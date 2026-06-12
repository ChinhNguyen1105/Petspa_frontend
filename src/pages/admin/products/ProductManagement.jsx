import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Package, 
  Layers, 
  ChevronRight
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import { formatPrice } from '../../../utils/formatPrice';
import ProductFormAdmin from '../../../components/form/ProductFormAdmin';
import Modal from '../../../components/common/Modal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Pagination from '../../../components/common/Pagination';

import { useCartStore } from '../../../store/cartStore';
import { useProductStore } from '../../../store/productStore';
import { useCategoryStore } from '../../../store/categoryStore';


const ProductManagement = () => {
  // ── Store: Products & Pagination ──
  const products        = useProductStore((state) => state.products) || [];
  const meta            = useProductStore((state) => state.meta);
  const loadingProducts = useProductStore((state) => state.loading);
  const errorProducts   = useProductStore((state) => state.error);
  
  const fetchProducts   = useProductStore((state) => state.fetchProducts);
  const createProduct   = useProductStore((state) => state.createProduct);
  const updateProduct   = useProductStore((state) => state.updateProduct);
  const deleteProduct   = useProductStore((state) => state.deleteProduct);

  // ── Store: Categories ──
  const storeCategories   = useCategoryStore((state) => state.categories);
  const fetchCategories   = useCategoryStore((state) => state.fetchCategories);
  const loadingCategories = useCategoryStore((state) => state.loading);

  // ── LOCAL UI STATE ──
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0); 
  const [currentPage, setCurrentPage]       = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [modalType, setModalType]             = useState('CREATE');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',        
    title: '',
    message: '',
    pendingData: null,
  });

  const showToast = useCartStore((state) => state.showToast);

  // Tải danh mục ban đầu
  useEffect(() => {
    fetchCategories({ type: "PRODUCT" });
  }, [fetchCategories]);

  // FETCH DATA: Gom toàn bộ logic lắng nghe thay đổi vào đây
  useEffect(() => {
    fetchProducts({
      page: currentPage,
      keyword: searchTerm.trim(),
      categoryId: selectedCategory === 0 ? undefined : selectedCategory
    });
  }, [currentPage, searchTerm, selectedCategory, fetchProducts]);

  // ── Sửa bộ lắng nghe onChange để reset trang chủ động (Bỏ Effect phụ) ──
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ngay khi gõ
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(Number(e.target.value));
    setCurrentPage(1); // Reset ngay khi chọn danh mục khác
  };

  // Mapping Options
  const categoriesOptions = [
    { value: 0, label: 'Tất cả sản phẩm' },
    ...storeCategories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  const formCategories = storeCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Handlers: Modals
  const handleOpenCreateModal = () => {
    setModalType('CREATE');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalType('EDIT');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: 'CANCEL_FORM',
      title: 'Hủy bỏ thao tác?',
      message: 'Những thay đổi bạn vừa nhập sẽ không được lưu. Bạn vẫn muốn thoát chứ?',
      pendingData: null,
    });
  };

  const handleFormSubmit = (formOutputData) => {
    if (modalType === 'EDIT') {
      setConfirmModal({
        isOpen: true,
        type: 'CONFIRM_UPDATE',
        title: 'Xác nhận cập nhật',
        message: `Bạn có chắc chắn muốn cập nhật thay đổi cho sản phẩm "${formOutputData.name}"?`,
        pendingData: formOutputData,
      });
    } else {
      executeSaveProduct(formOutputData);
    }
  };

  const executeSaveProduct = async (formOutputData) => {
    try {
      const catIdParsed = Number(formOutputData.categoryId);
      const catMatch = storeCategories.find((c) => c.id === catIdParsed);
      
      const mappedPayload = {
        name:          formOutputData.name,
        price:         Number(formOutputData.price), // Ép kiểu số cho an toàn với API thật
        stockQuantity: Number(formOutputData.stockQuantity ?? formOutputData.stock ?? 0),
        categoryId:    catIdParsed,
        categoryName:  catMatch ? catMatch.name : '',
        thumbnailUrl:  formOutputData.thumbnailUrl ?? formOutputData.image ?? '',
        description:   formOutputData.description || '',
        activeFlag:    true,
      };

      if (modalType === 'CREATE') {
        const result = await createProduct(mappedPayload);
        if (result?.success) {
          showToast('Thêm sản phẩm mới thành công!', 'success');
          setCurrentPage(1); // Tạo xong thì nên đưa người dùng về trang 1 để xem sản phẩm mới nhất
        } else {
          showToast('Đã xảy ra lỗi khi thêm sản phẩm.', 'error');
        }
      } else {
        const result = await updateProduct(selectedProduct.id, mappedPayload);
        if (result?.success) {
          showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
          // Giữ nguyên trang hiện tại để họ kiểm tra dòng dữ liệu vừa sửa
          fetchProducts({ page: currentPage, keyword: searchTerm.trim(), categoryId: selectedCategory === 0 ? undefined : selectedCategory });
        } else {
          showToast('Đã xảy ra lỗi khi cập nhật sản phẩm.', 'error');
        }
      }

      setIsModalOpen(false);
      closeConfirmModal();
    } catch (err) {
      console.error('Gặp lỗi khi xử lý dữ liệu:', err);
      showToast('Đã xảy ra lỗi hệ thống.', 'error');
    }
  };

  // Handlers: Xóa sản phẩm
  const handleConfirmDelete = (productId, productName) => {
    setConfirmModal({
      isOpen: true,
      type: 'CONFIRM_DELETE',
      title: 'Xóa sản phẩm vĩnh viễn',
      message: `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`,
      pendingData: { id: productId, name: productName },
    });
  };

  const executeDeleteProduct = async () => {
    const { id, name } = confirmModal.pendingData;
    try {
      const result = await deleteProduct(id);
      if (result?.success) {
        showToast(`Đã xóa sản phẩm "${name}" thành công!`, 'success');
        // Sau khi xóa, gọi lại danh sách hiện tại
        fetchProducts({ page: currentPage, keyword: searchTerm.trim(), categoryId: selectedCategory === 0 ? undefined : selectedCategory });
      } else {
        showToast('Không thể xóa sản phẩm vào lúc này.', 'error');
      }
      closeConfirmModal();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      showToast('Đã xảy ra lỗi khi tiến hành xóa.', 'error');
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case 'CANCEL_FORM':
        setIsModalOpen(false);
        closeConfirmModal();
        break;
      case 'CONFIRM_UPDATE':
        executeSaveProduct(confirmModal.pendingData);
        break;
      case 'CONFIRM_DELETE':
        executeDeleteProduct();
        break;
      default:
        closeConfirmModal();
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', title: '', message: '', pendingData: null });
  };

  if (errorProducts) {
    return (
      <div className="text-center p-6 text-red-500 flex items-center justify-center gap-2 h-[60vh]">
        <AlertCircle size={18} /> {errorProducts}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Shop</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Sản phẩm</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DANH SÁCH SẢN PHẨM</h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange} // Dùng hàm handle mới tối ưu
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange} // Dùng hàm handle mới tối ưu
          disabled={loadingCategories}
          className="w-full sm:w-52 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none disabled:opacity-50"
        >
          {categoriesOptions.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {(loadingProducts || loadingCategories) && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loading size="large" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-24 text-center">Ảnh</th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4 text-center">Kho hàng</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy sản phẩm.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border flex items-center justify-center mx-auto">
                        {product.thumbnailUrl ? (
                          <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base">{product.name}</div>
                      <div className="text-xs font-mono text-gray-400">
                        Mã định danh: <span className="font-bold text-blue-600">ID - {product.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Layers size={12} />
                        {product.categoryName || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-gray-900 text-base">{formatPrice(product.price)}</td>
                    <td className="p-4 text-center font-bold text-gray-800">{product.stockQuantity ?? 0} cái</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(product.id, product.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <Pagination 
              currentPage={currentPage} 
              totalPages={meta.pages} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          </div>
        )}
      </div>

      {/* Modal 1: Form tạo / chỉnh sửa */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={modalType === 'CREATE' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
        size="lg"
      >
        <ProductFormAdmin
          categories={formCategories}
          initialData={selectedProduct}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
        />
      </Modal>

      {/* Modal 2: Xác nhận hành động */}
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

export default ProductManagement;