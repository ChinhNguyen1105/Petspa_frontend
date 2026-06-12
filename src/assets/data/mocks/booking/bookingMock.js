export const bookingMock = {
  success: true,
  message: "Get bookings successfully",

  meta: {
    page: 1,
    pageSize: 20,
    pages: 3,
    total: 30,
  },

  result: Array.from({ length: 20 }, (_, index) => {
    const id = index + 1;

    // Dữ liệu mẫu để xoay vòng
    const statuses = ["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"];
    
    const users = [
      { id: "550e8400-e29b-41d4-a716-446655440001", name: "Nguyễn Văn A" },
      { id: "550e8400-e29b-41d4-a716-446655440002", name: "Trần Thị B" },
      { id: "550e8400-e29b-41d4-a716-446655440003", name: "Lê Văn C" },
      { id: "550e8400-e29b-41d4-a716-446655440004", name: "Phạm Minh D" },
    ];

    const pets = [
      { id: 1, name: "Milu" },
      { id: 2, name: "Kiki" },
      { id: 3, name: "Miu" },
      { id: 4, name: "LuLu" },
      { id: 5, name: "Ngáo" },
    ];

    const availableServices = [
      { id: 1, name: "Tắm và vệ sinh cho chó", price: 150000, duration: 60 },
      { id: 2, name: "Cắt móng", price: 100000, duration: 30 },
      { id: 3, name: "Cắt tỉa lông Poodle", price: 200000, duration: 90 },
      { id: 4, name: "Khám sức khỏe tổng quát", price: 250000, duration: 45 },
      { id: 5, name: "Spa thư giãn", price: 300000, duration: 60 },
    ];

    const timeSlots = [
      { start: "09:00:00", end: "10:30:00" },
      { start: "11:00:00", end: "12:00:00" },
      { start: "14:00:00", end: "15:30:00" },
      { start: "16:00:00", end: "17:00:00" },
    ];

    // Lấy dữ liệu theo index xoay vòng
    const user = users[index % users.length];
    const pet = pets[index % pets.length];
    const status = statuses[index % statuses.length];
    const timeSlot = timeSlots[index % timeSlots.length];

    // Tạo ngẫu nhiên danh sách 1 hoặc 2 dịch vụ đi kèm cho mỗi booking
    const serviceCount = (index % 2) + 1; // Sinh ra số lượng 1 hoặc 2
    const bookingDetails = Array.from({ length: serviceCount }, (_, sIndex) => {
      // Chọn dịch vụ xoay vòng dựa trên index của booking và sIndex của dịch vụ
      const serviceIdx = (index + sIndex) % availableServices.length;
      const s = availableServices[serviceIdx];
      
      return {
        id: id * 100 + (sIndex + 1), // Tạo ID detail duy nhất
        bookingId: id,
        serviceId: s.id,
        serviceName: s.name,
        servicePrice: s.price,
        serviceDuration: s.duration,
      };
    });

    // Tính tổng tiền dựa trên các dịch vụ đã chọn ở trên
    const actualPrice = bookingDetails.reduce((sum, item) => sum + item.servicePrice, 0);

    // Tính toán ngày (Đảm bảo định dạng 2 chữ số)
    const dayMod = ((id - 1) % 28) + 1; // Giới hạn ngày từ 01 đến 28 để an toàn cho mọi tháng
    const dayStr = String(dayMod).padStart(2, "0");
    const createdDayStr = String(Math.max(1, dayMod - 2)).padStart(2, "0"); // Ngày tạo trước ngày booking 1-2 ngày

    return {
      id,
      userId: user.id,
      userName: user.name,
      status,

      actualPrice,

      bookingDate: `2026-06-${dayStr}`,
      startTime: timeSlot.start,
      endTime: timeSlot.end,

      petId: pet.id,
      petName: pet.name,

      bookingDetails,

      createdDate: `2026-06-${createdDayStr}T08:30:00`,
      lastModifiedDate: `2026-06-${createdDayStr}T09:00:00`,
    };
  }),
};