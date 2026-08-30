import { create } from 'zustand';
import type { Toast, AuthModalMode } from '@/types';

interface UIState {
  isMobileNavOpen: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  toasts: Toast[];
  isTransitioning: boolean;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  setTransitioning: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isMobileNavOpen: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  toasts: [],
  isTransitioning: false,

  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  addToast: (message, type = 'info') => {
    const id = 'toast-' + Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setTransitioning: (value) => set({ isTransitioning: value }),
}));
