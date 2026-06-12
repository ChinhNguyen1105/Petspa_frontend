import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  // Định nghĩa các bảng màu dựa trên hệ màu của dự án (pet-blue, pet-orange)
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-pet-blue/10 text-pet-blue',
    secondary: 'bg-pet-orange/10 text-pet-orange',
    success: 'bg-green-100 text-green-600',
    danger: 'bg-red-100 text-red-600',
    outline: 'border border-gray-200 text-gray-500 bg-transparent',
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 
        rounded-full text-xs font-bold tracking-wide
        transition-all duration-200
        ${variantClass}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export { Badge };