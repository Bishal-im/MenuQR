export interface PlatformStats {
  totalRestaurants: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalOrders: number;
  revenueGrowth: number;
  restaurantGrowth: number;
}

export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  planId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxTables: number;
  maxMenuItems: number;
  hasAnalytics: boolean;
  hasBranding: boolean;
}

export interface Subscription {
  id: string;
  restaurantId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'trial';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

// Mock Data
const MOCK_STATS: PlatformStats = {
  totalRestaurants: 156,
  activeSubscriptions: 142,
  monthlyRevenue: 28500,
  totalOrders: 45000,
  revenueGrowth: 12.5,
  restaurantGrowth: 8.2,
};

const MOCK_PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'Basic',
    price: 999,
    billingCycle: 'monthly',
    features: ['Up to 10 tables', 'Basic Menu', 'Email Support'],
    maxTables: 10,
    maxMenuItems: 50,
    hasAnalytics: false,
    hasBranding: false,
  },
  {
    id: 'p2',
    name: 'Pro',
    price: 2499,
    billingCycle: 'monthly',
    features: ['Unlimited tables', 'Full Analytics', 'Custom Branding', 'Priority Support'],
    maxTables: 100,
    maxMenuItems: 500,
    hasAnalytics: true,
    hasBranding: true,
  },
];

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'The Grand Dhaba',
    ownerName: 'Rahul Sharma',
    email: 'contact@granddhaba.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
    planId: 'p2',
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'r2',
    name: 'Pizza Palace',
    ownerName: 'John Doe',
    email: 'info@pizzapalace.com',
    phone: '+91 88776 55443',
    address: 'Delhi, India',
    planId: 'p1',
    status: 'inactive',
    createdAt: '2025-02-10',
  },
];

export const superAdminService = {
  getStats: async (): Promise<PlatformStats> => {
    return MOCK_STATS;
  },

  getRestaurants: async (): Promise<Restaurant[]> => {
    return MOCK_RESTAURANTS;
  },

  createRestaurant: async (data: Omit<Restaurant, 'id' | 'createdAt'>) => {
    console.log("Creating restaurant:", data);
    return { success: true, id: 'r' + Math.random().toString(36).substr(2, 9) };
  },

  updateRestaurant: async (id: string, data: Partial<Restaurant>) => {
    console.log("Updating restaurant:", id, data);
    return { success: true };
  },

  getPlans: async (): Promise<Plan[]> => {
    return MOCK_PLANS;
  },

  createPlan: async (data: Omit<Plan, 'id'>) => {
    console.log("Creating plan:", data);
    return { success: true, id: 'p' + Math.random().toString(36).substr(2, 9) };
  },

  getSubscriptions: async () => {
    return [
      {
        id: 's1',
        restaurantId: 'r1',
        planId: 'p2',
        startDate: '2025-01-15',
        expiryDate: '2026-01-15',
        status: 'active',
        paymentStatus: 'paid',
      }
    ];
  },

  getAnalytics: async () => {
    return {
      revenueByMonth: [
        { name: 'Jan', revenue: 21000 },
        { name: 'Feb', revenue: 24000 },
        { name: 'Mar', revenue: 28500 },
      ],
      ordersByMonth: [
        { name: 'Jan', orders: 12000 },
        { name: 'Feb', orders: 15000 },
        { name: 'Mar', orders: 18000 },
      ]
    };
  }
};
