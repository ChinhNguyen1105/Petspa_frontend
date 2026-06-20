import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VNPayService from "../../services/VNpayService";

const VNPayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleProcess = async () => {
      try {
        const queryString = location.search.substring(1);

        const response = await VNPayService.handleVNPayReturn(queryString);

        console.log("VNPay Return:", response);

        /**
         * Điều chỉnh lại theo response thực tế của backend
         *
         * Ví dụ:
         * {
         *   status: "SUCCESS"
         * }
         *
         * hoặc:
         * {
         *   success: true
         * }
         */
        const isSuccess =
          response === "SUCCESS" ||
          response?.status === "SUCCESS" ||
          response?.success === true ||
          response?.data?.status === true;

        setSuccess(isSuccess);

        timeoutId = setTimeout(() => {
          if (isSuccess) {
            navigate("/profile/orders");
          } else {
            navigate("/cart");
          }
        }, 3000);
      } catch (error) {
        console.error("VNPay Return Error:", error);

        setSuccess(false);

        timeoutId = setTimeout(() => {
          navigate("/cart");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      handleProcess();
    } else {
      navigate("/");
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5" />

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Đang xác thực giao dịch
        </h2>

        <p className="text-gray-500 text-center max-w-md">
          Hệ thống đang kiểm tra trạng thái thanh toán và cập nhật đơn hàng của
          bạn. Vui lòng không đóng trình duyệt.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        {success ? (
          <>
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-4xl text-green-600">✓</span>
            </div>

            <h1 className="text-2xl font-bold text-green-600 mb-3">
              Thanh toán thành công
            </h1>

            <p className="text-gray-600 mb-6">
              Đơn hàng của bạn đã được ghi nhận thành công. Bạn sẽ được chuyển
              đến trang đơn hàng trong vài giây.
            </p>

            <button
              onClick={() => navigate("/profile/orders")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition"
            >
              Xem đơn hàng
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-4xl text-red-600">✕</span>
            </div>

            <h1 className="text-2xl font-bold text-red-600 mb-3">
              Thanh toán thất bại
            </h1>

            <p className="text-gray-600 mb-6">
              Giao dịch chưa được hoàn tất hoặc không hợp lệ. Bạn có thể quay
              lại giỏ hàng để thử thanh toán lại.
            </p>

            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition"
            >
              Quay về giỏ hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VNPayReturnPage;
