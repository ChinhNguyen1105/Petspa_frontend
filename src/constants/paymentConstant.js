export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },

  PROCESSING: {
    label: "Đang xử lý",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },

  SUCCESS: {
    label: "Thanh toán thành công",
    color: "text-green-600 bg-green-50 border-green-200",
  },

  FAILED: {
    label: "Thanh toán thất bại",
    color: "text-red-600 bg-red-50 border-red-200",
  },

  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
};