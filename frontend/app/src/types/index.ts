export interface Sale {
  active: boolean;
  price?: number | null;
  unlimited?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AttributeRow {
  name: string;
  value: string;
}

export interface SizeForm {
  title: string;
  rows: AttributeRow[];
}

export interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  salePrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  image: string;
  images?: string[];
  hoverImage?: string;
  description: string;
  isNew?: boolean;
  isSale?: boolean;
  stock: number;
  cost?: number;
  hidden?: boolean;
  unitsSold?: number;
  sale?: Sale;
  sizeCharts?: Record<string, SizeForm[]> | string;
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
  fullName?: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  role?: string;
  avatar?: string;
  orders?: Order[];
}

export interface OrderItem {
  productId: string;
  name?: string;
  title?: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface StatusHistoryItem {
  status: string;
  at: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[] | OrderItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderStatus?: string;
  cancelledBy?: 'user' | 'admin';
  total: number;
  totalAmount?: number;
  date: string;
  orderDate?: string;
  shippingAddress: Address;
  paymentMethod: string;
  statusHistory?: StatusHistoryItem[];
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