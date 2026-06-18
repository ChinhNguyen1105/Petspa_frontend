// import { useState, useCallback } from 'react';
// import spaService from '../services/serviceService';

// export const useBooking = () => {
//   const [bookings, setBookings] = useState([]);
//   const [currentBooking, setCurrentBooking] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Lấy danh sách lịch đặt lịch hẹn
//   const fetchBookings = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await spaService.getAllBookings();
//       setBookings(data);
//     } catch (err) {
//       setError(err.message || 'Không thể tải danh sách lịch đặt.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Lấy chi tiết 1 lịch đặt
//   const fetchBookingById = useCallback(async (id) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await spaService.getBookingById(id);
//       setCurrentBooking(data);
//       return data;
//     } catch (err) {
//       setError(err.message || 'Không tìm thấy chi tiết lịch đặt.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Tiến hành đặt lịch mới
//   const createBooking = async (bookingData) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const newBooking = await spaService.createBooking(bookingData);
//       // Cập nhật danh sách local ngay lập tức
//       setBookings((prev) => [newBooking, ...prev]);
//       return newBooking;
//     } catch (err) {
//       const errMsg = err.message || 'Đặt lịch thất bại. Vui lòng thử lại.';
//       setError(errMsg);
//       throw new Error(errMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { bookings, currentBooking, loading, error, fetchBookings, fetchBookingById, createBooking };
// };