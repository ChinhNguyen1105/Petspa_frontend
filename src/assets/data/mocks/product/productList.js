// productMock.js
export const productMock = {
  meta: {
    page: 1,
    pageSize: 10,
    pages: 20, // Ép UI hiển thị 6 trang
    total: 60,
  },

  result: Array.from({ length: 30 }, (_, index) => {
    const id = 5001 + index;
    
    const productTemplates = [
      { name: "Royal Canin Mini Adult", desc: "Thức ăn hạt cho chó trưởng thành cỡ nhỏ", img: "https://picsum.photos/300/300" },
      { name: "Sữa tắm Joyce & Dolls", desc: "Sữa tắm hương nước hoa lưu hương lâu cho thú cưng", img: "https://picsum.photos/300/301" },
      { name: "Pate cho mèo Whiskas", desc: "Pate gói vị cá ngừ thơm ngon bổ dưỡng", img: "https://picsum.photos/300/304" },
      { name: "Vòng cổ da cao cấp", desc: "Vòng cổ chất liệu da đệm êm cho chó mèo", img: "https://picsum.photos/300/303" },
      { name: "Thức ăn hạt Pedigree", desc: "Thức ăn hạt vị bò và rau củ cho chó", img: "https://picsum.photos/300/302" },
    ];

    const categories = [
      { id: 1, name: "Thức ăn thú cưng" },
      { id: 2, name: "Vật dụng & Phụ kiện" },
      { id: 3, name: "Mỹ phẩm & Nhỏ gáy" }
    ];

    const template = productTemplates[index % productTemplates.length];
    const category = categories[index % categories.length];
    const basePrice = 50000 + (index * 25000);
    const stockQuantity = (index % 4 === 0) ? 0 : 15 + index;

    const createdDay = String((index % 28) + 1).padStart(2, "0");
    const modifiedDay = String(Math.min(28, (index % 28) + 2)).padStart(2, "0");

    return {
      id,
      name: `${template.name} v${index + 1}`,
      description: template.desc,
      price: basePrice,
      categoryId: category.id,
      categoryName: category.name,
      stockQuantity,
      thumbnailUrl: template.img,
      averageRating: 4.5,
      reviewCount: 12 + index,
      status: stockQuantity > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      activeFlag: true,
      deleteFlag: false,
      createdBy: "admin@gmail.com",
      lastModifiedBy: "staff@gmail.com",
      createdDate: `2026-05-${createdDay}T10:15:00`,
      lastModifiedDate: `2026-06-${modifiedDay}T14:20:00`,
    };
  }),
};

export default productMock;