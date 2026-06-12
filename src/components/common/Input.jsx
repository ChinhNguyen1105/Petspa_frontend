import React from 'react';

export const Input = ({ 
  label, 
  icon: Icon, // Destructure icon và đổi tên thành Icon (viết hoa)
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-bold text-gray-700 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Icon (Chỉ render nếu Icon là một function/component hợp lệ) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pet-blue transition-colors">
            <Icon size={18} />
          </div>
        )}

        {/* Input Field */}
        <input
          className={`
            w-full py-3 rounded-2xl text-sm font-medium transition-all outline-none
            ${Icon ? 'pl-11 pr-4' : 'px-4'}
            ${error 
              ? 'bg-red-50 border border-red-200 text-red-900 focus:border-red-400' 
              : 'bg-gray-50 border border-transparent focus:bg-white focus:border-pet-blue/30 focus:ring-4 focus:ring-pet-blue/5 text-gray-800'
            }
            placeholder:text-gray-400
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <span className="text-xs font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};
