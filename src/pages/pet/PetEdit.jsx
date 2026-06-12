import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PawPrint, HeartPulse, Scale, Calendar, FileText, ArrowLeft, Camera, UploadCloud } from 'lucide-react';
import {Input} from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { usePetStore } from '../../store/petStore';

const PetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 1. BÓC TÁCH STATE VÀ ACTIONS TỪ ZUSTAND STORE
  const {
    currentPet,
    species,
    loading,
    submitting,
    fetchPetById,
    fetchSpecies,
    updatePet
  } = usePetStore();

  const [formData, setFormData] = useState({
    name: '',
    speciesId: '', // Lưu ID của loài thay vì string text thuần túy
    breed: '',
    weight: '',
    age: '',
    notes: '',
    image: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [localError, setLocalError] = useState(null);

  // 2. FETCH DỮ LIỆU BAN ĐẦU (CHI TIẾT PET & DANH MỤC LOÀI)
  useEffect(() => {
    if (id) {
      fetchPetById(id);
    }
    fetchSpecies(); // Lấy danh sách loài (Chó, Mèo...) về cho thẻ select
  }, [id, fetchPetById, fetchSpecies]);

  // 3. ĐỒNG BỘ DỮ LIỆU TỪ STORE VÀO FORM STATE KHI LOAD XONG
  useEffect(() => {
    if (currentPet && String(currentPet.id) === String(id)) {
      setFormData({
        name: currentPet.name || '',
        speciesId: currentPet.species?.id || '', // Gán ID của species đang có sẵn của bé
        breed: currentPet.breed || '',
        weight: currentPet.weight_kg || '',
        age: currentPet.age || '',
        notes: currentPet.personality || '',
        image: currentPet.thumbnail || ''
      });
      setImagePreview(currentPet.thumbnail || '');
    } else if (!loading && !currentPet) {
      setLocalError("Không tìm thấy thông tin thú cưng.");
    }
  }, [currentPet, id, loading]);

  // 4. XỬ LÝ SỰ KIỆN FILE HÌNH ẢNH
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn file hình ảnh!');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 5. SUBMIT FORM QUA ZUSTAND ACTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tìm đối tượng species tương ứng với ID người dùng chọn để build đúng cấu trúc API
    const selectedSpecieObj = species.find(s => String(s.id) === String(formData.speciesId));

    const submitData = {
      name: formData.name,
      species: {
        id: parseInt(formData.speciesId, 10),
        name: selectedSpecieObj?.name || 'Dog'
      },
      breed: formData.breed,
      weight_kg: parseFloat(formData.weight) || 0,
      age: parseInt(formData.age, 10) || 0,
      personality: formData.notes,
      thumbnail: imagePreview // Đang dùng URL preview/base64 tạm thời của bạn, sau này có thể bọc FormData nếu upload file thô
    };

    const result = await updatePet(id, submitData);
    
    if (result && result.success) {
      // Quay trở lại trang detail của bé để xem thành quả, cập nhật realtime ngay lập tức!
      navigate(`/profile/pets/${id}`); 
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
        <Button variant="outline" onClick={() => navigate('/profile')}>
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
          <p className="text-xs text-gray-400 font-medium">Cập nhật hình ảnh, cân nặng để phục vụ tại spa chuẩn xác nhất</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* KHU VỰC CẬP NHẬT HÌNH ẢNH (AVATAR UPLOAD) */}
        <div className="flex flex-col items-center justify-center py-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-2">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Pet Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <UploadCloud size={28} />
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
            Thay đổi ảnh đại diện của bé
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
          placeholder="Nhập tên bé..."
          required
        />

        {/* Phân loại & Giống */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <HeartPulse size={15} className="text-gray-400" /> Loại thú cưng
            </label>
            <select
              name="speciesId"
              value={formData.speciesId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px]"
            >
              <option value="" disabled>-- Chọn loài thú cưng --</option>
              {species.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name === 'DOG' || spec.name === 'Dog' ? 'Chó (Dog)' : spec.name === 'CAT' || spec.name === 'Cat' ? 'Mèo (Cat)' : spec.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Chủng tộc / Giống"
            icon={HeartPulse}
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="Ví dụ: Corgi, Mèo Anh lông ngắn..."
          />
        </div>

        {/* Cân nặng & Tuổi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cân nặng (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Ví dụ: 4.5"
            required
          />

          <Input
            label="Tuổi (Tháng hoặc tuổi)"
            icon={Calendar}
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Ví dụ: 2"
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <FileText size={15} className="text-gray-400" /> Ghi chú đặc biệt cho Spa
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            placeholder="Ví dụ: Bé sợ tiếng sấy tóc, dị ứng với xà phòng hương sen..."
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