export const orderMock = {
  meta: {
    page: 1,
    pageSize: 10,
    pages: 20,
    total: 60,
  },

  result: Array.from({ length: 10 }, (_, index) => {
    const id = 1001 + index;
    const userId = (index % 5) + 1;

    // Dữ liệu mẫu khách hàng để xoay vòng
    const users = [
      { name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0987654321", address: "Số 10 Ngõ 50, Dịch Vọng, Cầu Giấy, Hà Nội" },
      { name: "Trần Thị B", email: "tranthib@gmail.com", phone: "0911222333", address: "15 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội" },
      { name: "Lê Văn C", email: "levanc@gmail.com", phone: "0922333444", address: "Hẻm 45 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh" },
      { name: "Phạm Minh D", email: "phamminhd@gmail.com", phone: "0933444555", address: "Ngõ 120 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội" },
      { name: "Hoàng Ngân E", email: "hoangngane@gmail.com", phone: "0944555666", address: "Đường Nguyễn Văn Linh, Thạch Bàn, Long Biên, Hà Nội" },
    ];

    // Dữ liệu mẫu sản phẩm để xoay vòng
    const availableProducts = [
      { id: 1, name: "Thức ăn cho chó Pedigree", price: 250000, imgSuffix: 300 },
      { id: 2, name: "Sữa tắm Joyce & Dolls", price: 180000, imgSuffix: 301 },
      { id: 3, name: "Royal Canin Mini Adult", price: 420000, imgSuffix: 302 },
      { id: 4, name: "Vòng cổ da cao cấp", price: 150000, imgSuffix: 303 },
      { id: 5, name: "Pate cho mèo Whiskas", price: 35000, imgSuffix: 304 },
      { id: 6, name: "Nhà cây cho mèo (Cat tree)", price: 650000, imgSuffix: 305 },
    ];

    const statuses = ["PENDING", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];
    const paymentMethods = ["VNPAY", "COD", "MOMO"];
    const paymentStatuses = ["SUCCESS", "PENDING", "FAILED"];

    const user = users[index % users.length];
    const status = statuses[index % statuses.length];
    const paymentMethod = paymentMethods[index % paymentMethods.length];
    
    // Nếu đơn hàng bị huỷ hoặc đang chờ xử lý thì trạng thái thanh toán có thể linh hoạt hơn
    const paymentStatus = status === "CANCELLED" ? "FAILED" : paymentStatuses[index % paymentStatuses.length];

    // Tạo ngẫu nhiên danh sách 1 đến 3 sản phẩm cho mỗi đơn hàng
    const productCount = (index % 3) + 1; 
    const orderDetails = Array.from({ length: productCount }, (_, pIndex) => {
      const productIdx = (index + pIndex) % availableProducts.length;
      const p = availableProducts[productIdx];
      const quantity = (pIndex % 2) + 1; // Số lượng mua mỗi món: 1 hoặc 2

      return {
        id: id * 10 + (pIndex + 1),
        productId: p.id,
        productName: p.name,
        productImage: `https://picsum.photos/300/${p.imgSuffix}`,
        quantity,
        unitPrice: p.price,
        totalAmount: p.price * quantity,
      };
    });

    // Tự động tính toán tổng số lượng và tổng tiền của đơn hàng
    const totalQuantity = orderDetails.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = orderDetails.reduce((sum, item) => sum + item.totalAmount, 0);

    // Xử lý logic ngày tháng tăng dần trong tháng 06/2026
    const dayMod = ((index) % 28) + 1;
    const dayStr = String(dayMod).padStart(2, "0");
    const nextDayStr = String(Math.min(28, dayMod + 1)).padStart(2, "0");

    return {
      id,
      userId,
      userName: user.name,
      userEmail: user.email,

      shippingName: user.name,
      shippingPhone: user.phone,
      shippingAddressFull: user.address,

      totalQuantity,
      totalAmount,

      status,
      paymentMethod,
      paymentStatus,

      activeFlag: true,
      deleteFlag: false,

      createdBy: user.email,
      lastModifiedBy: "staff@gmail.com",

      createdDate: `2026-06-${dayStr}T09:00:00`,
      lastModifiedDate: `2026-06-${status === "PENDING" ? dayStr : nextDayStr}T10:15:00`,

      orderDetails,
    };
  }),
};

export default orderMock;