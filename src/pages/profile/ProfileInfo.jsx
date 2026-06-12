import React, { useState, useEffect } from 'react';
import {Input} from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore'; 
import { useUserStore } from '../../store/userStore'; 

// Dữ liệu Dropdown đồng bộ với AddressForm
const LOCATION_DATA = {
  "Hải Phòng": ["Quận Ngô Quyền", "Quận Hồng Bàng", "Quận Lê Chân", "Quận Hải An", "Quận Kiến An"],
  "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Đống Đa"],
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận Bình Thạnh"]
};

const ProfileInfo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    detailAddress: ''
  });

  // Sử dụng States và Actions từ Zustand Store
  const { currentUser, loading, submitting, fetchUserById, updateUser } = useUserStore();
  const { showToastNotification } = useCartStore();

  // Trích xuất thông tin ID người dùng đang đăng nhập từ hệ thống
  const getLoggedInUserId = () => {
    const storedUser = localStorage.getItem('petspa_user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      return userObj.id || 101;
    }
    return 101; 
  };

  const userId = getLoggedInUserId();

  // 1. FETCH DỮ LIỆU USER THÔNG QUA STORE KHI VÀO TRANG
  useEffect(() => {
    fetchUserById(userId);
  }, [userId, fetchUserById]);

  // ĐỒNG BỘ: Khi dữ liệu trong store thay đổi, map ngược vào form state
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        city: currentUser.city || '',
        district: currentUser.district || '',
        detailAddress: currentUser.address || '' // Map từ address trong DB sang detailAddress trên UI
      });
    }
  }, [currentUser]);

  // 2. XỬ LÝ THAY ĐỔI INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (e) => {
    setFormData(prev => ({
      ...prev,
      city: e.target.value,
      district: '' // Reset quận huyện khi đổi thành phố
    }));
  };

  // 3. XỬ LÝ SUBMIT FORM QUA ACTIONS CỦA STORE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ĐỒNG BỘ: Đóng gói chuyển đổi ngược lại cấu trúc trường thông tin để gửi lên Store
    const payloadData = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      district: formData.district,
      address: formData.detailAddress // Gửi ngược trường address về DB
    };

    // Gọi action updateUser từ Zustand thay vì gọi trực tiếp api service
    const response = await updateUser(userId, payloadData);
    
    if (response && response.success) {
      // Đồng bộ cập nhật lại thông tin mới vào bộ nhớ localStorage của phiên làm việc
      const storedUser = localStorage.getItem('petspa_user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const updatedUserObj = { ...userObj, name: formData.fullName, phone: formData.phone };
        localStorage.setItem('petspa_user', JSON.stringify(updatedUserObj));
      }

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

  // GIAO DIỆN SKELETON KHI ĐANG TẢI DỮ LIỆU
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-7 bg-gray-200 rounded-xl w-1/4 mb-4" />
        <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        </div>
        <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        <div className="h-12 bg-gray-200 rounded-2xl w-24" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex items-center gap-2 pb-4 border-b border-gray-50 mb-2">
          <ShieldCheck className="text-pet-blue" size={24} />
          <h2 className="text-xl font-black text-pet-blue uppercase tracking-tight">
            Thông tin tài khoản
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
        />

        {/* Email & Số điện thoại */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Địa chỉ Email (Không thể thay đổi)" 
            icon={Mail} 
            value={formData.email} 
            disabled 
            className="bg-gray-50 text-gray-400 cursor-not-allowed font-medium"
          />
          <Input 
            label="Số điện thoại *" 
            icon={Phone} 
            name="phone"
            value={formData.phone} 
            onChange={handleInputChange} 
            required
          />
        </div>

        {/* Chọn Tỉnh/Thành & Quận/Huyện */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tỉnh / Thành phố</label>
            <select
              value={formData.city}
              onChange={handleCityChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px]"
            >
              <option value="">-- Chọn Thành phố --</option>
              {Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Quận / Huyện</label>
            <select
              value={formData.district}
              onChange={handleInputChange}
              name="district"
              disabled={!formData.city}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 h-[46px] ${
                !formData.city ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200'
              }`}
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {formData.city && LOCATION_DATA[formData.city].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <Input 
          label="Địa chỉ cụ thể (Số nhà, tên đường) *" 
          icon={MapPin} 
          name="detailAddress"
          value={formData.detailAddress} 
          onChange={handleInputChange} 
          placeholder="Ví dụ: Số 12 Hẻm 4 Ngõ 92..."
          required
        />
        
        {/* Nút hành động */}
        <div className="pt-2 border-t border-gray-50 flex justify-end">
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full md:w-auto !px-8 !py-3 rounded-xl font-black shadow-md shadow-pet-blue/10 uppercase text-sm tracking-wider"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ProfileInfo;