import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';

const facilities = [
  {
    icon: "🛁",
    title: "Phòng tắm & sấy khô",
    desc: "Bồn tắm inox chuyên dụng, máy sấy lồng tách biệt từng thú cưng, khử khuẩn sau mỗi ca.",
  },
  {
    icon: "✂️",
    title: "Khu cắt tỉa lông",
    desc: "Bàn grooming chống trượt, dụng cụ thép y tế tiệt trùng, ánh sáng đèn LED chuyên nghiệp.",
  },
  {
    icon: "🏠",
    title: "Phòng nghỉ cá nhân",
    desc: "Mỗi bé có ô riêng có đệm mềm, hệ thống thông gió & điều hòa 24/7, camera giám sát.",
  },
  {
    icon: "🩺",
    title: "Góc kiểm tra sức khỏe",
    desc: "Cân điện tử, đèn khám da lông, bác sĩ tư vấn on-call — phát hiện sớm bất thường.",
  },
];

const FacilitiesTeaser = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-slate-900 to-pet-blue text-white p-8 rounded-3xl mb-16 shadow-lg">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <span className="bg-pet-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Không gian chăm sóc
          </span>
          <h3 className="text-2xl font-black mt-3 tracking-tight uppercase leading-snug">
            Cơ Sở Vật Chất <br />
            <span className="text-pet-orange">Tiêu Chuẩn Quốc Tế</span>
          </h3>
          <p className="text-slate-300 text-sm mt-3 max-w-sm leading-relaxed">
            Mỗi góc của Boss Spa được thiết kế riêng cho sự thoải mái và an toàn của thú cưng — sạch sẽ, hiện đại, kiểm soát nhiệt độ toàn thời gian.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/spa')}
          className="bg-pet-orange hover:bg-orange-600 border-none font-bold text-sm text-white self-start md:self-auto shrink-0"
        >
          Đặt lịch trải nghiệm →
        </Button>
      </div>

      {/* Facility grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facilities.map((item, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/15 transition-colors duration-200"
          >
            <span className="text-3xl">{item.icon}</span>
            <p className="font-bold text-white text-sm leading-snug">{item.title}</p>
            <p className="text-slate-300 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        {[
          { value: "500+", label: "Thú cưng đã phục vụ" },
          { value: "4.9★", label: "Đánh giá trung bình" },
          { value: "100%", label: "Dụng cụ tiệt trùng" },
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-2xl font-black text-pet-orange">{stat.value}</p>
            <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacilitiesTeaser;