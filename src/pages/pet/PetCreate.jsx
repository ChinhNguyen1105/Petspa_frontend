import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, HeartPulse, Scale, Calendar, FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { usePetStore } from '../../store/petStore';
import { useCartStore } from '../../store/cartStore'; 

const PetCreate = () => {
  const navigate = useNavigate();

  // Đọc trạng thái loading và các action từ Zustand Store
  const { createPet, loading, error: storeError, clearError } = usePetStore();
  const { showToastNotification } = useCartStore(); 

  // Khởi tạo form data
  const [formData, setFormData] = useState({
    name: '',
    specie: '',          // Nhập chữ tự do (Ví dụ: DOG, CAT, RABBIT...)
    gender: 'MALE',      // Select cố định mặc định là MALE phù hợp với Enum DB
    birthday: '',        // Chuỗi LocalDate dạng YYYY-MM-DD
    weight: '',          // Kiểu số thực Float cho cân nặng
    healthStatus: ''     // Chuỗi văn bản trạng thái sức khỏe
  });

  const [validationError, setValidationError] = useState('');

  // Tự động dọn dẹp lỗi cũ của Store khi truy cập trang
  useEffect(() => {
    clearError?.();
  }, [clearError]);

  // Cập nhật state khi người dùng nhập liệu văn bản / số / select
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'weight' ? (value !== '' ? parseFloat(value) : '') : value 
    }));
  };

  // GỬI DỮ LIỆU TẠO MỚI QUA ACTION CỦA STORE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    // Validation Client cơ bản
    if (!formData.name.trim()) return setValidationError('Vui lòng điền tên của bé. ❌');
    if (!formData.specie.trim()) return setValidationError('Vui lòng nhập loại thú cưng (Ví dụ: DOG, CAT...). ❌');
    if (!formData.birthday) return setValidationError('Vui lòng nhập ngày sinh. ❌');
    if (formData.weight === '' || formData.weight <= 0) {
      return setValidationError('Cân nặng phải là số thực dương lớn hơn 0. ❌');
    }

    // Đóng gói dữ liệu gửi đi (specie tự động viết hoa toàn bộ để đồng bộ)
    const submitData = {
      name: formData.name.trim(),
      specie: formData.specie.trim().toUpperCase(), 
      gender: formData.gender, // Giữ nguyên giá trị MALE/FEMALE từ select
      birthday: formData.birthday,
      weight: formData.weight,
      healthStatus: formData.healthStatus.trim() || 'Bình thường'
    };

    // Gọi action createPet từ Zustand store
    const response = await createPet(submitData);

    // Xử lý phản hồi từ kết quả trả về
    if (response && !storeError) {
      if (showToastNotification) {
        showToastNotification("Đăng ký hồ sơ bé thành công! 🎉");
      } else {
        alert("Đăng ký hồ sơ bé thành công!");
      }
      navigate('/profile', { state: { activeTab: "pets" } }); 
    } else if (storeError) {
      if (showToastNotification) {
        showToastNotification(`${storeError} ❌`);
      } else {
        alert(storeError);
      }
    }
  };

  // Lấy ngày hiện tại làm mốc tối đa cho trường Birthday tránh chọn ngày tương lai (@PastOrPresent)
  const todayStr = new Date().toISOString().split('T')[0];

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
          <p className="text-xs text-gray-400 font-medium">Khởi tạo thông số sinh trắc học chuẩn DTO để áp dụng dịch vụ Spa</p>
        </div>
      </div>

      {/* Khối hiển thị lỗi Client / Server */}
      {(validationError || storeError) && (
        <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm font-medium">
          <AlertCircle className="flex-shrink-0 text-red-500 mt-0.5" size={18} />
          <div>{validationError || storeError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Tên Thú Cưng */}
        <Input
          label="Tên của bé *"
          icon={PawPrint}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên bé (ví dụ: Cậu Vàng, Bin Bin...)"
          required
        />

        {/* Loài (Input tự do) & Giới tính (Select cố định theo Enum DB) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Loại thú cưng *"
            icon={HeartPulse}
            name="specie"
            value={formData.specie}
            onChange={handleInputChange}
            placeholder="Ví dụ: DOG, CAT, RABBIT..."
            required
          />

          {/* Trường Giới tính dùng Select chuẩn Enum */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <HeartPulse size={15} className="text-gray-400" /> Giới tính *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px] text-gray-800 bg-[image:none]"
            >
              <option value="MALE">🎯 Đực (MALE)</option>
              <option value="FEMALE">🎀 Cái (FEMALE)</option>
            </select>
          </div>
        </div>

        {/* Ngày sinh & Cân nặng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar size={15} className="text-gray-400" /> Ngày sinh sinh học *
            </label>
            <input
              type="date"
              name="birthday"
              max={todayStr}
              value={formData.birthday}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 transition-all text-gray-800 bg-white h-[46px]"
              required
            />
          </div>

          <Input
            label="Cân nặng thực tế (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            min="0.01"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Ví dụ: 8.5"
            required
          />
        </div>

        {/* Trạng thái sức khỏe / Lưu ý Spa */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <FileText size={15} className="text-gray-400" /> Tình trạng sức khỏe & Lưu ý đặc biệt
          </label>
          <textarea
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleInputChange}
            rows="4"
            placeholder="Ghi chú tiền sử bệnh lý, dị ứng thuốc, dị ứng thức ăn hoặc các biểu hiện đặc biệt để nhân viên lưu ý khi làm dịch vụ..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none leading-relaxed text-gray-800"
          />
        </div>

        {/* Footer Nút hành động */}
        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/profile", { state: { activeTab: "pets" } })}
            disabled={loading}
            className="rounded-xl font-bold px-6"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl font-black px-8 shadow-md shadow-pet-blue/10 uppercase text-sm tracking-wider flex items-center gap-2"
          >
            {loading ? "Đang lưu hồ sơ..." : "Hoàn tất đăng ký"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetCreate;