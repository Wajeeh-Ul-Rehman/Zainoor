export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  image: string;
  hoverImage?: string;
  description: string;
  isNew?: boolean;
  isSale?: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface Address {
  fullName: string;
  address: string;
  city: string;
  province: string;
  phone: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface AffiliateApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  socialHandle?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AuthModalMode = 'login' | 'signup';
export type DashboardTab = 'orders' | 'addresses' | 'wishlist' | 'affiliate' | 'settings';
export type AdminTab = 'overview' | 'orders' | 'products' | 'customers' | 'affiliates' | 'settings';
