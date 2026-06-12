/**
 * Kiểm tra định dạng email hợp lệ
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Xác thực dữ liệu form đăng nhập
 * @param {Object} formData - Chứa dữ liệu email và password từ giao diện
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateLoginForm = (formData) => {
  const email = formData?.email?.trim() || "";
  const password = formData?.password || "";

  if (!email || !password) {
    return {
      isValid: false,
      message: "Vui lòng điền đầy đủ Email và Mật khẩu.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: "Định dạng Email không hợp lệ (Ví dụ: name@example.com).",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Mật khẩu phải chứa ít nhất 6 ký tự.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

/**
 * Xác thực dữ liệu form đăng ký
 * @param {Object} formData - Chứa dữ liệu đăng ký từ giao diện
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateRegisterForm = (formData) => {
  // 1. Kiểm tra trống dữ liệu cơ bản
  if (
    !formData?.name?.trim() ||
    !formData?.email?.trim() ||
    !formData?.phone?.trim() ||
    !formData?.password?.trim() ||
    !formData?.confirmPassword?.trim()
  ) {
    return { isValid: false, message: "Vui lòng điền đầy đủ tất cả các trường thông tin." };
  }

  // 2. Tái sử dụng hàm isValidEmail đã có ở trên để kiểm tra định dạng email
  if (!isValidEmail(formData.email.trim())) {
    return { isValid: false, message: "Định dạng email không hợp lệ. Vui lòng kiểm tra lại." };
  }

  // 3. Kiểm tra định dạng số điện thoại Việt Nam
  const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(formData.phone.trim())) {
    return { isValid: false, message: "Số điện thoại không hợp lệ (Phải gồm 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09)." };
  }

  // 4. Kiểm tra độ dài mật khẩu bảo mật cơ bản
  if (formData.password.length < 6) {
    return { isValid: false, message: "Mật khẩu bảo mật phải chứa ít nhất 6 ký tự." };
  }

  // 5. Kiểm tra mật khẩu khớp nhau
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, message: "Mật khẩu xác nhận không khớp với mật khẩu đã nhập." };
  }

  return { isValid: true, message: "" };
};

// Xuất mặc định một object chứa tất cả các hàm để linh hoạt trong cách import
const authValidator = {
  isValidEmail,
  validateLoginForm,
  validateRegisterForm,
};

export default authValidator;