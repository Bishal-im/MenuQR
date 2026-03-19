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
  totalOrders: Number,
  revenueGrowth: Number,
  restaurantGrowth: Number,
});

export const PlatformStatsModel = models.PlatformStats || model('PlatformStats', PlatformStatsSchema);



// Restaurant Schema
const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = models.Order || model('Order', OrderSchema);

// Table Schema
const TableSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  number: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['Active', 'Empty'], default: 'Empty' },
  lastOrderAt: { type: Date },
});

export const TableModel = models.Table || model('Table', TableSchema);

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

// Force refresh the models in development to avoid stale schema errors
if (models.User) delete (mongoose as any).models.User;
if (models.OTP) delete (mongoose as any).models.OTP;

export const UserModel = model('User', UserSchema);
export const OTPModel = model('OTP', OTPSchema);
