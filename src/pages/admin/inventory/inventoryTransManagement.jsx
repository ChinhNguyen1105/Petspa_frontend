import React, { useEffect, useState } from "react";
import { useWarehouseStore } from "../../../store/warehouseStore";
import { useCartStore } from "../../../store/cartStore";
import {
  Search,
  RefreshCw,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  User,
  FileText,
  History,
  X,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import Pagination from "../../../components/common/Pagination";

const InventoryTransManagement = () => {
  // ─── TẬN DỤNG TRẠNG THÁI VÀ ACTIONS TỪ ZUSTAND STORE ───────────────────────
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

  // ─── LOCAL UI STATES ────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch dữ liệu theo phân trang
  useEffect(() => {
    fetchTransactions({
      page: currentPage,
      pageSize: 10,
    });
  }, [currentPage, fetchTransactions]);

  // Reset về trang 1 khi từ khóa tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [transactionKeyword]);

  // ─── XỬ LÝ LỌC TRỰC TIẾP TẠI FRONTEND ───
  const filteredTransactions = transactions.filter((trans) => {
    const matchesType =
      transactionType === "" || trans.type === transactionType;
    const matchesKeyword =
      !transactionKeyword ||
      trans.productName
        ?.toLowerCase()
        .includes(transactionKeyword.toLowerCase()) ||
      trans.note?.toLowerCase().includes(transactionKeyword.toLowerCase()) ||
      trans.productId?.toString().includes(transactionKeyword);

    return matchesType && matchesKeyword;
  });

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleKeywordChange = (e) => {
    setTransactionKeyword(e.target.value);
  };

  const handleTypeChange = (typeValue) => {
    setTransactionType(typeValue);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    resetFilters();
    showToast("Đã làm mới bộ lọc lịch sử kho", "success");
  };

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
      {/* BREADCRUMB & TIÊU ĐỀ TRANG */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Kho</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Lịch sử biến động</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            BIẾN ĐỘNG KHO HÀNG
          </h1>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG BỘ LỌC */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 flex items-center">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã vật tư, tên sản phẩm hoặc ghi chú..."
            value={transactionKeyword}
            onChange={handleKeywordChange}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700 transition-all"
          />
          {transactionKeyword && (
            <button
              onClick={() => setTransactionKeyword("")}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

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
            Tất cả ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("IMPORT")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              transactionType === "IMPORT"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-emerald-600 hover:bg-emerald-50/50"
            }`}
          >
            <ArrowDownLeft size={14} /> Nhập kho (
            {transactions.filter((t) => t.type === "IMPORT").length})
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("EXPORT")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              transactionType === "EXPORT"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-blue-600 hover:bg-blue-50/50"
            }`}
          >
            <ArrowUpRight size={14} /> Xuất kho (
            {transactions.filter((t) => t.type === "EXPORT").length})
          </button>

          {(transactionType !== "" || transactionKeyword) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200 transition-all"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* BẢNG HIỂN THỊ DANH SÁCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[450px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4 w-32 text-center">Loại biến động</th>
                <th className="p-4">Thông tin sản phẩm vật tư</th>
                <th className="p-4 text-center w-28">Số lượng</th>
                <th className="p-4 text-center w-32">Tồn cuối</th>
                <th className="p-4 w-72">Nội dung / Ghi chú</th>
                <th className="p-4 w-48">Thời gian / Nhân sự</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History
                        size={36}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <span className="text-sm font-medium">
                        Không tìm thấy biến động kho nào khớp với bộ lọc.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trans, index) => {
                  const isImport = trans.type === "IMPORT";
                  return (
                    <tr
                      key={trans.id || index}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-4 text-center font-mono text-xs text-gray-400">
                        {getGlobalIndex(index)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                            isImport
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
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
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">
                          {trans.productName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          Mã vật tư:{" "}
                          <span className="font-bold text-gray-500">
                            #{trans.productId}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-mono font-black text-sm ${isImport ? "text-emerald-600" : "text-blue-600"}`}
                        >
                          {isImport
                            ? `+${trans.quantity}`
                            : `-${trans.quantity}`}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-xs font-black text-slate-600 bg-gray-50/30">
                        {trans.currentStock}
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-1.5 text-xs text-gray-600 font-medium line-clamp-2 max-w-xs">
                          <FileText
                            size={14}
                            className="text-gray-300 shrink-0 mt-0.5"
                          />
                          <span>
                            {trans.note || (
                              <span className="text-gray-300 italic">
                                Không có ghi chú
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 font-bold font-mono">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{formatDate(trans.createdDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 font-medium truncate max-w-[160px]">
                          <User size={12} className="text-gray-300" />
                          <span>
                            {trans.createdBy?.split("@")[0] || "Hệ thống"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {metaTransactions && metaTransactions.pages > 1 && (
          <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400">
              Hiển thị:{" "}
              <span className="text-slate-700">
                {filteredTransactions.length}
              </span>{" "}
              / {transactions.length} bản ghi của trang này
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={metaTransactions.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTransManagement;
