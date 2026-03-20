import mongoose, { Schema, model, models } from 'mongoose';

// Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
});



// MenuItem Schema
const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
});



// PlatformStats Schema
const PlatformStatsSchema = new Schema({
  totalRestaurants: Number,
  totalOrders: Number,
  revenueGrowth: Number,
  restaurantGrowth: Number,
});





// Restaurant Schema
const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  cuisine: { type: String },
  website: { type: String },
  isOpen: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  operatingHours: {
    monday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: '09:00 AM' }, close: { type: String, default: '10:00 PM' }, isClosed: { type: Boolean, default: false } },
  },
  createdAt: { type: Date, default: Date.now },
});



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
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'esewa', 'khalti', 'imepay'],
    default: 'cash'
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending' 
  },
  callWaiter: { type: Boolean, default: false },
  waiterAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



// Table Schema
const TableSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  number: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['Active', 'Empty'], default: 'Empty' },
  lastOrderAt: { type: Date },
});

// OTP Schema for Passwordless Auth
const OTPSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 120 } // 2 minutes TTL
});

// User Schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['superadmin', 'admin', 'waiter', 'customer'],
    default: 'customer'
  },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { strict: true }); // Ensure only defined fields are allowed

// PlatformSettings Schema
const PlatformSettingsSchema = new Schema({
  platformName: { type: String, default: "MenuQR" },
  primaryColor: { type: String, default: "#f97316" },
  platformFee: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  allowNewSignups: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
});

// Force refresh the models in development to avoid stale schema errors
if (models.User) delete (mongoose as any).models.User;
if (models.OTP) delete (mongoose as any).models.OTP;
if (models.Category) delete (mongoose as any).models.Category;
if (models.MenuItem) delete (mongoose as any).models.MenuItem;
if (models.Restaurant) delete (mongoose as any).models.Restaurant;
if (models.Order) delete (mongoose as any).models.Order;
if (models.Table) delete (mongoose as any).models.Table;
if (models.PlatformSettings) delete (mongoose as any).models.PlatformSettings;

export const UserModel = models.User || model('User', UserSchema);
export const OTPModel = models.OTP || model('OTP', OTPSchema);
export const CategoryModel = models.Category || model('Category', CategorySchema);
export const MenuItemModel = models.MenuItem || model('MenuItem', MenuItemSchema);
export const RestaurantModel = models.Restaurant || model('Restaurant', RestaurantSchema);
export const OrderModel = models.Order || model('Order', OrderSchema);
export const TableModel = models.Table || model('Table', TableSchema);
export const PlatformStatsModel = models.PlatformStats || model('PlatformStats', PlatformStatsSchema);
export const PlatformSettingsModel = models.PlatformSettings || model('PlatformSettings', PlatformSettingsSchema);
