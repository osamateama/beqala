
import React from 'react';
import { Sale } from '../types';

interface InvoiceProps {
  sale: Sale;
}

const Invoice: React.FC<InvoiceProps> = ({ sale }) => {
  return (
    <div className="bg-white p-10 text-slate-900 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:m-0 print:w-full">
      {/* Invoice Header */}
      <div className="flex justify-between items-center border-b-4 border-emerald-600 pb-8 mb-10">
        <div>
          <h1 className="text-4xl font-black text-emerald-700 mb-2">بقالة أسامة النموذجية</h1>
          <div className="text-sm text-slate-500 font-bold space-y-1">
            <p>📍 العنوان: شارع النصر، الحي التجاري - القاهرة</p>
            <p>📞 هاتف: 01002003040</p>
            <p>📧 بريد: osama-store@example.com</p>
          </div>
        </div>
        <div className="text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">فاتورة ضريبية</h2>
          <div className="text-sm font-bold text-slate-600">
            <p>الرقم المرجعي: <span className="text-emerald-600 font-black">{sale.id}</span></p>
            <p>تاريخ الإصدار: {new Date(sale.date).toLocaleDateString('ar-EG')}</p>
            <p>وقت الإصدار: {new Date(sale.date).toLocaleTimeString('ar-EG')}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">بيانات العميل</h3>
          <p className="text-xl font-black text-slate-800">{sale.customerName}</p>
          <p className="text-sm text-slate-500 mt-1 italic">شكراً لاختيارك متجرنا</p>
        </div>
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center">
          <p className="text-xs font-black text-emerald-600 mb-1">حالة الفاتورة</p>
          <div className="text-2xl font-black text-emerald-700 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            مكتملة ومسددة
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-5 font-black text-sm">م</th>
              <th className="p-5 font-black text-sm">وصف المنتج</th>
              <th className="p-5 font-black text-sm">سعر الوحدة</th>
              <th className="p-5 font-black text-sm text-center">الكمية</th>
              <th className="p-5 font-black text-sm text-left">الإجمالي الفرعي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.items.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-5 text-slate-400 font-bold">{index + 1}</td>
                <td className="p-5 font-black text-slate-800">{item.productName}</td>
                <td className="p-5 text-slate-600 font-medium">{item.price.toFixed(2)} ج.م</td>
                <td className="p-5 text-center font-bold text-slate-800">{item.quantity}</td>
                <td className="p-5 text-left font-black text-slate-900">{item.total.toFixed(2)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-20">
        <div className="w-72 space-y-3">
          <div className="flex justify-between items-center text-slate-500 px-2 font-bold">
            <span>الإجمالي قبل الضريبة:</span>
            <span>{(sale.totalPrice / 1.14).toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 px-2 font-bold">
            <span>ضريبة القيمة المضافة (14%):</span>
            <span>{(sale.totalPrice - (sale.totalPrice / 1.14)).toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between items-center bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-600/20">
            <span className="font-black text-lg">المجموع الكلي:</span>
            <span className="font-black text-2xl">{sale.totalPrice.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-auto pt-10 border-t border-dashed border-slate-300">
        <div className="flex justify-center gap-12 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl mb-2">🔄</div>
            <p className="text-[10px] font-black text-slate-400">سياسة الاستبدال: 14 يوم</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl mb-2">🚛</div>
            <p className="text-[10px] font-black text-slate-400">خدمة التوصيل متاحة</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl mb-2">🛡️</div>
            <p className="text-[10px] font-black text-slate-400">منتجات طازجة ومضمونة</p>
          </div>
        </div>
        <p className="text-xl font-black text-slate-800 mb-2 italic">نتمنى لكم يوماً سعيداً!</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Osama Smart Grocery POS System</p>
      </div>
    </div>
  );
};

export default Invoice;
