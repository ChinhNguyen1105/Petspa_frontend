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
  PackageCheck
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";

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
  } = useWarehouseStore();

  const showToast = useCartStore((state) => state.showToast);

  // ── LOCAL UI STATES ──
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const pageSize = 10; // Cố định số lượng phần tử trên một trang

  // Lắng nghe các filter và trang hiện tại thay đổi để gọi API Server
  useEffect(() => {
    fetchInventory({
      page: currentPage,
      pageSize: pageSize,
      productId: productId || null,
    });
  }, [currentPage, inventoryKeyword, minQuantity, maxQuantity, productId, fetchInventory]);

  // Bộ xử lý thay đổi từ ô Tìm kiếm Keyword
  const handleKeywordChange = (e) => {
    setInventoryKeyword(e.target.value);
    setCurrentPage(1); // Reset chủ động về trang 1 khi tìm kiếm
  };

  // Bộ xử lý thay đổi mã sản phẩm (Đồng bộ với trường productId trong store)
  const handleProductIdChange = (e) => {
    setProductId(e.target.value);
    setCurrentPage(1);
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
    await fetchInventory({ page: currentPage, pageSize: pageSize });
    showToast("Đã đồng bộ dữ liệu kho mới nhất", "success");
  };

  // Trích xuất các biến phân trang an toàn từ meta dữ liệu hệ thống
  const totalItems = metaInventory?.total || 0;
  // Tính toán tổng số trang dựa trên dữ liệu thật vì meta trả về chỉ đảm bảo thuộc tính total
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 border text-xs font-bold rounded-xl transition-all shadow-sm ${
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
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
            Làm mới
          </button>
        </div>
      </div>

      {/* ── BỘ LỌC NÂNG CAO ── */}
      {showAdvancedFilter && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
              Mã Sản Phẩm (ID)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 101"
              value={productId}
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
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc từ khóa..."
                value={inventoryKeyword}
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
                    <td colSpan="6" className="p-16 text-center text-gray-400 font-medium">
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
                      <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors group">
                        {/* STT */}
                        <td className="p-4 text-center font-mono text-xs text-gray-400">
                          {getGlobalIndex(index)}
                        </td>

                        {/* HÌNH ẢNH */}
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

                        {/* TÊN SẢN PHẨM */}
                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-800 transition-colors group-hover:text-orange-500">
                            {item.productName}
                          </div>
                        </td>

                        {/* MÃ PRODUCT ID */}
                        <td className="p-4 text-center font-mono text-xs text-gray-500 font-bold">
                          #{item.productId}
                        </td>

                        {/* GIÁ BÁN */}
                        <td className="p-4 text-right font-mono font-black text-xs text-slate-700">
                          {item.productPrice ? `${item.productPrice.toLocaleString()} đ` : "---"}
                        </td>

                        {/* KHỐI SỐ LƯỢNG TỒN KHO KÈM BADGE */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`text-sm font-black font-mono px-3 py-1 rounded-xl border ${
                              isOutOfStock
                                ? "bg-red-50 text-red-500 border-red-100"
                                : isLowStock
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}>
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
            Tổng sản phẩm trong kho: <span className="text-slate-700">{totalItems}</span> vật tư
            {totalItems > 0 && (
              ` (Đang hiển thị ${getGlobalIndex(0)} - ${Math.min(currentPage * pageSize, totalItems)})`
            )}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </div>
    </div>
  );
};

export default InventoryListManagement;