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

export interface Category {
  id: string;
  name: string;
}

export interface OrderData {
  restaurantId: string;
  tableId: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

// Mock data for initial development
const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Starters" },
  { id: "2", name: "Main Course" },
  { id: "3", name: "Beverages" },
  { id: "4", name: "Desserts" },
];

const MOCK_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Paneer Tikka",
    description: "Marinated paneer cubes grilled to perfection with onions and bell peppers.",
    price: 250,
    image: "https://images.unsplash.com/photo-1567184109191-37 a6c2cf9c79?auto=format&fit=crop&q=80&w=400",
    category: "1",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "m2",
    name: "Chicken Wings",
    description: "Spicy and succulent chicken wings tossed in BBQ sauce.",
    price: 320,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=400",
    category: "1",
    isVeg: false,
    isAvailable: true,
  },
  {
    id: "m3",
    name: "Butter Chicken",
    description: "Classic Indian butter chicken with a rich tomato creamy gravy.",
    price: 450,
    image: "https://images.unsplash.com/photo-1603894584713-f484439d3 b1d?auto=format&fit=crop&q=80&w=400",
    category: "2",
    isVeg: false,
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "m4",
    name: "Dal Makhani",
    description: "Slow-cooked black lentils with cream and spices.",
    price: 350,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
    category: "2",
    isVeg: true,
    isAvailable: true,
  },
];

export const customerService = {
  getMenu: async (restaurantId: string) => {
    // In production, fetch from API: /api/customer/menu?restaurantId=${restaurantId}
    return {
      restaurantName: "The Grand Dhaba",
      categories: MOCK_CATEGORIES,
      menu: MOCK_MENU,
    };
  },

  createOrder: async (data: OrderData) => {
    // In production, POST to API: /api/customer/orders
    console.log("Placing order:", data);
    return {
      success: true,
      orderId: "ord_" + Math.random().toString(36).substr(2, 9),
    };
  },

  getOrder: async (orderId: string) => {
    // In production, fetch from API: /api/customer/orders/${orderId}
    return {
      id: orderId,
      status: "pending", // pending, preparing, ready, served
      items: MOCK_MENU.slice(0, 2).map(item => ({ ...item, quantity: 1 })),
      totalAmount: 570,
      createdAt: new Date().toISOString(),
    };
  }
};
