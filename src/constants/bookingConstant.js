export const BOOKING_STATUS = {
  ALL: 'ALL',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const BOOKING_STATUS_LIST = [
  { 
    value: BOOKING_STATUS.PENDING, 
    label: 'Chờ xử lý', 
    className: 'bg-amber-50 text-amber-600 border border-amber-200', // map sang variant: warning
    iconName: 'Clock'
  },
  { 
    value: BOOKING_STATUS.CONFIRMED, 
    label: 'Đã xác nhận', 
    className: 'bg-blue-50 text-blue-600 border border-blue-200', // map sang variant: info
    iconName: 'CheckCircle'
  },
  { 
    value: BOOKING_STATUS.COMPLETED, 
    label: 'Đã hoàn thành', 
    className: 'bg-emerald-50 text-emerald-600 border border-emerald-200', // map sang variant: success
    iconName: 'CheckCircle'
  },
  { 
    value: BOOKING_STATUS.CANCELLED, 
    label: 'Đã hủy', 
    className: 'bg-rose-50 text-rose-600 border border-rose-200', // map sang variant: danger
    iconName: 'XCircle'
  },
];

export const BOOKING_CONFIG = {
  PENDING: { label: 'Chờ xử lý', variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'info' },
  COMPLETED: { label: 'Đã hoàn thành', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' }
}