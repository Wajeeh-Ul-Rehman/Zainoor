// frontend/app/src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

const BACKEND_URL = 'http://localhost:5001/api/auth';


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
            googleLogin: async (credential: string) => {
        try {
          const res = await fetch(`${BACKEND_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.message || 'Google login failed' };
          }

          const userData: User = {
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone,
            isAdmin: Boolean(data.user.isAdmin),
          };

          set({ user: userData });
          return { success: true, user: userData };
        } catch (err: any) {
          return { success: false, error: 'Server connection failed' };
        }
      },
      user: null,
      login: async (email, password) => {
        try {
          const res = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.message || 'Login failed' };
          }

          const userData: User = {
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone,
            isAdmin: Boolean(data.user.isAdmin), // Captures the database flag accurately
          };

          set({ user: userData });
          return { success: true, user: userData };
        } catch (err: any) {
          return { success: false, error: 'Server connection failed' };
        }
      },
      logout: () => set({ user: null }),
    }),
    { name: 'zainoor_auth_store' }
    
  )
  
);
