export const userMock = {
  success: true,
  message: "Get users successfully",

  meta: {
    page: 1,
    pageSize: 10,
    pages: 1,
    total: 5,
  },

  result: [
    {
      id: "USR001",
      name: "Nguyễn Văn A",
      email: "admin@gmail.com",
      dateOfBirth: "2003-05-15",
      gender: "MALE",
      roleName: "ADMIN",
      createdBy: "system",
      lastModifiedBy: "admin@gmail.com",
      createdDate: "2026-06-01T10:00:00",
      lastModifiedDate: "2026-06-05T15:30:00",
      activeFlag: true,
      deleteFlag: false,
    },

    {
      id: "USR002",
      name: "Trần Thị B",
      email: "manager@gmail.com",
      dateOfBirth: "1998-08-22",
      gender: "FEMALE",
      roleName: "MANAGER",

      createdBy: "admin@gmail.com",
      lastModifiedBy: "manager@gmail.com",
      createdDate: "2026-06-02T09:15:00",
      lastModifiedDate: "2026-06-06T14:10:00",

      activeFlag: true,
      deleteFlag: false,
    },

    {
      id: "USR003",
      name: "Lê Văn C",
      email: "staff1@gmail.com",
      dateOfBirth: "2001-12-10",
      gender: "MALE",
      roleName: "STAFF",

      createdBy: "manager@gmail.com",
      lastModifiedBy: "manager@gmail.com",
      createdDate: "2026-06-03T08:30:00",
      lastModifiedDate: "2026-06-07T11:45:00",

      activeFlag: true,
      deleteFlag: false,
    },

    {
      id: "USR004",
      name: "Phạm Thị D",
      email: "staff2@gmail.com",
      dateOfBirth: "2000-03-05",
      gender: "FEMALE",
      roleName: "STAFF",

      createdBy: "manager@gmail.com",
      lastModifiedBy: "admin@gmail.com",
      createdDate: "2026-06-04T13:20:00",
      lastModifiedDate: "2026-06-08T16:00:00",

      activeFlag: false,
      deleteFlag: false,
    },

    {
      id: "USR005",
      name: "Hoàng Văn E",
      email: "customer@gmail.com",
      dateOfBirth: "2004-11-18",
      gender: "MALE",
      roleName: "CUSTOMER",

      createdBy: "system",
      lastModifiedBy: "admin@gmail.com",
      createdDate: "2026-06-05T17:45:00",
      lastModifiedDate: "2026-06-09T10:25:00",

      activeFlag: false,
      deleteFlag: true,
    },
  ],
};