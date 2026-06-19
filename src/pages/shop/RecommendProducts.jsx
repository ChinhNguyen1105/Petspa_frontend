import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, Loader2 } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';

import { useProductStore } from '../../store/productStore';
import { useOrderStore } from '../../store/orderStore';

import useRecommendationStore from '../../store/apioriStore';

const RecommendedProducts = ({ maxItems = 4 }) => {
  // ================= STORE =================
  const { orders, fetchOrders } = useOrderStore();

  const {
    productRecommendations,
    fetchProductRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const {
    products,
    fetchProducts,
    loading: prodLoading,
  } = useProductStore();

  const [recommendedList, setRecommendedList] = useState([]);

  // 🔥 KHỞI TẠO GUARD READY STATE ĐỂ ĐỒNG BỘ FLOW
  const productsReady = products?.length > 0;
  const ordersReady = orders?.length > 0;

  /* =====================================================
  | STEP 1: LOAD ORDERS (DEBUG SAFE)
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 1] orders state:", orders);

    if (!orders?.length) {
      console.log("[STEP 1] fetching orders...");
      fetchOrders({ page: 1, pageSize: 5 });
    }
  }, [orders, fetchOrders]);

  /* =====================================================
  | STEP 2: EXTRACT ITEM IDS + DEBUG FULL FLOW (OPTIMIZED)
  ===================================================== */
  useEffect(() => {
    if (!ordersReady) {
      console.log("[STEP 2] skip - orders not ready yet");
      return;
    }

    console.log("[STEP 2] orders changed & ready:", orders);

    const itemIds = Array.from(
      new Set(
        orders
          .flatMap(order => {
            const items =
              order.items ||
              order.orderDetails ||
              order.cartItems ||
              [];

            return items.map(item =>
              item.productId ||
              item.product?.id ||
              item.id
            );
          })
          .filter(Boolean)
      )
    );

    console.log("[STEP 2] extracted itemIds:", itemIds);

    if (!itemIds.length) {
      console.warn("[STEP 2] NO ITEM IDS → SKIP RECOMMENDATION API");
      return;
    }

    console.log("[STEP 2] calling recommendation API...");

    fetchProductRecommendations(itemIds)
      .then(res => console.log("[STEP 2] API SUCCESS:", res))
      .catch(err => console.error("[STEP 2] API ERROR:", err));
  }, [ordersReady]); // Theo dõi trạng thái Ready của Orders thay vì mảng động

  /* =====================================================
  | STEP 3: LOAD PRODUCTS
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 3] products state:", products);

    if (!products?.length) {
      console.log("[STEP 3] fetching products...");
      fetchProducts({ page: 1, pageSize: 50 });
    }
  }, [products, fetchProducts]);

  /* =====================================================
  | STEP 4: MAP RECOMMENDATIONS → PRODUCTS (SAFE & FIXED)
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 4] productRecommendations:", productRecommendations);
    console.log("[STEP 4] products state ready:", productsReady);

    if (!productRecommendations?.length || !productsReady) {
      console.warn("[STEP 4] waiting for recommendations or products list...");
      return;
    }

    // 🔥 FIX LỖI MAPPING SAI KIỂU DỮ LIỆU: Ép toán bộ về String để so khớp chính xác
    const mapped = productRecommendations
      .map(id => products.find(p => String(p.id) === String(id)))
      .filter(Boolean)
      .slice(0, maxItems);

    console.log("[STEP 4] mapped result successfully:", mapped);

    setRecommendedList(mapped);
  }, [productRecommendations, productsReady, maxItems]); // Lắng nghe dựa trên ready state tối ưu

  /* =====================================================
  | LOADING STATE (DEBUG SAFE)
  ===================================================== */
  const isLoading =
    (recLoading || prodLoading) &&
    recommendedList.length === 0;

  if (recError) {
    console.error("[RECOMMENDATION ERROR]:", recError);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin text-pet-blue" size={32} />
        <p className="text-sm font-medium">
          Đang tính toán sản phẩm phù hợp cho bạn...
        </p>
      </div>
    );
  }

  /* =====================================================
  | EMPTY STATE
  ===================================================== */
  if (!recommendedList.length) {
    console.warn("[FINAL] recommendedList is empty");
    return null;
  }

  // ================= MAIN RENDER =================
  return (
    <div className="my-10 bg-gradient-to-b from-blue-50/40 to-transparent p-6 rounded-3xl border border-blue-50/60">
      
      {/* Tiêu đề Khối Gợi Ý */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 text-left">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl animate-pulse">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              Sản phẩm thường được mua cùng
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Gợi ý thông minh dựa trên thói quen mua sắm của bạn
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-bold text-pet-blue bg-blue-50 px-3 py-1.5 rounded-full">
          <ShoppingBag size={13} />
          <span>Apriori System</span>
        </div>
      </div>

      {/* Danh sách lưới sản phẩm gợi ý đặc quyền */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {recommendedList.map((product) => (
          <div key={product.id} className="relative group">
            {/* Nhãn Đánh Dấu Sản Phẩm Gợi Ý Cao */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-sm z-10 uppercase tracking-wider flex items-center gap-1">
              Gợi ý mua kèm ✨
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;