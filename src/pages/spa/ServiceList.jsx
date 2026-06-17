import React, { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, Layers } from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import { useCategoryStore } from "../../store/categoryStore";

import Loading from "../../components/common/Loading";
import ServiceCard from "../../components/ui/ServiceCard";
import Pagination from "../../components/common/Pagination";

const ServiceList = () => {
  const [filterCategoryId, setFilterCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12; // Số lượng item trên 1 trang ở Frontend

  const {
    services,
    loading: loadingServices,
    fetchServices,
  } = useServiceStore();

  const {
    categories,
    loading: loadingCategories,
    fetchCategories,
  } = useCategoryStore();

  // 1. Chỉ gọi API lấy dữ liệu 1 lần duy nhất khi vào trang
  useEffect(() => {
    fetchCategories();
    // Gọi API lấy TẤT CẢ dịch vụ (Truyền page/size lớn hoặc theo thiết kế của API để lấy hết về)
    fetchServices({ page: 1, size: 999 }); 
  }, [fetchCategories, fetchServices]);

  // 2. Lọc danh mục dạng "SERVICE" ở frontend
  const filteredCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter((cat) => cat && cat.categoryType === "SERVICE")
      : [];
  }, [categories]);

  // 3. LỌC DỮ LIỆU HOÀN TOÀN Ở FRONTEND (Dùng useMemo để tối ưu hiệu năng)
  const allFilteredServices = useMemo(() => {
    const rawServices = Array.isArray(services) ? services : [];
    
    return rawServices.filter((service) => {
      if (!service) return false;

      // Kiểm tra theo danh mục (Kiểm tra cả categoryId và categoryName phòng hờ)
      const matchesCategory =
        filterCategoryId === null || 
        service.categoryId === filterCategoryId;

      // Kiểm tra theo từ khóa tìm kiếm (tên hoặc mô tả)
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !cleanSearch ||
        service.name?.toLowerCase().includes(cleanSearch) ||
        service.description?.toLowerCase().includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [services, filterCategoryId, searchTerm]);

  // 4. PHÂN TRANG HOÀN TOÀN Ở FRONTEND
  const totalPages = Math.ceil(allFilteredServices.length / PAGE_SIZE);
  
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return allFilteredServices.slice(startIndex, endIndex);
  }, [allFilteredServices, currentPage]);

  // Reset về trang 1 khi tương tác bộ lọc
  const handleCategoryChange = (id) => {
    setFilterCategoryId(id);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFirstLoad = loadingCategories || loadingServices;

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
              Dịch Vụ Petspa
            </h1>
            <p className="text-gray-500 font-medium">
              Chăm sóc thú cưng của bạn bằng tất cả tình yêu thương
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                filterCategoryId === null
                  ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                  : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
              }`}
            >
              Tất Cả
            </button>

            {filteredCategories.map((cat, index) => {
              const categoryName = cat.name || cat.title;
              const currentId = cat.id !== undefined ? cat.id : index;
              if (!categoryName) return null;

              return (
                <button
                  key={currentId}
                  onClick={() => handleCategoryChange(currentId)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                    filterCategoryId === currentId
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

        {/* ─── TOOLBAR ─── */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm tên dịch vụ hoặc mô tả..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all font-medium text-gray-700"
            />
          </div>

          <button className="flex items-center gap-2 text-gray-600 font-black text-xs uppercase tracking-wider hover:text-pet-blue transition-colors cursor-pointer bg-transparent border-none outline-none">
            <SlidersHorizontal size={16} />
            Sắp xếp theo: Phổ biến nhất
          </button>
        </div>

        {/* ─── GRID LIST & PAGINATION ─── */}
        {currentTableData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {currentTableData.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Thanh phân trang dựa theo dữ liệu đã cắt ở frontend */}
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
              Không tìm thấy dịch vụ nào phù hợp với danh mục hoặc từ khóa "
              {searchTerm}" hiện tại của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;