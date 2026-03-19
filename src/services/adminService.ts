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
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);

    const orders = await OrderModel.find({ 
      restaurantId,
      status: 'completed' 
    }).lean();
    
    const totalSales = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const orderCount = orders.length;

    // 1. Peak hour (most frequent hour)
    const hours = orders.map((o: any) => new Date(o.createdAt).getHours());
    const hourCounts: any = {};
    hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
    const peakHourVal = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, "N/A");
    const peakHour = peakHourVal !== "N/A" ? `${peakHourVal}:00` : "N/A";

    // 2. Payment split
    const paymentCounts: any = { esewa: 0, khalti: 0, imepay: 0, cash: 0 };
    orders.forEach((o: any) => {
      const method = (o.paymentMethod || 'cash').toLowerCase();
      if (paymentCounts[method] !== undefined) paymentCounts[method]++;
    });

    const totalOrders = orders.length || 1;
    const paymentSplit = [
      { label: "eSewa", val: `${Math.round((paymentCounts.esewa / totalOrders) * 100)}%`, color: "bg-primary" },
      { label: "Khalti", val: `${Math.round((paymentCounts.khalti / totalOrders) * 100)}%`, color: "bg-purple-500" },
      { label: "IME Pay", val: `${Math.round((paymentCounts.imepay / totalOrders) * 100)}%`, color: "bg-blue-500" },
      { label: "Cash", val: `${Math.round((paymentCounts.cash / totalOrders) * 100)}%`, color: "bg-zinc-500" },
    ];

    // 3. Real Revenue Trend (Last 7 days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const daySales = orders
        .filter((o: any) => {
          const createdAt = new Date(o.createdAt);
          return createdAt >= d && createdAt < nextD;
        })
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      
      trend.push(daySales);
    }

    // Normalize trend to percentages for the UI bar chart
    const maxSales = Math.max(...trend, 1);
    const normalizedTrend = trend.map(s => Math.round((s / maxSales) * 100));

    // 4. Hourly Orders (Last 24 hours or just today's standard hours)
    const hourlyOrders = new Array(12).fill(0); // 9am to 8pm (12 hours)
    orders.forEach((o: any) => {
      const hour = new Date(o.createdAt).getHours();
      if (hour >= 9 && hour <= 20) {
        hourlyOrders[hour - 9]++;
      }
    });
    
    // Normalize hourly orders to percentages
    const maxHourly = Math.max(...hourlyOrders, 1);
    const normalizedHourly = hourlyOrders.map(c => Math.round((c / maxHourly) * 100));

    return {
      totalSales,
      orderCount,
      peakHour,
      paymentSplit,
      revenueTrend: normalizedTrend,
      hourlyOrders: normalizedHourly
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Analytics Error:", error);
    return { totalSales: 0, orderCount: 0, peakHour: "N/A", paymentSplit: [], revenueTrend: [] };
  }
}

export async function getAdminDashboardStats() {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Stats Cards
    const completedOrdersToday = await OrderModel.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: today }
    }).lean();

    const totalOrdersToday = await OrderModel.countDocuments({
      restaurantId,
      createdAt: { $gte: today }
    });

    const revenueToday = completedOrdersToday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalOrdersToday > 0 ? Math.round(revenueToday / totalOrdersToday) : 0;
    
    const activeTables = await TableModel.countDocuments({
      restaurantId,
      status: 'Active'
    });
    const totalTables = await TableModel.countDocuments({ restaurantId });

    // 2. Live Orders (not completed/cancelled)
    const liveOrdersData = await OrderModel.find({
      restaurantId,
      status: { $in: ['pending', 'preparing', 'ready'] }
    }).sort({ createdAt: -1 }).limit(5).lean();

    const liveOrders = liveOrdersData.map(o => ({
      id: `#${o._id.toString().slice(-3).toUpperCase()}`,
      table: `Table ${o.tableId}`,
      items: o.items.map((it: any) => `${it.name}${it.quantity > 1 ? ` ×${it.quantity}` : ''}`).join(', '),
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      statusColor: o.status === 'pending' ? "text-blue-500 bg-blue-500/10" : 
                   o.status === 'preparing' ? "text-amber-500 bg-amber-500/10" : 
                   "text-emerald-500 bg-emerald-500/10"
    }));

    // 3. Popular Items Today
    const allOrdersToday = await OrderModel.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: today }
    }).lean();

    const itemMap: any = {};
    allOrdersToday.forEach(o => {
      o.items.forEach((it: any) => {
        if (!itemMap[it.name]) itemMap[it.name] = 0;
        itemMap[it.name] += it.quantity;
      });
    });

    const sortedItems = Object.entries(itemMap)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 4);

    const maxCount = sortedItems[0]?.[1] || 1;
    const popularItems = sortedItems.map(([name, count]: any) => ({
      name,
      count,
      percent: Math.round((count / maxCount) * 100)
    }));

    // 4. Trends (Compare with yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const completedOrdersYesterday = await OrderModel.find({
      restaurantId,
      status: 'completed',
      createdAt: { $gte: yesterday, $lt: today }
    }).lean();

    const revenueYesterday = completedOrdersYesterday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueTrend = revenueYesterday > 0 
      ? `${Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100)}%`
      : "+0%";

    const ordersYesterday = await OrderModel.countDocuments({
      restaurantId,
      createdAt: { $gte: yesterday, $lt: today }
    });
    const ordersTrend = ordersYesterday > 0
      ? `${Math.round(((totalOrdersToday - ordersYesterday) / ordersYesterday) * 100)}%`
      : "+0%";

    // 5. Sidebar Badge (Pending Orders)
    const pendingCount = await OrderModel.countDocuments({
      restaurantId,
      status: 'pending'
    });

    const restaurant = await RestaurantModel.findById(restaurantId).lean();

    return {
      revenueToday,
      revenueTrend,
      revenueTrendUp: revenueToday >= revenueYesterday,
      ordersToday: totalOrdersToday,
      ordersTrend,
      ordersTrendUp: totalOrdersToday >= ordersYesterday,
      avgOrderValue,
      tablesActive: `${activeTables} / ${totalTables}`,
      liveOrders,
      popularItems,
      pendingCount,
      restaurantName: restaurant?.name || "Restaurant",
      restaurantStatus: restaurant?.isOpen ? "Open" : "Closed",
      userName: session.name || "Admin"
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Admin Dashboard Stats Error:", error);
    return null;
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
