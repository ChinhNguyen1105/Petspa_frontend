import React, { useEffect, useState } from "react";
import { useRolePermissionStore } from "../../../store/roleStore"; // Đồng bộ theo import của bạn
import { useCartStore } from "../../../store/cartStore"; // Sử dụng showToast đồng bộ hệ thống
import { 
  Shield, 
  ShieldCheck, 
  Save, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  AlertCircle,
  ChevronRight,
  CheckCircle,
  Layers,
  Lock
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import ConfirmModal from "../../../components/common/ConfirmModal";

const RoleManagement = () => {
  const {
    roles,
    permissionsByModule,
    loading,
    error,
    fetchRoles,
    fetchPermissions,
    updatePermissionsForRole,
  } = useRolePermissionStore();

  // ── LOCAL UI STATE ──
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPermissionIds, setCheckedPermissionIds] = useState([]);
  
  // Trạng thái cho Modal Xác nhận (Đồng bộ cấu trúc mẫu)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", 
    title: "",
    message: "",
    pendingData: null
  });

  const showToast = useCartStore((state) => state.showToast);

  // 1. Nạp dữ liệu ban đầu (Sử dụng hàm reference an toàn trong dependency)
  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchRoles(), fetchPermissions()]);
    };
    initData();
  }, [fetchRoles, fetchPermissions]);

  // 2. Mặc định chọn Vai trò đầu tiên khi danh sách tải xong
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      handleSelectRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // 3. Xử lý đổi Vai trò
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCheckedPermissionIds(role.permissionIds || []);
  };

  // 4. Xử lý bật/tắt từng ô checkbox quyền đơn lẻ
  const handleTogglePermission = (permissionId) => {
    setCheckedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // 5. Xử lý bật/tắt nhanh TẤT CẢ quyền lợi của một Phân hệ (Module)
  const handleToggleModuleAll = (modulePermissions) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const isAllSelected = moduleIds.every((id) => checkedPermissionIds.includes(id));

    if (isAllSelected) {
      setCheckedPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setCheckedPermissionIds((prev) => {
        const uniqueIds = new Set([...prev, ...moduleIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  // 6. Mở modal xác nhận cập nhật phân quyền
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole) return;

    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_SUBMIT",
      title: "Xác nhận cập nhật phân quyền",
      message: `Bạn có chắc chắn muốn cập nhật lại ma trận quyền hạn cho vai trò "${selectedRole.name}" không?`,
      pendingData: checkedPermissionIds
    });
  };

  // 7. Thực thi lưu dữ liệu qua Store sau khi bấm xác nhận trên Modal
  const executeSavePermissions = async () => {
    try {
      const res = await updatePermissionsForRole(selectedRole.id, confirmModal.pendingData);
      closeConfirmModal();
      
      if (res && res.success) {
        showToast(`Cập nhật quyền vai trò [${selectedRole.name}] thành công!`, "success");
        setSelectedRole((prev) => ({ ...prev, permissionIds: confirmModal.pendingData }));
      }
    } catch (err) {
      showToast("Đã xảy ra lỗi hệ thống khi cập nhật quyền.", "error");
      closeConfirmModal();
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "CONFIRM_SUBMIT") executeSavePermissions();
    else closeConfirmModal();
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", title: "", message: "", pendingData: null });
  };

  // Trạng thái Loading ban đầu giống hệt trang CategoryManagement
  if (loading && roles.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* BREADCRUMB & TIÊU ĐỀ TRANG (Đồng bộ chuẩn phong cách) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Cấu hình</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Phân quyền Hệ thống</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            MA TRẬN PHÂN QUYỀN
          </h1>
        </div>
        
        <button 
          type="button"
          onClick={() => { fetchRoles(); fetchPermissions(); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} /> 
          Làm mới dữ liệu
        </button>
      </div>

      {/* Thông báo lỗi tập trung từ Store */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 max-w-7xl">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* THÂN CHÍNH: BỐ CỤC LƯỚI ĐỒNG BỘ CHUẨN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT TRÁI: DANH SÁCH VAI TRÒ (Thay thế khung Form cũ thành danh sách chọn) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-base font-black text-slate-800 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide">
            <Shield size={18} className="text-orange-500" />
            1. Chọn vai trò tài khoản
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border transition-all active:scale-[0.99] ${
                    isSelected
                      ? "bg-orange-50/40 border-orange-200/80 text-orange-600 shadow-sm"
                      : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 border ${
                      isSelected ? "bg-orange-500 border-orange-600 text-white" : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      <ShieldCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-black tracking-tight ${isSelected ? 'text-slate-800' : 'text-gray-700'}`}>
                        {role.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{role.description || "Chưa có mô tả vai trò"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                    isSelected ? "bg-white border-orange-200 text-orange-600" : "bg-gray-100 border-transparent text-gray-500"
                  }`}>
                    {role.permissionIds?.length || 0} quyền
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT MA TRẬN PHÂN QUYỀN (Bọc trong container bảng trắng lớn) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[500px]">
          
          {/* THANH ĐẦU KHUNG CHI TIẾT */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Lock size={16} className="text-orange-500" />
              2. Ma trận quyền chi tiết 
              {selectedRole && <span className="text-orange-500 font-black">[{selectedRole.name}]</span>}
            </div>

            {selectedRole && (
              <button
                type="button"
                onClick={handleFormSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-opacity-90 text-white font-black rounded-xl text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm uppercase"
              >
                <CheckCircle size={14} />
                Cập nhật phân quyền
              </button>
            )}
          </div>

          {/* VÙNG HIỂN THỊ DANH SÁCH QUYỀN THEO MODULE */}
          <div className="p-5 space-y-5 max-h-[calc(100vh-260px)] overflow-y-auto custom-scrollbar">
            {Object.keys(permissionsByModule).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium space-y-2">
                <Layers size={32} className="text-gray-300" />
                <span>Không tìm thấy tài nguyên quyền hạn nào từ hệ thống.</span>
              </div>
            ) : (
              Object.keys(permissionsByModule).map((moduleName) => {
                const modulePermissions = permissionsByModule[moduleName];
                
                const isAllModuleChecked = modulePermissions.every((p) =>
                  checkedPermissionIds.includes(p.id)
                );
                const isSomeModuleChecked = modulePermissions.some((p) =>
                  checkedPermissionIds.includes(p.id)
                ) && !isAllModuleChecked;

                return (
                  <div key={moduleName} className="border border-gray-100 rounded-xl overflow-hidden shadow-xs bg-white">
                    
                    {/* TIÊU ĐỀ PHÂN HỆ (MODULE HEADER) */}
                    <div className="bg-gray-50/60 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                        📦 PHÂN HỆ: {moduleName}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => handleToggleModuleAll(modulePermissions)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold transition-colors ${
                          isAllModuleChecked
                            ? "text-purple-600 bg-purple-50 border-purple-100"
                            : isSomeModuleChecked
                            ? "text-teal-600 bg-teal-50 border-teal-100"
                            : "text-gray-400 bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {isAllModuleChecked ? <CheckSquare size={12} /> : <Square size={12} />}
                        Chọn tất cả
                      </button>
                    </div>

                    {/* LƯỚI Ô QUYỀN LỢI CHI TIẾT */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                      {modulePermissions.map((permission) => {
                        const isChecked = checkedPermissionIds.includes(permission.id);
                        
                        return (
                          <div
                            key={permission.id}
                            onClick={() => handleTogglePermission(permission.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
                              isChecked
                                ? "bg-orange-50/20 border-orange-200/60 shadow-xs"
                                : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className={`mt-0.5 rounded shrink-0 transition-colors ${
                              isChecked ? "text-orange-500" : "text-gray-300 group-hover:text-gray-400"
                            }`}>
                              {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                            </div>

                            <div className="min-w-0">
                              <p className={`text-xs font-bold leading-tight transition-colors ${isChecked ? "text-slate-800" : "text-gray-600"}`}>
                                {permission.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border tracking-wide ${
                                  permission.method === "GET" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                  permission.method === "POST" ? "bg-teal-50 text-teal-600 border-teal-100" :
                                  permission.method === "PUT" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}>
                                  {permission.method}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold font-mono truncate" title={permission.apiPath}>
                                  {permission.apiPath}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* CHÂN KHUNG THÔNG TIN TRẠNG THÁI TỔNG HỢP */}
          <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
            <div>
              Đã chọn: <span className="text-slate-700">{checkedPermissionIds.length}</span> quyền hạn cho vai trò này.
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider hidden sm:block">
              Hệ thống Bảo mật cấu hình nâng cao
            </div>
          </div>

        </div>
      </div>

      {/* MODAL XÁC NHẬN CHUNG ĐỒNG BỘ HỆ THỐNG */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type="warning" 
      />
    </div>
  );
};

export default RoleManagement;