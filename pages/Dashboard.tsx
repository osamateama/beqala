
import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { DashboardStats, Sale, User } from '../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [dailySalesTotal, setDailySalesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const canViewReports = user.permissions.includes('view_dashboard');

  useEffect(() => {
    if (!canViewReports) return;
    
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [allStats, allSales] = await Promise.all([
          db.getDashboardStats(),
          db.getSales()
        ]);
        
        setStats(allStats);
        setRecentSales(allSales.slice(0, 5));
        
        const today = new Date().toDateString();
        const todayTotal = allSales
          .filter(sale => new Date(sale.date).toDateString() === today)
          .reduce((sum, sale) => sum + sale.totalPrice, 0);
        setDailySalesTotal(todayTotal);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [canViewReports]);

  if (!canViewReports) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-black text-slate-800">مرحباً بك في نظام متجر أسامة</h2>
            <p className="text-slate-400 mt-2">استخدم القائمة الجانبية للبدء في عملك حسب صلاحياتك</p>
        </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="دخل اليوم" value={`${dailySalesTotal.toFixed(2)} ج.م`} icon="💵" color="indigo" />
        <StatCard title="إجمالي الدخل" value={`${stats.totalRevenue.toLocaleString('ar-EG')} ج.م`} icon="🏦" color="slate" />
        <StatCard title="الفواتير" value={stats.totalSalesCount.toString()} icon="📄" color="indigo" />
        <StatCard title="نواقص المخزون" value={stats.lowStockItems.length.toString()} icon="📦" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-slate-800">أحدث عمليات البيع</h3>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Real-time</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">رقم الفاتورة</th>
                  <th className="px-8 py-5">العميل</th>
                  <th className="px-8 py-5 text-left">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-400 text-xs">#{sale.id.slice(0, 8)}</td>
                    <td className="px-8 py-5 text-slate-700 font-bold">{sale.customerName}</td>
                    <td className="px-8 py-5 font-black text-indigo-600 text-left">{sale.totalPrice.toFixed(2)} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-rose-50/20">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="text-rose-500">⚠️</span> الأصناف الناقصة
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {stats.lowStockItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="text-xs font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">{item.stock}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: 'indigo' | 'slate' | 'rose' }> = ({ title, value, icon, color }) => {
    const colors = {
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100'
    };
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-all">
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
            </div>
            <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl border ${colors[color]}`}>
                {icon}
            </div>
        </div>
    );
};

export default Dashboard;
