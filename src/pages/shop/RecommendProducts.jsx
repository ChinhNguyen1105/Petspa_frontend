import React, { useEffect, useState, useRef } from "react";
import { Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import ProductCard from "../../components/ui/ProductCard";

import { useProductStore } from "../../store/productStore";
import useRecommendationStore from "../../store/apioriStore";

const RecommendedProducts = ({ maxItems = 4, currentCartIds = [] }) => {
  // ================= STORE CONNECTIONS =================
  const {
    productRecommendations,
    fetchProductRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const { products, fetchProducts, loading: prodLoading } = useProductStore();

  const [recommendedList, setRecommendedList] = useState([]);

  // Ref lưu cache chuỗi IDs cũ để ngăn chặn việc trigger re-render gọi API vô hạn
  const lastFetchedIdsRef = useRef("");

  const productsReady = products?.length > 0;

  /* =====================================================
  | STEP 1: LOAD PRODUCTS NỀN TẢNG HỆ THỐNG
  ===================================================== */
  useEffect(() => {
    if (!products?.length) {
      fetchProducts({ page: 1, pageSize: 50 });
    }
  }, [products, fetchProducts]);

  /* =====================================================
  | STEP 2: PIPELINE APRIORI - CHỈ PHÂN TÍCH KHI CÓ GIỎ HÀNG
  ===================================================== */
  useEffect(() => {
    if (!currentCartIds || currentCartIds.length === 0) {
      setRecommendedList([]);
      lastFetchedIdsRef.current = "";
      return;
    }

    // Làm sạch và ép kiểu mảng ID về Number dứt khoát
    const cleanProductIds = Array.from(new Set(currentCartIds))
      .filter(Boolean)
      .map(Number);

    if (!cleanProductIds.length) return;

    // Chống lặp spam gọi trùng lặp API liên tục khi Re-render dữ liệu
    const currentIdsString = cleanProductIds.sort().join(",");
    if (lastFetchedIdsRef.current === currentIdsString) return;

    lastFetchedIdsRef.current = currentIdsString;

    // Gọi API phân tích luật kết hợp Apriori dựa trên các ID sản phẩm đang checkout
    fetchProductRecommendations(cleanProductIds).catch((err) =>
      console.error("[APRIORI PRODUCT PIPELINE ERROR]:", err),
    );
  }, [currentCartIds, fetchProductRecommendations]);

  /* =====================================================
  | STEP 3: MAPPING ĐỒNG BỘ ĐẦU RA (KHÔNG CÓ FALLBACK MỒI)
  ===================================================== */
  useEffect(() => {
    // 🔥 CHẶN: Giỏ hàng trống hoặc API không có gợi ý phù hợp thỏa mãn -> Ẩn hoàn toàn, không lấy mồi mặc định
    if (
      !currentCartIds.length ||
      !productRecommendations?.length ||
      !productsReady
    ) {
      setRecommendedList([]);
      return;
    }

    // Khớp ID an toàn tuyệt đối bằng chuỗi String
    const mapped = productRecommendations
      .map((id) => products.find((p) => String(p.id) === String(id)))
      .filter(Boolean)
      .slice(0, maxItems);

    setRecommendedList(mapped);
  }, [
    productRecommendations,
    products,
    productsReady,
    maxItems,
    currentCartIds.length,
  ]);

  /* =====================================================
  | LOADING & ERROR STATES
  ==================================================== */
  const isLoading = (recLoading || prodLoading) && recommendedList.length === 0;

  if (recError) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3 bg-white border border-gray-100 rounded-3xl my-10">
        <Loader2 className="animate-spin text-blue-500" size={28} />
        <p className="text-xs font-semibold text-gray-500">
          Đang tính toán sản phẩm mua kèm phù hợp...
        </p>
      </div>
    );
  }

  // Nếu giỏ hàng trống hoặc không tìm thấy luật kết hợp phù hợp -> Trả về null ẩn hoàn toàn UI
  if (!recommendedList.length) return null;

  // ================= MAIN RENDER =================
  return (
    <div className="my-10 bg-slate-50/50 p-6 rounded-3xl border border-gray-100 text-left">
      {/* Tiêu đề Khối Gợi Ý Tối Giản */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg shrink-0">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight">
              Sản phẩm thường được mua cùng đơn hàng của bạn
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              Gợi ý thông minh dựa trên thói quen mua sắm phối hợp từ hệ thống
              dữ liệu khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full w-fit self-start sm:self-center">
          <ShoppingBag size={11} />
          <span>Apriori System</span>
        </div>
      </div>

      {/* Danh sách lưới sản phẩm gợi ý sử dụng lại ProductCard của hệ thống */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {recommendedList.map((product) => (
          <div key={product.id} className="relative group">
            {/* Nhãn Đánh Dấu Sản Phẩm Gợi Ý Nhỏ Gọn Đè Góc */}
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider">
              Gợi ý kèm ✨
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
