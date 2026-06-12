

export const USER_STATUS_CONFIG = {
  ACTIVE: {
    label: "Đang hoạt động",
    color: "text-green-600 bg-green-50 border-green-200",
  },

  PROBATION: {
    label: "Thử việc",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },

  SUSPENDED: {
    label: "Tạm đình chỉ",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },

  TERMINATED: {
    label: "Đã nghỉ việc",
    color: "text-red-600 bg-red-50 border-red-200",
  },
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

export const ROLE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả vai trò' },
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'STAFF', label: 'Nhân viên' },
  { value: 'CUSTOMER', label: 'Khách hàng' } // Hoặc 'USER' tùy thuộc vào database của bạn
];