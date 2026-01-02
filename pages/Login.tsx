
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../mockDb';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const users = await db.getUsers();
      const foundUser = users.find(u => u.username === username && u.password === password);
      
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      setError('فشل الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="text-5xl mb-4 relative z-10">🛡️</div>
            <h1 className="text-3xl font-black relative z-10">متجر أسامة</h1>
            <p className="mt-2 text-indigo-100 text-sm font-medium relative z-10">نظام إدارة المبيعات الذكي</p>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-500 text-xs font-black uppercase mb-2 px-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-slate-600 font-bold"
                  placeholder="أدخل اليوزر"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-black uppercase mb-2 px-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-slate-600 font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && <div className="text-rose-500 text-sm font-bold text-center">{error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:bg-slate-300"
              >
                {loading ? 'جاري التحقق...' : 'دخول للنظام'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
