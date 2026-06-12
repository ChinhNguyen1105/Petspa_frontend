import { addressList } from "../assets/data/mocks/order/addressList";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| SHIPPING ADDRESS SERVICES
|--------------------------------------------------------------------------
*/

// 1. Lấy danh sách địa chỉ nhận hàng
const getAddresses = async () => {
  await delay(400);
  return {
    success: true,
    message: addressList.message || "Get addresses successfully",
    data: [...addressList.data], // Đồng bộ sử dụng biến addressList mới
  };
};

// 2. Thêm mới một địa chỉ
const createAddress = async (addressData) => {
  await delay(500);
  console.log("Service: Nhận yêu cầu THÊM địa chỉ:", addressData);

  const fullAddress = `${addressData.addressDetail}, ${addressData.ward}, ${addressData.district}, ${addressData.province}`;

  return {
    success: true,
    message: "Create address successfully",
    data: {
      id: Date.now(), // Tạo ID ngẫu nhiên bằng timestamp
      ...addressData,
      fullAddress,
      isDefault: addressData.isDefault || false,
    },
  };
};

// 3. Cập nhật thông tin địa chỉ
const updateAddress = async (id, addressData) => {
  await delay(500);
  console.log(`Service: Nhận yêu cầu CẬP NHẬT địa chỉ [ID: ${id}]:`, addressData);

  const fullAddress = `${addressData.addressDetail}, ${addressData.ward}, ${addressData.district}, ${addressData.province}`;

  return {
    success: true,
    message: "Update address successfully",
    data: {
      id: Number(id),
      ...addressData,
      fullAddress,
    },
  };
};

// 4. Xóa một địa chỉ
const deleteAddress = async (id) => {
  await delay(400);
  console.log(`Service: Nhận yêu cầu XÓA địa chỉ [ID: ${id}]`);
  return {
    success: true,
    message: `Delete address #${id} successfully`,
  };
};

// 5. Thiết lập một địa chỉ làm mặc định
const setDefaultAddress = async (id) => {
  await delay(300);
  console.log(`Service: Đặt địa chỉ [ID: ${id}] làm mặc định`);
  return {
    success: true,
    message: "Set default address successfully",
  };
};

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};