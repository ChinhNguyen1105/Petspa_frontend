import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ChevronRight,
  FolderPlus,
  CheckCircle,
  X
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import ConfirmModal from '../../../components/common/ConfirmModal'; 
import { useCartStore } from '../../../store/cartStore'; 
import { useCategoryStore } from '../../../store/categoryStore';
import Pagination from '../../../components/common/Pagination';

const CategoryManagement = () => {
  // ── Store: Categories & Server Pagination (meta) ──
  const categories    = useCategoryStore((state) => state.categories) || [];
  const categoryMeta  = useCategoryStore((state) => state.categoryMeta); // Lấy meta từ store giống cấu trúc mẫu của bạn
  const loading       = useCategoryStore((state) => state.loading);
  const errorStore    = useCategoryStore((state) => state.error);

  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const createCategory  = useCategoryStore((state) => state.createCategory);
  const updateCategory  = useCategoryStore((state) => state.updateCategory);
  const deleteCategory  = useCategoryStore((state) => state.deleteCategory);

  // ── LOCAL UI STATE ──
  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // State quản lý Form
  const [formData, setFormData] = useState({ 
    id: null, 
    name: '', 
    categoryType: 'PRODUCT'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');

  // Trạng thái cho Modal Xác nhận
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', 
    title: '',
    message: '',
    pendingData: null
  });

  const showToast = useCartStore((state) => state.showToast);

  // 🌟 DỰA VÀO ĐỘNG: Gửi params lên Server API mỗi khi currentPage hoặc searchTerm thay đổi
  useEffect(() => {
    fetchCategories({
      page: currentPage,
      pageSize: 10, // Hoặc cấu hình tùy ý
      keyword: searchTerm.trim()
    });
  }, [currentPage, searchTerm, fetchCategories]);

  // Bộ xử lý thay đổi ô tìm kiếm - Reset chủ động trang về 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  // Xử lý dữ liệu input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formError) setFormError('');
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setFormError('');
    setFormData({
      id: category.id,
      name: category.name,
      categoryType: category.categoryType || 'PRODUCT'
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormError('');
    setFormData({ id: null, name: '', categoryType: 'PRODUCT' });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Tên danh mục không được để trống!');
      return;
    }
    if (isEditing) {
      setConfirmModal({
        isOpen: true,
        type: 'CONFIRM_SUBMIT',
        title: 'Xác nhận cập nhật',
        message: `Bạn có chắc chắn muốn lưu các thay đổi cho danh mục nhóm "${formData.name}" không?`,
        pendingData: formData
      });
    } else {
      executeSaveCategory(formData);
    }
  };

  const executeSaveCategory = async (dataToSave) => {
    try {
      let res;
      if (isEditing) {
        res = await updateCategory(dataToSave.id, dataToSave);
        if (res && res.success) showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        res = await createCategory(dataToSave);
        if (res && res.success) showToast('Thêm danh mục mới thành công!', 'success');
      }
      resetForm();
      closeConfirmModal();
      // Refresh lại trang hiện tại sau khi thêm/sửa
      fetchCategories({ page: currentPage, keyword: searchTerm.trim() });
    } catch (err) {
      setFormError('Đã xảy ra lỗi hệ thống, vui lòng thử lại.');
    }
  };

  const handleOpenDeleteModal = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: 'CONFIRM_DELETE',
      title: 'Xóa danh mục vĩnh viễn',
      message: `Bạn có chắc chắn muốn xóa danh mục "${name}"?`,
      pendingData: { id, name }
    });
  };

  const executeDeleteCategory = async () => {
    const { id, name } = confirmModal.pendingData;
    try {
      const res = await deleteCategory(id);
      if (res && res.success) {
        showToast(`Xóa danh mục "${name}" thành công!`, 'success');
        if (isEditing && formData.id === id) resetForm();
        // Sau khi xóa, kiểm tra nếu trang hiện tại hết sạch data thì lùi 1 trang
        const nextTargetPage = categories.length === 1 ? Math.max(currentPage - 1, 1) : currentPage;
        setCurrentPage(nextTargetPage);
      }
      closeConfirmModal();
    } catch (err) {
      showToast('Đã xảy ra lỗi hệ thống khi xóa danh mục.', 'error');
      closeConfirmModal();
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'CONFIRM_SUBMIT') executeSaveCategory(confirmModal.pendingData);
    else if (confirmModal.type === 'CONFIRM_DELETE') executeDeleteCategory();
    else closeConfirmModal();
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', title: '', message: '', pendingData: null });
  };

  // 🌟 GIẢ LẬP ĐỘNG: Trích xuất các biến số phân trang chuẩn từ cục `categoryMeta` hệ thống gửi về
  const totalItems  = categoryMeta?.total || 0;     // mapping đúng trường 'total' từ API mẫu của bạn
  const totalPages  = categoryMeta?.pages || 1;     // mapping đúng trường 'pages' từ API mẫu của bạn
  const pageSize    = categoryMeta?.pageSize || 10; // mapping đúng trường 'pageSize' từ API mẫu của bạn

  // 🌟 ĐỘNG STT: Số thứ tự tăng tiến chính xác dựa trên cấu trúc trang Server trả về
  const getGlobalIndex = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  if (loading && categories.length === 0) {
    return <div className="flex h-[60vh] items-center justify-center"><Loading size="large" /></div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          <span>Quản lý Shop</span><ChevronRight size={12} /><span className="text-orange-500">Danh mục</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">DANH MỤC HỆ THỐNG</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FORM THÊM / SỬA */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-base font-black text-slate-800 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide">
            <FolderPlus size={18} className="text-orange-500" />
            {isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tắm & Vệ sinh, Thức ăn hạt..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Loại danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryType"
                value={formData.categoryType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-bold"
              >
                <option value="PRODUCT">SẢN PHẨM (PRODUCT)</option>
                <option value="SERVICE">DỊCH VỤ (SERVICE)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${
                  isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-opacity-90'
                }`}
              >
                <CheckCircle size={16} />
                {isEditing ? "Cập nhật" : "Tạo danh mục"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-xl text-sm transition-all">
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* BẢNG HIỂN THỊ DANH SÁCH */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 transition-all text-gray-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="bg-gray-50/70 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                    <th className="p-4 w-16 text-center">STT</th>
                    <th className="p-4">Tên danh mục</th>
                    <th className="p-4">Phân loại</th>
                    <th className="p-4 text-right w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-gray-400 font-medium">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Layers size={32} className="text-gray-300" />
                          <span>Không tìm thấy danh mục nào phù hợp từ hệ thống.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => {
                      const isRowEditing = formData.id === category.id;
                      return (
                        <tr key={category.id} className={`transition-colors group ${isRowEditing ? 'bg-orange-50/40 hover:bg-orange-50/50' : 'hover:bg-gray-50/50'}`}>
                          <td className="p-4 text-center font-mono text-xs text-gray-400">{getGlobalIndex(index)}</td>
                          <td className="p-4">
                            <div className={`font-bold text-base transition-colors ${isRowEditing ? 'text-orange-500' : 'text-gray-800'}`}>
                              {category.name}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full border ${
                              category.categoryType === 'SERVICE' 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-teal-50 text-teal-600 border-teal-100'
                            }`}>
                              {category.categoryType || 'PRODUCT'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => handleEditClick(category)} className={`p-2 rounded-xl border transition-all ${isRowEditing ? 'text-orange-500 bg-orange-100 border-orange-200' : 'text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-200'}`}>
                                <Edit2 size={14} />
                              </button>
                              <button type="button" onClick={() => handleOpenDeleteModal(category.id, category.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 🌟 THANH ĐIỀU HƯỚNG PHÂN TRANG ĐỘNG: Đồng bộ với API */}
          <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400">
              Tổng cộng: <span className="text-slate-700">{totalItems}</span> danh mục
              {totalItems > 0 && ` (Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)})`}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === 'CONFIRM_DELETE' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default CategoryManagement;