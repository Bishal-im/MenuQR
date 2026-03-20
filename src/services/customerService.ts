"use server";

import { connectToDatabase } from "@/lib/db";
import { CategoryModel, MenuItemModel, OrderModel, RestaurantModel, TableModel } from "@/models/Schemas";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderData {
  restaurantId: string;
  tableId: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

import mongoose from "mongoose";

export async function getMenu(restaurantId: string) {
  await connectToDatabase();
  
  let restaurant = null;
  if (mongoose.Types.ObjectId.isValid(restaurantId)) {
    restaurant = await RestaurantModel.findById(restaurantId);
  }
  
  if (!restaurant) {
    restaurant = await RestaurantModel.findOne();
  }

  const categories = await CategoryModel.find({ restaurantId: restaurant?._id });
  const menuItems = await MenuItemModel.find({ restaurantId: restaurant?._id });

  return {
    restaurantName: restaurant?.name || "The Grand Dhaba",
    categories: categories.map(c => ({ id: c._id.toString(), name: c.name })),
    menu: menuItems.map(m => ({
      id: m._id.toString(),
      name: m.name,
      description: m.description,
      price: m.price,
      image: m.image,
      category: m.category?.toString(),
      isVeg: m.isVeg,
      isAvailable: m.isAvailable,
      isPopular: m.isPopular,
    })),
  };
}

export async function createOrder(data: OrderData) {
  await connectToDatabase();
  
  // Check for an existing active order for this table and restaurant
  // Sessions include: pending, accepted, preparing, ready
  const activeStatuses = ['pending', 'accepted', 'preparing', 'ready'];
  const existingOrder = await OrderModel.findOne({
    restaurantId: mongoose.Types.ObjectId.isValid(data.restaurantId) ? data.restaurantId : undefined,
    tableId: data.tableId,
    status: { $in: activeStatuses }
  });

  if (existingOrder) {
    // Merge items into the existing order
    const currentItems = [...existingOrder.items];
    
    data.items.forEach(newItem => {
      const existingItemIndex = currentItems.findIndex(i => 
        i.menuItemId?.toString() === newItem.menuItemId || i.name === newItem.name
      );

      if (existingItemIndex !== -1) {
        // Increment quantity of existing item
        currentItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item to the list
        currentItems.push({
          menuItemId: mongoose.Types.ObjectId.isValid(newItem.menuItemId) ? newItem.menuItemId : undefined,
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price
        });
      }
    });

    existingOrder.items = currentItems;
    existingOrder.totalAmount += data.totalAmount;
    existingOrder.updatedAt = new Date();
    
    await existingOrder.save();

    // Ensure table is marked as Occupied
    await (mongoose.model('Table') as any).findOneAndUpdate(
      { number: data.tableId, restaurantId: data.restaurantId },
      { status: 'Occupied', lastOrderAt: new Date() }
    );

    return {
      success: true,
      orderId: existingOrder._id.toString(),
      merged: true
    };
  }

  // If no pending order, create a new one
  const newOrder = await OrderModel.create({
    restaurantId: mongoose.Types.ObjectId.isValid(data.restaurantId) ? data.restaurantId : undefined,
    tableId: data.tableId,
    items: data.items.map(item => ({
      menuItemId: mongoose.Types.ObjectId.isValid(item.menuItemId) ? item.menuItemId : undefined,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    totalAmount: data.totalAmount,
    status: 'pending'
  });

  // Set table status to Occupied
  await (mongoose.model('Table') as any).findOneAndUpdate(
    { number: data.tableId, restaurantId: data.restaurantId },
    { status: 'Occupied', lastOrderAt: new Date() }
  );

  return {
    success: true,
    orderId: newOrder._id.toString(),
  };
}

export async function getOrder(orderId: string) {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid Order ID format");
  }

  const order = await OrderModel.findById(orderId).populate('items.menuItemId');
  if (!order) {
    throw new Error("Order not found");
  }

  return {
    id: order._id.toString(),
    status: order.status,
    callWaiter: order.callWaiter,
    waiterAccepted: order.waiterAccepted,
    items: order.items.map((item: any) => ({
      id: item.menuItemId?._id?.toString() || item._id.toString(),
      name: item.menuItemId?.name || item.name,
      quantity: item.quantity,
      price: item.price
    })),
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function cancelOrder(orderId: string) {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, error: "Invalid Order ID" };
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  if (order.status !== 'pending') {
    return { success: false, error: "Cannot cancel order that has already been accepted or prepared." };
  }

  await OrderModel.findByIdAndUpdate(orderId, { 
    status: 'cancelled',
    updatedAt: new Date()
  });

  return { success: true };
}

export async function callWaiterAlert(orderId: string) {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, error: "Invalid Order ID" };
  }

  const result = await OrderModel.findByIdAndUpdate(orderId, { 
    callWaiter: true,
    updatedAt: new Date()
  });

  return { success: !!result };
}

export async function clearWaiterAccepted(orderId: string) {
  await connectToDatabase();
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, error: "Invalid Order ID" };
  }

  const result = await OrderModel.findByIdAndUpdate(orderId, { 
    waiterAccepted: false,
    updatedAt: new Date()
  });

  return { success: !!result };
}

export async function callWaiterByTable(tableId: string, restaurantId: string) {
  await connectToDatabase();
  
  // Find a pending order for this table and restaurant
  const existingOrder = await OrderModel.findOne({
    tableId,
    restaurantId: mongoose.Types.ObjectId.isValid(restaurantId) ? restaurantId : undefined,
    status: 'pending',
    callWaiter: false // Only pick one that hasn't already called
  }).sort({ createdAt: -1 });

  if (existingOrder) {
    existingOrder.callWaiter = true;
    existingOrder.updatedAt = new Date();
    await existingOrder.save();
    return { success: true, orderId: existingOrder._id.toString() };
  }

  // If no pending order exists, create a "Service Call" order
  const newOrder = await OrderModel.create({
    restaurantId: mongoose.Types.ObjectId.isValid(restaurantId) ? restaurantId : undefined,
    tableId,
    items: [],
    totalAmount: 0,
    status: 'pending',
    callWaiter: true
  });

  return { 
    success: true, 
    orderId: newOrder._id.toString(),
    isNew: true 
  };
}

// Server actions must only export async functions.
// Types and interfaces are also allowed.
