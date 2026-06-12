export const productDetailMock = {
  id: 1,
  name: "Thức ăn cho chó Pedigree",
  description:
    "Thức ăn dinh dưỡng cho chó trưởng thành, bổ sung vitamin và khoáng chất giúp phát triển toàn diện.",
  price: 250000,
  categoryId: 1,
  categoryName: "Thức ăn thú cưng",
  stockQuantity: 120,
  averageRating: 4.8,
  reviewCount: 125,
  activeFlag: true,
  deleteFlag: false,
  createdBy: "admin@gmail.com",
  lastModifiedBy: "staff@gmail.com",
  createdDate: "2026-05-20T08:00:00",
  lastModifiedDate: "2026-06-08T09:30:00",

  images: [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
      isThumbnail: true,
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a",
      isThumbnail: false,
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2",
      isThumbnail: false,
    },
  ],
};

export default productDetailMock;