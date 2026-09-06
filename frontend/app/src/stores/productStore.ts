import { create } from 'zustand';
import { API_URL } from '../../config';
import { socket } from '@/lib/socket';
import type { Product, Sale } from '../types';

const API_BASE = `${API_URL}/api/products`;

interface ApiResult {
  success: boolean;
  error?: string;
  product?: Product;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (includeHidden?: boolean) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<ApiResult>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<ApiResult>;
  deleteProduct: (id: string) => Promise<ApiResult>;
  toggleHide: (id: string) => Promise<void>;
  setSale: (id: string, sale: Sale) => Promise<void>;
  uploadImages: (files: File[]) => Promise<string[]>;
  addProduct: (product: Product) => void;
  initRealtime: () => () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      const response = await fetch(API_BASE);
      const parseProduct = (p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
        sizeCharts: typeof p.sizeCharts === 'string' ? JSON.parse(p.sizeCharts || '{}') : (p.sizeCharts || {}),
        sale: typeof p.sale === 'string' ? JSON.parse(p.sale || '{}') : (p.sale || {}),
      }); 
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      set({ products: data.map(parseProduct) });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  },

  addProduct: (newProduct) => set((state) => ({ 
    products: [newProduct, ...state.products.filter(p => p.id !== newProduct.id)] 
  })),

  createProduct: async (productData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title || productData.name,
          description: productData.description,
          price: productData.price,
          cost: productData.cost || 0,
          stock: productData.stock,
          category: productData.category,
          images: productData.images || (productData.image ? [productData.image] : []),
          sizeCharts: productData.sizeCharts || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || data.error };
      
      get().fetchProducts();
      return { success: true, product: data.product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title || productData.name,
          description: productData.description,
          price: productData.price,
          cost: productData.cost || 0,
          stock: productData.stock,
          category: productData.category,
          images: productData.images || (productData.image ? [productData.image] : []),
          sizeCharts: productData.sizeCharts || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message || data.error };
      
      get().fetchProducts();
      return { success: true, product: data.product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, 

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.message || body.error };
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
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
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
    const onDeleted = (payload: any) => {
      const id = typeof payload === 'string' ? payload : payload.id;
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