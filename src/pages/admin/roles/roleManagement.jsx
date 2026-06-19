import React, { useEffect, useState, useMemo, useRef } from "react";

import { useRoleStore } from "../../../store/roleStore"; 
import { usePermissionStore } from "../../../store/permissionStore";
import { useCartStore } from "../../../store/cartStore"; 
import { 
  Shield, ShieldCheck, Save, CheckSquare, Square, RefreshCw, 
  AlertCircle, ChevronRight, CheckCircle, Layers, Lock
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import ConfirmModal from "../../../components/common/ConfirmModal";
import Pagination from "../../../components/common/Pagination";

const RoleManagement = () => {
  // ── 1. ĐỒNG BỘ STORE ──
  const roles = useRoleStore((state) => state.roles);
  const loadingRoles = useRoleStore((state) => state.loading);
  const errorRoles = useRoleStore((state) => state.error);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const updateRole = useRoleStore((state) => state.updateRole);

  const permissions = usePermissionStore((state) => state.permissions);
  // Giả định store của bạn có lưu meta hoặc bạn có thể bổ sung. 
  // Nếu store không giữ meta, hãy đảm bảo hàm fetchPermissions cập nhật dữ liệu permissions ứng với từng trang.
  const loadingPermissions = usePermissionStore((state) => state.loading);
  const errorPermissions = usePermissionStore((state) => state.error);
  const fetchPermissions = usePermissionStore((state) => state.fetchPermissions);
  
  // Tổng số lượng bản ghi thực tế từ API để truyền vào phân trang (ví dụ: 59)
  // Bạn hãy thay thế bằng trường total thực tế trong Store của bạn (ví dụ: state.totalPermissions hoặc state.meta.total)
  const totalPermissions = usePermissionStore((state) => state.total || state.meta?.total || 59); 

  const isLoadingCombined = loadingRoles || loadingPermissions;
  const combinedError = errorRoles || errorPermissions;

  const permissionContainerRef = useRef(null);

  // ── LOCAL UI STATE ──
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPermissionIds, setCheckedPermissionIds] = useState([]);
  
  // State quản lý trang hiện tại gửi lên API
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Khớp với kích thước trang Backend đang trả về (pageSize: 20)

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, type: "", title: "", message: "", pendingData: null
  });

  const showToast = useCartStore((state) => state.showToast);

  // ── 2. NẠP VAI TRÒ BAN ĐẦU (CHẠY 1 LẦN) ──
  useEffect(() => {
    const initRoles = async () => {
      const rolesRes = await fetchRoles({ pageSize: 100 });
      if (rolesRes && rolesRes.length > 0) {
        const firstRole = rolesRes[0];
        setSelectedRole(firstRole);
        setCheckedPermissionIds(firstRole.permissions ? firstRole.permissions.map(p => p.id) : []);
      }
    };
    initRoles();
  }, [fetchRoles]);

  // ── 3. FETCH QUYỀN HẠN THEO TRANG (CHẠY MỖI KHI CURRENT_PAGE THAY ĐỔI) ──
  useEffect(() => {
    fetchPermissions({ page: currentPage, pageSize: pageSize });
    
    // Cuộn mượt khung hiển thị lên đầu mỗi khi dữ liệu trang mới về
    if (permissionContainerRef.current) {
      permissionContainerRef.current.scrollTop = 0;
    }
  }, [currentPage, pageSize, fetchPermissions]);

  // ── 4. ĐỒNG BỘ KHI ROLES TRÊN STORE THAY ĐỔI ĐỘT BIẾN (SAU KHI LƯU) ──
  useEffect(() => {
    if (selectedRole && roles.length > 0) {
      const updatedRole = roles.find(r => r.id === selectedRole.id);
      if (updatedRole) {
        const updatedIds = updatedRole.permissions ? updatedRole.permissions.map(p => p.id) : [];
        const currentIds = selectedRole.permissions ? selectedRole.permissions.map(p => p.id) : [];
        
        if (JSON.stringify(updatedIds) !== JSON.stringify(currentIds)) {
          setSelectedRole(updatedRole);
          setCheckedPermissionIds(updatedIds);
        }
      }
    }
  }, [roles]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const extractedIds = role.permissions ? role.permissions.map((p) => p.id) : [];
    setCheckedPermissionIds(extractedIds);
    setCurrentPage(1); 
  };

  // ── 5. NHÓM QUYỀN HẠN THEO MODULE (DỮ LIỆU ĐÃ ĐƯỢC API LỌC THEO TRANG) ──
  const permissionsByModule = useMemo(() => {
    if (!permissions || permissions.length === 0) return {};
    
    return permissions.reduce((acc, curr) => {
      const moduleName = curr.module || curr.apiPath?.split("/")[3]?.toUpperCase() || "HỆ THỐNG CHUNG";
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(curr);
      return acc;
    }, {});
  }, [permissions]);

  // Lấy toàn bộ danh sách các group module từ cục dữ liệu phân trang hiện tại của API
  const moduleKeys = useMemo(() => Object.keys(permissionsByModule), [permissionsByModule]);

  const handleTogglePermission = (permissionId) => {
    setCheckedPermissionIds((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  const handleToggleModuleAll = (modulePermissions) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const isAllSelected = moduleIds.every((id) => checkedPermissionIds.includes(id));

    if (isAllSelected) {
      setCheckedPermissionIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setCheckedPermissionIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

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

  const executeSavePermissions = async () => {
    try {
      const formattedPermissions = confirmModal.pendingData.map(id => ({ id }));
      const updatePayload = {
        id: selectedRole.id,
        name: selectedRole.name,
        description: selectedRole.description,
        activeFlag: selectedRole.activeFlag ?? true,
        permissions: formattedPermissions 
      };

      const res = await updateRole(updatePayload);
      closeConfirmModal();
      
      if (res && res.success) {
        showToast(`Cập nhật ma trận quyền vai trò [${selectedRole.name}] thành công!`, "success");
        
        const updatedPermissionsMock = confirmModal.pendingData.map(id => {
          const originalPerm = permissions.find(p => p.id === id);
          return originalPerm ? originalPerm : { id };
        });

        setSelectedRole((prev) => ({ ...prev, permissions: updatedPermissionsMock }));
      } else {
        showToast(res.message || "Không thể cập nhật phân quyền.", "error");
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

  if (isLoadingCombined && roles.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
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
          onClick={() => { fetchRoles({ pageSize: 100 }); fetchPermissions({ page: currentPage, pageSize: pageSize }); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={14} className={`${isLoadingCombined ? 'animate-spin' : ''}`} /> 
          Làm mới dữ liệu
        </button>
      </div>

      {combinedError && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 max-w-7xl">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{combinedError}</span>
        </div>
      )}

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT VAI TRÒ */}
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
                    isSelected ? "bg-orange-50/40 border-orange-200/80 text-orange-600 shadow-sm" : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 border ${isSelected ? "bg-orange-500 border-orange-600 text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                      <ShieldCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-black tracking-tight ${isSelected ? 'text-slate-800' : 'text-gray-700'}`}>
                        {role.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{role.description || "Chưa có mô tả vai trò"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${isSelected ? "bg-white border-orange-200 text-orange-600" : "bg-gray-100 border-transparent text-gray-500"}`}>
                    {role.permissions?.length || 0} quyền
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CỘT DANH SÁCH QUYỀN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[550px]">
          
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

          <div 
            ref={permissionContainerRef}
            className="p-5 space-y-5 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar flex-1 scroll-smooth"
          >
            {moduleKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium space-y-2">
                <Layers size={32} className="text-gray-300" />
                <span>Không tìm thấy tài nguyên quyền hạn nào từ hệ thống.</span>
              </div>
            ) : (
              moduleKeys.map((moduleName) => {
                const modulePermissions = permissionsByModule[moduleName];
                const isAllModuleChecked = modulePermissions.every((p) => checkedPermissionIds.includes(p.id));
                const isSomeModuleChecked = modulePermissions.some((p) => checkedPermissionIds.includes(p.id)) && !isAllModuleChecked;

                return (
                  <div key={moduleName} className="border border-gray-100 rounded-xl overflow-hidden shadow-xs bg-white">
                    <div className="bg-gray-50/60 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                        📦 PHÂN HỆ: {moduleName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleModuleAll(modulePermissions)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold transition-colors ${
                          isAllModuleChecked ? "text-purple-600 bg-purple-50 border-purple-100" : isSomeModuleChecked ? "text-teal-600 bg-teal-50 border-teal-100" : "text-gray-400 bg-white border-gray-200"
                        }`}
                      >
                        {isAllModuleChecked ? <CheckSquare size={12} /> : <Square size={12} />}
                        Chọn tất cả
                      </button>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                      {modulePermissions.map((permission) => {
                        const isChecked = checkedPermissionIds.includes(permission.id);
                        return (
                          <div
                            key={permission.id}
                            onClick={() => handleTogglePermission(permission.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
                              isChecked ? "bg-orange-50/20 border-orange-200/60 shadow-xs" : "bg-white border-gray-100 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className={`mt-0.5 rounded shrink-0 transition-colors ${isChecked ? "text-orange-500" : "text-gray-300"}`}>
                              {isChecked ? <CheckSquare size={15} /> : <Square size={15} />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold leading-tight ${isChecked ? "text-slate-800" : "text-gray-600"}`}>
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
                                <span className="text-[10px] text-gray-400 font-bold font-mono truncate">
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

          {/* FOOTER BAR: TRUYỀN ĐÚNG TRƯỜNG TOTAL TỪ API */}
          <div className="bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between p-4 gap-4 text-xs font-bold text-gray-400">
            <div>
              Đã chọn: <span className="text-slate-700">{checkedPermissionIds.length}</span> quyền hạn cho vai trò này.
            </div>
            
            {totalPermissions > 0 && (
              <div className="scale-90 origin-right">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalPermissions} // Sử dụng số lượng 59 bản ghi của API thay vì moduleKeys.length khách hàng
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen} onClose={closeConfirmModal} onConfirm={handleConfirmAction}
        title={confirmModal.title} message={confirmModal.message} type="warning" 
      />
    </div>
  );
};

export default RoleManagement;