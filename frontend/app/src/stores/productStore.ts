import { create } from 'zustand';
import { API_URL } from '../../config';
import { socket } from '@/lib/socket'; // Import your socket instance
import type { Product, Sale } from '../types';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (includeAll?: boolean) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<{ success: boolean; error?: string; product?: Product }>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<{ success: boolean; error?: string; product?: Product }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleHide: (id: string) => Promise<{ success: boolean; error?: string }>;
  setSale: (id: string, sale: Sale) => Promise<{ success: boolean; error?: string }>;
  uploadImages: (files: File[]) => Promise<string[]>;
  initRealtime: () => void; // <-- Add to interface
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  // Real-time socket event listeners
  initRealtime: () => {
    socket.off('product:created');
    socket.off('product:updated');
    socket.off('product:deleted');

    socket.on('product:created', (product: Product) => {
      set((state) => {
        if (state.products.some((p) => p.id === product.id)) return state;
        return { products: [product, ...state.products] };
      });
    });

    socket.on('product:updated', (product: Product) => {
      set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      }));
    });

    socket.on('product:deleted', (data: { id: string } | string) => {
      const id = typeof data === 'string' ? data : data.id;
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    });
  },

  fetchProducts: async (includeAll = true) => {
    set({ loading: true, error: null });
    try {
      const url = `${API_URL}/api/products${includeAll ? '?all=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      set({ products: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createProduct: async (productData) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend returned non-JSON response.');
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Could not create product' };
      }

      if (data.product) {
        set((state) => ({ products: [data.product, ...state.products] }));
      }
      return { success: true, product: data.product };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend returned non-JSON response.');
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Could not update product' };
      }

      if (data.product) {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? data.product : p)),
        }));
      }
      return { success: true, product: data.product };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || (data.success !== undefined && !data.success)) {
        return { success: false, error: data.message || 'Could not delete product' };
      }

      set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  toggleHide: async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/hide`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'Could not toggle hide status' };

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? (data.id ? data : { ...p, hidden: !p.hidden }) : p)),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  setSale: async (id, sale) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/sale`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || 'Could not update sale' };

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? (data.id ? data : { ...p, sale }) : p)),
      }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  uploadImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await fetch(`${API_URL}/api/products/upload`, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Image upload endpoint returned invalid response.');
      }

      const data = await res.json();
      if (!res.ok || !data.urls) throw new Error(data.message || 'Upload failed');
      return data.urls;
    } catch (err: any) {
      console.error('Image Upload Error:', err);
      return [];
    }
  },
}));