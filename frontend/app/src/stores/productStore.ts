import { create } from 'zustand';
import { socket } from '@/lib/socket';

export interface Sale {
  active: boolean;
  price: number | null;
  unlimited: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  images: string[];
  hidden: boolean;
  unitsSold: number;
  sale: Sale;
}

const API_BASE = 'http://localhost:5001/api/products';

interface ApiResult {
  success: boolean;
  error?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (includeHidden?: boolean) => Promise<void>;
  createProduct: (data: {
    title: string;
    description: string;
    price: number;
    cost: number;
    stock: number;
    category: string;
    images: string[];
  }) => Promise<ApiResult>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<ApiResult>;
  deleteProduct: (id: string) => Promise<ApiResult>;
  toggleHide: (id: string) => Promise<void>;
  setSale: (id: string, sale: Sale) => Promise<void>;
  uploadImages: (files: File[]) => Promise<string[]>;
  /** Call once (e.g. in App.tsx) to start listening for live updates. Returns a cleanup function. */
  initRealtime: () => () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (includeHidden = false) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}${includeHidden ? '?all=true' : ''}`);
      const data = await res.json();
      set({ products: data, loading: false });
    } catch {
      set({ loading: false, error: 'Could not load products.' });
    }
  },

  createProduct: async (data) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      // No need to push into state manually — the 'product:created' socket event does it,
      // including for every other open tab/browser at the same time.
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  },

  toggleHide: async (id) => {
    await fetch(`${API_BASE}/${id}/hide`, { method: 'PATCH' });
  },

  setSale: async (id, sale) => {
    await fetch(`${API_BASE}/${id}/sale`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
  },

  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    const body = await res.json();
    return (body.urls as string[]) || [];
  },

  initRealtime: () => {
    const onCreated = (product: Product) => {
      set((state) => ({ products: [product, ...state.products] }));
    };
    const onUpdated = (product: Product) => {
      set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      }));
    };
    const onDeleted = ({ id }: { id: string }) => {
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    };

    socket.on('product:created', onCreated);
    socket.on('product:updated', onUpdated);
    socket.on('product:deleted', onDeleted);

    return () => {
      socket.off('product:created', onCreated);
      socket.off('product:updated', onUpdated);
      socket.off('product:deleted', onDeleted);
    };
  },
}));