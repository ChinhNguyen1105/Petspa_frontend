import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { usePetStore } from '../../store/petStore';

const PetDetail = () => {
  const { id } = useParams(); // Nếu có id trên URL => Chế độ Update, ngược lại là Create
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { 
    currentPet, 
    loading, 
    error: storeError,
    fetchPetById, 
    createPet, 
    updatePet, 
    clearCurrentPet,
    clearError 
  } = usePetStore();

  // Khởi tạo state chuẩn cấu trúc DTO Backend
  const [formData, setFormData] = useState({
    name: '',
    specie: 'DOG', // Mặc định DOG / CAT
    gender: 'MALE', // Mặc định MALE / FEMALE theo Enum
    birthday: '', // YYYY-MM-DD
    weight: '', // Float
    healthStatus: '' // Thay thế cho các trường ghi chú cũ
  });

  const [validationError, setValidationError] = useState('');

  // 1. Fetch dữ liệu cũ nếu ở chế độ chỉnh sửa (Update Mode)
  useEffect(() => {
    if (isEditMode && id) {
      fetchPetById(id);
    }
    return () => {
      clearCurrentPet?.();
      clearError?.();
    };
  }, [id, isEditMode, fetchPetById, clearCurrentPet, clearError]);

  // 2. Điền dữ liệu cũ vào Form khi API fetchPetById hoàn thành
  useEffect(() => {
    if (isEditMode && currentPet) {
      setFormData({
        name: currentPet.name || '',
        specie: currentPet.specie || currentPet.species?.name?.toUpperCase() || 'DOG',
        gender: currentPet.gender?.toUpperCase() || 'MALE',
        birthday: currentPet.birthday || '', // Backend trả về chuỗi định dạng YYYY-MM-DD
        weight: currentPet.weight || currentPet.weight_kg || '',
        healthStatus: currentPet.healthStatus || currentPet.medical_note || ''
      });
    }
  }, [currentPet, isEditMode]);

  // Xử lý thay đổi dữ liệu trong ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'weight' ? (value !== '' ? parseFloat(value) : '') : value
    }));
  };

  // Xử lý gửi Form lên hệ thống
  const handleSubmit = async (e) => {
  e.preventDefault();
  setValidationError('');

  // Kiểm tra nhanh Validation ở Client
  if (!formData.name.trim()) return setValidationError('Vui lòng điền tên của bé.');
  if (!formData.birthday) return setValidationError('Vui lòng nhập ngày sinh.');
  if (formData.weight === '' || formData.weight <= 0) {
    return setValidationError('Cân nặng phải là số dương lớn hơn 0.');
  }

  try {
    let response;
    if (isEditMode) {
      // Khớp cấu trúc ReqUpdatePet (Đính kèm ID dưới dạng số nguyên)
      const updatePayload = {
        id: parseInt(id, 10), 
        ...formData
      };
      response = await updatePet(id, updatePayload);
    } else {
      // Khớp cấu trúc ReqCreatePet
      response = await createPet(formData);
    }

    if (response) {
      navigate('/profile', { state: { activeTab: 'pets' } });
    }
  } catch (err) {
    console.error("Gửi form thất bại: ", err);
  }
};

  if (isEditMode && loading && !currentPet) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="large" />
      </div>
    );
  }

  // Lấy ngày hiện tại làm mốc tối đa (max date) cho trường Birthday
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-left">
      
      {/* Thanh điều hướng quay lại */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/profile', { state: { activeTab: 'pets' } })}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} /> Quay lại danh sách bé
        </button>
      </div>

      {/* Khung chứa Form chính */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        
        {/* Tiêu đề động */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="text-pet-orange" size={26} />
            {isEditMode ? 'Cập nhật hồ sơ của bé' : 'Đăng ký thú cưng mới'}
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {isEditMode ? 'Sửa đổi các thông số sinh trắc học và sức khỏe để cập nhật giá dịch vụ Spa.' : 'Điền đầy đủ thông tin để nhận diện và tính toán giá dịch vụ Spa phù hợp nhất cho bé.'}
          </p>
        </div>

        {/* Thông báo lỗi nếu xảy ra sự cố */}
        {(validationError || storeError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm font-medium">
            <AlertCircle className="flex-shrink-0 text-red-500 mt-0.5" size={18} />
            <div>{validationError || storeError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. TÊN THÚ CƯNG */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Tên của bé <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Cậu Vàng, Bin Bin..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-pet-blue transition-colors text-gray-800"
              />
            </div>

            {/* 2. CHỦ CHỦNG LOÀI (SPECIE) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Chủng loài <span className="text-red-500">*</span></label>
              <select
                name="specie"
                value={formData.specie}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800 bg-white"
              >
                <option value="DOG">🐶 Loài Chó (DOG)</option>
                <option value="CAT">🐱 Loài Mèo (CAT)</option>
              </select>
            </div>

            {/* 3. GIỚI TÍNH (GENDER) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Giới tính <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'MALE' }))}
                  className={`py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                    formData.gender === 'MALE'
                      ? 'border-pet-blue bg-blue-50/50 text-pet-blue shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  ♂ Đực (MALE)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'FEMALE' }))}
                  className={`py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                    formData.gender === 'FEMALE'
                      ? 'border-pet-orange bg-orange-50/50 text-pet-orange shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  ♀ Cái (FEMALE)
                </button>
              </div>
            </div>

            {/* 4. NGÀY SINH (BIRTHDAY) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Ngày sinh sinh học <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="birthday"
                max={todayStr} // Khóa không cho chọn ngày tương lai theo @PastOrPresent
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800 bg-white"
              />
            </div>

            {/* 5. CÂN NẶNG (WEIGHT) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Cân nặng hiện tại (kg) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Nhập số cân nặng của bé..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800"
              />
            </div>
          </div>

          {/* 6. TÌNH TRẠNG SỨC KHỎE / LƯU Ý (HEALTH STATUS) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Trạng thái sức khỏe & Lưu ý đặc biệt</label>
            <textarea
              name="healthStatus"
              rows={4}
              value={formData.healthStatus}
              onChange={handleChange}
              placeholder="Ghi chú tiền sử bệnh lý, dị ứng thuốc, dị ứng thức ăn hoặc tính khí đặc biệt của bé khi tắm rửa để nhân viên lưu ý..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-pet-blue transition-colors text-gray-800 resize-none leading-relaxed"
            />
          </div>

          {/* HÀNG NÚT BẤM HÀNH ĐỘNG */}
          <div className="pt-4 border-t border-gray-50 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => navigate('/profile', { state: { activeTab: 'pets' } })}
              className="rounded-xl font-bold px-6 py-2.5 text-sm"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl font-bold px-6 py-2.5 text-sm bg-pet-blue shadow-md shadow-pet-blue/10 flex items-center gap-2"
            >
              {loading ? (
                'Đang xử lý...'
              ) : (
                <>
                  <Save size={16} /> {isEditMode ? 'Lưu thay đổi' : 'Đăng ký bé'}
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PetDetail;