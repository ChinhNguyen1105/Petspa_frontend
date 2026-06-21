import React, { useEffect, useState } from "react";
import { useWarehouseStore } from "../../../store/warehouseStore";
import { useCartStore } from "../../../store/cartStore";
import {
  Search,
  RefreshCw,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  AlertTriangle,
  Package,
  FilterX,
  PackageCheck,
  Plus,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";
import Modal from "../../../components/common/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import InventoryTransactionAdmin from "../../../components/form/InventoryTransactionAdmin";

const InventoryListManagement = () => {
  // ── Sourced From Zustand Store ──
  const {
    inventory,
    metaInventory,
    loading,
    inventoryKeyword,
    minQuantity,
    maxQuantity,
    productId,
    setInventoryKeyword,
    setMinQuantity,
    setMaxQuantity,
    setProductId,
    fetchInventory,
    resetFilters,
    products,
    importProduct,
    exportProduct,
    adjustProduct,
  } = useWarehouseStore();

  const showToast = useCartStore((state) => state.showToast);

  // ── LOCAL UI STATES ──
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const pageSize = 10;

  // ── TẠO STATE TẠM THỜI ĐỂ DEBOUNCE (TRÁNH REFRESH NGAY KHI GÕ) ──
  const [localKeyword, setLocalKeyword] = useState(inventoryKeyword);
  const [localProductId, setLocalProductId] = useState(productId);

  // Đồng bộ lại local state khi bộ lọc bị xóa (Clear Filters) từ bên ngoài hoặc từ store
  useEffect(() => {
    setLocalKeyword(inventoryKeyword);
  }, [inventoryKeyword]);

  useEffect(() => {
    setLocalProductId(productId);
  }, [productId]);

  // Luồng đóng mở Form & Trạng thái Modal lập phiếu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("CREATE");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // ── EFFECT 1: XỬ LÝ DEBOUNCE CHO TÌM KIẾM NHANH (inventoryKeyword) ──
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localKeyword !== inventoryKeyword) {
        setInventoryKeyword(localKeyword);
        setCurrentPage(1); // Reset về trang 1 khi từ khóa thực sự thay đổi
      }
    }, 500); // Trì hoãn 500ms sau khi ngừng gõ

    return () => clearTimeout(handler);
  }, [localKeyword, setInventoryKeyword, inventoryKeyword]);

  // ── EFFECT 2: XỬ LÝ DEBOUNCE CHO TÌM KIẾM NÂNG CAO (productId / Tên sản phẩm nâng cao) ──
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localProductId !== productId) {
        setProductId(localProductId);
        setCurrentPage(1); // Reset về trang 1 khi từ khóa thực sự thay đổi
      }
    }, 500); // Trì hoãn 500ms sau khi ngừng gõ

    return () => clearTimeout(handler);
  }, [localProductId, setProductId, productId]);

  // ── EFFECT TÍNH TOÁN FILTER SPECIFICATION & GỌI API ──
  useEffect(() => {
    const filterConditions = [];

    // 1. Tìm kiếm theo tên sản phẩm vật tư (Từ ô nhập Keyword chính)
    if (inventoryKeyword && inventoryKeyword.trim() !== "") {
      filterConditions.push(`product.name~*${inventoryKeyword.trim()}*`);
    }

    // 2. Tìm kiếm theo tên sản phẩm (Thay thế cho logic tìm productId cũ)
    if (productId && productId.trim() !== "") {
      filterConditions.push(`product.name~*${productId.trim()}*`);
    }

    // 3. Số lượng tối thiểu sử dụng toán tử "Lớn hơn hoặc bằng (>)" cho kiểu số
    if (
      minQuantity !== null &&
      minQuantity !== undefined &&
      minQuantity !== ""
    ) {
      filterConditions.push(`quantity>${minQuantity}`);
    }

    // 4. Số lượng tối đa sử dụng toán tử "Nhỏ hơn hoặc bằng (<)" cho kiểu số
    if (
      maxQuantity !== null &&
      maxQuantity !== undefined &&
      maxQuantity !== ""
    ) {
      filterConditions.push(`quantity<${maxQuantity}`);
    }

    // Kết hợp các điều kiện bằng dấu phẩy "," đại diện cho toán tử AND (Mặc định)
    const filterQueryString = filterConditions.join(",");

    // Gọi API Server với tham số filter chuẩn hóa
    fetchInventory({
      page: currentPage - 1, // Đồng bộ với Spring Data JPA Pageable (bắt đầu từ 0)
      size: pageSize,
      filter: filterQueryString || null,
    });
  }, [
    currentPage,
    inventoryKeyword, // Chỉ kích hoạt lại khi debounce hoàn tất và cập nhật store
    minQuantity,
    maxQuantity,
    productId, // Chỉ kích hoạt lại khi debounce hoàn tất và cập nhật store
    fetchInventory,
  ]);

  // Bộ xử lý thay đổi từ ô Tìm kiếm Keyword (Cập nhật local state, không gọi API ngay)
  const handleKeywordChange = (e) => {
    setLocalKeyword(e.target.value);
  };

  // Bộ xử lý thay đổi mã sản phẩm (Cập nhật local state, không gọi API ngay)
  const handleProductIdChange = (e) => {
    setLocalProductId(e.target.value);
  };

  // Bộ xử lý thay đổi Min Quantity
  const handleMinQtyChange = (e) => {
    setMinQuantity(e.target.value);
    setCurrentPage(1);
  };

  // Bộ xử lý thay đổi Max Quantity
  const handleMaxQtyChange = (e) => {
    setMaxQuantity(e.target.value);
    setCurrentPage(1);
  };

  // Làm sạch toàn bộ bộ lọc
  const handleClearFilters = () => {
    resetFilters();
    setCurrentPage(1);
    showToast("Đã xóa toàn bộ bộ lọc tồn kho", "success");
  };

  // Làm mới dữ liệu thủ công
  const handleManualRefresh = async () => {
    setCurrentPage(1);
    // Bổ sung gọi lại fetch trực tiếp để lập tức cập nhật dữ liệu mới nhất
    const filterConditions = [];
    if (inventoryKeyword && inventoryKeyword.trim() !== "")
      filterConditions.push(`productName~*${inventoryKeyword.trim()}*`);
    if (productId && productId.trim() !== "")
      filterConditions.push(`productName~*${productId.trim()}*`);
    if (minQuantity) filterConditions.push(`quantity>${minQuantity}`);
    if (maxQuantity) filterConditions.push(`quantity<${maxQuantity}`);

    fetchInventory({
      page: 0,
      size: pageSize,
      filter: filterConditions.join(",") || null,
    });
    showToast("Đã đồng bộ dữ liệu kho mới nhất", "success");
  };

  // ─── HANDLERS LUỒNG LẬP PHIẾU KHO ──────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setModalType("CREATE");
    setIsModalOpen(true);
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
        "Những thay đổi bạn vừa nhập trên Form lập phiếu sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleFormSubmit = (formOutputData) => {
    let typeText = "NHẬP";
    if (formOutputData.type === "EXPORT") typeText = "XUẤT";
    if (formOutputData.type === "ADJUST") typeText = "ĐIỀU CHỈNH CHỐT TỒN";

    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_SAVE_FORM",
      title: "Xác nhận lập phiếu kho",
      message: `Bạn có chắc chắn muốn lập phiếu ${typeText} kho cho vật tư này không?`,
      pendingData: formOutputData,
    });
  };

  const executeSaveTransaction = async () => {
    const { type, productId, quantity, note } = confirmModal.pendingData;
    const requestBody = { productId, quantity, note };
    let res;

    try {
      if (type === "IMPORT" && importProduct) {
        res = await importProduct(requestBody);
      } else if (type === "EXPORT" && exportProduct) {
        res = await exportProduct(requestBody);
      } else if (type === "ADJUST" && adjustProduct) {
        res = await adjustProduct(requestBody);
      }

      if (res?.success) {
        showToast(
          "Lập phiếu kho và cập nhật số lượng tồn thành công!",
          "success",
        );
        setCurrentPage(1); // Ép render và re-fetch lại danh sách
        setIsModalOpen(false);
      } else {
        showToast(res?.message || "Gặp sự cố khi lập phiếu kho.", "error");
      }
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      showToast("Gặp sự cố khi xử lý giao dịch kho.", "error");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;
      case "CONFIRM_SAVE_FORM":
        executeSaveTransaction();
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

  // Trích xuất các biến phân trang an toàn từ meta dữ liệu hệ thống
  const totalItems = metaInventory?.totalElements || metaInventory?.total || 0;
  const totalPages =
    metaInventory?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  // Tính số thứ tự (STT) tăng tiến chuẩn dựa trên trang hiện tại
  const getGlobalIndex = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  // Trạng thái Loading ban đầu khi chưa có dữ liệu mảng
  if (loading && inventory.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ── BREADCRUMB & TIÊU ĐỀ TRANG ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Kho</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Danh sách tồn kho</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            TỒN KHO HỆ THỐNG
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all order-first sm:order-none"
          >
            <Plus size={16} /> LẬP PHIẾU KHO
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 border text-xs font-bold rounded-xl transition-all shadow-sm ${
              showAdvancedFilter
                ? "bg-orange-500 border-orange-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            {showAdvancedFilter ? "Đóng bộ lọc nâng cao" : "Bộ lọc nâng cao"}
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── BỘ LỌC NÂNG CAO ── */}
      {showAdvancedFilter && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
          {/* Sử dụng localProductId cho ô input */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
              Tên Sản Phẩm
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Sữa tắm, Pate..."
              value={localProductId}
              onChange={handleProductIdChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
              Số lượng tối thiểu (Min)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 10"
              value={minQuantity}
              onChange={handleMinQtyChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
              Số lượng tối đa (Max)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ví dụ: 500"
              value={maxQuantity}
              onChange={handleMaxQtyChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
            >
              <FilterX size={14} /> Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* ── KHUNG CHỨA BẢNG DANH SÁCH CHÍNH ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[450px]">
        <div>
          {/* Thanh tìm kiếm nhanh trên đầu bảng */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Search size={16} />
              </span>
              {/* Sử dụng localKeyword cho ô input này */}
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc từ khóa..."
                value={localKeyword}
                onChange={handleKeywordChange}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Vùng Render Bảng biểu responsive */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50/70 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                  <th className="p-4 w-16 text-center">STT</th>
                  <th className="p-4 w-20 text-center">Hình ảnh</th>
                  <th className="p-4">Sản phẩm vật tư</th>
                  <th className="p-4 text-center w-36">Mã Sản Phẩm</th>
                  <th className="p-4 text-right w-40">Đơn giá bán</th>
                  <th className="p-4 text-center w-40">Tồn kho hiện tại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <Loading size="small" />
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-16 text-center text-gray-400 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Layers size={32} className="text-gray-300" />
                        <span className="text-xs font-bold text-gray-400">
                          Không tìm thấy mặt hàng nào phù hợp trong kho dữ liệu.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inventory.map((item, index) => {
                    const isLowStock = item.quantity <= 10;
                    const isOutOfStock = item.quantity === 0;

                    return (
                      <tr
                        key={item.id || index}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-4 text-center font-mono text-xs text-gray-400">
                          {getGlobalIndex(index)}
                        </td>

                        <td className="p-4 text-center">
                          <div className="w-10 h-10 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center mx-auto shrink-0">
                            {item.thumbnailUrl ? (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <Package size={16} className="text-gray-300" />
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-800 transition-colors group-hover:text-orange-500">
                            {item.productName}
                          </div>
                        </td>

                        <td className="p-4 text-center font-mono text-xs text-gray-500 font-bold">
                          #{item.productId}
                        </td>

                        <td className="p-4 text-right font-mono font-black text-xs text-slate-700">
                          {item.productPrice
                            ? `${item.productPrice.toLocaleString()} đ`
                            : "---"}
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span
                              className={`text-sm font-black font-mono px-3 py-1 rounded-xl border ${
                                isOutOfStock
                                  ? "bg-red-50 text-red-500 border-red-100"
                                  : isLowStock
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                              }`}
                            >
                              {item.quantity}
                            </span>

                            {isOutOfStock && (
                              <span className="text-[9px] font-black text-red-500 tracking-wide uppercase flex items-center gap-0.5">
                                <AlertTriangle size={10} /> Hết hàng
                              </span>
                            )}
                            {!isOutOfStock && isLowStock && (
                              <span className="text-[9px] font-black text-amber-500 tracking-wide uppercase">
                                Sắp hết hàng
                              </span>
                            )}
                            {!isLowStock && (
                              <span className="text-[9px] font-extrabold text-gray-300 tracking-wide uppercase flex items-center gap-0.5">
                                <PackageCheck size={10} /> An toàn
                              </span>
                            )}
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

        {/* ── PHÂN TRANG VÀ THÔNG SỐ ── */}
        <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-400">
            Tổng sản phẩm trong kho:{" "}
            <span className="text-slate-700">{totalItems}</span> vật tư
            {totalItems > 0 &&
              ` (Đang hiển thị ${getGlobalIndex(0)} - ${Math.min(currentPage * pageSize, totalItems)})`}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* ─── MODAL LUỒNG FORM LẬP PHIẾU ĐÃ TÍCH HỢP ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "CREATE"
            ? "Lập phiếu biến động kho mới"
            : "Chi tiết phiếu kho"
        }
        size="lg"
      >
        <InventoryTransactionAdmin
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
          products={products || []}
          mode={modalType}
        />
      </Modal>

      {/* CONFIRM_MODAL ĐẢM BẢO TRẢI NGHIỆM AN TOÀN */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === "CANCEL_FORM" ? "warning" : "success"}
      />
    </div>
  );
};

export default InventoryListManagement;
