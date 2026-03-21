"use server";

import { connectToDatabase } from "@/lib/db";
import { OrderModel, TableModel } from "@/models/Schemas";
import { getSession } from "@/services/authService";
import mongoose from "mongoose";

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface WaiterOrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface WaiterOrder {
  id: string;
  tableId: string;
  items: WaiterOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  callWaiter?: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getOrders(): Promise<WaiterOrder[]> {
  try {
    await connectToDatabase();
    // Force waiter session to ensure correct table filtering even if other sessions exist
    const session = await getSession('waiter');
    if (!session || !session.restaurantId) {
      return [];
    }

    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    let query: any = { restaurantId };

    // If waiter, only show assigned tables
    if (session.role === 'waiter') {
      const assignedTables = await TableModel.find({ 
        restaurantId,
        assignedWaiter: new mongoose.Types.ObjectId(session.id)
      }).select('number').lean();
      
      const tableNumbers = assignedTables.map((t: any) => t.number);
      query.tableId = { $in: tableNumbers };
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: 1 })
      .populate('items.menuItemId')
      .lean();
    
    const mappedOrders: WaiterOrder[] = orders.map((order: any) => ({
      id: order._id.toString(),
      tableId: order.tableId,
      items: order.items.map((item: any) => ({
        id: item.menuItemId?._id?.toString() || item.menuItemId?.toString() || item._id.toString(),
        name: item.name || item.menuItemId?.name || 'Unknown Item',
        quantity: item.quantity
      })),
      totalAmount: order.totalAmount,
      status: order.status as OrderStatus,
      callWaiter: order.callWaiter || false,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt).toISOString(),
      updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : new Date(order.updatedAt).toISOString(),
    }));

    // Safeguard: Merge active orders (pending, accepted, preparing, ready) for the same table and status
    const mergedOrders: WaiterOrder[] = [];
    const activeStatuses = ['pending', 'accepted', 'preparing', 'ready'];

    mappedOrders.forEach(order => {
      if (activeStatuses.includes(order.status)) {
        const existingOrder = mergedOrders.find(
          o => o.tableId === order.tableId && o.status === order.status
        );

        if (existingOrder) {
          // Merge items
          order.items.forEach(newItem => {
            const existingItem = existingOrder.items.find(i => i.id === newItem.id || i.name === newItem.name);
            if (existingItem) {
              existingItem.quantity += newItem.quantity;
            } else {
              existingOrder.items.push({ ...newItem });
            }
          });
          existingOrder.totalAmount += order.totalAmount;
          // Keep the older createdAt but update updatedAt if newer
          if (new Date(order.updatedAt) > new Date(existingOrder.updatedAt)) {
            existingOrder.updatedAt = order.updatedAt;
          }
          if (order.callWaiter) existingOrder.callWaiter = true;
        } else {
          mergedOrders.push({ ...order, items: [...order.items.map(i => ({ ...i }))] });
        }
      } else {
        // Just push history orders as is, UI will handle consolidation for display
        mergedOrders.push(order);
      }
    });

    return mergedOrders;
  } catch (error) {
    console.error("[WAITER SERVICE] Get Orders Error:", error);
    return [];
  }
}

// Server actions must only export async functions.

export async function acceptOrder(orderId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const session = await getSession('waiter') || await getSession();
    if (!session || !session.restaurantId) return false;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return false;
    }
    const result = await OrderModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId), restaurantId: new mongoose.Types.ObjectId(session.restaurantId) },
      { 
        status: 'accepted',
        updatedAt: new Date()
      }
    );
    return !!result;
  } catch (error) {
    console.error("[WAITER SERVICE] Accept Order Error:", error);
    return false;
  }
}

export async function updateStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    await connectToDatabase();
    const session = await getSession('waiter') || await getSession();
    if (!session || !session.restaurantId) return false;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return false;
    }
    const currentOrder = await OrderModel.findOne({
      _id: new mongoose.Types.ObjectId(orderId), 
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId) 
    });

    if (!currentOrder) return false;

    // Check if there's already an order in the target status for this table
    const targetOrder = await OrderModel.findOne({
      restaurantId: currentOrder.restaurantId,
      tableId: currentOrder.tableId,
      status: status,
      _id: { $ne: currentOrder._id }
    });

    if (targetOrder) {
      // Merge items from currentOrder into targetOrder
      const mergedItems = [...targetOrder.items];
      
      currentOrder.items.forEach((item: any) => {
        const existingItemIndex = mergedItems.findIndex(i => 
          i.menuItemId?.toString() === item.menuItemId?.toString() || i.name === item.name
        );

        if (existingItemIndex !== -1) {
          mergedItems[existingItemIndex].quantity += item.quantity;
        } else {
          mergedItems.push({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          });
        }
      });

      targetOrder.items = mergedItems;
      targetOrder.totalAmount += currentOrder.totalAmount;
      targetOrder.updatedAt = new Date();
      
      await targetOrder.save();

      // Delete the current order as it has been merged
      await OrderModel.findByIdAndDelete(currentOrder._id);
      return true;
    }

    // No target order, just update status
    currentOrder.status = status;
    currentOrder.updatedAt = new Date();
    await currentOrder.save();
    return true;
  } catch (error) {
    console.error("[WAITER SERVICE] Update Status Error:", error);
    return false;
  }
}

export async function resolveWaiterCall(orderId: string, notifyCustomer: boolean = true): Promise<boolean> {
  try {
    await connectToDatabase();
    const session = await getSession('waiter') || await getSession();
    if (!session || !session.restaurantId) return false;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return false;
    }
    // Find the order first to check items
    const order = await OrderModel.findOne({ 
      _id: new mongoose.Types.ObjectId(orderId), 
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId) 
    });

    if (!order) return false;

    const update: any = { 
      callWaiter: false,
      waiterAccepted: notifyCustomer,
      updatedAt: new Date()
    };

    // If it's a pure service call (no items), mark as completed
    if (!order.items || order.items.length === 0) {
      update.status = 'completed';
    }

    const result = await OrderModel.findOneAndUpdate(
      { _id: order._id },
      update
    );
    return !!result;
  } catch (error) {
    console.error("[WAITER SERVICE] Resolve Call Error:", error);
    return false;
  }
}

export async function resolveAllServiceCalls(notifyCustomer: boolean = false): Promise<boolean> {
  try {
    await connectToDatabase();
    const session = await getSession('waiter') || await getSession();
    if (!session || !session.restaurantId) return false;

    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    let query: any = { restaurantId, callWaiter: true };

    if (session.role === 'waiter') {
      const assignedTables = await TableModel.find({ 
        restaurantId,
        assignedWaiter: new mongoose.Types.ObjectId(session.id)
      }).select('number').lean();
      
      const tableNumbers = assignedTables.map((t: any) => t.number);
      query.tableId = { $in: tableNumbers };
    }

    // Mark all as resolved
    const result = await OrderModel.updateMany(
      query,
      { 
        callWaiter: false, 
        waiterAccepted: notifyCustomer, 
        updatedAt: new Date() 
      }
    );

    // Additionally, complete any active orders that have NO items (pure service calls)
    await OrderModel.updateMany(
      { ...query, items: { $size: 0 } },
      { status: 'completed', updatedAt: new Date() }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("[WAITER SERVICE] Resolve All Error:", error);
    return false;
  }
}

// Server actions must only export async functions.
