"use server";

import { connectToDatabase } from "@/lib/db";
import { UserModel, RestaurantModel } from "@/models/Schemas";
import { getSession } from "@/services/authService";
import mongoose from "mongoose";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

export async function getStaff(): Promise<StaffMember[]> {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      throw new Error("Unauthorized");
    }

    const restaurantId = session.restaurantId;
    if (!restaurantId) {
      return [];
    }

    const staff = await UserModel.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      role: 'waiter' 
    }).lean();

    return staff.map((member: any) => ({
      id: member._id.toString(),
      name: member.name || "Unnamed",
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      status: "Active" // For now, since we don't have a status field in User
    }));
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Get Staff Error:", error.message);
    return [];
  }
}

export async function addStaff(name: string, email: string, phone: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, error: "Unauthorized: Only restaurant owners can add staff." };
    }

    const restaurantId = session.restaurantId;
    if (!restaurantId) {
      return { success: false, error: "Restaurant ID not found in session." };
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.role === 'waiter' && existingUser.restaurantId?.toString() === restaurantId) {
        return { success: false, error: "Staff member with this email already exists." };
      }
      return { success: false, error: "This email is already registered in the system." };
    }

    await UserModel.create({
      name,
      email: normalizedEmail,
      phone,
      role: 'waiter',
      restaurantId: new mongoose.Types.ObjectId(restaurantId)
    });

    return { success: true };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Add Staff Error:", error.message);
    return { success: false, error: error.message || "Failed to add staff member." };
  }
}

export async function deleteStaff(id: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return { success: false, error: "Unauthorized" };
    }

    const restaurantId = session.restaurantId;
    
    // Ensure the waiter belongs to this restaurant
    const waiter = await UserModel.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      restaurantId: new mongoose.Types.ObjectId(restaurantId) 
    });

    if (!waiter) {
      return { success: false, error: "Staff member not found or does not belong to your restaurant." };
    }

    await UserModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    return { success: true };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Delete Staff Error:", error.message);
    return { success: false, error: "Failed to delete staff member." };
  }
}
