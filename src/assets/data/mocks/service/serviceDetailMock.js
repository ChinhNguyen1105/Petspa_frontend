export const serviceDetailMock = {
  success: true,
  message: "Get service successfully",

  data: {
    id: 1,

    name: "Tắm và vệ sinh cho chó",
    status: "ACTIVE",

    description:
      "Dịch vụ tắm, vệ sinh tai, cắt móng và sấy khô cho chó.",

    basePrice: 150000,
    durationMin: 60,

    categoryId: 1,
    categoryName: "Chăm sóc thú cưng",

    serviceImages: [
      {
        id: 1,
        imageUrl: "https://picsum.photos/800/500?random=1",
        isThumbnail: true,
        serviceId: 1,
      },
      {
        id: 2,
        imageUrl: "https://picsum.photos/800/500?random=2",
        isThumbnail: false,
        serviceId: 1,
      },
      {
        id: 3,
        imageUrl: "https://picsum.photos/800/500?random=3",
        isThumbnail: false,
        serviceId: 1,
      },
    ],

    averageRating: 4.8,
    totalReviews: 125,

    createdDate: "2026-06-01T08:30:00",
    lastModifiedDate: "2026-06-08T14:20:00",
  },
};