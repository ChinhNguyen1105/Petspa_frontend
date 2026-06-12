import React, { useState, useEffect, useRef } from 'react';
import { Camera, UploadCloud, X } from 'lucide-react';

const UserFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar: '',
    roleName: 'CUSTOMER',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        avatar: initialData.avatar || '',
        roleName: initialData.role?.name || 'CUSTOMER',
        status: initialData.status || 'ACTIVE'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Xử lý đọc file ảnh chuyển thành chuỗi Base64 để lưu/xem trước
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Vui lòng chọn file định dạng ảnh hợp lệ!' }));
      return;
    }

    // Kiểm tra dung lượng (Ví dụ giới hạn 2MB)
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

  // Xóa ảnh hiện tại
  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Họ và tên không được để trống';
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const roleMap = {
      ADMIN: { id: 1, name: 'ADMIN' },
      STAFF: { id: 2, name: 'STAFF' }, 
      CUSTOMER: { id: 3, name: 'CUSTOMER' }
    };

    const finalPayload = {
      ...initialData, 
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar || "https://placehold.co/100x100",
      role: roleMap[formData.roleName],
      status: formData.status
    };

    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {/* KHU VỰC CHỌN VÀ HIỂN THỊ ẢNH ĐẠI DIỆN */}
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

          {/* Nút trigger chọn file đè lên hình tròn */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
            title="Tải ảnh lên"
          >
            <Camera size={16} />
          </button>

          {/* Nút xóa ảnh nếu có dữ liệu */}
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

        {/* Nút chọn ảnh phụ dưới khu vực preview */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs font-bold text-orange-500 hover:text-orange-600 underline"
        >
          {formData.avatar ? "Thay đổi ảnh khác" : "Chọn tệp từ máy tính"}
        </button>

        {/* File Input ẩn */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {errors.avatar && <p className="text-xs text-red-500 font-medium mt-1">{errors.avatar}</p>}
      </div>

      {/* CÁC TRƯỜNG THÔNG TIN CÒN LẠI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Họ và tên *</label>
          <input 
            type="text" 
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Nhập họ và tên thành viên"
            className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.full_name ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.full_name && <p className="text-xs text-red-500 font-medium">{errors.full_name}</p>}
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
            className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
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
            className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
        </div>

        {/* Role Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Phân vai trò</label>
          <select 
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-semibold text-gray-700"
          >
            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
            <option value="STAFF">Nhân viên (STAFF)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        {/* Status Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Trạng thái hoạt động</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-semibold text-gray-700"
          >
            <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
            <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
            <option value="BANNED">Cấm vĩnh viễn (BANNED)</option>
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