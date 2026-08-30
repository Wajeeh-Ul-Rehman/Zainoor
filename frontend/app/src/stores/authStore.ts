import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<AuthResult>;
}

const API_BASE = 'http://localhost:5001/api/auth';

// TEMP: the backend's `users` table has no isAdmin column, so admin status
// is still decided in the browser by matching this one email. Once you add
// an isAdmin column and have /login and /register return it, replace this
// with `data.user.isAdmin` from the response.
const ADMIN_EMAIL = 'abdullahwajeeh074@gmail.com';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: async (email, password) => {
        try {
          const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.message || 'Invalid credentials.' };
          }

          const cleanEmail: string = data.user.email.trim().toLowerCase();
          const user: User = {
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone,
            isAdmin: cleanEmail === ADMIN_EMAIL,
          };
          set({ user, isAuthenticated: true });
          return { success: true };
        } catch {
          return { success: false, error: 'Could not reach the server — is it running on port 5001?' };
        }
      },

      register: async ({ name, email, phone, password }) => {
        try {
          const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: name, email, phone, password }),
          });
          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.message || 'Registration failed.' };
          }

          const cleanEmail: string = data.user.email.trim().toLowerCase();
          const user: User = {
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone,
            isAdmin: cleanEmail === ADMIN_EMAIL,
          };
          set({ user, isAuthenticated: true });
          return { success: true };
        } catch {
          return { success: false, error: 'Could not reach the server — is it running on port 5001?' };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (data) => {
        const current = get().user;
        if (!current) return { success: false, error: 'You need to be logged in.' };

        try {
          const res = await fetch(`${API_BASE}/profile/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: data.name, email: data.email, phone: data.phone }),
          });
          const body = await res.json();
          if (!res.ok) return { success: false, error: body.message || 'Could not update profile.' };

          set({
            user: {
              ...current,
              name: body.user.fullName,
              email: body.user.email,
              phone: body.user.phone,
            },
          });
          return { success: true };
        } catch {
          return { success: false, error: 'Could not reach the server.' };
        }
      },
    }),
    {
      name: 'zainoor-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);