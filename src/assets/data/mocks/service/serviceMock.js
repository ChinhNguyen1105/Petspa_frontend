// serviceMock.js
const rawServices = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1;

  const categories = [
    { id: 1, name: "Chăm sóc thú cưng" },
    { id: 2, name: "Thú y" },
    { id: 3, name: "Lưu trú" },
  ];

  const serviceNames = [
    "Tắm cho chó nhỏ",
    "Cắt tỉa lông Poodle",
    "Khám sức khỏe tổng quát",
    "Tiêm phòng dại",
    "Khách sạn thú cưng",
    "Vệ sinh tai",
    "Cắt móng",
    "Spa thư giãn",
    "Tắm dưỡng lông",
    "Khám răng miệng",
  ];

  const category = categories[index % 3];

  return {
    id,
    name: `${serviceNames[index % serviceNames.length]} #${id}`,
    description: "Dịch vụ chăm sóc thú cưng chuyên nghiệp, đảm bảo an toàn và chất lượng.",
    basePrice: 100000 + (index % 10) * 50000,
    durationMin: [20, 30, 45, 60, 90, 120][index % 6],
    categoryId: category.id,
    categoryName: category.name,
    serviceImages: [
      {
        id: id * 10 + 1,
        imageUrl: `https://picsum.photos/300/200?random=${id}`,
        isThumbnail: true,
        serviceId: id,
      },
      {
        id: id * 10 + 2,
        imageUrl: `https://picsum.photos/300/200?random=${id + 100}`,
        isThumbnail: false,
        serviceId: id,
      },
    ],
    averageRating: Number((4 + (index % 10) * 0.1).toFixed(1)), // Thay Math.random() để dữ liệu nhất quán không đổi khi chuyển trang
    totalReviews: 20 + id * 5,
    createdDate: `2026-06-${String(((id - 1) % 28) + 1).padStart(2, "0")}T08:00:00`,
    lastModifiedDate: `2026-06-${String(((id - 1) % 28) + 1).padStart(2, "0")}T16:00:00`,
  };
});

export const serviceMock = {
  meta: {
    page: 1,
    pageSize: 10,
    total: rawServices.length,                // Tự động ăn theo mảng thực tế = 30
    pages: Math.ceil(rawServices.length / 10) // Tự động tính toán = 3 trang
  },
  result: rawServices
};

export default serviceMock;