import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAddressStore } from '../../store/addressStore';

/**
 * Component Form Xử lý địa chỉ giao hàng (Thêm mới / Cập nhật / Xóa)
 */
const AddressForm = ({ initialData, onSuccess, onCancel, userId = 101 }) => { 
  const navigate = useNavigate();
  // Lấy thêm hàm editAddress và removeAddress từ Store đã viết sẵn
  const { addAddress, editAddress, removeAddress, isLoading } = useAddressStore();

  const [formData, setFormData] = useState({
    receiverName: '',
    phone: '',
    city: '',        
    district: '',     
    detailAddress: ''
  });

  const [errors, setErrors] = useState({});

  // 🔄 ĐỒNG BỘ: Điền dữ liệu cũ vào form nếu component dùng cho mục đích CẬP NHẬT
  useEffect(() => {
    if (initialData) {
      setFormData({
        receiverName: initialData.fullName || initialData.recipient_name || '',
        phone: initialData.phone || initialData.phone_number || '',
        city: initialData.province || initialData.province_city || '',
        district: initialData.district || initialData.district_ward || '',
        detailAddress: initialData.addressDetail || initialData.detail_address || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ───────────────────────── XỬ LÝ LƯU (CREATE / UPDATE) ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dữ liệu đầu vào
    const newErrors = {};
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Vui lòng nhập tên người nhận';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam';
    }
    
    if (!formData.city.trim()) newErrors.city = 'Vui lòng nhập Tỉnh/Thành phố';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng nhập Quận/Huyện';
    if (!formData.detailAddress.trim()) newErrors.detailAddress = 'Vui lòng nhập số nhà, tên đường';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Map đúng cấu trúc SnakeCase như Backend yêu cầu
      const apiPayload = {
        user_id: Number(userId),
        recipient_name: formData.receiverName.trim(),
        phone_number: formData.phone.trim(),
        province_city: formData.city.trim(), 
        district_ward: formData.district.trim(),
        detail_address: formData.detailAddress.trim(),
        address_type: "HOME"
      };

      let response;
      
      if (initialData?.id) {
        // Nếu có id cũ đầu vào -> Gọi API CẬP NHẬT
        response = await editAddress(initialData.id, apiPayload);
      } else {
        // Nếu không có id -> Gọi API THÊM MỚI
        response = await addAddress(apiPayload);
      }

      if (response && (response.success !== false)) {
        const savedAddress = response.data || {};
        
        // Tạo cấu trúc CamelCase chuẩn để gửi ngược về cho Checkout Component nhận diện
        const formattedAddress = {
          id: savedAddress.id || initialData?.id || Date.now(),
          fullName: savedAddress.fullName || savedAddress.recipient_name || formData.receiverName.trim(),
          phone: savedAddress.phone || savedAddress.phone_number || formData.phone.trim(),
          addressDetail: savedAddress.addressDetail || savedAddress.detail_address || formData.detailAddress.trim(),
          ward: savedAddress.ward || "",
          district: savedAddress.district || savedAddress.district_ward || formData.district.trim(),
          province: savedAddress.province || savedAddress.province_city || formData.city.trim(),
          isDefault: savedAddress.isDefault !== undefined ? savedAddress.isDefault : (savedAddress.is_default || false),
          fullAddress: savedAddress.fullAddress || `${formData.detailAddress.trim()}, ${formData.district.trim()}, ${formData.city.trim()}`
        };

        if (onSuccess) {
          onSuccess(formattedAddress);
        } else {
          navigate('/shop/checkout'); 
        }
      } else {
        alert(response.message || "Không thể xử lý dữ liệu, vui lòng kiểm tra lại.");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý địa chỉ thông qua Store:", err);
      alert("Hệ thống gặp sự cố khi lưu địa chỉ.");
    }
  };

  // ───────────────────────── XỬ LÝ XÓA ─────────────────────────
  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ giao hàng này không?")) {
      try {
        const response = await removeAddress(initialData.id);
        if (response.success) {
          if (onCancel) {
            onCancel(); // Đóng Modal/Overlay nếu có
          } else {
            navigate('/shop/checkout');
          }
        } else {
          alert(response.message || "Xóa địa chỉ thất bại.");
        }
      } catch (err) {
        console.error("Lỗi khi xóa địa chỉ:", err);
        alert("Hệ thống gặp sự cố khi xóa địa chỉ.");
      }
    }
  };

  const inputBaseStyle = "w-full !px-5 !py-3.5 bg-[#f8f9fa] border border-transparent rounded-[20px] text-sm font-medium text-gray-800 transition-all placeholder-gray-400 focus:bg-white focus:border-blue-500/50 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left">
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Tên người nhận *</label>
        <Input 
          type="text"
          name="receiverName"
          value={formData.receiverName}
          onChange={handleInputChange}
          placeholder="Nhập họ và tên người nhận hàng"
          className={`${inputBaseStyle} ${errors.receiverName ? '!border-red-500 focus:!border-red-500 bg-white' : ''}`}
        />
        {errors.receiverName && <p className="text-xs text-red-500 font-bold mt-1.5 pl-2">{errors.receiverName}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Số điện thoại *</label>
        <Input 
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Nhập số điện thoại liên hệ"
          className={`${inputBaseStyle} ${errors.phone ? '!border-red-500 focus:!border-red-500 bg-white' : ''}`}
        />
        {errors.phone && <p className="text-xs text-red-500 font-bold mt-1.5 pl-2">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Tỉnh / Thành phố *</label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Ví dụ: Hà Nội, Hải Phòng..."
            className={`${inputBaseStyle} ${errors.city ? '!border-red-500 focus:!border-red-500 bg-white' : ''}`}
          />
          {errors.city && <p className="text-xs text-red-500 font-bold mt-1.5 pl-2">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Quận / Huyện *</label>
          <Input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            placeholder="Ví dụ: Cầu Giấy, Ngô Quyền..."
            className={`${inputBaseStyle} ${errors.district ? '!border-red-500 focus:!border-red-500 bg-white' : ''}`}
          />
          {errors.district && <p className="text-xs text-red-500 font-bold mt-1.5 pl-2">{errors.district}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Địa chỉ chi tiết (Số nhà, tên đường) *</label>
        <Input 
          type="text"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={handleInputChange}
          placeholder="Ví dụ: Số 25 ngõ 102 Lê Lợi..."
          className={`${inputBaseStyle} ${errors.detailAddress ? '!border-red-500 focus:!border-red-500 bg-white' : ''}`}
        />
        {errors.detailAddress && <p className="text-xs text-red-500 font-bold mt-1.5 pl-2">{errors.detailAddress}</p>}
      </div>

      <div className="flex gap-4 justify-between pt-5 mt-2">
        {/* NÚT XÓA: Chỉ hiển thị khi đang sửa một địa chỉ có sẵn */}
        {initialData?.id ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-[18px] border-red-500 text-red-500 hover:bg-red-50 !py-3.5 !px-6 font-bold text-sm shadow-sm transition-all"
          >
            Xóa địa chỉ
          </Button>
        ) : (
          <div /> /* Thẻ giữ chỗ để đẩy 2 nút kia về góc phải */
        )}

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel || (() => navigate(-1))}
            disabled={isLoading}
            className="rounded-[18px] border-[#1d3557] text-[#1d3557] hover:bg-slate-50 !py-3.5 !px-8 font-bold text-sm min-w-[120px] shadow-sm transition-all"
          >
            Hủy bỏ
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="rounded-[18px] bg-[#1d3557] hover:bg-[#14263f] text-white !py-3.5 !px-8 font-bold text-sm min-w-[140px] shadow-sm transition-all border-none"
          >
            {isLoading ? "Đang xử lý..." : initialData?.id ? "Cập nhật" : "Lưu địa chỉ"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;