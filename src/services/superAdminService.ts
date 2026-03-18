"use server";

import { connectToDatabase } from "@/lib/db";
import { PlatformStatsModel, RestaurantModel, PlanModel, UserModel } from "@/models/Schemas";

export interface PlatformStats {
  totalRestaurants: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
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
  planId: string;
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

export interface Subscription {
  id: string;
  restaurantId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'trial';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

import mongoose from "mongoose";

export async function getStats(): Promise<PlatformStats> {
  await connectToDatabase();
  const stats = await PlatformStatsModel.findOne();
  return {
    totalRestaurants: stats?.totalRestaurants || 0,
    activeSubscriptions: stats?.activeSubscriptions || 0,
    monthlyRevenue: stats?.monthlyRevenue || 0,
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
    planId: r.planId?.toString() || '',
    status: r.status,
    createdAt: r.createdAt.toISOString().split('T')[0],
  }));
}

export async function createRestaurant(data: Omit<Restaurant, 'id' | 'createdAt'>) {
  await connectToDatabase();
  const newRestaurant = await RestaurantModel.create({
    ...data,
    planId: mongoose.Types.ObjectId.isValid(data.planId) ? data.planId : undefined,
  });
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

export async function getPlans(): Promise<Plan[]> {
  await connectToDatabase();
  const plans = await PlanModel.find().lean();
  return plans.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    billingCycle: p.billingCycle,
    features: p.features,
    maxTables: p.maxTables,
    maxMenuItems: p.maxMenuItems,
    hasAnalytics: p.hasAnalytics,
    hasBranding: p.hasBranding,
  }));
}

export async function createPlan(data: Omit<Plan, 'id'>) {
  await connectToDatabase();
  const newPlan = await PlanModel.create(data);
  return { success: true, id: newPlan._id.toString() };
}

export async function getSubscriptions() {
  return [];
}

export async function getAnalytics() {
  return {
    revenueByMonth: [
      { name: 'Jan', revenue: 21000 },
      { name: 'Feb', revenue: 24000 },
      { name: 'Mar', revenue: 28500 },
    ],
    ordersByMonth: [
      { name: 'Jan', orders: 12000 },
      { name: 'Feb', orders: 15000 },
      { name: 'Mar', orders: 18000 },
    ]
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

// Server actions must only export async functions.
