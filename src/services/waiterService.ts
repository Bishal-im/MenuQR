export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface WaiterOrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface WaiterOrder {
  id: string;
  tableId: string;
  items: WaiterOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Mock Orders
const MOCK_ORDERS: WaiterOrder[] = [
  {
    id: "ord_101",
    tableId: "5",
    items: [
      { id: "m1", name: "Paneer Tikka", quantity: 2 },
      { id: "m3", name: "Butter Chicken", quantity: 1 }
    ],
    totalAmount: 950,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ord_102",
    tableId: "12",
    items: [
      { id: "m2", name: "Chicken Wings", quantity: 3 },
      { id: "m4", name: "Dal Makhani", quantity: 1 }
    ],
    totalAmount: 1310,
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const waiterService = {
  getOrders: async (): Promise<WaiterOrder[]> => {
    // In production: fetch from /api/waiter/orders
    return MOCK_ORDERS;
  },

  acceptOrder: async (orderId: string): Promise<boolean> => {
    console.log("Accepting order:", orderId);
    return true;
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
    console.log("Updating order", orderId, "to", status);
    return true;
  },

  // Simulate new order for UI testing
  subscribeToNewOrders: (callback: (order: WaiterOrder) => void) => {
    // In production: Use WebSockets (socket.io)
    // mock: send 1 order after 30 seconds
    const timer = setTimeout(() => {
      callback({
        id: "ord_" + Math.random().toString(36).substr(2, 5),
        tableId: (Math.floor(Math.random() * 20) + 1).toString(),
        items: [{ id: "m1", name: "Random Starter", quantity: 1 }],
        totalAmount: 250,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 30000);
    return () => clearTimeout(timer);
  }
};
