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

const isSuperAdmin = (email: string) => {
  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  return superadminEmail?.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase());
};

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
    if (!session) return [];
    if (session.role !== 'admin' && session.role !== 'superadmin') return [];

    const restaurantId = session.restaurantId;
    if (!restaurantId) return [];

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
    if (!session) return { categories: [], menuItems: [] };

    let restaurantIdRaw = session.restaurantId;
    if (!restaurantIdRaw && isSuperAdmin(session.email)) {
      const firstReg = await RestaurantModel.findOne().lean();
      if (firstReg) restaurantIdRaw = firstReg._id.toString();
    }

    if (!restaurantIdRaw) return { categories: [], menuItems: [] };
    const restaurantId = new mongoose.Types.ObjectId(restaurantIdRaw);
    
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
    const session = await getSession();
    if (!session) return [];
    
    let restaurantIdRow = session.restaurantId;
    if (!restaurantIdRow && isSuperAdmin(session.email)) {
      const firstReg = await RestaurantModel.findOne().lean();
      if (firstReg) restaurantIdRow = firstReg._id.toString();
    }
    
    if (!restaurantIdRow) return [];
    
    const orders = await OrderModel.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantIdRow) 
    }).sort({ createdAt: -1 }).lean();

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
    
    // If marking as completed or cancelled, check if table should be cleared
    if (['completed', 'cancelled'].includes(status.toLowerCase())) {
      const order = await OrderModel.findById(orderId).lean();
      if (order && order.tableId) {
        // Find any OTHER active orders for this table
        const activeOrdersCount = await OrderModel.countDocuments({
          restaurantId: order.restaurantId,
          tableId: order.tableId,
          status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
          _id: { $ne: new mongoose.Types.ObjectId(orderId) }
        });

        if (activeOrdersCount === 0) {
          // No more active orders, set table to Empty
          await TableModel.findOneAndUpdate(
            { number: order.tableId, restaurantId: order.restaurantId },
            { status: 'Empty' }
          );
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Dashboard Analytics ---

export async function getDashboardAnalytics() {
  try {
    const session = await getSession();
    if (!session) return { totalSales: 0, orderCount: 0, peakHour: "N/A", paymentSplit: [], revenueTrend: [], hourlyOrders: [] };
    
    const restaurantIdRow = session.restaurantId;
    if (!restaurantIdRow) return { totalSales: 0, orderCount: 0, peakHour: "N/A", paymentSplit: [], revenueTrend: [], hourlyOrders: [] };
    
    const restaurantId = new mongoose.Types.ObjectId(restaurantIdRow);

    const orders = await OrderModel.find({ 
      restaurantId,
      status: 'completed' 
    }).lean();
    
    const totalSales = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

    // 1. Peak hour (most frequent hour)
    const hours = orders.map((o: any) => new Date(o.createdAt).getHours());
    const hourCounts: any = {};
    hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
    const peakHourVal = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, "N/A");
    const peakHour = peakHourVal !== "N/A" ? `${peakHourVal}:00` : "N/A";

    // 2. Top Selling Items
    const itemCounts: any = {};
    orders.forEach((o: any) => {
      o.items.forEach((it: any) => {
        itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
      });
    });
    const topItems = Object.entries(itemCounts)
      .map(([name, count]: any) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

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
      
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      trend.push({ label: dayName, value: daySales });
    }

    const maxSales = Math.max(...trend.map(t => t.value), 1);
    const revenueTrend = trend.map(t => ({
      ...t,
      percentage: Math.round((t.value / maxSales) * 100)
    }));

    // 4. Hourly Orders
    const hourlyRaw = new Array(12).fill(0); 
    orders.forEach((o: any) => {
      const h = new Date(o.createdAt).getHours();
      if (h >= 9 && h <= 20) {
        hourlyRaw[h - 9]++;
      }
    });
    
    const maxHourly = Math.max(...hourlyRaw, 1);
    const hourlyOrders = hourlyRaw.map((count, i) => {
      const h = i + 9;
      const label = h > 12 ? `${h-12}pm` : h === 12 ? '12pm' : `${h}am`;
      return {
        label,
        count,
        percentage: Math.round((count / maxHourly) * 100)
      };
    });

    return {
      totalSales,
      orderCount,
      avgOrderValue,
      peakHour,
      topItems,
      revenueTrend,
      hourlyOrders
    };
  } catch (error) {
    console.error("[ADMIN SERVICE] Analytics Error:", error);
    return { 
      totalSales: 0, 
      orderCount: 0, 
      avgOrderValue: 0, 
      peakHour: "N/A", 
      topItems: [], 
      revenueTrend: [], 
      hourlyOrders: [] 
    };
  }
}

export async function getAdminDashboardStats(restaurantIdOverride?: string) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) throw new Error("Unauthorized: No session found");
    
    let restaurantIdRaw = restaurantIdOverride || session.restaurantId;

    // If superadmin has no restaurantId, try to find the first available one to show something useful
    if (!restaurantIdRaw && isSuperAdmin(session.email)) {
      const firstRestaurant = await RestaurantModel.findOne().lean();
      if (firstRestaurant) {
        restaurantIdRaw = firstRestaurant._id.toString();
        console.log(`[ADMIN SERVICE] Superadmin ${session.email} using default restaurant ${firstRestaurant.name} (${restaurantIdRaw})`);
      }
    }

    if (!restaurantIdRaw) {
      if (!isSuperAdmin(session.email)) {
        console.warn(`[ADMIN SERVICE] Dashboard access attempted by ${session.role} (${session.email}) but no restaurantId found.`);
      }
      return { 
        error: "No restaurant associated with your account.",
        userName: session.name || "User",
        restaurantName: "N/A",
        restaurantStatus: "Closed",
        pendingCount: 0
      };
    }

    const restaurantId = new mongoose.Types.ObjectId(restaurantIdRaw);

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
    }).sort({ createdAt: 1 }).limit(10).lean();

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

    const maxCount = Number(sortedItems[0]?.[1]) || 1;
    const popularItems = sortedItems.map(([name, count]: any) => ({
      name,
      count,
      percent: Math.round((Number(count) / maxCount) * 100)
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

    const pendingCount = await OrderModel.countDocuments({
      restaurantId,
      status: 'pending'
    });

    const latestOrder = await OrderModel.findOne({
      restaurantId,
      status: 'pending'
    }).sort({ createdAt: -1 }).select('createdAt').lean();

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
      latestOrderTime: latestOrder?.createdAt || null,
      restaurantName: restaurant?.name || "Restaurant",
      restaurantStatus: restaurant?.isOpen ? "Open" : "Closed",
      userName: session.name || "Admin",
      notificationPreferences: (restaurant as any)?.notificationPreferences || {
        newOrderAlerts: true,
        emailSummaries: true
      },
      securityPreferences: (restaurant as any)?.securityPreferences || {
        loginNotifications: true,
        doubleVerification: false
      }
    };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Admin Dashboard Stats Error:", error.message);
    return null;
  }
}

// --- Settings Management ---

const DEFAULT_HOURS = {
  monday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  tuesday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  wednesday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  thursday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  friday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  saturday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
  sunday: { open: '09:00 AM', close: '10:00 PM', isClosed: false },
};

export async function getRestaurantSettings() {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // If no restaurantId in session, try finding by email
    let restaurant = null;
    if (session.restaurantId) {
      restaurant = await RestaurantModel.findById(session.restaurantId).lean();
    } else {
      restaurant = await RestaurantModel.findOne({ email: session.email }).lean();
    }

    if (!restaurant) {
      // Return empty data for a new restaurant setup
      return {
        success: true,
        data: {
          id: "",
          name: "",
          ownerName: session.name || "",
          email: session.email,
          phone: "",
          address: "",
          cuisine: "",
          website: "",
          isOpen: true,
          operatingHours: DEFAULT_HOURS,
          notificationPreferences: {
            newOrderAlerts: true,
            emailSummaries: true
          },
          securityPreferences: {
            loginNotifications: true,
            doubleVerification: false
          }
        }
      };
    }

    return {
      success: true,
      data: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        ownerName: restaurant.ownerName,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        cuisine: (restaurant as any).cuisine || "",
        website: (restaurant as any).website || "",
        isOpen: (restaurant as any).isOpen ?? true,
        operatingHours: (restaurant as any).operatingHours || DEFAULT_HOURS,
        notificationPreferences: (restaurant as any).notificationPreferences || {
          newOrderAlerts: true,
          emailSummaries: true
        },
        securityPreferences: (restaurant as any).securityPreferences || {
          loginNotifications: true,
          doubleVerification: false
        }
      }
    };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Get Settings Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateRestaurantSettings(data: any) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    let restaurant;
    
    if (session.restaurantId) {
      restaurant = await RestaurantModel.findById(session.restaurantId);
    } else {
      restaurant = await RestaurantModel.findOne({ email: session.email });
    }

    if (restaurant) {
      // Update existing
      restaurant.name = data.name;
      restaurant.ownerName = data.ownerName;
      restaurant.phone = data.phone;
      restaurant.address = data.address;
      (restaurant as any).cuisine = data.cuisine;
      (restaurant as any).website = data.website;
      (restaurant as any).isOpen = data.isOpen;
      (restaurant as any).operatingHours = data.operatingHours;
      (restaurant as any).notificationPreferences = data.notificationPreferences;
      (restaurant as any).securityPreferences = data.securityPreferences;
      restaurant.updatedAt = new Date();
      await restaurant.save();
    } else {
      // Create new
      restaurant = await RestaurantModel.create({
        name: data.name,
        ownerName: data.ownerName || session.name,
        email: session.email,
        phone: data.phone,
        address: data.address,
        cuisine: data.cuisine,
        website: data.website,
        isOpen: data.isOpen,
        operatingHours: data.operatingHours || DEFAULT_HOURS,
        notificationPreferences: data.notificationPreferences || {
          newOrderAlerts: true,
          emailSummaries: true
        },
        securityPreferences: data.securityPreferences || {
          loginNotifications: true,
          doubleVerification: false
        }
      });

      // Update user to link this restaurant (optional but good for future sessions)
      await UserModel.findOneAndUpdate(
        { email: session.email },
        { $set: { restaurantId: restaurant._id, role: 'admin' } }
      );
    }

    return { success: true, data: restaurant };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Update Settings Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDailySummary() {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    let restaurant;
    let restaurantId = session.restaurantId;

    if (!restaurantId && isSuperAdmin(session.email)) {
      const firstRestaurant = await RestaurantModel.findOne({ status: 'active' });
      if (firstRestaurant) {
        restaurantId = firstRestaurant._id.toString();
      }
    }

    if (restaurantId) {
      restaurant = await RestaurantModel.findById(restaurantId);
    } else {
      restaurant = await RestaurantModel.findOne({ email: session.email });
    }

    if (!restaurant) throw new Error("Restaurant not found");

    const stats = await getAdminDashboardStats(restaurant._id.toString());
    if (!stats) throw new Error("Failed to fetch statistics");

    const { sendEmail } = await import("@/lib/emailer");
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f97316;">Daily Restaurant Summary: ${restaurant.name}</h2>
        <p>Hello ${restaurant.ownerName || 'Partner'}, here is your performance for today:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <p style="font-size: 12px; color: #666; margin: 0;">Total Revenue</p>
            <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">Rs. ${stats.revenueToday}</p>
            <p style="font-size: 12px; color: ${stats.revenueTrendUp ? '#10b981' : '#ef4444'}; margin: 0;">${stats.revenueTrend} vs yesterday</p>
          </div>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <p style="font-size: 12px; color: #666; margin: 0;">Total Orders</p>
            <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stats.ordersToday}</p>
            <p style="font-size: 12px; color: ${stats.ordersTrendUp ? '#10b981' : '#ef4444'}; margin: 0;">${stats.ordersTrend} vs yesterday</p>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          <p>This is a summary from MenuQR. You received this because "Email Summaries" is enabled in your settings.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: session.email,
      subject: `Daily Summary - ${restaurant.name}`,
      html: emailHtml
    });

    return { success: true };
  } catch (error: any) {
    console.error("[ADMIN SERVICE] Email Summary Error:", error.message);
    return { success: false, error: error.message };
  }
}

// --- Table Management ---

export async function getTables() {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) return [];
    
    let restaurantIdRow = session.restaurantId;
    if (!restaurantIdRow && isSuperAdmin(session.email)) {
      const firstReg = await RestaurantModel.findOne().lean();
      if (firstReg) restaurantIdRow = firstReg._id.toString();
    }
    
    if (!restaurantIdRow) return [];

    const restaurantId = new mongoose.Types.ObjectId(restaurantIdRow);
    const tables = await TableModel.find({ restaurantId }).populate('assignedWaiter').lean();
    
    return tables.map((t: any) => ({
      id: t._id.toString(),
      number: t.number,
      capacity: t.capacity,
      status: t.status,
      lastOrder: t.lastOrderAt ? "Recent" : "No orders",
      assignedWaiter: t.assignedWaiter ? {
        id: t.assignedWaiter._id.toString(),
        name: t.assignedWaiter.name
      } : null
    }));
  } catch (error) {
    console.error("[ADMIN SERVICE] Get Tables Error:", error);
    return [];
  }
}

export async function addTable(number: string, capacity: number) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");
    
    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    await TableModel.create({ 
      number, 
      capacity, 
      status: 'Empty',
      restaurantId 
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignWaiterToTable(tableId: string, waiterId: string | null) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || !session.restaurantId) throw new Error("Unauthorized");

    const restaurantId = new mongoose.Types.ObjectId(session.restaurantId);
    
    await TableModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(tableId), restaurantId },
      { assignedWaiter: waiterId ? new mongoose.Types.ObjectId(waiterId) : null }
    );
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
