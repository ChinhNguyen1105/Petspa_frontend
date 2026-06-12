export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", // Thêm prop size, mặc định là trung bình
  className = "", 
  ...props 
}) => {
  const variants = {
    primary: "bg-pet-blue text-white hover:bg-opacity-90",
    secondary: "bg-pet-orange text-white hover:bg-opacity-90",
    outline: "border-2 border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white",
  };

  // Định nghĩa các kích thước ở đây
  const sizes = {
    xs: "px-3 py-1 text-xs",       // Nhỏ nhất (Extra Small)
    sm: "px-4 py-1.5 text-sm",     // Nhỏ (Small)
    md: "px-6 py-2.5 text-base",   // Vừa (Medium - Kích thước gốc của bạn)
    lg: "px-8 py-3.5 text-lg",     // Lớn (Large)
  };
  
  return (
    <button 
      className={`rounded-full font-semibold transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};