export const cartMock = {
  success: true,
  message: "Get cart successfully",

  data: {
    id: 1,
    itemDtoList: [
      {
        id: 1,
        quantity: 2,
        productId: 1,
        productName: "Thức ăn cho chó Pedigree",
        productPrice: 250000,
        productImage: "https://picsum.photos/300/300",
        totalPrice: 500000,
      },
      {
        id: 2,
        quantity: 1,
        productId: 2,
        productName: "Sữa tắm cho chó",
        productPrice: 180000,
        productImage: "https://picsum.photos/300/301",
        totalPrice: 180000,
      },
    ],
    totalAmount: 680000,
    totalItem: 3,
  },
};
