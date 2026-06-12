import { create } from "zustand";
import AddressService from "../services/addressService";

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  // Action: Tải danh sách địa chỉ từ mock vào store
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await AddressService.getAddresses();
      if (res.success) {
        set({ addresses: res.data, isLoading: false });
      } else {
        set({ error: res.message, isLoading: false });
      }
    } catch (err) {
      set({ error: "Failed to fetch addresses", isLoading: false });
    }
  },

  // Action: Thêm địa chỉ mới
  addAddress: async (addressData) => {
    set({ isLoading: true });
    try {
      const res = await AddressService.createAddress(addressData);
      if (res.success) {
        const currentAddresses = get().addresses;
        
        // Nếu địa chỉ mới thêm là mặc định, hủy trạng thái mặc định của các địa chỉ cũ
        const updatedList = res.data.isDefault
          ? currentAddresses.map(item => ({ ...item, isDefault: false }))
          : currentAddresses;

        set({
          addresses: [...updatedList, res.data],
          isLoading: false
        });
      }
      return res;
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: "Error occurred while creating address" };
    }
  },

  // Action: Cập nhật thông tin địa chỉ
  editAddress: async (id, addressData) => {
    set({ isLoading: true });
    try {
      const res = await AddressService.updateAddress(id, addressData);
      if (res.success) {
        const updatedAddresses = get().addresses.map((item) => {
          // Nếu trùng ID, cập nhật data mới từ service trả về
          if (item.id === Number(id)) {
            return { ...item, ...res.data };
          }
          // Nếu địa chỉ vừa sửa được tích chọn làm mặc định, bỏ mặc định của tất cả địa chỉ khác
          if (res.data.isDefault) {
            return { ...item, isDefault: false };
          }
          return item;
        });

        set({ addresses: updatedAddresses, isLoading: false });
      }
      return res;
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: "Error occurred while updating address" };
    }
  },

  // Action: Xóa một địa chỉ
  removeAddress: async (id) => {
    set({ isLoading: true });
    try {
      const res = await AddressService.deleteAddress(id);
      if (res.success) {
        const filteredAddresses = get().addresses.filter((item) => item.id !== Number(id));
        set({ addresses: filteredAddresses, isLoading: false });
      }
      return res;
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: "Error occurred while deleting address" };
    }
  },

  // Action: Đặt địa chỉ cụ thể làm địa chỉ mặc định
  markAsDefault: async (id) => {
    set({ isLoading: true });
    try {
      const res = await AddressService.setDefaultAddress(id);
      if (res.success) {
        const updatedAddresses = get().addresses.map((item) => ({
          ...item,
          isDefault: item.id === Number(id), // Chỉ phần tử được chọn mới là true, còn lại là false
        }));
        set({ addresses: updatedAddresses, isLoading: false });
      }
      return res;
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: "Error occurred while setting default address" };
    }
  }
}));