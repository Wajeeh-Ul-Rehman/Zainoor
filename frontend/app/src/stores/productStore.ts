import { create } from 'zustand';
import { socket } from '@/lib/socket';

export interface Sale {
  active: boolean;
  price: number | null;
  unlimited: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface ProductStore {
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
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

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // Fetches all products on page load/refresh
  fetchProducts: async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
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

  // Instantly adds a single product to the UI without refreshing
  addProduct: (newProduct) => set((state) => ({ 
    products: [...state.products, newProduct] 
  })),

  createProduct: async (productData: any) => {
    try {
      const res = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          category: productData.category,
          images: productData.images,
          sizeCharts: productData.sizeCharts || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      
      get().fetchProducts();
      return { success: true, product: data.product };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const res = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          category: productData.category,
          images: productData.images,
          sizeCharts: productData.sizeCharts || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      
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