import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Mail, ShieldCheck, Calendar, Camera } from 'lucide-react';
import { useCartStore } from '../../store/cartStore'; 
import { useUserStore } from '../../store/userStore'; 

const ProfileInfo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: 'MALE'
  });
  
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  // Sử dụng các action profile và upload từ Store mới của bạn
  const { 
    loading, 
    detailLoading, 
    fetchProfile, 
    updateProfile, 
    uploadAvatar 
  } = useUserStore();
  
  const { showToastNotification } = useCartStore();

  // Hàm helper lấy nhanh ID để phục vụ việc upload avatar (nếu API upload yêu cầu ID)
  const getLoggedInUserId = () => {
    const storedUser = localStorage.getItem('petspa_user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      return userObj.id || "101";
    }
    return "101"; 
  };

  const userId = getLoggedInUserId();

  // 1. TẢI DỮ LIỆU PROFILE QUA TOKEN (Không dùng fetchUserById nữa)
  const loadUserProfile = async () => {
    const response = await fetchProfile();
    
    if (response && response.status === "SUCCESS" && response.data) {
      const user = response.data;
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'MALE'
      });
      setAvatarPreview(user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [fetchProfile]);

  // 2. XỬ LÝ THAY ĐỔI INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. XỬ LÝ UPLOAD AVATAR
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiển thị preview tạm thời ngay lập tức cho UI mượt mà
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Gọi API upload thông qua store
    const response = await uploadAvatar(userId, file);
    
    if (response && response.status === "SUCCESS") {
      if (showToastNotification) {
        showToastNotification("Cập nhật ảnh đại diện thành công! 📸");
      }
      // Tải lại profile mới từ server để đồng bộ url ảnh chuẩn
      loadUserProfile();
    } else {
      const errorMsg = response?.message || "Lỗi khi tải ảnh lên.";
      if (showToastNotification) {
        showToastNotification(`${errorMsg} ❌`);
      } else {
        alert(errorMsg);
      }
    }
  };

  // 4. XỬ LÝ SUBMIT FORM UPDATE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ĐỒNG BỘ: Cấu trúc payload đúng với ReqUserUpdateProfile ở Backend
    const payloadData = {
      name: formData.fullName,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
      gender: formData.gender
    };

    const response = await updateProfile(payloadData);
    
    if (response && response.status === "SUCCESS") {
      // Đồng bộ thông tin cơ bản vào localStorage của session hiện tại
      const storedUser = localStorage.getItem('petspa_user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const updatedUserObj = { ...userObj, name: formData.fullName };
        localStorage.setItem('petspa_user', JSON.stringify(updatedUserObj));
      }

      // Tải lại thông tin mới nhất
      loadUserProfile();

      if (showToastNotification) {
        showToastNotification("Cập nhật thông tin cá nhân thành công! 🎉");
      } else {
        alert("Cập nhật thành công!");
      }
    } else {
      const errorMsg = response?.message || "Có lỗi xảy ra, vui lòng thử lại sau.";
      if (showToastNotification) {
        showToastNotification(`${errorMsg} ❌`);
      } else {
        alert(errorMsg);
      }
    }
  };

  // GIAO DIỆN SKELETON KHI ĐANG TẢI PROFILE (Dùng biến detailLoading của fetchProfile)
  if (detailLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-7 bg-gray-200 rounded-xl w-1/4 mb-4" />
        <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        </div>
        <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        <div className="h-12 bg-gray-200 rounded-2xl w-24 ml-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left">
      
      {/* KHU VỰC UPLOAD AVATAR */}
      <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <img 
            src={avatarPreview} 
            alt="User Avatar" 
            className={`w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md transition-all duration-300 ${loading ? 'opacity-50' : 'group-hover:brightness-75'}`}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="text-white" size={20} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
            disabled={loading}
          />
        </div>
        <p className="text-xs font-bold text-gray-400 mt-2.5 uppercase tracking-wider">
          {loading ? "Đang xử lý file..." : "Nhấp vào ảnh để thay đổi avatar"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex items-center gap-2 pb-4 border-b border-gray-50 mb-2">
          <ShieldCheck className="text-pet-blue" size={24} />
          <h2 className="text-xl font-black text-pet-blue uppercase tracking-tight">
            Thông tin cá nhân
          </h2>
        </div>

        {/* Họ tên */}
        <Input 
          label="Họ và tên người dùng *" 
          icon={User} 
          name="fullName"
          value={formData.fullName} 
          onChange={handleInputChange} 
          required
          disabled={loading}
        />

        {/* Email & Ngày sinh */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Địa chỉ Email (Không thể thay đổi)" 
            icon={Mail} 
            value={formData.email} 
            disabled 
            className="bg-gray-50 text-gray-400 cursor-not-allowed font-medium"
          />
          <Input 
            label="Ngày sinh" 
            icon={Calendar} 
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth} 
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* Lựa chọn giới tính (GenderEnum) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Giới tính</label>
          <div className="grid grid-cols-3 gap-3">
            {['MALE', 'FEMALE', 'OTHER'].map((genderOption) => (
              <label 
                key={genderOption}
                className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-2xl text-sm font-bold cursor-pointer transition-all select-none ${
                  formData.gender === genderOption 
                    ? 'border-pet-blue bg-blue-50/50 text-pet-blue ring-2 ring-pet-blue/10' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio"
                  name="gender"
                  value={genderOption}
                  checked={formData.gender === genderOption}
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={loading}
                />
                {genderOption === 'MALE' ? 'Nam' : genderOption === 'FEMALE' ? 'Nữ' : 'Khác'}
              </label>
            ))}
          </div>
        </div>
        
        {/* Nút hành động */}
        <div className="pt-2 border-t border-gray-50 flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto !px-8 !py-3 rounded-xl font-black shadow-md shadow-pet-blue/10 uppercase text-sm tracking-wider"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ProfileInfo;