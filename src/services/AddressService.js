import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

/*
|--------------------------------------------------------------------------
| SHIPPING ADDRESS SERVICES (REAL API)
|--------------------------------------------------------------------------
*/

// 1. Lấy danh sách địa chỉ nhận hàng
const getAddresses = async () => {
  const response = await api.get(
    URL_CONSTANT.ShippingAddress.GET_SHIPPING_ADDRESSES
  );
  return response.data;
};

// 2. Thêm mới một địa chỉ
const createAddress = async (data) => {
  const payload = {
    fullName: data.recipient_name,
    phone: data.phone_number,
    province: data.province_city,
    district: data.district_ward,
    ward: data.district_ward,
    addressDetail: data.detail_address,
    isDefault: data.isDefault ?? false,
  };

  return api.post(
    URL_CONSTANT.ShippingAddress.CREATE_SHIPPING_ADDRESS,
    payload
  );
};

// 3. Cập nhật thông tin địa chỉ
const updateAddress = async (id, addressData) => {
  const response = await api.put(
    URL_CONSTANT.ShippingAddress.UPDATE_SHIPPING_ADDRESS,
    {
      id,
      ...addressData,
    }
  );

  return response.data;
};

// 4. Xóa một địa chỉ
const deleteAddress = async (id) => {
  const response = await api.delete(
    URL_CONSTANT.ShippingAddress.DELETE_SHIPPING_ADDRESS.replace("{id}", id)
  );

  return response.data;
};

// 5. Thiết lập một địa chỉ làm mặc định
const setDefaultAddress = async (id) => {
  const response = await api.patch(
    URL_CONSTANT.ShippingAddress.SET_DEFAULT_ADDRESS.replace("{id}", id)
  );

  return response.data;
};

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};