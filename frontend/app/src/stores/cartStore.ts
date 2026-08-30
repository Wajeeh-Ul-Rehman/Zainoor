import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (product, size, color) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.product.id === product.id && item.size === size && item.color === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1, size, color }] });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.size === size && item.color === color)
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCartOpen: (open) => set({ isCartOpen: open }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.product.salePrice || item.product.price;
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: 'zainoor-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
