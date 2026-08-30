import { create } from 'zustand';

export interface UserOrderSummary {
  orderId: string;
  orderDate: string;
  orderTime: string;
  orderStatus: string;
  shippingAddress: string;
  totalAmount: number;
  items: { productId?: string; title: string; qty: number; price: number }[];
}

export interface UserWithHistory {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  orders: UserOrderSummary[];
}

const API_BASE = 'http://localhost:5001/api/auth';

interface ApiResult {
  success: boolean;
  error?: string;
}

interface UserState {
  users: UserWithHistory[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<ApiResult>;
  deleteUsersBulk: (userIds: string[]) => Promise<ApiResult>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/users/all/history`);
      const data = await res.json();
      set({ users: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  deleteUser: async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      set({ users: get().users.filter((u) => u.id !== userId) });
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  deleteUsersBulk: async (userIds) => {
    try {
      const res = await fetch(`${API_BASE}/users/delete-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      set({ users: get().users.filter((u) => !userIds.includes(u.id)) });
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },
}));