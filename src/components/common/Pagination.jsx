import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Tính toán khoảng số trang được phép hiển thị (Tối đa 6 trang)
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 6;
    
    let startPage = 1;
    let endPage = totalPages;

    // Nếu tổng số trang vượt quá giới hạn hiển thị (6)
    if (totalPages > maxVisiblePages) {
      // Đặt trang hiện tại nằm ở khoảng giữa cụm 6 nút
      startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      endPage = startPage + maxVisiblePages - 1;

      // Xử lý trường hợp nếu khoảng kết thúc vượt quá tổng số trang thực tế
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - maxVisiblePages + 1;
      }
    }

    // Render danh sách các nút số trong khoảng đã tính toán
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 mx-1 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
            currentPage === i
              ? 'bg-pet-blue text-white shadow-md shadow-pet-blue/20'
              : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Nút Trước */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        Trước
      </button>

      {/* Danh sách các trang */}
      <div className="flex items-center">
        {renderPageNumbers()}
      </div>

      {/* Nút Sau */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination;