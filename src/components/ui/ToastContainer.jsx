import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore'; 

const ToastContainer = () => {
  // Lấy đầy đủ show, message và type từ store
  const { show, message, type } = useCartStore((state) => state.toast);

  const isSuccess = type === 'success';

  return (
    <div 
      className={`fixed top-24 right-0 z-[9999] transition-transform duration-500 ease-out 
        ${show ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div 
        className={`text-white px-6 py-4 rounded-l-2xl shadow-2xl flex items-center gap-3 border border-r-0 border-white/10 min-w-[280px]
          ${isSuccess ? 'bg-pet-blue' : 'bg-red-500'}`}
      >
        {/* Đổi icon động theo loại trạng thái */}
        {isSuccess ? (
          <Check className="bg-white text-pet-blue rounded-full p-0.5" size={18} />
        ) : (
          <AlertCircle className="bg-white text-red-500 rounded-full p-0.5" size={18} />
        )}
        
        <span className="font-bold text-sm tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default ToastContainer;