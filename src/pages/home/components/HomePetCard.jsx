import React from 'react';
import { Heart } from 'lucide-react';

const HomePetCard = ({ pet, onClick }) => {
  // Giả định dữ liệu pet từ petService có các thuộc tính này
  const { name, image, breed, age, gender } = pet;

  // 🔥 ĐỒNG BỘ LOGIC AN TOÀN: Đề phòng mock trả về breed dưới dạng Object { id, name }
  const displayBreed = breed && typeof breed === 'object'
    ? (breed.name || breed.title)
    : (breed || 'Thú cưng');

  // 🔥 ĐỒNG BỘ LOGIC AN TOÀN: Đề phòng mock trả về gender dưới dạng Object hoặc String
  const displayGender = gender && typeof gender === 'object'
    ? (gender.name || gender.value)
    : (gender || 'Chưa rõ');

  // Chuẩn hóa chuỗi giới tính để kiểm tra điều kiện tô màu sắc (Pink / Blue)
  const genderKey = String(displayGender).toLowerCase();
  const isFemale = genderKey === 'female' || genderKey === 'cái';

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col h-full"
    >
      {/* Khu vực ảnh tràn viền với lớp phủ gradient */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img 
          src={image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500"} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Lớp phủ đen mờ nhẹ ở đáy ảnh để làm nổi bật thông tin */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Nút thả tim trang trí góc phải */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Ngăn hành vi kích hoạt sự kiện onClick của toàn thẻ Card khi bấm thả tim
          }}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white transition-colors shadow-sm"
        >
          <Heart size={18} className="fill-current" />
        </button>

        {/* Giới tính tag đè lên ảnh — Đã sửa đổi sử dụng logic chuỗi an toàn */}
        <span className={`absolute bottom-3 left-4 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${
          isFemale ? 'bg-pink-500' : 'bg-blue-500'
        }`}>
          {displayGender}
        </span>
      </div>

      {/* Khu vực thông tin chi tiết bên dưới */}
      <div className="p-5 flex flex-col flex-grow text-left">
        {/* SỬA TẠI ĐÂY: Sử dụng text giống loài đã chuẩn hóa */}
        <span className="text-xs font-bold text-pet-orange uppercase tracking-wider mb-1 block">
          {displayBreed}
        </span>
        <h4 className="text-xl font-black text-slate-800 group-hover:text-pet-blue transition-colors mb-2 line-clamp-1">
          {name}
        </h4>
        
        {/* Tuổi của bé */}
        <p className="text-sm text-slate-500 font-medium mb-4">
          Tuổi: <span className="text-slate-700 font-semibold">{age || 'Đang cập nhật'}</span>
        </p>
      </div>
    </div>
  );
};

export default HomePetCard;