
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalPrice: number;
  customerName?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSalesCount: number;
  totalRevenue: number;
  lowStockItems: Product[];
}

export type Permission = 
  | 'view_dashboard' 
  | 'manage_inventory' 
  | 'delete_inventory' 
  | 'pos_access' 
  | 'manage_users';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'staff';
  permissions: Permission[];
}
