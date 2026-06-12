import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Heart, Award, Smile } from 'lucide-react';

// Thành phần con xử lý hiệu ứng nhảy số tự động
const AnimatedNumber = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false); // Tránh chạy lại nhiều lần không cần thiết

  // Hàm tách số từ chuỗi (Ví dụ: "15,000+" -> 15000, "99%" -> 99)
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);
  // Lấy các ký tự đặc biệt đi kèm ở trước hoặc sau (Ví dụ: "%", "+", "+ Năm")
  const suffix = target.replace(/[0-9,]/g, '');
  const hasComma = target.includes(',');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Khi phần tử xuất hiện trên màn hình và chưa từng chạy animation
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // Tính toán giá trị hiện tại dựa trên tiến độ thời gian (Ease-out công thức)
            const progressRatio = Math.min(progress / duration, 1);
            // Công thức Ease Out Quad giúp số chạy chậm dần lại khi gần tới đích tạo cảm giác mượt mà
            const easeOutProgress = progressRatio * (2 - progressRatio); 
            
            const currentValue = Math.floor(easeOutProgress * numericTarget);

            setCount(currentValue);

            if (progress < duration) {
              requestAnimationFrame(animate);
            } else {
              setCount(numericTarget); // Đảm bảo số dừng đúng target chuẩn
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 } // Xuất hiện 10% diện tích là kích hoạt ngay
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [numericTarget, duration]);

  // Định dạng lại dấu phẩy cho hàng nghìn nếu chuỗi gốc có dấu phẩy (Ví dụ: 15000 -> 15,000)
  const formatNumber = (num) => {
    if (hasComma) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num;
  };

  return (
    <span ref={elementRef} className="text-2xl font-black text-slate-800 tabular-nums">
      {target.startsWith(suffix) ? suffix : ''}
      {formatNumber(count)}
      {!target.startsWith(suffix) ? suffix : ''}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    { icon: <ShieldCheck size={32} className="text-pet-orange" />, customCount: "100%", label: "Sản phẩm chính hãng" },
    { icon: <Heart size={32} className="text-pet-blue" />, customCount: "15,000+", label: "Thú cưng được chăm sóc" },
    { icon: <Award size={32} className="text-pet-orange" />, customCount: "5+ Năm", label: "Kinh nghiệm phục vụ" },
    { icon: <Smile size={32} className="text-pet-blue" />, customCount: "99%", label: "Khách hàng hài lòng" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-8 rounded-2xl mb-16 border border-slate-100 shadow-sm">
      {stats.map((item, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center text-center p-4 transform hover:-translate-y-1 transition-transform duration-300"
        >
          {/* Icon kèm hiệu ứng nổi bật nhẹ */}
          <div className="mb-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          
          {/* Gọi thành phần số hiệu ứng nhảy đếm ngược */}
          <AnimatedNumber target={item.customCount} duration={2000} />
          
          <span className="text-sm font-medium text-slate-500 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;