import React from "react";
import { Link } from "react-router-dom";
import {
  Edit2,
  Eye,
  Scale,
  Calendar,
  Activity,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import { Badge } from "./Badge";

const PetCard = ({ pet }) => {
  // HÀM HELPER: Tính tuổi dựa trên ngày sinh (birthday)
  const calculateAge = (birthday) => {
    if (!birthday) return "Chưa rõ tuổi";
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 1) {
      const months =
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        today.getMonth() -
        birthDate.getMonth();
      return months <= 0 ? "Mới sinh" : `${months} tháng`;
    }

    return `${age} tuổi`;
  };

  // HÀM HELPER: Lấy Cấu hình Icon chính thống & Màu sắc theo loài (specie)
  const getSpecieConfig = (specie) => {
    const type = specie?.toLowerCase();
    if (type === "dog") {
      return {
        label: "Chó",
        bgColor: "bg-amber-50 text-amber-600 border-amber-100",
        IconComponent: Dog,
      };
    }
    if (type === "cat") {
      return {
        label: "Mèo",
        bgColor: "bg-sky-50 text-sky-600 border-sky-100",
        IconComponent: Cat,
      };
    }
    return {
      label: specie || "Thú cưng",
      bgColor: "bg-purple-50 text-purple-600 border-purple-100",
      IconComponent: PawPrint,
    };
  };

  // Chuẩn hóa dữ liệu giới tính dựa trên Enum (MALE, FEMALE, UNKNOWN)
  const isMale = pet.gender?.toUpperCase() === "MALE";
  const isFemale = pet.gender?.toUpperCase() === "FEMALE";

  const { label, bgColor, IconComponent } = getSpecieConfig(pet.specie);

  return (
    <div className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-pet-blue/20 transition-all duration-300 text-left flex flex-col justify-between min-h-[220px]">
      <div>
        {/* Hàng đầu: Icon loài (Chính thống Lucide) & Badge giới tính */}
        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl border text-xs font-bold ${bgColor}`}
          >
            <IconComponent size={14} className="shrink-0" />
            <span>{label}</span>
          </div>

          <Badge
            variant={isMale ? "default" : isFemale ? "secondary" : "outline"}
            className="text-xs font-bold px-2.5 py-1 rounded-xl"
          >
            {isMale ? "♂ Đực" : isFemale ? "♀ Cái" : "⚦ Chưa rõ"}
          </Badge>
        </div>

        {/* Tên Pet */}
        <h3 className="text-xl font-black text-gray-900 group-hover:text-pet-blue transition-colors mb-4 truncate">
          {pet.name}
        </h3>

        {/* Khu vực thông tin chi tiết (Grid) */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Tuổi */}
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-semibold truncate">
              {calculateAge(pet.birthday)}
            </span>
          </div>

          {/* Cân nặng */}
          <div className="flex items-center gap-2 text-gray-500">
            <Scale size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-semibold truncate">
              {pet.weight ? `${pet.weight} kg` : "---"}
            </span>
          </div>

          {/* Tình trạng sức khỏe */}
          <div className="flex items-center gap-2 text-gray-500 col-span-2 border-t border-gray-50 pt-2 mt-0.5">
            <Activity size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-gray-400 truncate">
              {pet.healthStatus || "Tình trạng sức khỏe ổn định"}
            </span>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        <Link to={`/profile/pets/detail/${pet.id}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-pet-blue hover:text-white transition-all text-xs font-bold cursor-pointer border-none">
            <Eye size={14} /> Xem
          </button>
        </Link>

        <Link to={`/profile/pets/edit/${pet.id}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-pet-orange hover:text-white transition-all text-xs font-bold cursor-pointer border-none">
            <Edit2 size={14} /> Sửa
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PetCard;
