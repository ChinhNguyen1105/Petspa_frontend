import React, { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  Eye,
  Package,
  Plus,
  Layers,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import { formatPrice } from "../../../utils/formatPrice";
import { formatDate } from "../../../utils/formatDate";
import Modal from "../../../components/common/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { useCartStore } from "../../../store/cartStore";
import Pagination from "../../../components/common/Pagination";

import { useServiceStore } from "../../../store/serviceStore";
import { useCategoryStore } from "../../../store/categoryStore";
import ServiceFormAdmin from "../../../components/form/ServiceFormAdmin";

// ==========================================
// MAIN MANAGEMENT COMPONENT
// ==========================================
const ServiceManagement = () => {
  // --- TẬN DỤNG TRẠNG THÁI VÀ ACTIONS TỪ SERVICE STORE ---
  const services = useServiceStore((state) => state.services) || [];
  const meta = useServiceStore((state) => state.meta);
  const serviceLoading = useServiceStore((state) => state.loading);
  const errorStore = useServiceStore((state) => state.error);

  // Đổi sang dùng action searchServices từ store để tìm kiếm API chuyên biệt
  const searchServices = useServiceStore((state) => state.searchServices);

  const createService = useServiceStore((state) => state.createService);
  const updateService = useServiceStore((state) => state.updateService);
  const deleteService = useServiceStore((state) => state.deleteService);

  const setStoreState = useServiceStore.setState;

  // --- TẬN DỤNG DANH MỤC TỪ CATEGORY STORE ---
  const categories = useCategoryStore((state) => state.categories) || [];
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const categoryLoading = useCategoryStore((state) => state.loading);

  // ─── LOCAL UI STATE FOR SERVER-SIDE SEPARATE FILTERS ────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0); // Thay thế "ALL" bằng id số 0
  const [currentPage, setCurrentPage] = useState(1);

  // Trạng thái trì hoãn Debounce cho ô input tìm kiếm tránh re-fetch liên tục
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Điều khiển Main Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("VIEW"); // 'VIEW', 'EDIT', 'CREATE'
  const [selectedService, setSelectedService] = useState(null);

  // Điều khiển Modal xác nhận
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // 'CANCEL_FORM', 'CONFIRM_UPDATE', 'CONFIRM_SAVE_FORM', 'CONFIRM_DELETE'
    title: "",
    message: "",
    pendingData: null,
  });

  const showToast = useCartStore((state) => state.showToast);

  // Fetch danh sách Categories từ API đầu kỳ để làm bộ lọc ngoài
  useEffect(() => {
    fetchCategories({ type: "SERVICE" });
  }, [fetchCategories]);

  // ─── MECHANISM: DEBOUNCE SEARCH INPUT ──────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ─── EFFECT: GỌI API SEARCHSERVICES QUA SPECIFICATION FILTER ──────────────────
  const handleLoadData = React.useCallback(() => {
    const filterConditions = [];

    // 1. Tìm kiếm tương đối theo Tên gói dịch vụ (Nếu có nhập text)
    if (debouncedSearchTerm) {
      filterConditions.push(`name~*${debouncedSearchTerm}*`);
    }

    // 2. Tìm kiếm chính xác theo Id Danh mục (Nếu chọn danh mục cụ thể)
    if (selectedCategory !== 0) {
      filterConditions.push(`category.id:${selectedCategory}`);
    }

    // Gộp mảng các điều kiện bằng dấu phẩy theo chuẩn Specification API của hệ thống
    const filterParam =
      filterConditions.length > 0 ? filterConditions.join(",") : "";

    // Kích hoạt gọi API tìm kiếm thông qua searchServices của Store
    // Khớp signature: searchServices(filterParam, params, options)
    searchServices(filterParam, { page: currentPage });
  }, [currentPage, debouncedSearchTerm, selectedCategory, searchServices]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  // Đảm bảo Reset trang hiện tại về 1 nếu thay đổi tiêu chí bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  // Đồng bộ Mapping Options sạch cho Dropdown Category
  const categoriesOptions = [
    { value: 0, label: "Tất cả danh mục" },
    ...categories
      .filter(
        (cat) =>
          cat.categoryType === "SERVICE" ||
          cat.type === "SERVICE" ||
          !cat.categoryType,
      )
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
  ];

  // ─── MODAL HANDLERS ────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setModalType("CREATE");
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setModalType("EDIT");
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (service) => {
    setModalType("VIEW");
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formOutputData) => {
    if (modalType === "EDIT") {
      setConfirmModal({
        isOpen: true,
        type: "CONFIRM_UPDATE",
        title: "Cập nhật dịch vụ",
        message: `Hành động này sẽ thay đổi thông tin của gói dịch vụ: ${formOutputData.name}. Bạn chắc chắn chứ?`,
        pendingData: formOutputData,
      });
    } else {
      setConfirmModal({
        isOpen: true,
        type: "CONFIRM_SAVE_FORM",
        title: "Tạo dịch vụ mới",
        message: "Bạn có chắc chắn muốn thêm gói dịch vụ mới này vào hệ thống?",
        pendingData: formOutputData,
      });
    }
  };

  const executeSaveService = async () => {
    const formOutputData = confirmModal.pendingData;
    try {
      if (modalType === "CREATE") {
        const res = await createService(formOutputData);
        if (res?.success !== false) {
          showToast("Thêm gói dịch vụ mới thành công! 🎉", "success");
          setSearchTerm("");
          setSelectedCategory(0);
          setCurrentPage(1);
          setIsModalOpen(false);
          handleLoadData();
        } else {
          showToast(res?.message || "Gặp sự cố khi thêm dịch vụ.", "error");
        }
      } else {
        const res = await updateService(selectedService.id, formOutputData);
        if (res?.success !== false) {
          setStoreState((state) => ({
            services: state.services.map((s) =>
              s.id === selectedService.id ? { ...s, ...formOutputData } : s,
            ),
          }));
          showToast(
            `Đã lưu thay đổi cho gói dịch vụ #${selectedService.id} thành công! 💾`,
            "success",
          );
          setIsModalOpen(false);
          handleLoadData();
        } else {
          showToast(res?.message || "Gặp sự cố khi cập nhật dịch vụ.", "error");
        }
      }
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      showToast("Gặp sự cố khi kết nối hệ thống để xử lý dữ liệu.", "error");
    }
  };

  const handleCancelForm = () => {
    if (modalType === "VIEW") {
      setIsModalOpen(false);
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thay đổi bạn vừa nhập trên Form sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleConfirmDelete = (serviceId, serviceName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_DELETE",
      title: "Xóa dịch vụ vĩnh viễn",
      message: `Hành động này sẽ thực hiện xóa bỏ gói [${serviceName}] ra khỏi hệ thống hiển thị.`,
      pendingData: { id: serviceId },
    });
  };

  const executeDeleteService = async () => {
    const { id } = confirmModal.pendingData;
    try {
      const res = await deleteService(id);
      if (res?.success !== false) {
        showToast(
          "Đã gỡ bỏ gói dịch vụ thành công khỏi hệ thống! 🗑️",
          "success",
        );
        handleLoadData();
      } else {
        showToast(
          res?.message || "Xảy ra lỗi khi thực thi xóa dịch vụ.",
          "error",
        );
      }
      closeConfirmModal();
    } catch (err) {
      showToast("Xảy ra lỗi khi thực thi xóa.", "error");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;
      case "CONFIRM_SAVE_FORM":
      case "CONFIRM_UPDATE":
        executeSaveService();
        break;
      case "CONFIRM_DELETE":
        executeDeleteService();
        break;
      default:
        closeConfirmModal();
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      pendingData: null,
    });
  };

  if (errorStore) {
    return (
      <div className="text-center p-6 text-red-500 flex items-center justify-center gap-2 h-[60vh]">
        <AlertCircle size={18} /> {errorStore}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý cửa hàng</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Dịch vụ Spa</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            QUẢN LÝ DỊCH VỤ
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} /> Thêm dịch vụ mới
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
            placeholder="Tìm kiếm theo tên gói dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          disabled={categoryLoading}
          className="w-full sm:w-56 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 disabled:opacity-60"
        >
          {categoriesOptions.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {serviceLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loading size="large" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-20">ID</th>
                <th className="p-4">Thông tin dịch vụ</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Giá cơ bản</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy gói dịch vụ nào trùng khớp.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-4 font-mono font-bold text-gray-400">
                      #{service.id}
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-gray-800 text-sm group-hover:text-orange-500 transition-colors">
                        {service.name}
                      </div>
                      <div
                        className="text-xs text-gray-400 truncate mt-0.5"
                        title={service.description}
                      >
                        {service.description || "Chưa cập nhật mô tả ngắn."}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Ngày tạo: {formatDate(service.createdDate)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Layers size={12} />{" "}
                        {service.categoryName || "Mặc định"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        <Clock size={14} className="text-gray-400" />{" "}
                        {service.durationMin} phút
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-gray-900 text-sm flex items-center">
                        <DollarSign
                          size={14}
                          className="text-gray-400 shrink-0"
                        />
                        {formatPrice(service.basePrice)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenViewModal(service)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl border border-transparent transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmDelete(service.id, service.name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                          title="Xóa dịch vụ"
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

        {/* ─── PAGINATION ──────────────────────── */}
        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* MODAL LUỒNG FORM DỊCH VỤ */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "CREATE"
            ? "Thêm gói dịch vụ mới"
            : modalType === "EDIT"
              ? "Cập nhật thông tin dịch vụ"
              : "Chi tiết thông tin gói Spa"
        }
        size="lg"
      >
        {modalType === "VIEW" ? (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block font-semibold text-gray-500 text-xs uppercase">
                  Tên dịch vụ
                </span>
                <span className="text-base font-bold text-gray-900">
                  {selectedService?.name}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-gray-500 text-xs uppercase">
                  Danh mục
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                  {selectedService?.categoryName || "Mặc định"}
                </span>
              </div>
            </div>
            <div>
              <span className="block font-semibold text-gray-500 text-xs uppercase">
                Mô tả dịch vụ
              </span>
              <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 whitespace-pre-line text-gray-600">
                {selectedService?.description || "Không có mô tả."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="block font-semibold text-gray-500 text-xs uppercase">
                  Giá gốc niêm yết
                </span>
                <span className="text-lg font-black text-gray-900">
                  {formatPrice(selectedService?.basePrice)}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-gray-500 text-xs uppercase">
                  Thời lượng dự kiến
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {selectedService?.durationMin} phút
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <ServiceFormAdmin
            initialData={selectedService}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
          />
        )}
      </Modal>

      {/* CONFIRM_MODAL ĐỂ KIỂM SOÁT THAO TÁC NGUY HIỂM */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === "CONFIRM_DELETE" ? "danger" : "warning"}
      />
    </div>
  );
};

export default ServiceManagement;
