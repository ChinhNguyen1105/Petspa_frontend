import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, HeartPulse, Scale, Calendar, FileText, ArrowLeft, Camera, UploadCloud } from 'lucide-react';
import {Input} from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { usePetStore } from '../../store/petStore'; // Import petStore vừa tạo
import { useCartStore } from '../../store/cartStore'; // Nếu bạn muốn dùng showToastNotification đồng bộ

const PetCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 

  // Đọc các trạng thái và action cần thiết từ Zustand
  const { createPet, submitting } = usePetStore();
  const { showToastNotification } = useCartStore(); // Dự phòng Toast nếu có, không có sẽ dùng alert()

  // Khởi tạo các trường dữ liệu trên Form UI
  const [formData, setFormData] = useState({
    name: '',
    species_name: 'Dog', 
    breed: '',
    weight_kg: '',      
    age: '',
    color: '',
    gender: 'Male',      
    personality: '',     
    allergies: '',       
    medical_note: ''     
  });

  const [imagePreview, setImagePreview] = useState(''); 

  // Xử lý khi chọn ảnh đại diện cho bé
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        if (showToastNotification) showToastNotification('Vui lòng chỉ chọn file hình ảnh hợp lệ! ❌');
        else alert('Vui lòng chỉ chọn file hình ảnh hợp lệ!');
        return;
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Cập nhật state khi nhập liệu văn bản / số lượng
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // GỬI DỮ LIỆU TẠO MỚI QUA ACTION CỦA STORE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chuẩn hóa cấu trúc và kiểu dữ liệu trước khi đẩy vào Store
    const submitData = {
      name: formData.name,
      breed: formData.breed,
      gender: formData.gender,
      age: parseInt(formData.age, 10) || 0,
      weight_kg: parseFloat(formData.weight_kg) || 0,
      color: formData.color || "Chưa rõ",
      personality: formData.personality || "Thân thiện",
      allergies: formData.allergies || "Không có",
      medical_note: formData.medical_note || "Không có",
      species: {
        id: formData.species_name === 'Dog' ? 1 : 2,
        name: formData.species_name
      },
      thumbnail: imagePreview || (formData.species_name === 'Cat' 
        ? 'https://placehold.co/300x300?text=Cat+Mochi' 
        : 'https://placehold.co/300x300?text=Corgi+Banh+Mi')
    };

    // Gọi trực tiếp action từ Zustand store
    const response = await createPet(submitData);

    // Xử lý phản hồi dựa trên cấu trúc Store (Store của bạn linh hoạt bọc res.success hoặc res thô)
    if (response && (response.success || response.id)) {
      if (showToastNotification) {
        showToastNotification("Đăng ký hồ sơ bé thành công! 🎉");
      } else {
        alert("Đăng ký hồ sơ bé thành công!");
      }
      // Chuyển hướng về tab quản lý thú cưng
      navigate('/profile', { state: { activeTab: "pets" } }); 
    } else {
      const errorMsg = response?.message || "Có lỗi xảy ra khi tạo hồ sơ thú cưng.";
      if (showToastNotification) {
        showToastNotification(`${errorMsg} ❌`);
      } else {
        alert(errorMsg);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left max-w-2xl mx-auto my-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-50 mb-6">
        <button 
          onClick={() => navigate("/profile", { state: { activeTab: "pets" } })} 
          className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-colors"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-pet-blue uppercase tracking-tight flex items-center gap-2">
            <PawPrint size={22} /> Đăng ký thành viên mới
          </h2>
          <p className="text-xs text-gray-400 font-medium">Thêm thông tin thú cưng của bạn để nhận dịch vụ chăm sóc tốt nhất</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* KHU VỰC TẢI ẢNH ĐẠI DIỆN */}
        <div className="flex flex-col items-center justify-center py-5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-2">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Pet Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                <UploadCloud size={28} className="mb-1 text-gray-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-3 text-xs font-bold text-pet-blue hover:underline flex items-center gap-1"
          >
            Tải lên hình ảnh của bé
          </button>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Tên Thú Cưng */}
        <Input
          label="Tên của bé *"
          icon={PawPrint}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên bé (ví dụ: Corgi Bánh Mì, Mochi...)"
          required
        />

        {/* Loài & Giới tính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <HeartPulse size={15} className="text-gray-400" /> Loài thú cưng
            </label>
            <select
              name="species_name"
              value={formData.species_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px]"
            >
              <option value="Dog">Chó (Dog)</option>
              <option value="Cat">Mèo (Cat)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <HeartPulse size={15} className="text-gray-400" /> Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px]"
            >
              <option value="Male">🎯 Đực (Male)</option>
              <option value="Female">🎀 Cái (Female)</option>
            </select>
          </div>
        </div>

        {/* Giống loài & Màu sắc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Giống loài (Breed)"
            icon={HeartPulse}
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="Ví dụ: Corgi, Poodle, British Shorthair..."
          />

          <Input
            label="Màu lông (Color)"
            icon={HeartPulse}
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="Ví dụ: Vàng trắng, Xám tro..."
          />
        </div>

        {/* Cân nặng & Tuổi đời */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cân nặng ước tính (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            name="weight_kg"
            value={formData.weight_kg}
            onChange={handleInputChange}
            placeholder="Ví dụ: 12.5"
            required
          />

          <Input
            label="Tuổi đời (Tuổi)"
            icon={Calendar}
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Ví dụ: 2"
          />
        </div>

        {/* Tính cách & Dị ứng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tính cách đặc trưng"
            icon={HeartPulse}
            name="personality"
            value={formData.personality}
            onChange={handleInputChange}
            placeholder="Ví dụ: Thân thiện, sợ máy sấy..."
          />

          <Input
            label="Tình trạng dị ứng (nếu có)"
            icon={HeartPulse}
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            placeholder="Ví dụ: Dị ứng thịt gà, không có..."
          />
        </div>

        {/* Ghi chú tiền sử bệnh lý / Lưu ý Spa */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <FileText size={15} className="text-gray-400" /> Lưu ý đặc biệt / Tiền sử bệnh lý
          </label>
          <textarea
            name="medical_note"
            value={formData.medical_note}
            onChange={handleInputChange}
            rows="3"
            placeholder="Ví dụ: Từng bị viêm da nhẹ, cần dùng loại sữa tắm dịu nhẹ..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none"
          />
        </div>

        {/* Footer Nút hành động */}
        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/profile", { state: { activeTab: "pets" } })}
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
            {submitting ? "Đang lưu..." : "Hoàn tất đăng ký"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetCreate;