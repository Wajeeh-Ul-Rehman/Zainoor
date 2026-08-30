import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AuthModalMode = 'login' | 'signup';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface SignupInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (data: SignupInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'zainoor_user';

// ==========================================
// UPDATED BACKEND URL TO PORT 5001
// ==========================================
const BACKEND_URL = 'http://localhost:5001/api/auth';

// TEMP: client-side admin check for the demo. Move this to your backend —
// the API that issues the session should decide isAdmin, not the browser.
const ADMIN_EMAILS = ['abdullahwajeeh074@gmail.com', 'support@zainoor.com.pk'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  // Restore session on page load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 1. LOGIN INTEGRATION
  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) return { success: false, error: 'Enter your email and password.' };

    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed.' };
      }

      const loggedInUser: User = {
        id: data.user?.id || crypto.randomUUID(),
        fullName: data.user?.fullName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        phone: data.user?.phone || undefined,
        isAdmin: ADMIN_EMAILS.includes(email.trim().toLowerCase()),
      };

      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to server. Ensure your backend is running.' };
    }
  };

  // 2. SIGNUP INTEGRATION
  const signup = async ({ fullName, email, phone, password }: SignupInput): Promise<AuthResult> => {
    if (!fullName || !email || !password) return { success: false, error: 'Fill in all required fields.' };

    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed.' };
      }

      const newUser: User = {
        id: data.user?.id || crypto.randomUUID(),
        fullName,
        email: email.trim().toLowerCase(),
        phone,
        isAdmin: ADMIN_EMAILS.includes(email.trim().toLowerCase()),
      };

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to server. Ensure your backend is running.' };
    }
  };

  // 3. LOGOUT INTEGRATION
  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn("Backend logout notification failed (offline or inactive):", err);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>.');
  return ctx;
}