import React, { useEffect, useState } from "react";
import { useWarehouseStore } from "../../../store/warehouseStore"; // Đường dẫn đến store của bạn
import { useCartStore } from "../../../store/cartStore"; // Đồng bộ lấy showToast hệ thống
import { 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  User, 
  FileText, 
  Plus,
  History,
  ClipboardList
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";

const InventoryTransManagement = () => {
  // ── Sourced From Zustand Store ──
  const {
    transactions,
    metaTransactions,
    loading,
    transactionKeyword,
    transactionType,
    setTransactionKeyword,
    setTransactionType,
    fetchTransactions,
    resetFilters,
  } = useWarehouseStore();

  const showToast = useCartStore((state) => state.showToast);

  // ── LOCAL UI STATES ──
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false); // Dùng cho form thêm mới nếu cần

  // Lắng nghe filter thay đổi để fetch dữ liệu từ API Server
  useEffect(() => {
    fetchTransactions({
      page: currentPage,
      pageSize: 10,
    });
  }, [currentPage, transactionKeyword, transactionType, fetchTransactions]);

  // Xử lý thay đổi Keyword tìm kiếm
  const handleKeywordChange = (e) => {
    setTransactionKeyword(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  };

  // Xử lý thay đổi Loại giao dịch (IMPORT / EXPORT / ALL)
  const handleTypeChange = (typeValue) => {
    setTransactionType(typeValue);
    setCurrentPage(1);
  };

  // Làm sạch bộ lọc giao dịch
  const handleClearFilters = () => {
    resetFilters();
    setCurrentPage(1);
    showToast("Đã làm mới bộ lọc lịch sử kho", "success");
  };

  // Định dạng ngày tháng hiển thị đẹp (YYYY-MM-DD HH:mm)
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Trích xuất thông tin phân trang từ meta Server trả về
  const totalItems = metaTransactions?.total || 0;
  // Để test Pagination khi dùng mock (pages = 1), bạn có thể tạm thời để: metaTransactions?.pages || 3
  const totalPages = metaTransactions?.pages || 1; 
  const pageSize = metaTransactions?.pageSize || 10;

  const getGlobalIndex = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* ── BREADCRUMB & TIÊU ĐỀ TRANG CHUẨN HỆ THỐNG ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Kho</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Lịch sử biến động</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            BIẾN ĐỘNG KHO HÀNG
          </h1>
        </div>

        {/* Nút Tạo phiếu nhập xuất kho (Nếu cần làm Form) */}
        <button
          type="button"
          onClick={() => {
            showToast("Tính năng lập phiếu đang được mở rộng!", "info");
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl hover:bg-orange-600 transition-all shadow-sm shadow-orange-100 active:scale-95"
        >
          <Plus size={16} /> LẬP PHIẾU KHO
        </button>
      </div>

      {/* ── THANH ĐIỀU HƯỚNG BỘ LỌC (TÌM KIẾM + PHÂN LOẠI TAB) ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Ô Tìm kiếm nhanh */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc ghi chú..."
            value={transactionKeyword}
            onChange={handleKeywordChange}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700"
          />
        </div>

        {/* Bộ lọc Tabs loại giao dịch (Tất cả / Nhập / Xuất) */}
        <div className="flex items-center gap-1.5 w-full md:w-auto bg-gray-100 p-1 rounded-xl self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => handleTypeChange("")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${
              transactionType === ""
                ? "bg-white text-slate-800 shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            Tất cả biến động
          </button>
          
          <button
            type="button"
            onClick={() => handleTypeChange("IMPORT")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              transactionType === "IMPORT"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <ArrowDownLeft size={14} /> Nhập kho
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("EXPORT")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              transactionType === "EXPORT"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ArrowUpRight size={14} /> Xuất kho
          </button>
        </div>
      </div>

      {/* ── BẢNG HIỂN THỊ DANH SÁCH LỊCH SỬ BIẾN ĐỘNG ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[450px]">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4 w-28 text-center">Loại</th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="p-4 text-center w-28">Số lượng</th>
                <th className="p-4 text-center w-32">Tồn sau cùng</th>
                <th className="p-4 w-72">Nội dung / Ghi chú</th>
                <th className="p-4 w-48">Thời gian / Nhân sự</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History size={32} className="text-gray-300" />
                      <span className="text-xs font-bold text-gray-400">
                        Chưa có lịch sử giao dịch kho nào được ghi nhận.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((trans, index) => {
                  const isImport = trans.type === "IMPORT";

                  return (
                    <tr key={index} className="hover:bg-gray-50/40 transition-colors group">
                      
                      {/* STT */}
                      <td className="p-4 text-center font-mono text-xs text-gray-400">
                        {getGlobalIndex(index)}
                      </td>

                      {/* LOẠI PHIẾU (BADGE) */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          isImport 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {isImport ? (
                            <>
                              <ArrowDownLeft size={12} /> NHẬP KHO
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={12} /> XUẤT KHO
                            </>
                          )}
                        </span>
                      </td>

                      {/* THÔNG TIN SẢN PHẨM */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-800">
                          {trans.productName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          Mã vật tư: <span className="font-bold text-gray-500">#{trans.productId}</span>
                        </div>
                      </td>

                      {/* SỐ LƯỢNG BIẾN ĐỘNG */}
                      <td className="p-4 text-center">
                        <span className={`font-mono font-black text-sm ${
                          isImport ? "text-emerald-600" : "text-blue-600"
                        }`}>
                          {isImport ? `+${trans.quantity}` : `-${trans.quantity}`}
                        </span>
                      </td>

                      {/* TỒN SAU CÙNG (CURRENT STOCK) */}
                      <td className="p-4 text-center font-mono text-xs font-black text-slate-600 bg-gray-50/30">
                        {trans.currentStock}
                      </td>

                      {/* GHI CHÚ / NỘI DUNG */}
                      <td className="p-4">
                        <div className="flex items-start gap-1.5 text-xs text-gray-600 font-medium line-clamp-2 max-w-xs">
                          <FileText size={14} className="text-gray-300 shrink-0 mt-0.5" />
                          <span>{trans.note || <span className="text-gray-300 italic">Không có ghi chú</span>}</span>
                        </div>
                      </td>

                      {/* THỜI GIAN & NGƯỜI THỰC HIỆN */}
                      <td className="p-4 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 font-bold font-mono">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{formatDate(trans.createdDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 font-medium truncate max-w-[160px]" title={trans.createdBy}>
                          <User size={12} className="text-gray-300" />
                          <span>{trans.createdBy?.split("@")[0] || "Hệ thống"}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PHÂN TRANG & THÔNG SỐ TOÀN CỤC TỪ API MOCK / REAL ── */}
        <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-400">
            Tổng số bản ghi: <span className="text-slate-700">{totalItems}</span> giao dịch biến động
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

export default InventoryTransManagement;