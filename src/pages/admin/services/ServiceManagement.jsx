import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, AlertCircle, 
  RefreshCw, Scissors, ChevronRight, Clock, Star
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Pagination from '../../../components/common/Pagination';
import ServiceFormAdmin from '../../../components/form/ServiceFormAdmin';

import { useCartStore } from '../../../store/cartStore';
import { useServiceStore } from '../../../store/serviceStore';
import { useCategoryStore } from '../../../store/categoryStore';

const PAGE_SIZE = 10;

const ServiceManagement = () => {
  // ── Store: Services ──
  const services       = useServiceStore((state) => state.services) || [];
  const meta           = useServiceStore((state) => state.meta);
  const serviceLoading = useServiceStore((state) => state.loading);
  const fetchServices  = useServiceStore((state) => state.fetchServices);
  const createService  = useServiceStore((state) => state.createService);
  const updateService  = useServiceStore((state) => state.updateService);
  const deleteService  = useServiceStore((state) => state.deleteService);

  // ── Store: Categories ──
  const categories      = useCategoryStore((state) => state.categories) || [];
  const categoryLoading = useCategoryStore((state) => state.loading);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const showToast = useCartStore((state) => state.showToast);

  // ── Local UI state ──
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage]       = useState(1);

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [confirmDelete, setConfirmDelete]   = useState({ isOpen: false, id: null, name: '' });
  const [error, setError]                   = useState(null);

  // Helper hàm trigger load lại danh sách dịch vụ để tránh lặp code và giữ vững đồng bộ
  const loadServicesList = React.useCallback(async () => {
    try {
      await fetchServices({
        page:       currentPage,
        pageSize:   PAGE_SIZE,
        keyword:    searchTerm.trim() || undefined,
        categoryId: selectedCategory !== 'ALL' ? Number(selectedCategory) : undefined,
      });
    } catch (err) {
      setError('Không thể tải danh sách dữ liệu dịch vụ.');
    }
  }, [currentPage, searchTerm, selectedCategory, fetchServices]);

  // ── Fetch danh mục dịch vụ — chỉ 1 lần khi mount ──
  useEffect(() => {
    fetchCategories({ type: 'SERVICE' });
  }, [fetchCategories]);
  
  // ── Fetch danh sách dịch vụ — chạy lại khi filter/page thay đổi ──
  useEffect(() => {
    setError(null);
    loadServicesList();
  }, [loadServicesList]);

  // ── Handlers: Filter ──
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  // ── Handlers: Modal ──
  const openAddModal = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // ── Handlers: Save thành công từ Form Child ──
  // Do form đã tự xử lý gọi API createService/updateService bên trong nó và trả ra vùng dữ liệu sạch res.data, 
  // component cha ở đây chỉ nhận data sạch để thông báo hiển thị và đồng bộ lại danh sách.
  const handleSaveSuccess = (savedData) => {
    const isEdit = !!selectedService;
    
    if (isEdit) {
      showToast('Cập nhật gói dịch vụ thành công!', 'success');
      loadServicesList(); // Reload giữ nguyên trang để kiểm tra kết quả vừa sửa
    } else {
      showToast('Thêm dịch vụ mới thành công!', 'success');
      setCurrentPage(1); // Ép về trang 1 nhìn thấy bản ghi mới tinh vừa tạo ở đầu
    }
  };

  // ── Handlers: Delete ──
  const executeDelete = async () => {
    const res = await deleteService(confirmDelete.id);
    if (res?.success) {
      showToast(`Xóa dịch vụ "${confirmDelete.name}" thành công!`, 'success');
      const isLastItemOnPage = services.length === 1 && currentPage > 1;
      setCurrentPage((prev) => (isLastItemOnPage ? prev - 1 : prev));
      if (!isLastItemOnPage) {
        loadServicesList();
      }
    } else {
      showToast(res?.message || 'Xóa thất bại, dịch vụ đang có lịch đặt của khách.', 'error');
    }
    setConfirmDelete({ isOpen: false, id: null, name: '' });
  };

  const isGlobalLoading = serviceLoading || categoryLoading;

  // ── Error State ──
  if (error) return (
    <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 text-center p-6">
      <div className="p-4 bg-red-50 text-red-500 rounded-full"><AlertCircle size={40} /></div>
      <p className="text-gray-600 font-medium">{error}</p>
      <button
        onClick={() => { setError(null); setCurrentPage(1); loadServicesList(); }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
      >
        <RefreshCw size={16} /> Thử lại
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Spa</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Gói Dịch Vụ</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DANH SÁCH DỊCH VỤ</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-opacity-90 text-white font-bold rounded-xl shadow-sm text-sm transition-all active:scale-95"
        >
          <Plus size={18} /> Thêm Dịch Vụ Mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm tên dịch vụ..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={categoryLoading}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none text-gray-700 font-medium disabled:opacity-50"
        >
          <option value="ALL">Tất cả danh mục</option>
          {Array.isArray(categories) && categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto relative">
          {isGlobalLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loading size="medium" />
            </div>
          )}

          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-xs uppercase font-black border-b border-gray-100">
                <th className="p-4 w-12 text-center">STT</th>
                <th className="p-4">Tên dịch vụ</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Giá (VNĐ)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Scissors size={32} className="text-gray-300" />
                      <span>Không tìm thấy gói dịch vụ nào phù hợp.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service, index) => {
                  // Phòng ngừa lỗi runtime render ảnh an toàn
                  const thumbnailObj = Array.isArray(service.serviceImages) 
                    ? service.serviceImages.find((img) => img && img.isThumbnail) 
                    : null;

                  return (
                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 text-center font-mono text-xs text-gray-400">
                        {meta?.page ? (meta.page - 1) * (meta.pageSize ?? PAGE_SIZE) + index + 1 : index + 1}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3 text-left">
                          {thumbnailObj?.imageUrl && (
                            <img
                              src={thumbnailObj.imageUrl}
                              alt={service.name || "Service image"}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0 bg-gray-50"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-800">{service.name || ''}</span>
                              {Number(service.averageRating) >= 4.8 && (
                                <Star size={13} className="text-amber-500 fill-amber-500" title="Dịch vụ nổi bật" />
                              )}
                            </div>
                            <div className="text-xs text-gray-400 max-w-xs truncate">{service.description || ''}</div>
                            {Number(service.averageRating) > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star size={11} className="text-amber-400 fill-amber-400" />
                                <span className="text-[11px] font-semibold text-amber-600">{Number(service.averageRating).toFixed(1)}</span>
                                <span className="text-[11px] text-gray-400">({(service.totalReviews || 0).toLocaleString()} đánh giá)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-xs font-semibold inline-block">
                          {/* Đảm bảo render chuỗi an toàn, nếu null hoặc bọc object sẽ không crash */}
                          {typeof service.categoryName === 'string' ? service.categoryName : 'Chưa phân loại'}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-gray-700">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {service.durationMin || 0} phút
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-gray-800">
                          {(service.basePrice || 0).toLocaleString()}đ
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600">
                          Hoạt động
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditModal(service)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200"
                            title="Sửa dịch vụ"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ isOpen: true, id: service.id, name: service.name || '' })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200"
                            title="Xóa dịch vụ"
                          >
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

        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Form Quản lý Admin tích hợp ảnh */}
      <ServiceFormAdmin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess} // 🌟 Thay đổi kết nối callback sạch
        serviceData={selectedService}
      />

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={executeDelete}
        title="Xóa dịch vụ cửa hàng"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn gói dịch vụ "${confirmDelete.name}"? Thao tác này không thể hoàn tác.`}
        type="danger"
      />
    </div>
  );
};

export default ServiceManagement;