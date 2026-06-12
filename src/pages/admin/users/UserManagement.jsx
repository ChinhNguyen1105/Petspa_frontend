import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Shield, 
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import { formatDate } from '../../../utils/formatDate';
import Modal from '../../../components/common/Modal'; 
import ConfirmModal from '../../../components/common/ConfirmModal';
import UserFormAdmin from '../../../components/form/UserFormAdmin';
import Pagination from '../../../components/common/Pagination';

// IMPORT ZUSTAND STORES
import { useUserStore } from '../../../store/userStore';
import { useCartStore } from '../../../store/cartStore';
import { ROLE_OPTIONS } from '../../../constants';

const UserManagement = () => {
  // BÓC TÁCH STATE & ACTIONS TỪ USEUSERSTORE
  const { 
    users, 
    meta,
    loading, 
    keyword,
    selectedRole,
    page,
    pageSize,
    setKeyword,
    setSelectedRole,
    setPage,
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUserStore();

  // Toast notification kết nối từ cartStore
  const showToast = useCartStore((state) => state.showToast);

  // Điều khiển Modal Form chính
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('CREATE'); 
  const [selectedUser, setSelectedUser] = useState(null);

  // Trạng thái cho các cửa sổ xác nhận (ConfirmModal)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'CANCEL_FORM', 'CONFIRM_UPDATE', 'CONFIRM_DELETE'
    title: '',
    message: '',
    pendingData: null
  });

  const roles = ROLE_OPTIONS;

  // Lắng nghe thay đổi của bộ lọc để tự động fetch lại dữ liệu từ API
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, keyword, selectedRole, page]);

  const handleOpenCreateModal = () => {
    setModalType('CREATE');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalType('EDIT');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Nhận dữ liệu bắn lên từ UserForm khi nhấn Lưu
  const handleFormSubmit = (formData) => {
    if (modalType === 'EDIT') {
      setConfirmModal({
        isOpen: true,
        type: 'CONFIRM_UPDATE',
        title: 'Xác nhận cập nhật',
        message: `Bạn có chắc chắn muốn lưu các thay đổi cho tài khoản "${formData.name}"?`,
        pendingData: formData
      });
    } else {
      executeSaveUser(formData);
    }
  };

  // Thực thi lưu xuống API thông qua Store Actions
  const executeSaveUser = async (formData) => {
    try {
      if (modalType === 'CREATE') {
        const response = await createUser(formData);
        if (response && response.success) {
          showToast('Thêm thành viên mới thành công!', 'success');
          setIsModalOpen(false);
          closeConfirmModal();
          fetchUsers(); // Refresh lại danh sách trang đầu
        } else {
          showToast(response?.message || 'Đã xảy ra lỗi khi tạo.', 'error');
        }
      } else {
        const response = await updateUser(selectedUser.id, formData);
        if (response && response.success) {
          showToast('Cập nhật thông tin thành viên thành công!', 'success');
          setIsModalOpen(false);
          closeConfirmModal();
        } else {
          showToast(response?.message || 'Đã xảy ra lỗi khi cập nhật.', 'error');
        }
      }
    } catch (err) {
      console.error("Lỗi khi xử lý lưu thông tin user:", err);
      showToast('Đã xảy ra lỗi hệ thống khi lưu thông tin.', 'error');
    }
  };

  // Xử lý chặn thoát khi Form đang nhập dở
  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: 'CANCEL_FORM',
      title: 'Hủy bỏ thao tác?',
      message: 'Những thông tin bạn vừa nhập sẽ biến mất. Bạn vẫn muốn thoát chứ?',
      pendingData: null
    });
  };

  // Xác nhận kích hoạt luồng xóa người dùng
  const handleConfirmDelete = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: 'CONFIRM_DELETE',
      title: 'Xóa tài khoản vĩnh viễn',
      message: `Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản "${userName}"?`,
      pendingData: { id: userId, name: userName }
    });
  };

  const executeDeleteUser = async () => {
    const { id, name } = confirmModal.pendingData;
    try {
      const response = await deleteUser(id);
      if (response && response.success) {
        showToast(`Đã xóa tài khoản "${name}" thành công!`, 'success');
        closeConfirmModal();
      } else {
        showToast(response?.message || 'Xóa tài khoản thất bại.', 'error');
      }
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      showToast('Gặp lỗi hệ thống khi thực hiện xóa.', 'error');
    }
  };

  // Quản lý điều hướng nút "Đồng ý" của ConfirmModal
  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case 'CANCEL_FORM':
        setIsModalOpen(false); 
        closeConfirmModal();
        break;
      case 'CONFIRM_UPDATE':
        executeSaveUser(confirmModal.pendingData); 
        break;
      case 'CONFIRM_DELETE':
        executeDeleteUser(); 
        break;
      default:
        closeConfirmModal();
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', title: '', message: '', pendingData: null });
  };

  // Hàm xử lý hiển thị Badge Trạng thái dựa theo deleteFlag và activeFlag
  const renderStatusBadge = (user) => {
    if (user.deleteFlag) {
      return (
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-red-600 bg-red-50 border-red-100">
          Đã xóa
        </span>
      );
    }
    if (user.activeFlag) {
      return (
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-green-600 bg-green-50 border-green-100">
          Hoạt động
        </span>
      );
    }
    return (
      <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-amber-600 bg-amber-50 border-amber-100">
        Tạm ngưng
      </span>
    );
  };

  // Tính toán tổng số trang dựa trên meta data từ backend trả về
  const totalPages = meta?.total ? Math.ceil(meta.total / pageSize) : 1;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý hệ thống</span><ChevronRight size={12} /><span className="text-orange-500">Người dùng</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DANH SÁCH TÀI KHOẢN</h1>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all">
          <Plus size={18} /> Thêm người dùng
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><Search size={18} /></span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, số điện thoại..." 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700" 
          />
        </div>
        <select 
          value={selectedRole || 'ALL'} 
          onChange={(e) => setSelectedRole(e.target.value === 'ALL' ? '' : e.target.value)} 
          className="w-full sm:w-52 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
        >
          {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center"><Loading size="large" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                  <th className="p-4 w-24 text-center">Ảnh</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Ngày tạo</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-400">
                      <User size={36} className="mx-auto mb-2 text-gray-300" />
                      Không tìm thấy thành viên nào phù hợp yêu cầu.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4 text-center">
                        <div className="w-11 h-11 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center mx-auto">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base">{user.name}</div>
                        <div className="text-xs font-mono text-gray-400">ID: #{user.id}</div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <Mail size={13} className="text-gray-400" />
                          <span>{user.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Phone size={13} />
                          <span>{user.phone || '—'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Shield size={12} className="text-slate-500" />
                          {user.roleName === 'ADMIN' ? 'Quản trị viên' : user.roleName === 'STAFF' ? 'Nhân viên' : user.roleName === 'MANAGER' ? 'Quản lý' : 'Khách hàng'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {renderStatusBadge(user)}
                      </td>

                      <td className="p-4 text-center text-gray-500 font-medium">
                        {user.createdDate ? formatDate(user.createdDate) : '—'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(user)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(user.id, user.name)} 
                            disabled={user.deleteFlag}
                            className={`p-2 rounded-xl border border-transparent transition-all ${
                              user.deleteFlag 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-red-500 hover:bg-red-50 hover:border-red-200'
                            }`}
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
        )}
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-end mt-4">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(targetPage) => setPage(targetPage)} 
          />
        </div>
      )}

      {/* Modal chính chứa Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancelForm} 
        title={modalType === 'CREATE' ? 'Thêm tài khoản người dùng' : 'Chỉnh sửa tài khoản'}
        size='lg'
      >
        <UserFormAdmin
          initialData={selectedUser}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm} 
        />
      </Modal>

      {/* Modal xác nhận chặn phụ */}
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

export default UserManagement;