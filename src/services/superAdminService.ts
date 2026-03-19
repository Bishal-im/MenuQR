"use server";

import { connectToDatabase } from "@/lib/db";
import { PlatformStatsModel, RestaurantModel, UserModel, OrderModel } from "@/models/Schemas";

export interface PlatformStats {
  totalRestaurants: number;
  totalOrders: number;
  revenueGrowth: number;
  restaurantGrowth: number;
}

export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxTables: number;
  maxMenuItems: number;
  hasAnalytics: boolean;
  hasBranding: boolean;
}



import mongoose from "mongoose";

export async function getStats(): Promise<PlatformStats> {
  await connectToDatabase();
  const stats = await PlatformStatsModel.findOne();
  return {
    totalRestaurants: stats?.totalRestaurants || 0,
    totalOrders: stats?.totalOrders || 0,
    revenueGrowth: stats?.revenueGrowth || 0,
    restaurantGrowth: stats?.restaurantGrowth || 0,
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  await connectToDatabase();
  const restaurants = await RestaurantModel.find().lean();
  return restaurants.map((r: any) => ({
    id: r._id.toString(),
    name: r.name,
    ownerName: r.ownerName,
    email: r.email,
    phone: r.phone,
    address: r.address,
    status: r.status,
    createdAt: r.createdAt.toISOString().split('T')[0],
  }));
}

export async function createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt'>) {
  await connectToDatabase();
  const newRestaurant = await RestaurantModel.create(data);
  return { success: true, id: newRestaurant._id.toString() };
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid Restaurant ID" };
  }
  await RestaurantModel.findByIdAndUpdate(id, data);
  return { success: true };
}

export async function getAnalytics() {
  return {
    revenueByMonth: [],
    ordersByMonth: []
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'waiter' | 'customer';
  restaurantId?: string;
  createdAt: string;
}

export async function getUsers(): Promise<User[]> {
  await connectToDatabase();
  const users = await UserModel.find().lean();
  return users.map((u: any) => ({
    id: u._id.toString(),
    email: u.email,
    name: u.name || '',
    role: u.role,
    restaurantId: u.restaurantId?.toString() || '',
    createdAt: u.createdAt ? u.createdAt.toISOString().split('T')[0] : '',
  }));
}

export async function deleteRestaurant(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid Restaurant ID" };
  }
  
  // 1. Delete associated orders
  await OrderModel.deleteMany({ restaurantId: id });
  
  // 2. Delete associated users (admins, waiters, etc.)
  await UserModel.deleteMany({ restaurantId: id });
  
  // 3. Delete the restaurant itself
  await RestaurantModel.findByIdAndDelete(id);
  
  return { success: true };
}

export async function getPlans(): Promise<Plan[]> {
  // Mock plans for now as they are static in the UI
  return [
    {
      id: "p1",
      name: "Starter",
      price: 0,
      billingCycle: "monthly",
      features: ["Digital Menu QR", "Basic Order Management", "10 Tables Max", "50 Menu Items"],
      maxTables: 10,
      maxMenuItems: 50,
      hasAnalytics: false,
      hasBranding: false,
    },
    {
      id: "p2",
      name: "Pro",
      price: 2499,
      billingCycle: "monthly",
      features: ["Unlimited Tables", "Unlimited Menu Items", "Advanced Analytics", "Custom Branding", "Priority Support"],
      maxTables: 100,
      maxMenuItems: 500,
      hasAnalytics: true,
      hasBranding: true,
    }
  ];
}

// Server actions must only export async functions.
