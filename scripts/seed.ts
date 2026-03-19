import { connectToDatabase } from '../src/lib/db';
import { 
  CategoryModel, 
  MenuItemModel, 
  PlatformStatsModel,
  RestaurantModel,
  OrderModel
} from '../src/models/Schemas';
import mongoose from 'mongoose';

// Mock data from customerService.ts
const MOCK_CATEGORIES = [
  { name: "Starters" },
  { name: "Main Course" },
  { name: "Beverages" },
  { name: "Desserts" },
];

const MOCK_MENU = [
  {
    name: "Paneer Tikka",
    description: "Marinated paneer cubes grilled to perfection with onions and bell peppers.",
    price: 250,
    image: "https://images.unsplash.com/photo-1567184109191-37 a6c2cf9c79?auto=format&fit=crop&q=80&w=400",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Chicken Wings",
    description: "Spicy and succulent chicken wings tossed in BBQ sauce.",
    price: 320,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=400",
    isVeg: false,
    isAvailable: true,
  },
  {
    name: "Butter Chicken",
    description: "Classic Indian butter chicken with a rich tomato creamy gravy.",
    price: 450,
    image: "https://images.unsplash.com/photo-1603894584713-f484439d3 b1d?auto=format&fit=crop&q=80&w=400",
    isVeg: false,
    isAvailable: true,
    isPopular: true,
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils with cream and spices.",
    price: 350,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
    isVeg: true,
    isAvailable: true,
  },
];

// Mock data from superAdminService.ts
const MOCK_STATS = {
  totalRestaurants: 156,
  activeSubscriptions: 142,
  monthlyRevenue: 28500,
  totalOrders: 45000,
  revenueGrowth: 12.5,
  restaurantGrowth: 8.2,
};



const MOCK_RESTAURANTS = [
  {
    name: 'The Grand Dhaba',
    ownerName: 'Rahul Sharma',
    email: 'contact@granddhaba.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
    status: 'active',
  },
  {
    name: 'Pizza Palace',
    ownerName: 'John Doe',
    email: 'info@pizzapalace.com',
    phone: '+91 88776 55443',
    address: 'Delhi, India',
    status: 'inactive',
  },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      CategoryModel.deleteMany({}),
      MenuItemModel.deleteMany({}),
      PlatformStatsModel.deleteMany({}),
      RestaurantModel.deleteMany({}),
      OrderModel.deleteMany({}),
    ]);
    console.log('Cleared.');

    // Seed Categories
    console.log('Seeding categories...');
    const categories = await CategoryModel.insertMany(MOCK_CATEGORIES);
    console.log(`${categories.length} categories seeded.`);

    // Seed Menu Items
    console.log('Seeding menu items...');
    const menuWithCategory = MOCK_MENU.map((item, index) => ({
      ...item,
      category: categories[index % categories.length]._id,
    }));
    const menuItems = await MenuItemModel.insertMany(menuWithCategory);
    console.log(`${menuItems.length} menu items seeded.`);

    // Seed Platform Stats
    console.log('Seeding platform stats...');
    await PlatformStatsModel.create(MOCK_STATS);
    console.log('Platform stats seeded.');

    // Seed Restaurants
    console.log('Seeding restaurants...');
    const restaurantsWithPlan = MOCK_RESTAURANTS.map((rest, index) => ({
      ...rest,
    }));
    const restaurants = await RestaurantModel.insertMany(restaurantsWithPlan);
    console.log(`${restaurants.length} restaurants seeded.`);

    // Seed some mock orders
    console.log('Seeding mock orders...');
    const mockOrders = [
      {
        restaurantId: restaurants[0]._id,
        tableId: "5",
        items: [
          { menuItemId: menuItems[0]._id, name: menuItems[0].name, quantity: 2, price: menuItems[0].price },
          { menuItemId: menuItems[2]._id, name: menuItems[2].name, quantity: 1, price: menuItems[2].price }
        ],
        totalAmount: 950,
        status: 'pending',
      },
      {
        restaurantId: restaurants[0]._id,
        tableId: "12",
        items: [
          { menuItemId: menuItems[1]._id, name: menuItems[1].name, quantity: 3, price: menuItems[1].price },
          { menuItemId: menuItems[3]._id, name: menuItems[3].name, quantity: 1, price: menuItems[3].price }
        ],
        totalAmount: 1310,
        status: 'preparing',
      }
    ];
    await OrderModel.insertMany(mockOrders);
    console.log('Mock orders seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
