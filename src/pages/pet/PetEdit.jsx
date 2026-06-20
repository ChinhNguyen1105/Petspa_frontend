import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PawPrint,
  HeartPulse,
  Scale,
  Calendar,
  FileText,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import { useCartStore } from "../../store/cartStore";
import { usePetStore } from "../../store/petStore";

const PetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  // 1. BÓC TÁCH STATE VÀ ACTIONS TỪ ZUSTAND STORE
  const { currentPet, loading, submitting, fetchPetById, updatePet } =
    usePetStore();

  // Form State map chính xác theo ReqUpdatePet của Backend
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    specie: "",
    gender: "",
    birthday: "",
    weight: "",
    healthStatus: "",
  });

  const [localError, setLocalError] = useState(null);

  // 2. FETCH DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    if (id) {
      fetchPetById(id);
    }
  }, [id, fetchPetById]);

  // 3. ĐỒNG BỘ DỮ LIỆU TỪ STORE VÀO FORM STATE
  useEffect(() => {
    if (currentPet && String(currentPet.id) === String(id)) {
      setFormData({
        id: currentPet.id || "",
        name: currentPet.name || "",
        specie: currentPet.specie || "", // Nếu backend trả về object, map lại thành string: currentPet.specie?.name hoặc giữ nguyên tùy cấu trúc data cũ
        gender: currentPet.gender || "",
        birthday: currentPet.birthday || "", // Đảm bảo định dạng yyyy-MM-dd để input[type=date] nhận diện được
        weight: currentPet.weight || "",
        healthStatus: currentPet.healthStatus || "",
      });
    } else if (!loading && !currentPet) {
      setLocalError("Không tìm thấy thông tin thú cưng.");
    }
  }, [currentPet, id, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. SUBMIT FORM QUA ZUSTAND ACTION
  // 4. SUBMIT FORM QUA ZUSTAND ACTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sửa lỗi: Bỏ khai báo kiểu dữ liệu Long của Java trong JS
    const submitData = {
      id: parseInt(formData.id, 10),
      name: formData.name,
      specie: formData.specie,
      gender: formData.gender,
      birthday: formData.birthday,
      weight: parseFloat(formData.weight) || 0,
      healthStatus: formData.healthStatus || null,
    };

    const result = await updatePet(id, submitData);
    console.log("update success with response: ", result);

    if (result && result.status === "SUCCESS") {
      showToast(`Cập nhật thông tin thú cưng ${result.data.name} thành công!`);
      navigate(`/profile`);
    } else {
      alert(result?.message || "Có lỗi xảy ra khi cập nhật thông tin.");
    }
  };

  // Giao diện khi đang tải dữ liệu ban đầu
  if (loading && !currentPet) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="large" />
      </div>
    );
  }

  // Giao diện lỗi khi không tìm thấy pet
  if (localError) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <p className="text-red-500 font-bold mb-4">{localError}</p>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          Quay lại hồ sơ
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-50 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-colors"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-pet-blue uppercase tracking-tight flex items-center gap-2">
            <PawPrint size={22} /> Chỉnh sửa thông tin bé
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Cập nhật chính xác các thông tin cơ bản phục vụ cho việc quản lý
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tên Thú Cưng */}
        <Input
          label="Tên của bé *"
          icon={PawPrint}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên bé..."
          required
        />

        {/* Loài & Giới Tính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Loài sinh vật * (Specie)"
            icon={HeartPulse}
            name="specie"
            value={formData.specie}
            onChange={handleInputChange}
            placeholder="Ví dụ: DOG, CAT..."
            required
          />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Heart size={15} className="text-gray-400" /> Giới tính *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px]"
            >
              <option value="" disabled>
                -- Chọn giới tính --
              </option>
              <option value="MALE">Đực (MALE)</option>
              <option value="FEMALE">Cái (FEMALE)</option>
              <option value="UNKNOWN">Chưa rõ (UNKNOWN)</option>
            </select>
          </div>
        </div>

        {/* Ngày sinh & Cân nặng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ngày sinh * (Birthday)"
            icon={Calendar}
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]} // Giới hạn @PastOrPresent từ Client
            required
          />

          <Input
            label="Cân nặng (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            min="0.1" // Khống chế @Positive tránh số âm hoặc bằng 0
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Ví dụ: 4.5"
            required
          />
        </div>

        {/* Tình trạng sức khỏe */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <FileText size={15} className="text-gray-400" /> Tình trạng sức khỏe
            (Health Status)
          </label>
          <textarea
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleInputChange}
            rows="3"
            placeholder="Mô tả tình trạng sức khỏe hiện tại của bé (nếu có)..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none"
          />
        </div>

        {/* Footer Nút bấm */}
        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-xl font-bold px-6"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-xl font-black px-8 shadow-md shadow-pet-blue/10 uppercase text-sm tracking-wider"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetEdit;
