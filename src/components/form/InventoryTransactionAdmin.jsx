import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  FileText,
  Package,
  Search,
} from "lucide-react";
import { useProductStore } from "../../store/productStore";

const InventoryTransactionAdmin = ({ onClose, onSubmit, mode = "CREATE" }) => {
  // ── INTEGRATE ZUSTAND STORE ──
  const storeProducts = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  // ── LOCAL STATES FOR FORM ──
  const [type, setType] = useState("IMPORT"); // IMPORT / EXPORT / ADJUST
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  // State phục vụ tìm kiếm nhanh sản phẩm
  const [searchQuery, setSearchQuery] = useState("");

  // States hỗ trợ hiển thị UX xem trước số lượng tồn kho
  const [currentProduct, setCurrentProduct] = useState(null);
  const [previewStock, setPreviewStock] = useState(0);

  // Tự động gọi API lấy danh sách sản phẩm nếu store hiện tại đang rỗng
  useEffect(() => {
    if (storeProducts.length === 0) {
      fetchProducts({ pageSize: 100 });
    }
  }, [storeProducts, fetchProducts]);

  // ── LOGIC LỌC SẢN PHẨM THEO TÊN (name) HOẶC ID ──
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return storeProducts;

    const query = searchQuery.toLowerCase().trim();
    return storeProducts.filter((prod) => {
      const matchId = prod.id?.toString() === query;
      // Đồng bộ: Đổi từ prod.productName sang prod.name
      const matchName = prod.name?.toLowerCase().includes(query);
      return matchId || matchName;
    });
  }, [searchQuery, storeProducts]);

  // Lắng nghe thay đổi sản phẩm hoặc loại giao dịch để tính toán số tồn kho dự kiến
  useEffect(() => {
    const prod = storeProducts.find((p) => p.id === Number(selectedProductId));
    setCurrentProduct(prod);

    if (prod) {
      // Đồng bộ: Đổi từ prod.currentStock sang prod.stockQuantity
      const currentStock = prod.stockQuantity || 0;
      const qty = Number(quantity) || 0;

      if (type === "IMPORT") {
        setPreviewStock(currentStock + qty);
      } else if (type === "EXPORT") {
        setPreviewStock(currentStock - qty);
      } else if (type === "ADJUST") {
        setPreviewStock(qty);
      }
    } else {
      setPreviewStock(0);
    }
  }, [selectedProductId, quantity, type, storeProducts]);

  const isViewMode = mode === "VIEW";

  // ── XỬ LÝ SUBMIT VÀ ĐẨY LOGIC LÊN CHA ──
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Vui lòng chọn một sản phẩm!");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      alert("Số lượng thực hiện phải lớn hơn 0!");
      return;
    }
    // Đồng bộ: Kiểm tra tồn kho dựa trên trường stockQuantity
    if (
      type === "EXPORT" &&
      currentProduct &&
      Number(quantity) > currentProduct.stockQuantity
    ) {
      alert(
        `Số lượng xuất vượt quá số lượng tồn kho hiện tại (${currentProduct.stockQuantity})!`,
      );
      return;
    }

    // ── VALIDATE BẮT BUỘC NHẬP NOTE ──
    if (!note.trim()) {
      alert("Vui lòng nhập ghi chú lý do biến động kho!");
      return;
    }

    const formOutputData = {
      type,
      productId: Number(selectedProductId),
      quantity: Number(quantity),
      note: note.trim(),
    };

    onSubmit(formOutputData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. CHỌN LOẠI GIAO DỊCH (TABS) */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
          Loại giao dịch
        </label>
        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            disabled={isViewMode}
            onClick={() => setType("IMPORT")}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "IMPORT"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <ArrowDownLeft size={14} /> NHẬP KHO
          </button>
          <button
            type="button"
            disabled={isViewMode}
            onClick={() => setType("EXPORT")}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "EXPORT"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <ArrowUpRight size={14} /> XUẤT KHO
          </button>
          <button
            type="button"
            disabled={isViewMode}
            onClick={() => setType("ADJUST")}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "ADJUST"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <Sliders size={14} /> ĐIỀU CHỈNH
          </button>
        </div>
      </div>

      {/* 2. Ô TÌM KIẾM VÀ CHỌN SẢN PHẨM */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
          <Package size={12} /> Vật tư / Sản phẩm
        </label>

        {!isViewMode && (
          <div className="relative mb-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={12} />
            </span>
            <input
              type="text"
              placeholder="Gõ tên hoặc nhập đúng ID sản phẩm để lọc nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-gray-700 font-medium"
            />
          </div>
        )}

        <select
          value={selectedProductId}
          disabled={isViewMode || loading}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-medium"
        >
          {loading ? (
            <option value="">Đang tải danh sách sản phẩm...</option>
          ) : filteredProducts.length === 0 ? (
            <option value="">❌ Không tìm thấy sản phẩm phù hợp</option>
          ) : (
            <>
              <option value="">
                -- Chọn sản phẩm biến động ({filteredProducts.length}) --
              </option>
              {filteredProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {/* Đồng bộ: Dùng prod.name và prod.stockQuantity */}[
                  {prod.id}] {prod.name} (Tồn hiện tại:{" "}
                  {prod.stockQuantity || 0})
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* 3. NHẬP SỐ LƯỢNG BIẾN ĐỘNG */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
          {type === "ADJUST"
            ? "Số lượng tồn kho mới sau chốt"
            : "Số lượng thực hiện"}
        </label>
        <input
          type="number"
          min="1"
          disabled={isViewMode}
          placeholder={
            type === "ADJUST"
              ? "Nhập số lượng chốt tồn mới..."
              : "Nhập số lượng..."
          }
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-mono font-bold"
        />
      </div>

      {/* 4. BANNER PREVIEW SỐ TỒN DỰ KIẾN */}
      {currentProduct && (
        <div className="p-3 bg-slate-50 border border-dashed border-gray-200 rounded-xl grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tồn kho hiện tại
            </p>
            {/* Đồng bộ: Dùng currentProduct.stockQuantity */}
            <p className="text-sm font-black text-slate-600 font-mono mt-0.5">
              {currentProduct.stockQuantity || 0}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tồn sau xử lý (Dự kiến)
            </p>
            <p
              className={`text-sm font-black font-mono mt-0.5 ${
                previewStock < 0
                  ? "text-red-500"
                  : type === "IMPORT"
                    ? "text-emerald-600"
                    : type === "EXPORT"
                      ? "text-blue-600"
                      : "text-amber-500"
              }`}
            >
              {previewStock}
            </p>
          </div>
        </div>
      )}

      {/* 5. GHI CHÚ / NỘI DUNG LƯU VẾT */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
          <FileText size={12} /> Ghi chú lý do lý trấu{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          rows="3"
          disabled={isViewMode}
          placeholder="Nhập lý do nhập xuất hoặc mã chứng từ đi kèm (ví dụ: Xuất phục vụ dịch vụ spa)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-medium resize-none"
        />
      </div>

      {/* ACTIONS BUTTONS */}
      {!isViewMode && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-black rounded-xl transition-all"
          >
            HỦY BỎ
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-white text-xs font-black rounded-xl transition-all shadow-sm ${
              type === "IMPORT"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : type === "EXPORT"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-amber-500 hover:bg-amber-600"
            } active:scale-95`}
          >
            XÁC NHẬN GHI SỔ
          </button>
        </div>
      )}
    </form>
  );
};

export default InventoryTransactionAdmin;
