"use server";

import { connectToDatabase } from "@/lib/db";
import { RestaurantModel, UserModel, OrderModel, PlatformSettingsModel } from "@/models/Schemas";

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

export interface PlatformSettings {
  platformName: string;
  primaryColor: string;
  platformFee: number;
  currency: string;
  allowNewSignups: boolean;
  maintenanceMode: boolean;
}




import mongoose from "mongoose";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getStats(): Promise<PlatformStats> {
  await connectToDatabase();
  const totalRestaurants = await RestaurantModel.countDocuments();
  const totalOrders = await OrderModel.countDocuments();
  
  // You can implement more complex growth logic here if needed.
  // For now, we'll return these counts.
  
  return {
    totalRestaurants,
    totalOrders,
    revenueGrowth: 0,
    restaurantGrowth: 0,
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  await connectToDatabase();
  const restaurants = await RestaurantModel.find().sort({ createdAt: -1 }).lean();
  return restaurants.map((r: any) => ({
    id: r._id.toString(),
    name: r.name,
    ownerName: r.ownerName,
    email: r.email,
    phone: r.phone,
    address: r.address,
    status: r.status,
    createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : '',
  }));
}

export async function getRecentSignups(limit: number = 5): Promise<Restaurant[]> {
  await connectToDatabase();
  const restaurants = await RestaurantModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  return restaurants.map((r: any) => ({
    id: r._id.toString(),
    name: r.name,
    ownerName: r.ownerName,
    email: r.email,
    phone: r.phone,
    address: r.address,
    status: r.status,
    createdAt: r.createdAt ? r.createdAt.toISOString() : '',
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
  await connectToDatabase();
  const totalRestaurants = await RestaurantModel.countDocuments();
  const totalOrders = await OrderModel.countDocuments();
  const totalUsers = await UserModel.countDocuments();
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59, 999);
    
    const orders = await OrderModel.find({
      status: 'completed',
      createdAt: { $gte: d, $lte: endOfMonth }
    }).lean();
    
    const revenue = orders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0);
    
    revenueByMonth.push({
      month: monthNames[d.getMonth()],
      revenue
    });
  }
  
  return {
    totalRestaurants,
    totalOrders,
    totalUsers,
    revenueByMonth,
    ordersByMonth: [] // Left blank as it's not used in the UI currently
  };
}

export async function getSubscriptions() {
  return [
    {
      id: "1",
      restaurantName: "The Grand Dhaba",
      planName: "PRO SaaS",
      startDate: "2023-10-01",
      expiryDate: "2024-10-01",
      status: "Active",
      paymentStatus: "Paid"
    }
  ];
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  noStore();
  await connectToDatabase();
  let settings = await PlatformSettingsModel.findOne().lean();
  
  if (!settings) {
    // Create default settings if none exist
    settings = await PlatformSettingsModel.create({
      platformName: "MenuQR",
      primaryColor: "#f97316",
      platformFee: 0,
      currency: "INR",
      allowNewSignups: true,
      maintenanceMode: false,
    });
  }
  
  return {
    platformName: settings.platformName,
    primaryColor: settings.primaryColor,
    platformFee: settings.platformFee,
    currency: settings.currency,
    allowNewSignups: settings.allowNewSignups,
    maintenanceMode: settings.maintenanceMode,
  };
}

export async function updatePlatformSettings(data: Partial<PlatformSettings>) {
  await connectToDatabase();
  await PlatformSettingsModel.findOneAndUpdate({}, { $set: data }, { upsert: true });
  revalidatePath("/", "layout"); // Revalidate the whole layout to update CSS variables
  return { success: true };
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
  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  return users.map((u: any) => ({
    id: u._id.toString(),
    email: u.email,
    name: u.name || '',
    role: u.role,
    restaurantId: u.restaurantId?.toString() || '',
    createdAt: u.createdAt ? u.createdAt.toISOString().split('T')[0] : '',
  }));
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid User ID" };
  }
  await UserModel.findByIdAndDelete(id);
  return { success: true };
}

export async function updateUserRole(id: string, role: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Invalid User ID" };
  }
  await UserModel.findByIdAndUpdate(id, { role });
  return { success: true };
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
