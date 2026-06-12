// utils/bookingValidator.js

const validateBookingForm = (
  formData,
  {
    isWalkIn = false,
    requireGroomer = false,
  } = {}
) => {
  const errors = {};

  // Service
  if (!formData.serviceIds || formData.serviceIds.length === 0) {
    errors.serviceIds = "Vui lòng chọn ít nhất một dịch vụ!";
  }

  // Groomer (admin only)
  if (requireGroomer && !formData.groomerId) {
    errors.groomerId = "Vui lòng chọn nhân viên thực hiện!";
  }

  // Date
  if (!formData.date) {
    errors.date = "Vui lòng chọn ngày đặt lịch!";
  }

  // Time
  if (!formData.time) {
    errors.time = "Vui lòng chọn khung giờ!";
  }

  // Walk-in
  if (isWalkIn) {

    const name =
      formData.walkInName || formData.customerName || "";

    const phone =
      formData.walkInPhone || formData.customerPhone || "";

    if (!name.trim()) {
      errors.customerName = "Vui lòng nhập tên khách hàng!";
    }

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;

    if (!phone.trim()) {
      errors.customerPhone = "Vui lòng nhập số điện thoại!";
    } else if (!phoneRegex.test(phone.trim())) {
      errors.customerPhone = "Số điện thoại không hợp lệ!";
    }

  } else {

    // Registered customer
    if (!formData.customerId) {
      errors.customerId = "Vui lòng chọn khách hàng!";
    }

    if (!formData.petId) {
      errors.petId = "Vui lòng chọn thú cưng!";
    }
  }

  return errors;
};

export default validateBookingForm;