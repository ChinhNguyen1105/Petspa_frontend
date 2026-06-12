export const categoryMock = {
  meta: {
    page: 1,
    pageSize: 5,
    pages: 1,
    total: 6,
  },

  result: [
    {
      id: 1,
      name: "Thức ăn thú cưng",
      categoryType: "PRODUCT",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "admin@gmail.com",

      createdDate: "2026-05-01T08:00:00",
      lastModifiedDate: "2026-06-01T08:00:00",
    },

    {
      id: 2,
      name: "Phụ kiện",
      categoryType: "PRODUCT",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "staff@gmail.com",

      createdDate: "2026-05-02T08:00:00",
      lastModifiedDate: "2026-06-02T10:30:00",
    },

    {
      id: 3,
      name: "Chăm sóc thú cưng",
      categoryType: "PRODUCT",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "admin@gmail.com",

      createdDate: "2026-05-03T08:00:00",
      lastModifiedDate: "2026-06-03T14:15:00",
    },

    {
      id: 4,
      name: "Tắm & Vệ sinh",
      categoryType: "SERVICE",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "staff@gmail.com",

      createdDate: "2026-05-04T08:00:00",
      lastModifiedDate: "2026-06-04T11:45:00",
    },

    {
      id: 5,
      name: "Cắt tỉa lông",
      categoryType: "SERVICE",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "staff@gmail.com",

      createdDate: "2026-05-05T08:00:00",
      lastModifiedDate: "2026-06-05T16:20:00",
    },

    {
      id: 6,
      name: "Khám sức khỏe",

      categoryType: "SERVICE",

      activeFlag: false,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "admin@gmail.com",

      createdDate: "2026-05-06T08:00:00",
      lastModifiedDate: "2026-06-06T09:00:00",
    },
  ],
};

export default categoryMock;