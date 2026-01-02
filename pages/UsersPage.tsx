
import React, { useState, useEffect } from 'react';
import { db } from '../mockDb';
import { User, Permission } from '../types';

interface UsersPageProps {
  user: User;
}

const ALL_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'view_dashboard', label: 'رؤية لوحة التحكم' },
  { id: 'manage_inventory', label: 'إضافة وتعديل المخزون' },
  { id: 'delete_inventory', label: 'حذف الأصناف' },
  { id: 'pos_access', label: 'استخدام الكاشير' },
  { id: 'manage_users', label: 'إدارة المستخدمين' },
];

const UsersPage: React.FC<UsersPageProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>(['view_dashboard', 'pos_access']);

  useEffect(() => { loadUsers(); }, []);
  
  const loadUsers = async () => { 
    setLoading(true);
    try {
      const data = await db.getUsers();
      setUsers(data); 
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setUsername(u.username);
      setPassword(u.password || '');
      setRole(u.role);
      setSelectedPerms(u.permissions);
    } else {
      setEditingUser(null);
      setUsername('');
      setPassword('');
      setRole('staff');
      setSelectedPerms(['view_dashboard', 'pos_access']);
    }
    setIsModalOpen(true);
  };

  const togglePermission = (p: Permission) => {
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await db.updateUser(editingUser.id, { username, password, role, permissions: selectedPerms });
    } else {
      await db.addUser({ username, password, role, permissions: selectedPerms });
    }
    await loadUsers();
    setIsModalOpen(false);
  };

  const handleDelete = async (u: User) => {
    if (u.username === 'osama') return alert('لا يمكن حذف المدير الرئيسي');
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await db.deleteUser(u.id);
      await loadUsers();
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800">إدارة المستخدمين</h3>
          <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
            ➕ مستخدم جديد
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">المستخدم</th>
                  <th className="px-8 py-5">الدور</th>
                  <th className="px-8 py-5 text-center">خيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black uppercase text-xs">
                              {u.username[0]}
                          </div>
                          <span className="font-black text-slate-700">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role === 'admin' ? 'مدير' : 'موظف'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center space-x-2 space-x-reverse">
                      <button onClick={() => handleOpenModal(u)} className="text-indigo-500 hover:underline font-bold text-sm">تعديل</button>
                      {u.username !== 'osama' && (
                          <button onClick={() => handleDelete(u)} className="text-rose-400 hover:text-rose-600 font-bold text-sm">حذف</button>
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
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{editingUser ? 'تعديل المستخدم' : 'مستخدم جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl text-slate-300 hover:text-rose-500">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">اسم المستخدم</label>
                  <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" required />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-black uppercase mb-2">كلمة المرور</label>
                  <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none text-slate-600 font-bold" required />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-[10px] font-black uppercase mb-4">الصلاحيات الممنوحة</label>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map(p => (
                    <button 
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-right ${
                            selectedPerms.includes(p.id) 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedPerms.includes(p.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'}`}>
                            {selectedPerms.includes(p.id) && '✓'}
                        </div>
                        <span className="font-bold text-sm">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                حفظ بيانات المستخدم
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
