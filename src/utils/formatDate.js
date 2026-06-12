/**
 * Hàm định dạng ngày tháng năm cho toàn bộ hệ thống PETSPA
 * @param {string | Date} date - Chuỗi ngày tháng hoặc đối tượng Date
 * @param {string} type - Loại định dạng: 'short', 'full', 'time'
 * @returns {string} - Chuỗi ngày đã định dạng
 */
export const formatDate = (date, type = 'short') => {
  if (!date) return "N/A";
  
  const d = new Date(date);
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return "Ngày không hợp lệ";

  const options = {
    short: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    },
    full: {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    },
    timeOnly: {
      hour: '2-digit',
      minute: '2-digit'
    }
  };

  const selectedOption = options[type] || options.short;

  return new Intl.DateTimeFormat('vi-VN', selectedOption).format(d);
};

/**
 * Hàm tính khoảng thời gian từ lúc đăng (ví dụ: "2 giờ trước")
 * Thường dùng cho phần Review hoặc Thông báo
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  
  return formatDate(date);
};