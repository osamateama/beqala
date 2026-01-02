
import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { Product, SaleItem, Sale, User } from '../types';
import Invoice from '../components/Invoice';

interface SalesPageProps {
  user: User;
}

const SalesPage: React.FC<SalesPageProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  const canAccessPOS = user.permissions.includes('pos_access');

  useEffect(() => { 
    if (canAccessPOS) loadData(); 
  }, [canAccessPOS]);

  const loadData = async () => { 
    const [prods, sales] = await Promise.all([db.getProducts(), db.getSales()]);
    setProducts(prods); 
    setRecentSales(sales); 
  };

  const addToCart = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || product.stock < quantity) return;
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex !== -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      newCart[existingIndex].total = newCart[existingIndex].quantity * product.price;
      setCart(newCart);
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity, price: product.price, total: quantity * product.price }]);
    }
    setSelectedProductId(''); setQuantity(1);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    try {
      const newSale = await db.recordSale({ 
        items: cart, 
        totalPrice: cart.reduce((acc, item) => acc + item.total, 0), 
        customerName: customerName || 'عميل نقدي' 
      });
      setRecentSales([newSale, ...recentSales]); 
      setActiveInvoice(newSale); 
      setCart([]); 
      setCustomerName(''); 
      await loadData();
      setTimeout(() => { window.print(); }, 500);
    } catch (err) {
      alert("فشل في إتمام عملية البيع");
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessPOS) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-black text-slate-800">عذراً، لا تملك صلاحية الكاشير</h2>
            <p className="text-slate-400 mt-2">يرجى مراجعة مدير النظام لطلب الصلاحية</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
      <div className="lg:col-span-8 no-print space-y-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">🛒 فاتورة بيع</h3>
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full border border-white/10 tracking-widest uppercase">Supabase Cloud POS</span>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">العميل</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-600" placeholder="الاسم..." />
              </div>
              <div className="flex gap-4">
                <div className="flex-grow">
                  <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">المنتج</label>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-600">
                    <option value="">اختر الصنف</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} ({p.price} ج.م)</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">الكمية</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-center font-black text-slate-600" />
                </div>
              </div>
            </div>

            <button onClick={addToCart} disabled={!selectedProductId} className="w-full bg-slate-900 text-white py-5 rounded-2xl hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              إضافة للسلة ➕
            </button>

            <div className="pt-6 border-t border-slate-50">
                <div className="space-y-3">
                    {cart.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <p className="font-black text-slate-700">{item.productName}</p>
                                <p className="text-[10px] text-slate-400 font-black">{item.price} ج.م × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="font-black text-indigo-600">{item.total.toFixed(2)} ج.م</p>
                                <button onClick={() => setCart(cart.filter((_,i)=>i!==idx))} className="text-slate-300 hover:text-rose-500 transition-all">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          {cart.length > 0 && (
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">المجموع الكلي</p>
                <h2 className="text-4xl font-black text-slate-800">{cart.reduce((acc,i)=>acc+i.total,0).toFixed(2)} <span className="text-lg">ج.م</span></h2>
              </div>
              <button 
                onClick={handleCompleteSale} 
                disabled={loading}
                className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:bg-slate-300"
              >
                {loading ? 'جاري الحفظ...' : 'دفع وطباعة 📄'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 no-print h-fit">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-black text-slate-800">آخر العمليات</h3>
            </div>
            <div className="p-4 space-y-3">
                {recentSales.slice(0, 8).map(sale => (
                    <div key={sale.id} className="p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-400">#{sale.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 mb-2">{sale.customerName}</p>
                        <p className="font-black text-indigo-600 text-sm">{sale.totalPrice.toFixed(2)} ج.م</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {activeInvoice && (
        <div className="print-only">
          <Invoice sale={activeInvoice} />
        </div>
      )}
    </div>
  );
};

export default SalesPage;
