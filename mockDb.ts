
import { supabase } from './lib/supabase';
import { Product, Sale, DashboardStats, User, Permission } from './types';

export const db = {
  // --- Users Logic ---
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  },

  addUser: async (user: Omit<User, 'id'>) => {
    const { data, error } = await supabase.from('users').insert([user]).select();
    if (error) throw error;
    return data[0];
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;
  },

  deleteUser: async (id: string) => {
    // جلب بيانات المستخدم أولاً للتأكد من أنه ليس المدير الرئيسي
    const { data: user } = await supabase.from('users').select('username').eq('id', id).single();
    if (user?.username === 'osama') return; // منع حذف المدير الرئيسي

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Products Logic ---
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) throw error;
    return data;
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) throw error;
    return data[0];
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Sales Logic ---
  getSales: async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // تحويل البيانات من نمط قاعدة البيانات (snake_case) إلى نمط التطبيق (camelCase)
    return data.map(s => ({ 
      id: s.id,
      date: s.date,
      totalPrice: s.total_price,
      customerName: s.customer_name,
      items: s.sale_items.map((si: any) => ({
        productId: si.product_id,
        productName: si.product_name,
        quantity: si.quantity,
        price: si.price,
        total: si.total
      }))
    }));
  },

  recordSale: async (sale: Omit<Sale, 'id' | 'date'>) => {
    // 1. إنشاء الفاتورة
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ 
        total_price: sale.totalPrice, 
        customer_name: sale.customerName,
        date: new Date().toISOString()
      }])
      .select();
    
    if (saleError) throw saleError;
    const newSaleRecord = saleData[0];

    // 2. إضافة العناصر وتقليل المخزون
    const itemsToInsert = sale.items.map(item => ({
      sale_id: newSaleRecord.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // 3. تحديث المخزون
    for (const item of sale.items) {
      const { data: prod } = await supabase.from('products').select('stock').eq('id', item.productId).single();
      if (prod) {
        await supabase.from('products').update({ stock: prod.stock - item.quantity }).eq('id', item.productId);
      }
    }

    return { 
      id: newSaleRecord.id, 
      date: newSaleRecord.date, 
      totalPrice: newSaleRecord.total_price,
      customerName: newSaleRecord.customer_name,
      items: sale.items 
    };
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const products = await db.getProducts();
    const { data: sales } = await supabase.from('sales').select('total_price');
    
    return {
      totalProducts: products.length,
      totalSalesCount: sales?.length || 0,
      totalRevenue: sales?.reduce((acc, s) => acc + s.total_price, 0) || 0,
      lowStockItems: products.filter(p => p.stock < 10)
    };
  }
};
