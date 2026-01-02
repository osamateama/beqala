
import React from 'react';
import { User, Permission } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  const hasPermission = (p: Permission) => user.permissions.includes(p);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠', permission: 'view_dashboard' as Permission },
    { id: 'products', label: 'المخزون', icon: '📦', permission: 'manage_inventory' as Permission },
    { id: 'sales', label: 'الكاشير', icon: '🧾', permission: 'pos_access' as Permission },
    { id: 'users', label: 'المستخدمين', icon: '👥', permission: 'manage_users' as Permission },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row no-print bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#1E293B] text-slate-300 flex-shrink-0 z-20 shadow-2xl">
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4 shadow-xl shadow-indigo-600/20">
            🛒
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">بقالة أسامة</h1>
          <div className="mt-1 flex justify-center">
            <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
              {user.role === 'admin' ? 'مدير النظام' : 'موظف'}
            </span>
          </div>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          {navItems.filter(item => hasPermission(item.permission)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full text-right px-6 py-4 rounded-2xl flex items-center space-x-4 space-x-reverse transition-all duration-300 ${
                currentPage === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full bg-slate-800/50 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 py-3 rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-2 font-bold"
          >
            <span>🚪</span>
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-20 flex justify-between items-center bg-white px-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-800 font-black text-lg">
              {navItems.find(i => i.id === currentPage)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-slate-400">أهلاً بك</p>
              <p className="text-sm font-black text-slate-700 uppercase">{user.username}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 uppercase">
              {user.username[0]}
            </div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
