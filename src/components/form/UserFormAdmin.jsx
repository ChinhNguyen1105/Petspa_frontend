import React, { useState, useEffect, useRef } from 'react';
import { Camera, UploadCloud, X, Eye, EyeOff } from 'lucide-react';

const UserFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const isEditMode = !!initialData?.id; // Xác định đang Sửa hay Thêm mới

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    roleId: 3, 
    activeFlag: true,
    gender: '', 
    dateOfBirth: '', 
    password: '' 
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.dateOfBirth && initialData.dateOfBirth !== 'undefined') {
        formattedDate = initialData.dateOfBirth.split('T')[0];
      }

      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        avatar: initialData.avatar || '',
        roleId: initialData.roleId || 3,
        activeFlag: initialData.activeFlag !== undefined ? initialData.activeFlag : true,
        gender: initialData.gender && initialData.gender !== 'undefined' ? initialData.gender : '',
        dateOfBirth: formattedDate,
        password: '' 
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const targetValue = name === 'activeFlag' ? value === 'true' : value;
    
    setFormData(prev => ({ ...prev, [name]: targetValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Vui lòng chọn file định dạng ảnh hợp lệ!' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Kích thước ảnh không vượt quá 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
      if (errors.avatar) setErrors(prev => ({ ...prev, avatar: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Họ và tên không được để trống';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (formData.phone.trim().length < 9) {
      newErrors.phone = 'Số điện thoại chưa đúng cấu trúc';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Mật khẩu bắt buộc nhập đối với tài khoản mới';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const rawPayload = {
      ...initialData, 
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar || "",
      roleId: Number(formData.roleId),
      activeFlag: formData.activeFlag,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : undefined,
      password: formData.password ? formData.password : (isEditMode ? initialData?.password : undefined)
    };

    const finalPayload = Object.fromEntries(
      Object.entries(rawPayload).filter(([_, value]) => value !== undefined)
    );

    try {
      // Quyền quyết định đóng form được chuyển giao hoàn toàn lên cha qua hàm này
      await onSubmit(finalPayload); 
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {/* 1. KHU VỰC CHỌN VÀ HIỂN THỊ ẢNH ĐẠI DIỆN */}
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <label className="text-sm font-bold text-gray-700 mb-3 w-full text-left">Ảnh đại diện</label>
        
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-orange-100 bg-white flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 duration-200">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-300 flex flex-col items-center gap-1">
                <UploadCloud size={28} />
                <span className="text-[10px] font-medium text-gray-400">Chưa có ảnh</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
            title="Tải ảnh lên"
          >
            <Camera size={16} />
          </button>

          {formData.avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all active:scale-90"
              title="Xóa ảnh hiện tại"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs font-bold text-orange-500 hover:text-orange-600 underline"
        >
          {formData.avatar ? "Thay đổi ảnh khác" : "Chọn tệp từ máy tính"}
        </button>

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {errors.avatar && <p className="text-xs text-red-500 font-medium mt-1">{errors.avatar}</p>}
      </div>

      {/* 2. CÁC TRƯỜNG THÔNG TIN Ô NHẬP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Họ và tên *</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên thành viên"
            className={`w-full px-4 py-2.5 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Địa chỉ Email *</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@petspa.vn"
            className={`w-full px-4 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Số điện thoại *</label>
          <input 
            type="text" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại liên lạc"
            className={`w-full px-4 py-2.5 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">
            Mật khẩu {isEditMode ? "(Bỏ trống nếu không đổi)" : "*"}
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditMode ? "••••••••" : "Nhập mật khẩu tài khoản"}
              className={`w-full pl-4 pr-10 py-2.5 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
        </div>

        {/* Ngày sinh */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Ngày sinh</label>
          <input 
            type="date" 
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* Giới tính */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Giới tính</label>
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-semibold text-gray-700"
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="MALE">Nam (MALE)</option>
            <option value="FEMALE">Nữ (FEMALE)</option>
            <option value="OTHER">Khác (OTHER)</option>
          </select>
        </div>

        {/* Role ID Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Phân vai trò</label>
          <select 
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-semibold text-gray-700"
          >
            <option value={1}>Quản trị viên (ADMIN)</option>
            <option value={2}>Nhân viên (STAFF)</option>
            <option value={3}>Khách hàng (CUSTOMER)</option>
          </select>
        </div>

        {/* Active Flag Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Trạng thái hoạt động</label>
          <select 
            name="activeFlag"
            value={formData.activeFlag.toString()}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-semibold text-gray-700"
          >
            <option value="true">Kích hoạt (ACTIVE)</option>
            <option value="false">Tạm khóa (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
        >
          Hủy bỏ
        </button>
        <button 
          type="submit" 
          className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-sm transition-all active:scale-95"
        >
          Lưu lại
        </button>
      </div>
    </form>
  );
};

export default UserFormAdmin;