import React, { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, Layers } from "lucide-react";

import Loading from "../../components/common/Loading";
import ProductCard from "../../components/ui/ProductCard";
import Pagination from "../../components/common/Pagination";

import { useProductStore } from "../../store/productStore";
import { useCategoryStore } from "../../store/categoryStore";

const ProductList = () => {
  // Dùng state cục bộ cho Phân trang Frontend để không bị xung đột với cơ chế cũ của Store nếu cần
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // 1. Quản lý trạng thái từ Product Store
  const {
    products,
    loading: productLoading,
    selectedCategory,
    keyword,
    setSelectedCategory,
    setKeyword,
    fetchProducts,
  } = useProductStore();

  // 2. Quản lý trạng thái danh mục từ Category Store
  const {
    categories,
    loading: categoryLoading,
    fetchCategories,
  } = useCategoryStore();

  // 3. Gọi API lấy TOÀN BỘ dữ liệu 1 lần duy nhất khi vào trang
  useEffect(() => {
    fetchCategories();
    // Lấy số lượng lớn để kéo hết sản phẩm về Frontend tự xử lý lọc
    fetchProducts({ page: 1, size: 999 });
  }, [fetchCategories, fetchProducts]);

  // 4. Lọc danh mục loại PRODUCT ở frontend
  const filteredCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter((cat) => cat && cat.categoryType === "PRODUCT")
      : [];
  }, [categories]);

  // Tìm danh mục hiện tại đang chọn dựa trên ID (khi selectedCategory khác 0)
  const currentSelectedCategoryObj = useMemo(() => {
    if (selectedCategory === 0) return null;
    return filteredCategories.find((cat) => cat.id === selectedCategory);
  }, [filteredCategories, selectedCategory]);

  // 5. LỌC DỮ LIỆU HOÀN TOÀN Ở FRONTEND (Hỗ trợ đối chiếu linh hoạt ID và Name)
  const allFilteredProducts = useMemo(() => {
    const rawProducts = Array.isArray(products) ? products : [];

    return rawProducts.filter((product) => {
      if (!product) return false;

      // Kiểm tra danh mục (Nút "Tất cả" là 0)
      let matchesCategory = true;
      if (selectedCategory !== 0) {
        const matchById = product.categoryId === selectedCategory;

        // Phòng hờ lệch dữ liệu: so sánh theo chuỗi tên danh mục chuẩn hóa
        const matchByName =
          currentSelectedCategoryObj &&
          product.categoryName?.trim().toLowerCase() ===
            currentSelectedCategoryObj.name?.trim().toLowerCase();

        matchesCategory = matchById || matchByName;
      }

      // Kiểm tra theo từ khóa tìm kiếm (tên hoặc mô tả sản phẩm)
      const cleanSearch = keyword.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        product.name?.toLowerCase().includes(cleanSearch) ||
        product.description?.toLowerCase().includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, currentSelectedCategoryObj, keyword]);

  // 6. TÍNH TOÁN PHÂN TRANG Ở FRONTEND
  const totalPages = Math.ceil(allFilteredProducts.length / PAGE_SIZE);

  const currentProductList = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return allFilteredProducts.slice(startIndex, endIndex);
  }, [allFilteredProducts, currentPage]);

  // Điều hướng đổi danh mục
  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  };

  // Điều hướng gõ text ô search
  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm
  };

  // Điều hướng chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Màn hình chờ khi lần đầu tải dữ liệu tổng thể
  const isFirstLoad = productLoading || categoryLoading;

  if (isFirstLoad) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/50">
        <Loading />
      </div>
    );
  }

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
            {/* Nút Tất cả xử lý điều kiện trạng thái là số 0 */}
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

            {filteredCategories.map((cat) => {
              const categoryName = cat.name;
              const currentId = cat.id;
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
          {currentProductList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {currentProductList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center p-6">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Layers size={22} />
              </div>
              <h3 className="text-gray-700 font-black text-base mb-1">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-400 font-medium text-sm">
                Hiện tại không tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc từ
                khóa "{keyword}" của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
