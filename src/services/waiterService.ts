"use server";

import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Schemas";

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
  await connectToDatabase();
  const orders = await OrderModel.find()
    .sort({ createdAt: -1 })
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
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
}

import mongoose from "mongoose";

export async function acceptOrder(orderId: string): Promise<boolean> {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return false;
  }
  const result = await OrderModel.findByIdAndUpdate(orderId, { 
    status: 'accepted',
    updatedAt: new Date()
  });
  return !!result;
}

export async function updateStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return false;
  }
  const result = await OrderModel.findByIdAndUpdate(orderId, { 
    status,
    updatedAt: new Date()
  });
  return !!result;
}

export async function resolveWaiterCall(orderId: string): Promise<boolean> {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return false;
  }
  const result = await OrderModel.findByIdAndUpdate(orderId, { 
    callWaiter: false,
    waiterAccepted: true,
    updatedAt: new Date()
  });
  return !!result;
}

export async function resolveAllServiceCalls(): Promise<boolean> {
  await connectToDatabase();
  const result = await OrderModel.updateMany(
    { callWaiter: true },
    { callWaiter: false, waiterAccepted: true, updatedAt: new Date() }
  );
  return result.modifiedCount > 0;
}

// Server actions must only export async functions.
