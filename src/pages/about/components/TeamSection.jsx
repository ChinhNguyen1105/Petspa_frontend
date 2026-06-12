// src/pages/home/sections/TeamSection.jsx
import React from 'react';
import { Badge } from '../../../components/ui/Badge';

const TeamSection = ({ staffs = [] }) => {
  // Trả về null hoặc giao diện trống nếu không có dữ liệu đội ngũ
  if (!staffs.length) return null;

  return (
    <div className="py-12">
      {/* Header Section */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-pet-blue font-bold text-xs uppercase tracking-widest block mb-2">
          Đội ngũ chuyên nghiệp
        </span>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
          Gặp Gỡ Chuyên Gia
        </h2>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {staffs.map((member) => {
          const name = member?.full_name || member?.name || "Chuyên gia";
          const avatar = member?.avatar || member?.img || "https://placehold.co/300x300";
          const role = member?.account?.role?.name || member?.role || "Nhân viên";

          return (
            <div
              key={member.id || member._id}
              className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group"
            >
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border-2 border-slate-100 group-hover:border-pet-blue transition-colors">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <Badge
                  variant="primary"
                  className="bg-pet-blue/10 text-pet-blue font-bold mb-2 inline-block"
                >
                  {role}
                </Badge>

                <h3 className="text-xl font-bold text-slate-800">
                  {name}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Hơn 5 năm kinh nghiệm yêu thương và chăm sóc các người bạn nhỏ.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSection;