import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, QrCode, Copy, ShieldCheck } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, PROCESSING, SUCCESS
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút đếm ngược
  const [copied, setCopied] = useState(false);

  // Giả lập thông tin ngân hàng của Shop
  const BANK_INFO = {
    bankId: "MB", // Ngân hàng Quân Đội
    accountNo: "0999999999", // Số tài khoản shop
    accountName: "CONG TY PET SPA VIET NAM"
  };

  // Tạo nội dung chuyển khoản duy nhất dựa trên mã đơn hàng/đặt lịch
  // Ví dụ: PETSPA 123456
  const transferContent = `PETSPA ${orderData?.id || Math.floor(100000 + Math.random() * 900000)}`;
  const amount = orderData?.amount || 250000;

  // Link tạo ảnh VietQR tự động theo chuẩn Napas
  const qrImageUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  // Logic 1: Đếm ngược thời gian thanh toán
  useEffect(() => {
    if (!isOpen || paymentStatus === 'SUCCESS') return;
    
    if (timeLeft <= 0) {
      onClose(); // Hết giờ thì đóng modal
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, paymentStatus]);

  // Logic 2: Mô phỏng Cổng thanh toán tự động kiểm tra tài khoản ngân hàng (Auto Banking)
  useEffect(() => {
    if (!isOpen) return;

    // Thực tế: Đoạn này sẽ gọi API/Webhook liên tục (Long polling) để check tài khoản ngân hàng
    // Giả lập: Sau 8 giây, hệ thống "phát hiện" khách đã chuyển khoản thành công
    const paymentCheckSimulation = setTimeout(() => {
      setPaymentStatus('PROCESSING');
      
      // Giả lập xử lý check biến động số dư trong 2 giây
      setTimeout(() => {
        setPaymentStatus('SUCCESS');
        // Kích hoạt hàm xử lý thành công ở component cha (ví dụ: cập nhật DB, xóa giỏ hàng)
        if (onPaymentSuccess) onPaymentSuccess();
      }, 2000);

    }, 8000); 

    return () => clearTimeout(paymentCheckSimulation);
  }, [isOpen]);

  // Hàm copy nội dung nhanh
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format thời gian hiển thị (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative transition-all transform scale-100">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-pet-blue font-bold">
            <QrCode size={20} />
            <span>Thanh toán qua QR Banking</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nội dung thay đổi theo trạng thái thanh toán */}
        {paymentStatus !== 'SUCCESS' ? (
          <div className="p-6 flex flex-col items-center">
            
            {/* Đồng hồ đếm ngược */}
            <div className="mb-4 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
              Đang chờ thanh toán: {formatTime(timeLeft)}
            </div>

            {/* Khung chứa mã QR */}
            <div className="relative p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner mb-4 group">
              <img 
                src={qrImageUrl} 
                alt="VietQR Automatic Payment" 
                className={`w-56 h-56 object-contain transition-opacity ${paymentStatus === 'PROCESSING' ? 'opacity-20' : 'opacity-100'}`}
              />
              
              {/* Overlay lúc đang check tiền */}
              {paymentStatus === 'PROCESSING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-pet-blue font-bold text-sm bg-white/50">
                  <Loader2 className="animate-spin text-pet-orange mb-2" size={32} />
                  Đang xác thực giao dịch...
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5 max-w-xs">
              Mở ứng dụng ngân hàng bất kỳ (Banking), chọn tính năng <strong className="text-gray-600">Quét mã QR</strong> để thanh toán tự động.
            </p>

            {/* Thông tin chuyển khoản bằng tay nếu không quét được */}
            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Số tiền:</span>
                <strong className="text-sm font-bold text-pet-orange">
                  {amount.toLocaleString('vi-VN')} đ
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="font-mono text-gray-800 bg-white border px-2 py-0.5 rounded text-[13px]">
                    {transferContent}
                  </strong>
                  <button onClick={() => handleCopy(transferContent)} className="text-pet-blue hover:text-pet-orange">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {copied && <span className="text-[11px] text-emerald-500 font-bold mt-2">Đã sao chép nội dung!</span>}

            <div className="mt-5 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium bg-emerald-50/50 text-emerald-700 px-3 py-1 rounded-lg">
              <ShieldCheck size={14} /> Hệ thống kiểm tra số dư tự động mã hóa bảo mật
            </div>

          </div>
        ) : (
          /* Giao diện khi thanh toán THÀNH CÔNG */
          <div className="p-8 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Hệ thống đã nhận được tiền cho mã đơn <span className="font-bold text-gray-700">{transferContent}</span>. Lịch hẹn/Đơn hàng của bạn đã được xác nhận tự động.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/10 transition-colors"
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