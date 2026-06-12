export const roleMock = {
  success: true,
  message: "Get roles successfully",

  data: [
    {
      id: 1,
      name: "ADMIN",
      description: "Quản trị hệ thống",
      activeFlag: true,
      permissionIds: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 2,
      name: "STAFF",
      description: "Nhân viên",
      activeFlag: true,
      permissionIds: [2, 3, 7, 8, 9],
    },
    {
      id: 3,
      name: "CUSTOMER",
      description: "Khách hàng",
      activeFlag: true,
      permissionIds: [10, 11, 12],
    },
  ],
};