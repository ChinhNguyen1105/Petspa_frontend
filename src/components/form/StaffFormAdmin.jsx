import React, { useState, useEffect } from 'react';
import { 
  Plus,
  X,
  Briefcase,
  Award,
  Clock,
  Star,
  Tag
} from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import RoleService from '../../services/RoleService'; 

// SUB-COMPONENT: STAFF FORM (Chi tiết & Chỉnh sửa/Thêm mới)
// ==========================================
const StaffFormAdmin = ({ initialData, onSubmit, onClose, mode }) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    staff_code: initialData?.staff_code || `STF-${Date.now()}`,
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || '',
    status: initialData?.status || 'PROBATION',
    base_salary: initialData?.base_salary || 0,
    allowance: initialData?.allowance || 0,
    joined_at: initialData?.joined_at || new Date().toISOString().split('T')[0],
    
    // Khởi tạo các trường mới tích hợp mở rộng
    experience_years: initialData?.experience_years || 0,
    specialties: initialData?.specialties || [],
    rating: initialData?.rating || 0,
    total_reviews: initialData?.total_reviews || 0,
    working_hours: initialData?.working_hours || { start: "08:00", end: "17:00" }
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState(''); // State tạm để thêm chuyên môn mới

  useEffect(() => {
    const loadRoles = async () => {
      try {
        if (RoleService && typeof RoleService.getRoles === 'function') {
          const response = await RoleService.getRoles();
          const roleList = response?.data || response || [];
          setAvailableRoles(roleList);
        } else {
          setAvailableRoles([
            { id: 1, name: 'Kỹ thuật viên Cắt tỉa', default_salary: 10000000 },
            { id: 2, name: 'Nhân viên Tắm sấy', default_salary: 7500000 },
            { id: 3, name: 'Chuyên viên Điều trị da liễu', default_salary: 12000000 },
            { id: 4, name: 'Quản lý cửa hàng', default_salary: 18000000 },
            { id: 5, name: 'Nhân viên Lễ tân', default_salary: 7000000 }
          ]);
        }
      } catch (error) {
        console.error("Không thể tải danh sách chức vụ mẫu:", error);
      }
    };
    
    if (mode !== 'VIEW') {
      loadRoles();
    }
  }, [mode]);

  const handleRoleNameChange = (value) => {
    const foundRole = availableRoles.find(
      r => r.name?.toLowerCase() === value.trim().toLowerCase()
    );

    if (foundRole) {
      setFormData(prev => ({
        ...prev,
        role: foundRole.name,
        base_salary: foundRole.default_salary
      }));
    } else {
      setFormData(prev => ({ ...prev, role: value }));
    }
  };

  // Hàm xử lý thêm thẻ chuyên môn mới
  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    if (!formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
    }
    setNewSpecialty('');
  };

  // Hàm xóa thẻ chuyên môn
  const handleRemoveSpecialty = (indexToRemove) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone || !formData.role) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin cơ bản: Tên & Mã */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ và tên nhân viên</label>
          <input 
            type="text" 
            required
            disabled={mode === 'VIEW'}
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mã nhân sự hệ thống</label>
          <input 
            type="text" 
            required
            disabled
            value={formData.staff_code}
            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-mono text-gray-500"
          />
        </div>
      </div>

      {/* Thông tin liên lạc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Địa chỉ Email</label>
          <input 
            type="email" 
            required
            disabled={mode === 'VIEW'}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Số điện thoại</label>
          <input 
            type="text" 
            required
            disabled={mode === 'VIEW'}
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>
      </div>

      {/* Đã loại bỏ Phòng Ban - Giữ lại Trạng thái & Ngày tham gia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái nhân sự</label>
          <select 
            disabled={mode === 'VIEW'}
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none"
          >
            <option value="PROBATION">Thử việc (Probation)</option>
            <option value="ACTIVE">Đang làm việc (Active)</option>
            <option value="SUSPENDED">Tạm đình chỉ (Suspended)</option>
            <option value="TERMINATED">Đã nghỉ việc (Terminated)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngày vào công ty</label>
          <input 
            type="date" 
            required
            disabled={mode === 'VIEW'}
            value={formData.joined_at}
            onChange={(e) => setFormData({...formData, joined_at: e.target.value})}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Kinh nghiệm, Khung giờ làm việc & Đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100 p-4 rounded-2xl bg-white shadow-sm">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <Award size={14} className="text-orange-500" /> Số năm kinh nghiệm
          </label>
          <input 
            type="number" 
            min="0"
            disabled={mode === 'VIEW'}
            value={formData.experience_years}
            onChange={(e) => setFormData({...formData, experience_years: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none text-slate-700"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <Clock size={14} className="text-blue-500" /> Giờ làm việc (Bắt đầu - Kết thúc)
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="08:00"
              disabled={mode === 'VIEW'}
              value={formData.working_hours.start}
              onChange={(e) => setFormData({
                ...formData, 
                working_hours: { ...formData.working_hours, start: e.target.value }
              })}
              className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-semibold focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="text" 
              placeholder="17:00"
              disabled={mode === 'VIEW'}
              value={formData.working_hours.end}
              onChange={(e) => setFormData({
                ...formData, 
                working_hours: { ...formData.working_hours, end: e.target.value }
              })}
              className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-semibold focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <Star size={12} className="text-amber-500" /> Điểm (Rating)
            </label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="5"
              disabled={mode === 'VIEW' || mode === 'EDIT'} // Thường đánh giá sẽ do khách hàng chấm, tắt ở form nhập
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-center text-slate-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tổng Reviews</label>
            <input 
              type="number"
              disabled={mode === 'VIEW' || mode === 'EDIT'}
              value={formData.total_reviews}
              onChange={(e) => setFormData({...formData, total_reviews: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-center text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Quản lý danh sách Chuyên môn (Specialties) dưới dạng Tag */}
      <div className="space-y-2 border border-gray-100 p-4 rounded-2xl bg-white shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
          <Tag size={14} className="text-orange-500" /> Chuyên môn Spa đảm nhận
        </label>
        
        {mode !== 'VIEW' && (
          <div className="flex gap-2 max-w-md">
            <input 
              type="text"
              placeholder="Ví dụ: Cắt tỉa Poodle, Spa chó lớn..."
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
            <button 
              type="button"
              onClick={handleAddSpecialty}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              Thêm
            </button>
          </div>
        )}

        {/* Khối hiển thị danh sách các kỹ năng/chuyên môn */}
        <div className="flex flex-wrap gap-2 pt-1">
          {formData.specialties.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Chưa đăng ký chuyên môn nào.</span>
          ) : (
            formData.specialties.map((spec, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-semibold rounded-full text-xs border border-orange-100 shadow-sm">
                {spec}
                {mode !== 'VIEW' && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSpecialty(index)}
                    className="p-0.5 hover:bg-orange-200 rounded-full text-orange-500 hover:text-orange-800 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Chức vụ & Lương */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Briefcase size={16} className="text-orange-500" /> Chức vụ & Chế độ đãi ngộ
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm items-center">
          <div className="w-full sm:flex-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chức danh công việc</label>
            <input 
              type="text" 
              placeholder="Nhập hoặc lựa chọn vị trí..."
              required
              disabled={mode === 'VIEW'}
              value={formData.role}
              onChange={(e) => handleRoleNameChange(e.target.value)}
              list="role-suggestions"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none font-semibold text-slate-700"
            />
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lương cơ bản (VNĐ)</label>
            <input 
              type="number" 
              min="0"
              required
              disabled={mode === 'VIEW'}
              value={formData.base_salary}
              onChange={(e) => setFormData({...formData, base_salary: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-right focus:outline-none text-slate-800"
            />
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phụ cấp cố định</label>
            <input 
              type="number" 
              min="0"
              required
              disabled={mode === 'VIEW'}
              value={formData.allowance}
              onChange={(e) => setFormData({...formData, allowance: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-right focus:outline-none text-slate-800"
            />
          </div>
        </div>
      </div>

      <datalist id="role-suggestions">
        {availableRoles.map(r => (
          <option key={r.id} value={r.name}>{formatPrice(r.default_salary)}</option>
        ))}
      </datalist>

      {/* Tổng ngân sách dự kiến */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500 uppercase">Tổng chi trả dự kiến / tháng:</span>
        <span className="text-2xl font-black text-orange-500">
          {formatPrice(formData.base_salary + formData.allowance)}
        </span>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          {mode === 'VIEW' ? 'Đóng' : 'Hủy bỏ'}
        </button>
        {mode !== 'VIEW' && (
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all"
          >
            Lưu hồ sơ nhân viên
          </button>
        )}
      </div>
    </form>
  );
};

export default StaffFormAdmin;