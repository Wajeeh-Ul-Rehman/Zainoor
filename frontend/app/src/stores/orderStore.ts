import { create } from 'zustand';
import { socket } from '@/lib/socket';

// Keep this list in sync with backend/controllers/orderController.js's ORDER_STATUSES
export const ORDER_STATUSES = [
  'Pending',
  'In Progress',
  'Sent for Packing',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Delivery Unsuccessful',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  orderDate: string;
  orderTime: string;
  orderStatus: OrderStatus;
  shippingAddress: string;
  totalAmount: number;
  items: OrderItem[];
  statusHistory: OrderStatusEvent[];
}

const API_BASE = 'http://localhost:5001/api/orders';

interface ApiResult {
  success: boolean;
  error?: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  fetchAllOrders: () => Promise<void>;
  createOrder: (data: {
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: string;
  }) => Promise<ApiResult & { order?: Order }>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<ApiResult>;
  cancelOrder: (id: string) => Promise<ApiResult>;
  /** Call once (e.g. in App.tsx) to start listening for live updates. Returns a cleanup function. */
  initRealtime: () => () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,

  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      set({ orders: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createOrder: async (data) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      return { success: true, order: body.order };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  cancelOrder: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/cancel`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  initRealtime: () => {
    const onCreated = (order: Order) => {
      set((state) => ({ orders: [order, ...state.orders] }));
    };
    const onStatusUpdated = (payload: { id: string; orderStatus: OrderStatus; statusHistory: OrderStatusEvent[] }) => {
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === payload.id ? { ...o, orderStatus: payload.orderStatus, statusHistory: payload.statusHistory } : o
        ),
      }));
    };

    socket.on('order:created', onCreated);
    socket.on('order:statusUpdated', onStatusUpdated);

    return () => {
      socket.off('order:created', onCreated);
      socket.off('order:statusUpdated', onStatusUpdated);
    };
  },
}));