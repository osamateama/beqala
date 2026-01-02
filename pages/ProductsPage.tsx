
import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { Product, User } from '../types';

interface ProductsPageProps {
  user: User;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const canEdit = user.permissions.includes('manage_inventory');
  const canDelete = user.permissions.includes('delete_inventory');

  useEffect(() => { loadProducts(); }, []);
  
  const loadProducts = async () => { 
    setLoading(true);
    try {
      const data = await db.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (p?: Product) => {
    if (!canEdit) return;
    if (p) {
      setEditingProduct(p);
      setName(p.name);
      setCategory(p.category);
      setPrice(p.price);
      setStock(p.stock);
    } else {
      setName(''); setCategory(''); setPrice(0); setStock(0); setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) await db.updateProduct(editingProduct.id, { name, category, price, stock });
    else await db.addProduct({ name, category, price, stock });
    await loadProducts();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
        await db.deleteProduct(id);
        await loadProducts();
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">إدارة الأصناف</h3>
            <p className="text-slate-400 text-xs font-bold mt-1">إجمالي المنتجات: {products.length}</p>
          </div>
          {canEdit && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <span>➕</span>
              <span>إضافة صنف</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white">
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">المنتج</th>
                  <th className="px-8 py-5">التصنيف</th>
                  <th className="px-8 py-5 text-left">السعر</th>
                  <th className="px-8 py-5">المخزون</th>
                  <th className="px-8 py-5 text-center">خيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-black text-slate-700">{p.name}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{p.category}</td>
                    <td className="px-8 py-5 font-black text-indigo-600 text-left">{p.price.toFixed(2)} ج.م</td>
                    <td className="px-8 py-5 font-black text-slate-600">{p.stock} قطعة</td>
                    <td className="px-8 py-5 text-center space-x-2 space-x-reverse">
                      {canEdit && (
                          <button onClick={() => handleOpenModal(p)} className="text-indigo-500 hover:underline font-bold text-sm">تعديل</button>
                      )}
                      {canDelete && (
                          <button onClick={() => handleDelete(p.id)} className="text-rose-400 hover:text-rose-600 font-bold text-sm">حذف</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{editingProduct ? 'تعديل الصنف' : 'صنف جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl text-slate-300">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" placeholder="اسم المنتج" required />
              <input type="text" value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" placeholder="التصنيف" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" placeholder="السعر" required />
                <input type="number" value={stock} onChange={(e)=>setStock(parseInt(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" placeholder="الكمية" required />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">حفظ البيانات</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
