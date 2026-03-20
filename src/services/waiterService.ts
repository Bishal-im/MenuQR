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
    
    return orders.map((order: any) => ({
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
    const result = await OrderModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId), restaurantId: new mongoose.Types.ObjectId(session.restaurantId) },
      { 
        status,
        updatedAt: new Date()
      }
    );
    return !!result;
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
    const result = await OrderModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(orderId), restaurantId: new mongoose.Types.ObjectId(session.restaurantId) },
      { 
        callWaiter: false,
        waiterAccepted: notifyCustomer,
        updatedAt: new Date()
      }
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

    const result = await OrderModel.updateMany(
      query,
      { 
        callWaiter: false, 
        waiterAccepted: notifyCustomer, 
        updatedAt: new Date() 
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("[WAITER SERVICE] Resolve All Error:", error);
    return false;
  }
}

// Server actions must only export async functions.
