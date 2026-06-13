import React, { useEffect } from 'react';
import { Search, SlidersHorizontal, Layers } from 'lucide-react';

import Loading from '../../components/common/Loading';
import ProductCard from '../../components/ui/ProductCard';
import Pagination from '../../components/common/Pagination';

import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';

const ProductList = () => {
  // 1. Quản lý trạng thái và bộ lọc từ Product Store (Giữ nguyên Store)
  const {
    products,
    meta, 
    loading: productLoading,
    selectedCategory, 
    keyword, // Dùng trực tiếp state từ store thay vì searchTerm cục bộ
    page,    // Dùng trực tiếp state từ store thay vì currentPage cục bộ
    pageSize, // Lấy từ store ra làm backup
    setSelectedCategory,
    setKeyword,
    setPage,
    fetchProducts
  } = useProductStore();

  // 2. Quản lý trạng thái danh mục từ Category Store
  const {
    categories,
    loading: categoryLoading,
    fetchCategories
  } = useCategoryStore();

  // Xác định kích thước trang (Ưu tiên meta từ backend, không thì dùng cấu hình store, mặc định là 12)
  const currentSize = meta?.size || pageSize || 12;

  // Mount: Chỉ fetch danh mục loại PRODUCT 1 lần duy nhất
  useEffect(() => {
    fetchCategories({ type: 'PRODUCT' });
  }, [fetchCategories]);
  // TRIGGER EFFECT: Đồng bộ gọi API fetch dữ liệu tập trung qua 1 Effect duy nhất
  // Tích hợp Debounce (300ms) để tối ưu hiệu năng và truyền đúng cấu trúc tham số backend cần
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts({
        keyword: keyword || undefined,
        categoryId: selectedCategory !== 0 ? selectedCategory : undefined,
        page: page,
        size: currentSize, // Ép tham số gửi lên API khớp với size quy định
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, keyword, page, currentSize, fetchProducts]);

  // Điều hướng đổi danh mục
  const handleCategoryChange = (id) => {
    setSelectedCategory(id); // Hàm này trong store đã tự reset page về 1
  };

  // Điều hướng gõ text ô search
  const handleSearchChange = (e) => {
    setKeyword(e.target.value); // Hàm này trong store đã tự reset page về 1
  };

  // Điều hướng chuyển trang
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trạng thái màn hình chờ khi lần đầu tải dữ liệu tổng thể
  const isInitialLoading = (productLoading || categoryLoading) && (!products || products.length === 0);

  if (isInitialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/50">
        <Loading />
      </div>
    );
  }

  // Khai báo an toàn dữ liệu và CẮT MẢNG đúng bằng kích thước `size` cho phép hiển thị
  const rawProductList = Array.isArray(products) ? products : [];
  const productList = rawProductList.slice(0, currentSize); 
  const totalPages = meta?.totalPages || meta?.pages || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

        {/* ─── HEADER & FILTER SECTION ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-pet-blue mb-2">
              Cửa Hàng Petspa
            </h1>
            <p className="text-gray-500 font-medium">
              Cung cấp phụ kiện và thức ăn dinh dưỡng tốt nhất cho thú cưng
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => handleCategoryChange(0)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                selectedCategory === 0
                  ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                  : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
              }`}
            >
              Tất Cả Sản Phẩm
            </button>

            {Array.isArray(categories) &&
              categories.map((cat, index) => {
                const categoryName = typeof cat === "string" ? cat : cat.name || cat.title;
                const currentId = cat.id !== undefined ? cat.id : index;
                if (!categoryName) return null;

                return (
                  <button
                    key={currentId}
                    onClick={() => handleCategoryChange(currentId)}
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                      selectedCategory === currentId
                        ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                        : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              })}
          </div>
        </div>

        {/* ─── TOOLBAR (SEARCH & SORT) ─── */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={keyword}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all font-medium text-gray-700"
            />
          </div>

          <button className="flex items-center gap-2 text-gray-600 font-black text-xs uppercase tracking-wider hover:text-pet-blue transition-colors cursor-pointer bg-transparent border-none outline-none">
            <SlidersHorizontal size={16} />
            Sắp xếp theo: Bán chạy nhất
          </button>
        </div>

        {/* ─── GRID LIST & PAGINATION ─── */}
        <div className="relative">
          {/* Lớp phủ Loading mờ (Glassmorphism) xuất hiện khi re-fetch trang mới */}
          {productLoading && productList.length > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/50 backdrop-blur-sm min-h-[400px]">
              <Loading />
            </div>
          )}

          {productList.length > 0 ? (
            <>
              {/* Grid hiển thị danh sách Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {productList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Bố cục Pagination chuẩn */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            /* Empty State khi không có kết quả */
            !productLoading && (
              <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <Layers size={22} />
                </div>
                <h3 className="text-gray-700 font-black text-base mb-1">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-400 font-medium text-sm">
                  Hiện tại không tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc từ khóa của bạn.
                </p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductList;