import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

const createVNPayPayment = async (orderId) => {
  const response = await api.post(
    URL_CONSTANT.Payment.CREATE_PAYMENT,
    null,
    {
      params: { orderId },
    }
  );

  return response.data;
};

// --- TRONG FILE VNpayService.js ---

const handleVNPayReturn = async (queryString) => {
  // Biến chuỗi "vnp_Amount=55000&vnp_BankCode=NCB..." thành một Object để gửi an toàn
  const urlParams = new URLSearchParams(queryString);
  const paramsObject = Object.fromEntries(urlParams.entries());

  const response = await api.get(
    `${URL_CONSTANT.Payment.HANDLE_RETURN}`, // Không cộng chuỗi dính liền ở đây nữa
    {
      params: paramsObject // Đưa vào params của Axios để tự động xử lý chuẩn URL Encoding
    }
  );

  return response.data; // Sẽ trả về dữ liệu chuỗi text thô hoặc JSON
};

// Cập nhật lại trong file VNpaymentService.js của bạn:
const checkPaymentStatus = async (orderId) => { // Thêm orderId vào đây nhận tham số truyền tới
  const response = await api.get(
    `${URL_CONSTANT.Payment.GET_PAYMENT_STATUS}`,
    {
      params: { orderId: orderId },
    }
  );
  return response.data;
};
    
      
const VNpaymentService = {
    createVNPayPayment,
    handleVNPayReturn,
    checkPaymentStatus
};
export default VNpaymentService;