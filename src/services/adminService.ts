"use server";

import { connectToDatabase } from "@/lib/db";
import { 
  UserModel, 
  RestaurantModel, 
  OrderModel, 
  MenuItemModel, 
  CategoryModel,
  TableModel 
} from "@/models/Schemas";
import { getSession } from "@/services/authService";
import mongoose from "mongoose";

// --- Staff Management ---

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
      status: "Active" 
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

// --- Menu Management ---

export async function getMenuData() {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    
    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    
    const categories = await CategoryModel.find({ restaurantId }).lean();
    const menuItems = await MenuItemModel.find({ restaurantId }).populate('category').lean();

    return {
      categories: categories.map((c: any) => ({ id: c._id.toString(), name: c.name })),
      menuItems: menuItems.map((m: any) => ({
        id: m._id.toString(),
        name: m.name,
        category: m.category?.name || "Uncategorized",
        categoryId: m.category?._id?.toString(),
        price: m.price,
        status: m.isAvailable ? "In Stock" : "Out of Stock",
        image: m.image,
        description: m.description,
        isVeg: m.isVeg
      }))
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Get Menu Data Error:", error);
    return { categories: [], menuItems: [] };
  }
}

export async function addCategory(name: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    
    await CategoryModel.create({
      name,
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    
    // Check if category has items
    const itemcount = await MenuItemModel.countDocuments({ category: new mongoose.Types.ObjectId(id) });
    if (itemcount > 0) {
      return { success: false, error: "Cannot delete category with items. Move or delete them first." };
    }
    
    await CategoryModel.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id),
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMenuItem(data: any) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");

    await MenuItemModel.create({
      ...data,
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMenuItem(id: string, data: any) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");

    await MenuItemModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), restaurantId: new mongoose.Types.ObjectId(session.restaurantId) },
      data
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");

    await MenuItemModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      restaurantId: new mongoose.Types.ObjectId(session.restaurantId)
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Order Management ---

export async function getAllOrders() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return orders.map((o: any) => ({
      id: `#ORD-${o._id.toString().slice(-4).toUpperCase()}`,
      fullId: o._id.toString(),
      table: o.tableId || "N/A",
      items: o.items.map((it: any) => ({ name: it.name, qty: it.quantity })),
      total: o.totalAmount,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      time: o.createdAt,
      paymentMethod: o.paymentMethod || "cash"
    }));
  } catch (error) {
    console.error("[ADMIN SERVICE] Get Orders Error:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await connectToDatabase();
    await OrderModel.findByIdAndUpdate(orderId, { status: status.toLowerCase(), updatedAt: new Date() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Dashboard Analytics ---

export async function getDashboardAnalytics() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find({ status: 'completed' }).lean();
    
    const totalSales = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const orderCount = orders.length;

    // Simplified peak hour (most frequent hour)
    const hours = orders.map((o: any) => new Date(o.createdAt).getHours());
    const hourCounts: any = {};
    hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
    const peakHourVal = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, "N/A");
    const peakHour = peakHourVal !== "N/A" ? `${peakHourVal}:00` : "N/A";

    // Payment split
    const paymentCounts: any = { esewa: 0, khalti: 0, imepay: 0, cash: 0 };
    orders.forEach((o: any) => {
      const method = o.paymentMethod || 'cash';
      if (paymentCounts[method] !== undefined) paymentCounts[method]++;
    });

    const totalOrders = orders.length || 1;
    const paymentSplit = [
      { label: "eSewa", val: `${Math.round((paymentCounts.esewa / totalOrders) * 100)}%`, color: "bg-primary" },
      { label: "Khalti", val: `${Math.round((paymentCounts.khalti / totalOrders) * 100)}%`, color: "bg-purple-500" },
      { label: "IME Pay", val: `${Math.round((paymentCounts.imepay / totalOrders) * 100)}%`, color: "bg-blue-500" },
      { label: "Cash", val: `${Math.round((paymentCounts.cash / totalOrders) * 100)}%`, color: "bg-zinc-500" },
    ];

    return {
      totalSales,
      orderCount,
      peakHour,
      paymentSplit,
      revenueTrend: [40, 60, 45, 75, 55, 90, 80], // Placeholder for actual daily aggregation if needed
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Dashboard Error:", error);
    return { totalSales: 0, orderCount: 0, peakHour: "N/A", paymentSplit: [], revenueTrend: [] };
  }
}

// --- Table Management ---

export async function getTables() {
  try {
    await connectToDatabase();
    const tables = await TableModel.find().lean();
    return tables.map((t: any) => ({
      id: t._id.toString(),
      number: t.number,
      capacity: t.capacity,
      status: t.status,
      lastOrder: t.lastOrderAt ? "Recent" : "No orders"
    }));
  } catch (error) {
    console.error("[ADMIN SERVICE] Get Tables Error:", error);
    return [];
  }
}

export async function addTable(number: string, capacity: number) {
  try {
    await connectToDatabase();
    await TableModel.create({ number, capacity, status: 'Empty' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTable(id: string) {
  try {
    await connectToDatabase();
    await TableModel.findByIdAndDelete(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
