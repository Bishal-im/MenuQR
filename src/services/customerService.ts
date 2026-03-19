"use server";

import { connectToDatabase } from "@/lib/db";
import { CategoryModel, MenuItemModel, OrderModel, RestaurantModel } from "@/models/Schemas";

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

// Server actions must only export async functions.
// Types and interfaces are also allowed.
