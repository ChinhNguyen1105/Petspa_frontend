import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Filter, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  Layers, 
  ChevronRight,
  Eye,
  User,
  MapPin,
  CreditCard,
  DollarSign,
  Plus,
  X
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import Modal from '../../../components/common/Modal'; 
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useCartStore } from '../../../store/cartStore';
import { useOrderStore } from '../../../store/orderStore';
import OrderFormAdmin from '../../../components/form/OrderFormAdmin';
import { STATUS_FILTERS } from '../../../constants';
import Pagination from '../../../components/common/Pagination';

// ==========================================
// MAIN MANAGEMENT COMPONENT
// ==========================================
const OrderManagement = () => {
  // --- TẬN DỤNG TRẠNG THÁI VÀ ACTIONS TỪ ZUSTAND STORE ---
  const orders            = useOrderStore((state) => state.orders) || [];
  const meta              = useOrderStore((state) => state.meta); // Kế thừa cấu trúc cấu hình backend { page, pageSize, pages, total }
  const loading           = useOrderStore((state) => state.loading);
  const errorStore        = useOrderStore((state) => state.error);
  const fetchOrders       = useOrderStore((state) => state.fetchOrders);
  const createOrder       = useOrderStore((state) => state.createOrder);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const cancelOrder       = useOrderStore((state) => state.cancelOrder);

  const setStoreState = useOrderStore.setState;

  // ─── LOCAL UI STATE ────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage]       = useState(1);

  // Điều khiển Main Modal
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [modalType, setModalType]           = useState('VIEW'); // 'VIEW', 'EDIT', 'CREATE'
  const [selectedOrder, setSelectedOrder]   = useState(null);

  // Điều khiển Modal xác nhận bọc ngoài
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'CANCEL_FORM', 'CONFIRM_UPDATE', 'CONFIRM_DELETE'
    title: '',
    message: '',
    pendingData: null
  });

  const showToast = useCartStore((state) => state.showToast);
  const statusOptions = STATUS_FILTERS;

  // ─── FETCH KHI THAY ĐỔI TRANG HOẶC BỘ LỌC TỪ BACKEND ───────────────────────
  useEffect(() => {
    fetchOrders({ 
      page: currentPage, 
      search: searchTerm.trim(), 
      status: selectedStatus 
    });
  }, [currentPage, searchTerm, selectedStatus, fetchOrders]);

  // Reset về trang 1 khi filter thay đổi để tránh lỗi rỗng trang
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // ─── MODAL HANDLERS ────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setModalType('CREATE');
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setModalType('EDIT');
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (order) => {
    setModalType('VIEW');
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // 1. Khi bấm Lưu trên Form
  const handleFormSubmit = (formOutputData) => {
    if (modalType === 'EDIT') {
      setConfirmModal({
        isOpen: true,
        type: 'CONFIRM_UPDATE',
        title: 'Cập nhật đơn hàng',
        message: `Hành động này sẽ cập nhật trạng thái dữ liệu của đơn hàng #${formOutputData.id}. Bạn chắc chắn chứ?`,
        pendingData: formOutputData
      });
    } else {
      setConfirmModal({
        isOpen: true,
        type: 'CONFIRM_SAVE_FORM',
        title: 'Tạo đơn hàng mới',
        message: 'Bạn có chắc chắn muốn tạo đơn hàng thủ công này không?',
        pendingData: formOutputData
      });
    }
  };

  // Lõi thực thi Lưu bằng cách gọi Store Actions
  const executeSaveOrder = async () => {
    const formOutputData = confirmModal.pendingData;
    try {
      const mappedPayload = {
        id: formOutputData.id,
        userId: formOutputData.userId,
        userName: formOutputData.userName,
        userEmail: formOutputData.userEmail,
        shippingName: formOutputData.shippingName || formOutputData.userName,
        shippingPhone: formOutputData.shippingPhone,
        shippingAddressFull: formOutputData.shippingAddressFull,
        totalQuantity: formOutputData.totalQuantity,
        totalAmount: formOutputData.totalAmount,
        status: formOutputData.status,
        paymentMethod: formOutputData.paymentMethod,
        paymentStatus: formOutputData.paymentStatus,
        activeFlag: true,
        deleteFlag: false,
        createdBy: formOutputData.userEmail,
        lastModifiedBy: "staff@gmail.com",
        orderDetails: formOutputData.orderDetails || [],
        createdDate: selectedOrder?.createdDate || new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
      };

      if (modalType === 'CREATE') {
        const res = await createOrder(mappedPayload);
        if (res?.success !== false) {
          showToast('Tạo đơn hàng thủ công thành công!', 'success');
        } else {
          showToast(res?.message || 'Gặp sự cố khi tạo đơn hàng.', 'error');
        }
      } else {
        const res = await updateOrderStatus(selectedOrder.id, formOutputData.status);
        if (res?.success !== false) {
          // Đồng bộ state cục bộ ngay lập tức tương tự như Booking
          setStoreState((state) => ({
            orders: state.orders.map(o => o.id === selectedOrder.id ? { ...o, status: formOutputData.status } : o)
          }));
          showToast(`Đã lưu thay đổi cho đơn hàng #${formOutputData.id}!`, 'success');
        } else {
          showToast(res?.message || 'Gặp sự cố khi cập nhật đơn hàng.', 'error');
        }
      }

      setIsModalOpen(false);
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      showToast('Gặp sự cố khi xử lý đơn hàng.', 'error');
    }
  };

  // 2. Khi bấm Hủy/Đóng Form
  const handleCancelForm = () => {
    if (modalType === 'VIEW') {
      setIsModalOpen(false);
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'CANCEL_FORM',
      title: 'Hủy bỏ thao tác?',
      message: 'Những thay đổi bạn vừa nhập trên Form sẽ không được lưu. Bạn vẫn muốn thoát chứ?',
      pendingData: null
    });
  };

  // 3. Xóa/Hủy đơn hàng qua Store
  const handleConfirmDelete = (orderId) => {
    setConfirmModal({
      isOpen: true,
      type: 'CONFIRM_DELETE',
      title: 'Hủy đơn hàng vĩnh viễn',
      message: `Hành động này sẽ thực hiện hủy mã đơn [#${orderId}] trên hệ thống.`,
      pendingData: { id: orderId }
    });
  };

  const executeDeleteOrder = async () => {
    const { id } = confirmModal.pendingData;
    try {
      const res = await cancelOrder(id);
      if (res?.success !== false) {
        showToast(`Hủy thành công đơn hàng #${id}`, 'success');
      } else {
        showToast(res?.message || 'Xảy ra lỗi khi thực thi hủy đơn.', 'error');
      }
      closeConfirmModal();
    } catch (err) {
      showToast('Xảy ra lỗi khi thực thi xóa.', 'error');
    }
  };

  // ─── CONFIRM MODAL DISPATCHER ──────────────────────────────────────────────
  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case 'CANCEL_FORM':     setIsModalOpen(false); closeConfirmModal(); break;
      case 'CONFIRM_SAVE_FORM':
      case 'CONFIRM_UPDATE':  executeSaveOrder(); break;
      case 'CONFIRM_DELETE':  executeDeleteOrder(); break;
      default: closeConfirmModal();
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', title: '', message: '', pendingData: null });
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loading size="large" /></div>;
  if (errorStore) return <div className="text-center p-6 text-red-500">{errorStore}</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Shop</span><ChevronRight size={12} /><span className="text-orange-500">Đơn hàng</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">QUẢN LÝ ĐƠN HÀNG</h1>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all">
          <Plus size={18} /> Tạo đơn hàng mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, khách hàng, địa chỉ..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700" 
          />
        </div>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)} 
          className="w-full sm:w-56 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none"
        >
          {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-44">Mã đơn hàng</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Chi tiết sản phẩm mua</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4 text-center">Trạng thái đơn</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy dữ liệu hóa đơn nào trùng khớp.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const matchedStatus = statusOptions.find(s => s.value === order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="text-xs font-mono text-gray-400 mb-0.5">{formatDate(order.createdDate)}</div>
                        <div className="font-bold text-blue-600 font-mono tracking-tight text-sm">#{order.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" /> {order.userName}
                        </div>
                        <div className="text-xs text-gray-400 max-w-xs truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="shrink-0" /> {order.shippingAddressFull}
                        </div>
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="space-y-0.5">
                          {order.orderDetails?.map((item, idx) => (
                            <div key={item.id || idx} className="text-xs text-gray-600 truncate">
                              • <span className="font-semibold text-slate-700">{item.productName}</span> x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-gray-900 text-base">{formatPrice(order.totalAmount)}</div>
                        <div className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded w-max mt-1 bg-slate-100 text-slate-500">
                          {order.paymentMethod} • {order.paymentStatus === 'SUCCESS' ? 'Đã Thanh Toán' : 'Chưa Trả Tiền'}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${matchedStatus?.color || 'bg-gray-100'}`}>
                          {matchedStatus?.label || 'Không rõ'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleOpenViewModal(order)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl border border-transparent transition-all" title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleOpenEditModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all" title="Sửa thông tin">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleConfirmDelete(order.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all" title="Xóa/Hủy đơn">
                            <Trash2 size={16} />
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

        {/* ─── PAGINATION (KẾ THỪA CHUẨN TỪ TRANG BOOKING) ──────────────────────── */}
        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* MODAL LUỒNG FORM ĐƠN HÀNG */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancelForm} 
        title={modalType === 'CREATE' ? 'Tạo hóa đơn thủ công mới' : modalType === 'EDIT' ? 'Cập nhật thông tin đơn hàng' : 'Chi tiết đơn hàng'}
        size='lg'
      >
        <OrderFormAdmin
          initialData={selectedOrder}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
          mode={modalType}
        />
      </Modal>

      {/* CONFIRM_MODAL ĐỂ ĐỒNG BỘ TRẢI NGHIỆM */}
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

export default OrderManagement;