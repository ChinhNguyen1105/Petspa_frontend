import React, { useEffect, useState } from "react";
import { usePermissionStore } from "../../../store/permissionStore";
import { useCartStore } from "../../../store/cartStore"; // Sử dụng showToast đồng bộ hệ thống

import {
  KeyRound,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  AlertCircle,
  X,
  Save,
  Info,
  Filter,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import ConfirmModal from "../../../components/common/ConfirmModal";
import Pagination from "../../../components/common/Pagination";

// ── KHAI BÁO DANH SÁCH MODULE CỐ ĐỊNH KHÔNG PHỤ THUỘC DATA API ──
const MODULE_OPTIONS = [
  { value: "AUTH", label: " AUTHENTICATION" },
  { value: "USER", label: " USER (NGƯỜI DÙNG)" },
  { value: "ROLE", label: " ROLE (VAI TRÒ)" },
  { value: "PERMISSION", label: " PERMISSION (QUYỀN HẠN)" },
  { value: "PRODUCT", label: " PRODUCT (SẢN PHẨM)" },
  { value: "PET", label: " PET (THÚ CƯNG)" },
  { value: "SPA", label: " SPA SERVICE (DỊCH VỤ SPA)" },
  { value: "BOOKING", label: " BOOKING (LỊCH ĐẶT)" },
  { value: "ORDER", label: " ORDER (ĐƠN HÀNG)" },
  { value: "CART", label: " CART (GIỎ HÀNG)" },
  { value: "SYSTEM", label: " SYSTEM (HỆ THỐNG)" },
];

const PermissionManagement = () => {
  // ── 1. ĐỒNG BỘ STORE QUYỀN HẠN (usePermissionStore) ──
  const permissions = usePermissionStore((state) => state.permissions);
  const meta = usePermissionStore((state) => state.metaPermissions);
  const loading = usePermissionStore((state) => state.loading);
  const submitting = usePermissionStore((state) => state.submitting);
  const error = usePermissionStore((state) => state.error);

  const fetchPermissions = usePermissionStore(
    (state) => state.fetchPermissions,
  );
  const createPermission = usePermissionStore(
    (state) => state.createPermission,
  );
  const updatePermission = usePermissionStore(
    (state) => state.updatePermission,
  );
  const deletePermission = usePermissionStore(
    (state) => state.deletePermission,
  );

  const showToast = useCartStore((state) => state.showToast);

  // ── LOCAL STATE ──
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedModule, setSelectedModule] = useState(""); // Lưu trạng thái module lọc
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Trạng thái điều khiển Modal Thêm / Sửa
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    apiPath: "",
    method: "GET",
    module: "",
  });

  // Trạng thái cho Modal Xác nhận xóa
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    permissionId: null,
    permissionName: "",
  });

  // ── 2. TẠO FILTER STRING ĐỂ TRUYỀN XUỐNG BACKEND API ──
  const buildFilterQuery = (keyword, moduleVal) => {
    let filterArray = [];

    if (keyword?.trim()) {
      // Tìm kiếm đồng thời theo name HOẶC apiPath (sử dụng dấu nháy đơn ' ở đầu cho điều kiện OR)
      // Kết quả ra: name~*keyword*,'apiPath~*keyword*
      filterArray.push(`name~*${keyword.trim()}*`);
      filterArray.push(`'apiPath~*${keyword.trim()}*`);
    }

    if (moduleVal) {
      // Lọc chính xác theo Phân hệ (Module) - dùng toán tử bằng ':' thay vì bọc nháy đơn
      // Kết quả ra: module:USER
      filterArray.push(`module:${moduleVal}`);
    }

    // Ghép các điều kiện lại với nhau bằng dấu phẩy `,` (Mặc định là phép toán AND)
    return filterArray.length > 0 ? filterArray.join(",") : undefined;
  };

  // ── 3. NẠP VÀ LỌC DỮ LIỆU KẾT HỢP QUA BACKEND API ──
  const loadData = () => {
    const filterQuery = buildFilterQuery(searchKeyword, selectedModule);
    fetchPermissions({
      page: currentPage,
      pageSize: pageSize,
      filter: filterQuery,
    });
  };

  // Tự động gọi lại API khi thay đổi Số trang hoặc bộ lọc Phân hệ (Module)
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, selectedModule]);

  // Xử lý tìm kiếm qua form submit bằng nút nhấn hoặc phím Enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const filterQuery = buildFilterQuery(searchKeyword, selectedModule);
    fetchPermissions({
      page: 1,
      pageSize: pageSize,
      filter: filterQuery,
    });
  };

  // Khi thay đổi select module ở bộ lọc, reset trang về trang 1
  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
    setCurrentPage(1);
  };

  // Làm sạch toàn bộ bộ lọc và yêu cầu dữ liệu ban đầu
  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedModule("");
    setCurrentPage(1);
    fetchPermissions({
      page: 1,
      pageSize: pageSize,
      filter: undefined,
    });
  };

  // ── 4. XỬ LÝ ĐÓNG/MỞ FORM MODAL (THÊM / SỬA) ──
  const openCreateModal = () => {
    setEditingPermission(null);
    setFormData({ name: "", apiPath: "", method: "GET", module: "" });
    setIsFormModalOpen(true);
  };

  const openEditModal = (permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name || "",
      apiPath: permission.apiPath || "",
      method: permission.method || "GET",
      module: permission.module || "",
    });
    setIsFormModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.apiPath || !formData.module) {
      showToast("Vui lòng điền đầy đủ các trường bắt buộc!", "error");
      return;
    }

    let res;
    if (editingPermission) {
      res = await updatePermission({
        id: editingPermission.id,
        ...formData,
      });
    } else {
      res = await createPermission(formData);
    }

    if (res && res.success) {
      showToast(
        `${editingPermission ? "Cập nhật" : "Thêm mới"} quyền [${formData.name}] thành công!`,
        "success",
      );
      setIsFormModalOpen(false);
      loadData();
    } else {
      showToast(res.message || "Đã xảy ra lỗi, vui lòng thử lại.", "error");
    }
  };

  // ── 5. XỬ LÝ XOÁ PERMISSION ──
  const triggerDeletePermission = (permission) => {
    setConfirmDeleteModal({
      isOpen: true,
      permissionId: permission.id,
      permissionName: permission.name,
    });
  };

  const executeDeletePermission = async () => {
    const { permissionId, permissionName } = confirmDeleteModal;
    const res = await deletePermission(permissionId);

    setConfirmDeleteModal({
      isOpen: false,
      permissionId: null,
      permissionName: "",
    });

    if (res && res.success) {
      showToast(`Xóa quyền [${permissionName}] thành công!`, "success");
      if (permissions.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadData();
      }
    } else {
      showToast(res.message || "Không thể xóa quyền này.", "error");
    }
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case "GET":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "POST":
        return "bg-teal-50 text-teal-600 border-teal-100";
      case "PUT":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "DELETE":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "PATCH":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "OPTIONS":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* BREADCRUMB & HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Cấu hình</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Danh mục Quyền hạn</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            QUẢN LÝ QUYỀN HẠN (PERMISSIONS)
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus size={16} />
          Tạo quyền mới
        </button>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC ĐÃ ĐƯỢC TÁCH BIỆT DATA */}
      {/* THANH TÌM KIẾM & BỘ LỌC ĐÃ ĐƯỢC TÁCH BIỆT DATA */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Ô NHẬP TEXT TÌM KIẾM (Đã chuyển icon thành NÚT ẤN) */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full sm:w-80 relative group"
          >
            <input
              type="text"
              placeholder="Tìm theo tên quyền, API path..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all font-medium text-slate-700"
            />
            {/* Nút Tìm kiếm đặt ngay trong ô input */}
            <button
              type="submit"
              title="Ấn để tìm kiếm"
              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-gray-200/60 transition-all active:scale-90"
            >
              <Search size={16} className="transition-colors" />
            </button>
          </form>

          {/* Select chọn phân hệ (Module) - Không phụ thuộc data */}
          <div className="w-full sm:w-56 relative">
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">✨ Tất cả phân hệ</option>
              {MODULE_OPTIONS.map((mod) => (
                <option key={mod.value} value={mod.value}>
                  {mod.label}
                </option>
              ))}
            </select>
            <Filter
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới bộ lọc
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BẢNG HIỂN THỊ DỮ LIỆU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && permissions.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loading size="large" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium space-y-2">
            <Layers size={40} className="text-gray-300" />
            <span>
              Không tìm thấy tài nguyên quyền hạn nào khớp với bộ lọc.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-4 px-5 w-12 text-center">ID</th>
                  <th className="py-4 px-5">Tên Quyền Hạn</th>
                  <th className="py-4 px-5">Phân Hệ (Module)</th>
                  <th className="py-4 px-5">HTTP Method</th>
                  <th className="py-4 px-5 font-mono">API Path Endpoint</th>
                  <th className="py-4 px-5 text-right w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {permissions.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono text-xs text-gray-400 text-center">
                      {item.id}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-800 tracking-tight">
                        {item.name}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wide">
                        📦 {item.module || "HỆ THỐNG"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border tracking-widest ${getMethodBadgeClass(item.method)}`}
                      >
                        {item.method}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-gray-500 font-semibold tracking-tight">
                      {item.apiPath}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-gray-500 hover:text-orange-600 rounded-lg transition-all active:scale-90"
                          title="Sửa quyền hạn"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => triggerDeletePermission(item)}
                          className="p-1.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 rounded-lg transition-all active:scale-90"
                          title="Xóa quyền hạn"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PHÂN TRANG */}
        {meta && meta.pages > 1 && (
          <div className="bg-gray-50/40 px-5 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-400 order-2 sm:order-1">
              Hiển thị{" "}
              <span className="text-slate-700">{permissions.length}</span> /{" "}
              {meta.total} bản ghi dữ liệu.
            </span>
            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.pages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL: THÊM / SỬA (ĐÃ BỔ SUNG SELECT MODULE) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-slate-800 text-base uppercase tracking-wide">
                <KeyRound size={18} className="text-orange-500" />
                {editingPermission
                  ? "Cập nhật thông tin quyền"
                  : "Thêm mới quyền hệ thống"}
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                  Tên Quyền Hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ví dụ: Lấy thông tin người dùng hiện tại"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-medium rounded-xl focus:outline-none focus:border-orange-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                    HTTP Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 text-sm font-bold rounded-xl focus:outline-none focus:border-orange-400 text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>

                {/* THAY THẾ Ô INPUT BẰNG SELECT MODULE ĐỂ ĐỒNG BỘ DỮ LIỆU */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                    Phân Hệ / Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="module"
                    required
                    value={formData.module}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 text-sm font-bold rounded-xl focus:outline-none focus:border-orange-400 text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      --- Chọn Phân Hệ ---
                    </option>
                    {MODULE_OPTIONS.map((mod) => (
                      <option key={mod.value} value={mod.value}>
                        {mod.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                  API Path Endpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apiPath"
                  required
                  placeholder="Ví dụ: /api/v1/users/current"
                  value={formData.apiPath}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-mono font-semibold rounded-xl focus:outline-none focus:border-orange-400 text-slate-800"
                />
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl flex items-start gap-2 text-xs text-blue-600 font-medium leading-relaxed">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  API Endpoint và Method sẽ được Interceptor/Filter dưới Backend
                  quét kiểm tra khớp từng request để phân quyền bảo mật.
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={14} />
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      <ConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() =>
          setConfirmDeleteModal({
            isOpen: false,
            permissionId: null,
            permissionName: "",
          })
        }
        onConfirm={executeDeletePermission}
        title="Xác nhận gỡ bỏ quyền lợi"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn quyền hạn "${confirmDeleteModal.permissionName}" khỏi hệ thống? Hành động này có thể làm ảnh hưởng đến các cấu hình Vai trò đang chứa quyền này.`}
        type="danger"
      />
    </div>
  );
};

export default PermissionManagement;
