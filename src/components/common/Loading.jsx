import React from 'react';
import { PawPrint } from 'lucide-react';

const Loading = ({ fullScreen = false, size = "md", text = "Đang tải..." }) => {
  // Định nghĩa kích thước icon
  const sizes = {
    sm: 24,
    md: 40,
    lg: 60
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Vòng xoay bên ngoài */}
        <div className={`
          animate-spin rounded-full border-4 border-gray-100 border-t-pet-blue
          ${size === 'sm' ? 'w-10 h-10 border-2' : size === 'md' ? 'w-16 h-16' : 'w-24 h-24'}
        `}></div>
        
        {/* Icon dấu chân nhịp điệu ở giữa */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-pet-orange animate-pulse">
          <PawPrint size={sizes[size]} fill="currentColor" />
        </div>
      </div>
      
      {text && (
        <p className="text-sm font-bold text-pet-blue tracking-widest animate-bounce uppercase">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loading;