import mongoose, { Schema, model, models } from 'mongoose';

// Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
});

export const CategoryModel = models.Category || model('Category', CategorySchema);

// MenuItem Schema
const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
});

export const MenuItemModel = models.MenuItem || model('MenuItem', MenuItemSchema);

// PlatformStats Schema
const PlatformStatsSchema = new Schema({
  totalRestaurants: Number,
  activeSubscriptions: Number,
  monthlyRevenue: Number,
  totalOrders: Number,
  revenueGrowth: Number,
  restaurantGrowth: Number,
});

export const PlatformStatsModel = models.PlatformStats || model('PlatformStats', PlatformStatsSchema);

// Plan Schema
const PlanSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  features: [String],
  maxTables: Number,
  maxMenuItems: Number,
  hasAnalytics: Boolean,
  hasBranding: Boolean,
});

export const PlanModel = models.Plan || model('Plan', PlanSchema);

// Restaurant Schema
const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export const RestaurantModel = models.Restaurant || model('Restaurant', RestaurantSchema);

// Order Schema
const OrderItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  tableId: String,
  items: [OrderItemSchema],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = models.Order || model('Order', OrderSchema);
