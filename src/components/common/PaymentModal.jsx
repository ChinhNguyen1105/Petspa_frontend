import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  QrCode,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
// Import duy nhất Service xử lý cổng thanh toán
import VNPayService from "../../services/VNpayService";

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState("PENDING"); // PENDING, PROCESSING, SUCCESS
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút đếm ngược cổng thanh toán
  const [isInitializing, setIsInitializing] = useState(true);
  const [vnpayUrl, setVnpayUrl] = useState("");

  const pollingRef = useRef(null);
  const amount = orderData?.amount || orderData?.totalAmount || 0;
  const orderId = orderData?.id; 

  // Cấu hình URL sinh mã QR động dựa trên cổng VNPAY link
  const qrImageUrl = vnpayUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(vnpayUrl)}`
    : "";

  /*
  |--------------------------------------------------------------------------
  | EFFECT 1: KHỞI TẠO ĐƠN HÀNG QUA VNPAY SERVICE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const initPayment = async () => {
      try {
        setIsInitializing(true);
        // Sử dụng service sạch thay vì gọi Axios thủ công trực tiếp tại Component
        const resData = await VNPayService.createVNPayPayment(orderId);

        if (resData) {
          setVnpayUrl(resData);
          setIsInitializing(false);
        } else {
          throw new Error("Không nhận được cấu trúc phản hồi từ Service.");
        }
      } catch (error) {
        console.error("Lỗi khởi tạo phiên thanh toán VNPAY:", error);
        alert("Không thể kết nối đến hệ thống VNPAY. Vui lòng làm mới lại!");
        onClose();
      }
    };

    initPayment();
    setTimeLeft(300);
    setPaymentStatus("PENDING");
  }, [isOpen, orderId]);

  /*
  |--------------------------------------------------------------------------
  | EFFECT 2: ĐẾM NGƯỢC THỜI GIAN PHIÊN THANH TOÁN (COUNTDOWN)
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!isOpen || paymentStatus === "SUCCESS" || isInitializing) return;

    if (timeLeft <= 0) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      onClose();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, paymentStatus, isInitializing]);

  /*
  |--------------------------------------------------------------------------
  | EFFECT 3: LONG POLLING ĐỒNG BỘ TRẠNG THÁI TỪ BACKEND QUA SERVICE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!isOpen || !orderId || isInitializing) return;

    const checkStatus = async () => {
      try {
        // Gọi hàm checkPaymentStatus từ Service
        const data = await VNPayService.checkPaymentStatus(orderId);

        // 🔥 ĐÃ SỬA: Khớp chính xác với các trường dữ liệu thực tế trả về từ Backend của bạn
        if (
          data?.orderStatus === "PROCESSING" ||
          data?.paymentStatus === "SUCCESS"
        ) {
          setPaymentStatus("PROCESSING");
          if (pollingRef.current) clearInterval(pollingRef.current);

          setTimeout(() => {
            setPaymentStatus("SUCCESS");
            if (onPaymentSuccess) onPaymentSuccess();
          }, 1500);
        } else if (
          data?.paymentStatus === "FAILED" ||
          data?.orderStatus === "CANCELLED"
        ) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          alert("Giao dịch VNPAY thất bại hoặc bị hủy bỏ từ hệ thống.");
          onClose();
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái đơn hàng (Polling):", error);
      }
    };

    // Kiểm tra định kỳ 3 giây một lần đồng bộ
    pollingRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, orderId, isInitializing, onPaymentSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <QrCode size={20} />
            <span>Thanh toán an toàn qua VNPAY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Trạng thái 1: Đang tải kết nối link cổng */}
        {isInitializing ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 text-sm">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
            Đang kết nối cổng thanh toán VNPAY...
          </div>
        ) : paymentStatus !== "SUCCESS" ? (
          /* Trạng thái 2: Hiển thị mã quét QR giao dịch */
          <div className="p-6 flex flex-col items-center">
            <div className="mb-4 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
              Thời gian giữ cổng thanh toán: {formatTime(timeLeft)}
            </div>

            <div className="relative p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner mb-4">
              {qrImageUrl && (
                <img
                  src={qrImageUrl}
                  alt="VNPAY QR Gateway"
                  className={`w-52 h-52 object-contain transition-opacity ${paymentStatus === "PROCESSING" ? "opacity-20" : "opacity-100"}`}
                />
              )}

              {paymentStatus === "PROCESSING" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600 font-bold text-sm bg-white/50">
                  <Loader2
                    className="animate-spin text-orange-500 mb-2"
                    size={32}
                  />
                  Hệ thống đang kiểm tra xử lý kho hàng...
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5 max-w-xs leading-relaxed">
              Mở ứng dụng Ngân hàng (Banking) hoặc Ví VNPAY, chọn tính năng{" "}
              <strong className="text-gray-600">Quét mã QR</strong> để thanh
              toán.
            </p>

            <div className="w-full space-y-3">
              <a
                href={vnpayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-colors no-underline"
              >
                <ExternalLink size={16} />
                Mở ví / Cổng VNPAY trực tiếp
              </a>

              <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Tổng tiền đơn hàng #{orderId}:
                  </span>
                  <strong className="text-sm font-bold text-orange-500">
                    {amount.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium bg-emerald-50/50 text-emerald-700 px-3 py-1 rounded-lg">
              <ShieldCheck size={14} /> Bảo mật theo tiêu chuẩn quốc tế mã hóa
              VNPAY
            </div>
          </div>
        ) : (
          /* Trạng thái 3: Giao diện khi đồng bộ hóa đơn thành công */
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
              Hệ thống đã xác nhận hóa đơn của bạn. Kho hàng đã tự động cập nhật
              trừ sản phẩm thành công.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors border-none cursor-pointer"
            >
              Đóng & Xem trạng thái đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
