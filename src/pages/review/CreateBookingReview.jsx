import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "../../components/common/Button";
import Loading from "../../components/common/Loading";

// TÍCH HỢP ĐỒNG THỜI CẢ 2 STORES THEO LUỒNG XỬ LÝ THỰC TẾ MỚI
import { useBookingStore } from "../../store/bookingStore";
import { useReviewStore } from "../../store/reviewStore";
import { useCartStore } from "../../store/cartStore";

const CreateBookingReview = () => {
  const { showToast } = useCartStore();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // 1. Lấy dữ liệu chi tiết Booking từ useBookingStore mới
  const {
    currentBooking: booking,
    loading: bookingLoading,
    error: bookingError,
    fetchBookingById,
    setCurrentBooking,
    markBookingReviewed,
  } = useBookingStore();

  // 2. Cập nhật CHÍNH XÁC theo các hàm có sẵn trong useReviewStore của bạn
  const {
    loading: reviewSubmitting, // Biến loading chung của reviewStore
    error: reviewStoreError, // Biến error của reviewStore
    createServiceReview, // 🔥 Thay thế createReview bằng hàm dịch vụ chuẩn của store
    resetReviews, // 🔥 Dùng hàm resetReviews để xóa error/state cũ thay vì clearError không tồn tại
  } = useReviewStore();

  // Local Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState("");

  // ─── ĐỒNG BỘ DỮ LIỆU KHI MOUNT & UNMOUNT ───────────────────────────────────
  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }

    // Clear lỗi cũ và làm sạch state của review store khi vào trang
    resetReviews();

    return () => {
      setCurrentBooking(null);
    };
  }, [bookingId, fetchBookingById, setCurrentBooking, resetReviews]);

  // ─── XỬ LÝ GỬI ĐÁNH GIÁ CHẠY THẬT QUA REVIEW STORE ────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!comment.trim()) {
      return setLocalError("Vui lòng nhập nhận xét của bạn.");
    }

    try {
      // 🔥 Gọi chính xác hàm tạo review dịch vụ theo cấu trúc payload của Service
      const res = await createServiceReview({
        serviceId: Number(bookingId),
        rating,
        comment: comment.trim(),
      });

      // Kiểm tra phản hồi trả về từ service
      if (res) {
        if (markBookingReviewed) {
          markBookingReviewed(bookingId);
        }
        showToast(`Cảm ơn bạn đã đánh giá!`);
        navigate("/profile/bookings");
      }
    } catch (err) {
      // Trích xuất thông báo lỗi an toàn từ backend ném ra
      setLocalError(
        err?.response?.data?.message ||
          err.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại.",
      );
    }
  };

  // Trạng thái Loading khi đang fetch chi tiết Booking từ hệ thống
  if (bookingLoading && !booking) return <Loading fullScreen />;

  // Trích xuất mảng dịch vụ con an toàn từ booking
  const servicesList =
    booking?.bookingDetails || booking?.services || booking?.items || [];

  // Gom tất cả các nguồn lỗi để hiển thị tập trung lên UI (Đảm bảo bọc chuỗi an toàn)
  const serverReviewError =
    reviewStoreError?.response?.data?.message ||
    reviewStoreError?.message ||
    (typeof reviewStoreError === "string" ? reviewStoreError : "");
  const serverBookingError =
    bookingError?.message ||
    (typeof bookingError === "string" ? bookingError : "");
  const displayError = localError || serverBookingError || serverReviewError;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="max-w-2xl mx-auto px-4">
        {/* Nút Quay Lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-pet-blue font-bold mb-6 transition-colors cursor-pointer border-none bg-transparent outline-none"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Đánh Giá Booking Spa
          </h2>
          <p className="text-gray-500 font-semibold mb-6">
            Booking #{bookingId}
          </p>

          <div className="space-y-2 mb-6">
            <h4 className="font-bold text-gray-700 text-sm">
              Dịch vụ đã sử dụng
            </h4>

            {servicesList.length > 0 ? (
              <ul className="space-y-1.5 pl-1">
                {servicesList.map((service, index) => (
                  <li
                    key={service.id || index}
                    className="text-gray-600 text-sm font-medium flex items-center gap-2"
                  >
                    <span className="text-green-500 font-bold">✓</span>{" "}
                    {service?.serviceName || service?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1.5 pl-1">
                <li className="text-gray-600 text-sm font-medium">
                  <span className="text-green-500 font-bold">✓</span> Tắm sấy
                  phối hợp
                </li>
                <li className="text-gray-600 text-sm font-medium">
                  <span className="text-green-500 font-bold">✓</span> Cắt tỉa
                  tạo kiểu
                </li>
                <li className="text-gray-600 text-sm font-medium">
                  <span className="text-green-500 font-bold">✓</span> Vệ sinh
                  móng & tai tổng quát
                </li>
              </ul>
            )}
          </div>

          {/* Đường gạch ngang phân chia */}
          <hr className="border-t border-dashed border-gray-200 my-6" />

          {/* Khu vực hiển thị lỗi tập trung */}
          {displayError && (
            <p className="text-red-500 text-sm mb-4 font-semibold bg-red-50 p-3 rounded-xl">
              {displayError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CHỌN SỐ SAO (RATING) CHUNG */}
            <div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-2xl outline-none transition-transform active:scale-95 cursor-pointer bg-transparent border-none p-0"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      size={28}
                      className={
                        (hoverRating || rating) >= star
                          ? "text-pet-orange"
                          : "text-gray-200"
                      }
                      fill={
                        (hoverRating || rating) >= star
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* NỘI DUNG NHẬN XÉT (COMMENT) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nhận xét *
              </label>
              <textarea
                rows="4"
                className="w-full p-4 border border-gray-200 rounded-3xl focus:outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none italic text-sm transition-all text-gray-700"
                placeholder="Nhập cảm nhận thực tế của bạn về chất lượng phục vụ và thái độ nhân viên..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* NÚT GỬI ĐÁNH GIÁ */}
            <Button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full !py-3.5 font-bold rounded-2xl text-lg flex items-center justify-center gap-2"
            >
              {reviewSubmitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingReview;
