"use server";

import { connectToDatabase } from "@/lib/db";
import { CategoryModel, MenuItemModel } from "@/models/Schemas";
import mongoose from "mongoose";

export interface Category {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
}

export async function getCategories(restaurantId: string): Promise<Category[]> {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) return [];
  
  const categories = await CategoryModel.find({ restaurantId }).lean();
  return categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));
}

export async function addCategory(name: string, restaurantId: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) throw new Error("Invalid Restaurant ID");
  
  const newCategory = await CategoryModel.create({ name, restaurantId });
  return { success: true, id: newCategory._id.toString() };
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) return [];
  
  const items = await MenuItemModel.find({ restaurantId }).lean();
  return items.map((m: any) => ({
    id: m._id.toString(),
    name: m.name,
    description: m.description || "",
    price: m.price,
    image: m.image || "",
    category: m.category?.toString() || "",
    isVeg: m.isVeg,
    isAvailable: m.isAvailable,
    isPopular: m.isPopular,
  }));
}

export async function addMenuItem(data: Omit<MenuItem, "id">, restaurantId: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) throw new Error("Invalid Restaurant ID");
  
  const newItem = await MenuItemModel.create({
    ...data,
    restaurantId,
    category: mongoose.Types.ObjectId.isValid(data.category) ? data.category : undefined,
  });
  return { success: true, id: newItem._id.toString() };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Item ID");
  
  await MenuItemModel.findByIdAndUpdate(id, {
    ...data,
    category: data.category && mongoose.Types.ObjectId.isValid(data.category) ? data.category : undefined,
  });
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Item ID");
  
  await MenuItemModel.findByIdAndDelete(id);
  return { success: true };
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Category ID");
  
  // Also unset category from menu items
  await MenuItemModel.updateMany({ category: id }, { $unset: { category: 1 } });
  await CategoryModel.findByIdAndDelete(id);
  return { success: true };
}
