import React from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';
import {Card }from '../../../components/ui/Card';

const CoreValues = () => {
  const values = [
    {
      icon: <Heart size={32} className="text-pet-orange" />,
      title: "Tình Yêu Thương",
      desc: "Mọi dịch vụ và sản phẩm đều xuất phát từ sự thấu hiểu và tình yêu vô điều kiện dành cho thú cưng."
    },
    {
      icon: <Sparkles size={32} className="text-pet-blue" />,
      title: "Chất Lượng Vượt Trội",
      desc: "Trang thiết bị spa tân tiến, sản phẩm nhập khẩu chính hãng bảo mật tối đa sức khỏe của các boss."
    },
    {
      icon: <ShieldCheck size={32} className="text-pet-orange" />,
      title: "Trách Nhiệm Khách Hàng",
      desc: "Cam kết đồng hành chu đáo, theo sát lịch trình tiêm chủng và tư vấn dinh dưỡng trọn đời."
    }
  ];

  return (
    <div className="py-16 bg-slate-50 rounded-3xl px-8 mb-16 border border-slate-100">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-pet-orange font-bold text-xs uppercase tracking-widest block mb-2">Giá trị làm nên thương hiệu</span>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Triết Lý Của Chúng Tôi</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((val, idx) => (
          <Card key={idx} className="p-6 bg-white hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl mb-4 border border-slate-100">
              {val.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{val.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{val.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoreValues;