import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Eye, Scale } from 'lucide-react';
import { Badge } from './Badge';

const PetCard = ({ pet }) => {
  
  // HÀM HELPER: Tính tuổi dựa trên ngày sinh (birthday)
  const calculateAge = (birthday) => {
    if (!birthday) return 'Chưa rõ tuổi';
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Nếu chưa tới tháng sinh hoặc cùng tháng nhưng chưa tới ngày sinh thì trừ đi 1 tuổi
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 1) {
      // Nếu dưới 1 tuổi, tính theo tháng
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
      return months <= 0 ? 'Mới sinh' : `${months} tháng`;
    }
    
    return `${age} tuổi`;
  };

  // HÀM HELPER: Lấy ảnh mặc định theo loài (specie) vì data mới không có trường image
  const getPetPlaceholderImage = (specie) => {
    const type = specie?.toLowerCase();
    if (type === 'dog') {
      return "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=500"; // Ảnh chó
    }
    if (type === 'cat') {
      return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500"; // Ảnh mèo
    }
    return "https://images.unsplash.com/photo-1535268647977-a403b69fc756?q=80&w=500"; // Ảnh thú cưng chung
  };

  // Chuẩn hóa dữ liệu giới tính (Xử lý cả 'MALE', 'Male', 'FEMALE', 'Female')
  const isMale = pet.gender?.toUpperCase() === 'MALE';

  return (
    <div className="group bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-pet-blue/20 transition-all duration-300 text-left">
      
      {/* Hình ảnh với overlay và Badge giới tính */}
      <div className="relative w-full h-56 overflow-hidden rounded-2xl mb-4 bg-gray-50">
        <img 
          src={pet.image || getPetPlaceholderImage(pet.specie)} 
          alt={pet.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 right-3">
          <Badge 
            variant={isMale ? 'default' : 'secondary'} 
            className="backdrop-blur-md bg-white/80 border-0 text-xs font-bold"
          >
            {isMale ? '♂ Đực' : '♀ Cái'}
          </Badge>
        </div>
      </div>

      {/* Thông tin thú cưng dựa theo các trường data mới */}
      <div className="px-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-black text-gray-900 group-hover:text-pet-blue transition-colors">
            {pet.name}
          </h3>
          
          {/* Hiển thị cân nặng kèm icon nhỏ xinh */}
          {pet.weight && (
            <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
              <Scale size={12} className="text-gray-400" />
              {pet.weight} kg
            </span>
          )}
        </div>
        
        {/* Render loài (specie) và tuổi tính từ ngày sinh (birthday) */}
        <p className="text-sm font-medium text-gray-400 mb-4 truncate">
          {pet.specie === 'Dog' ? 'Chó' : pet.specie === 'Cat' ? 'Mèo' : pet.specie || 'Thú cưng'} • {calculateAge(pet.birthday)}
        </p>
      </div>
      
      {/* Nút hành động */}
      <div className="flex gap-2">
        <Link to={`/profile/pets/detail/${pet.id}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-pet-blue hover:text-white transition-all text-sm font-bold cursor-pointer border-none">
            <Eye size={16} /> Xem
          </button>
        </Link>
        
        <Link to={`/profile/pets/edit/${pet.id}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-pet-orange hover:text-white transition-all text-sm font-bold cursor-pointer border-none">
            <Edit2 size={16} /> Sửa
          </button>
        </Link>
      </div>

    </div>
  );
};

export default PetCard;