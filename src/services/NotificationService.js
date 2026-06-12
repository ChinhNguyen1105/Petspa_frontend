import { notificationMock } from '../assets/data/mocks/notification/notificationMock';

// Khởi tạo dữ liệu lưu trong bộ nhớ tạm (hoặc localStorage) để có thể thay đổi trạng thái is_read
let localNotifications = [...notificationMock.data];

const NotificationService = {
  getNotifications: async () => {
    // Giả lập độ trễ mạng mạng 300ms
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Get notifications successfully",
      data: localNotifications
    };
  },

  markAsRead: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    localNotifications = localNotifications.map(noti => 
      noti.id === id ? { ...noti, is_read: true } : noti
    );
    return { success: true, message: "Marked as read" };
  },

  markAllAsRead: async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    localNotifications = localNotifications.map(noti => ({ ...noti, is_read: true }));
    return { success: true, message: "Marked all as read" };
  }
};

export default NotificationService;