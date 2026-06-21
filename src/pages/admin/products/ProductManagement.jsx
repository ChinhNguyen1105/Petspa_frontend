import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Layers,
  ChevronRight,
  Hash,
  Boxes,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import { formatPrice } from "../../../utils/formatPrice";
import ProductFormAdmin from "../../../components/form/ProductFormAdmin";
import Modal from "../../../components/common/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import Pagination from "../../../components/common/Pagination";

import { useCartStore } from "../../../store/cartStore";
import { useProductStore } from "../../../store/productStore";
import { useCategoryStore } from "../../../store/categoryStore";

const ProductManagement = () => {
  // ── Store: Products & Pagination ──
  const products = useProductStore((state) => state.products) || [];
  const meta = useProductStore((state) => state.meta);
  const loadingProducts = useProductStore((state) => state.loading);
  const errorProducts = useProductStore((state) => state.error);

  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const createProduct = useProductStore((state) => state.createProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);

  // ── Store: Categories ──
  const storeCategories = useCategoryStore((state) => state.categories) || [];
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const loadingCategories = useCategoryStore((state) => state.loading);

  // ── Store: Global Toast ──
  const showToast = useCartStore((state) => state.showToast);

  // ── LOCAL UI STATE FOR SEPARATE FILTERS ──
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [stockStatus, setStockStatus] = useState("ALL"); // ALL, OUT_OF_STOCK, IN_STOCK
  const [currentPage, setCurrentPage] = useState(1);

  // State trì hoãn (Debounce) tối ưu tần suất gọi API
  const [debouncedFilters, setDebouncedFilters] = useState({
    id: "",
    name: "",
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // Tải danh mục sản phẩm phục vụ bộ lọc ngoài
  useEffect(() => {
    fetchCategories({ type: "PRODUCT" });
  }, [fetchCategories]);

  // ── MECHANISM: DEBOUNCE TEXT INPUTS ─────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        id: searchId.trim(),
        name: searchName.trim(),
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchId, searchName]);

  // ── EFFECT: FETCH PRODUCT VỚI SPECIFICATION FILTER (AND LOGIC) ──────────
  useEffect(() => {
    // Mảng chứa các điều kiện lọc phối hợp dạng AND (phân tách bởi dấu phẩy)
    const filterConditions = [];

    // 1. Lọc theo ID chính xác (Nếu là số)
    if (debouncedFilters.id) {
      if (!isNaN(debouncedFilters.id)) {
        filterConditions.push(`id:${debouncedFilters.id}`);
      }
    }

    // 2. Lọc theo Tên sản phẩm chứa từ khóa (LIKE)
    if (debouncedFilters.name) {
      filterConditions.push(`name~*${debouncedFilters.name}*`);
    }

    // 3. Lọc theo Phân loại danh mục (Sử dụng trường liên kết theo đặc tả database)
    if (selectedCategory !== 0) {
      filterConditions.push(`category.id:${selectedCategory}`);
      // Hoặc sử dụng `categoryId:${selectedCategory}` tùy thuộc hoàn toàn vào cấu trúc Entity Backend của bạn
    }

    // 4. Lọc theo trạng thái kho hàng (Toán tử so sánh số số học: >, <, :)
    if (stockStatus === "OUT_OF_STOCK") {
      filterConditions.push(`stockQuantity:0`); // Hết hàng: Số lượng bằng 0
    } else if (stockStatus === "IN_STOCK") {
      filterConditions.push(`stockQuantity>0`); // Còn hàng: Số lượng >= 1 (Theo tài liệu toán tử `>` tức là >=)
    }

    // Gộp tất cả các mảng điều kiện bằng dấu phẩy
    const filterParam =
      filterConditions.length > 0 ? filterConditions.join(",") : undefined;

    // Tiến hành gọi API thông qua Zustand store bằng biến filter chuẩn
    fetchProducts({
      page: currentPage,
      filter: filterParam,
    });
  }, [
    currentPage,
    debouncedFilters,
    selectedCategory,
    stockStatus,
    fetchProducts,
  ]);

  // Reset về trang 1 khi bất kỳ tiêu chí lọc nào thay đổi để tránh lỗi lệch trang dữ liệu
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, selectedCategory, stockStatus]);

  // Danh sách Mapping Options cho Dropdown Category
  const categoriesOptions = [
    { value: 0, label: "Tất cả danh mục" },
    ...storeCategories
      .filter((c) => c.categoryType === "PRODUCT" || c.type === "PRODUCT")
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];

  // Trạng thái Kho hàng Options
  const stockOptions = [
    { value: "ALL", label: "Tất cả trạng thái kho" },
    { value: "IN_STOCK", label: "Còn hàng (Số lượng > 0)" },
    { value: "OUT_OF_STOCK", label: "Hết hàng (Số lượng = 0)" },
  ];

  // ── MODAL HANDLERS ────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const isCreateMode = !selectedProduct;
    try {
      let res;
      if (isCreateMode) {
        res = await createProduct(payload);
      } else {
        res = await updateProduct(payload.id, payload);
      }

      if (res || res?.success) {
        setIsModalOpen(false);
        if (isCreateMode) {
          showToast("Thêm mới sản phẩm thành công! 🎉", "success");
          setSearchId("");
          setSearchName("");
          setSelectedCategory(0);
          setStockStatus("ALL");
          setCurrentPage(1);
        } else {
          showToast(`Cập nhật thông tin sản phẩm thành công! 💾`, "success");
          // Trigger reload lại trang hiện tại bằng cách giữ nguyên dependencies
          setCurrentPage(currentPage);
        }
      } else {
        showToast(
          "Xử lý dữ liệu thất bại. Vui lòng kiểm tra lại thông tin.",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Đã xảy ra lỗi hệ thống trong lúc truyền tải dữ liệu.",
        "error",
      );
    }
  };

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thay đổi bạn vừa nhập sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleConfirmDelete = (productId, productName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_DELETE",
      title: "Xóa sản phẩm vĩnh viễn",
      message: `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`,
      pendingData: { id: productId, name: productName },
    });
  };

  const executeDeleteProduct = async () => {
    const { id, name } = confirmModal.pendingData;
    try {
      const result = await deleteProduct(id);
      if (result?.success) {
        showToast(`Đã xóa sản phẩm "${name}" thành công! 🗑️`, "success");
      } else {
        showToast("Không thể xóa sản phẩm vào lúc này.", "error");
      }
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      showToast("Đã xảy ra lỗi khi tiến hành xóa.", "error");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;
      case "CONFIRM_DELETE":
        executeDeleteProduct();
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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            DANH SÁCH SẢN PHẨM
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* Grid Filter Bar: Chia thành 4 cột nhập liệu riêng biệt chuyên nghiệp */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Bộ lọc 1: Mã định danh sản phẩm (ID) */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Hash size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo ID sản phẩm..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* Bộ lọc 2: Tên sản phẩm */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* Bộ lọc 3: Phân loại danh mục */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
            <Layers size={16} />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            disabled={loadingCategories}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 disabled:opacity-50 appearance-none"
          >
            {categoriesOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ lọc 4: Trạng thái kho hàng */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
            <Boxes size={16} />
          </span>
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 appearance-none"
          >
            {stockOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
                    Không tìm thấy sản phẩm nào trùng khớp.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-4 text-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-200 shadow-sm">
                        {product.thumbnailUrl ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/150x150?text=No+Image";
                            }}
                          />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-base group-hover:text-orange-500 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs font-mono text-gray-400 mt-0.5">
                        Mã định danh:{" "}
                        <span className="font-bold text-blue-600">
                          ID - #{product.id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Layers size={12} />
                        {product.categoryName || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="p-4 font-black text-gray-900 text-base">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-bold ${product.stockQuantity === 0 ? "text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 text-xs" : "text-gray-800"}`}
                      >
                        {product.stockQuantity === 0
                          ? "Hết hàng"
                          : `${product.stockQuantity} cái`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmDelete(product.id, product.name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                          title="Xóa sản phẩm"
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

      {/* Modal Popup chứa Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          selectedProduct ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm mới"
        }
        size="lg"
      >
        <ProductFormAdmin
          initialData={selectedProduct}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
        />
      </Modal>

      {/* Modal Xác nhận */}
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

export default ProductManagement;
