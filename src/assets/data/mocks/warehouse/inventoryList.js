export const inventoryMock = {
  meta: {
    page: 1,
    pageSize: 10,
    pages: 3,
    total: 2,
  },

  result: [
    {
      id: 1,
      productId: 2,
      productName: "Royal Canin Mini Adult",
      quantity: 120,
      productPrice: 350000,
    },

    {
      id: 2,
      productId: 1,
      productName: "Thức ăn cho chó Pedigree",
      thumbnailUrl: "https://picsum.photos/300/300",
      quantity: 120,
      productPrice: 250000,
    },
  ],
};

export default inventoryMock;