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

    return mappedOrders;
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

    // No target order, just update status
    currentOrder.status = status;
    currentOrder.updatedAt = new Date();
    await currentOrder.save();

    // If marking as completed or cancelled, check if table should be cleared automatically
    if (['completed', 'cancelled'].includes(status.toLowerCase())) {
      // Find any OTHER active orders for this table
      const activeOrdersCount = await OrderModel.countDocuments({
        restaurantId: currentOrder.restaurantId,
        tableId: currentOrder.tableId,
        status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
        _id: { $ne: currentOrder._id }
      });

      if (activeOrdersCount === 0) {
        // No more active orders, set table to Empty
        await TableModel.findOneAndUpdate(
          { number: currentOrder.tableId, restaurantId: currentOrder.restaurantId },
          { status: 'Empty' }
        );
      }
    }

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

export async function clearTableStatus(tableNumber: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const session = await getSession('waiter') || await getSession();
    if (!session || !session.restaurantId) return false;

    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    
    const result = await TableModel.findOneAndUpdate(
      { number: tableNumber, restaurantId },
      { status: 'Empty' }
    );
    
    return !!result;
  } catch (error) {
    console.error("[WAITER SERVICE] Clear Table Error:", error);
    return false;
  }
}

// Server actions must only export async functions.
