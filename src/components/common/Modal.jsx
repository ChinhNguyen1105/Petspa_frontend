import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm:   'max-w-sm',    // 384px
  md:   'max-w-lg',    // 512px — default
  lg:   'max-w-3xl',   // 768px
  xl:   'max-w-4xl',   // 896px
  '2xl': 'max-w-5xl',  // 1024px
  full: 'max-w-[95vw]',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidth = SIZE_MAP[size] ?? SIZE_MAP.md; // fallback về md nếu truyền sai

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* 👇 maxWidth động theo prop size */}
      <div className={`bg-white w-full ${maxWidth} rounded-[32px] shadow-2xl relative z-10 overflow-hidden transform transition-all animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]`}>
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-black text-pet-blue tracking-tight uppercase">
            {title || "Thông báo"}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;