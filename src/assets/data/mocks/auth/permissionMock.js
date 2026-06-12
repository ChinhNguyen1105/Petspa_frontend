const permissionsMock = {
  success: true,
  message: "Get permissions successfully",

  data: [
    {
      id: 1,
      name: "Tạo sản phẩm",
      apiPath: "/api/v1/products",
      method: "POST",
      module: "PRODUCTS",
    },
    {
      id: 2,
      name: "Xem danh sách sản phẩm",
      apiPath: "/api/v1/products",
      method: "GET",
      module: "PRODUCTS",
    },
    {
      id: 3,
      name: "Cập nhật sản phẩm",
      apiPath: "/api/v1/products/{id}",
      method: "PUT",
      module: "PRODUCTS",
    },
    {
      id: 4,
      name: "Xóa sản phẩm",
      apiPath: "/api/v1/products/{id}",
      method: "DELETE",
      module: "PRODUCTS",
    },

    {
      id: 5,
      name: "Tạo dịch vụ",
      apiPath: "/api/v1/services",
      method: "POST",
      module: "SERVICES",
    },
    {
      id: 6,
      name: "Xem danh sách dịch vụ",
      apiPath: "/api/v1/services",
      method: "GET",
      module: "SERVICES",
    },
    {
      id: 7,
      name: "Cập nhật dịch vụ",
      apiPath: "/api/v1/services/{id}",
      method: "PUT",
      module: "SERVICES",
    },
    {
      id: 8,
      name: "Xóa dịch vụ",
      apiPath: "/api/v1/services/{id}",
      method: "DELETE",
      module: "SERVICES",
    },

    {
      id: 9,
      name: "Xem đơn hàng",
      apiPath: "/api/v1/orders",
      method: "GET",
      module: "ORDERS",
    },
    {
      id: 10,
      name: "Cập nhật trạng thái đơn hàng",
      apiPath: "/api/v1/orders/{id}/status",
      method: "PUT",
      module: "ORDERS",
    },

    {
      id: 11,
      name: "Xem lịch đặt dịch vụ",
      apiPath: "/api/v1/bookings",
      method: "GET",
      module: "BOOKINGS",
    },
    {
      id: 12,
      name: "Xác nhận lịch hẹn",
      apiPath: "/api/v1/bookings/{id}/confirm",
      method: "PUT",
      module: "BOOKINGS",
    },
    {
      id: 13,
      name: "Hủy lịch hẹn",
      apiPath: "/api/v1/bookings/{id}/cancel",
      method: "PUT",
      module: "BOOKINGS",
    },

    {
      id: 14,
      name: "Xem tồn kho",
      apiPath: "/api/v1/inventory",
      method: "GET",
      module: "INVENTORY",
    },
    {
      id: 15,
      name: "Nhập kho",
      apiPath: "/api/v1/inventory/import",
      method: "POST",
      module: "INVENTORY",
    },
    {
      id: 16,
      name: "Xuất kho",
      apiPath: "/api/v1/inventory/export",
      method: "POST",
      module: "INVENTORY",
    },

    {
      id: 17,
      name: "Xem danh sách người dùng",
      apiPath: "/api/v1/users",
      method: "GET",
      module: "USERS",
    },
    {
      id: 18,
      name: "Khóa tài khoản",
      apiPath: "/api/v1/users/{id}/lock",
      method: "PUT",
      module: "USERS",
    },
    {
      id: 19,
      name: "Mở khóa tài khoản",
      apiPath: "/api/v1/users/{id}/unlock",
      method: "PUT",
      module: "USERS",
    },

    {
      id: 20,
      name: "Quản lý vai trò",
      apiPath: "/api/v1/roles",
      method: "GET",
      module: "ROLES",
    },
  ],
};

export default permissionsMock;