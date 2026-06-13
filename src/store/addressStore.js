import { create } from "zustand";
import AddressService from "../services/addressService";

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  // ───────────────────────── FETCH ─────────────────────────
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await AddressService.getAddresses();

      set({
        addresses: res.data || [],
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to fetch addresses",
        isLoading: false,
      });
    }
  },

  // ───────────────────────── CREATE ─────────────────────────
  addAddress: async (addressData) => {
    set({ isLoading: true });

    try {
      const res = await AddressService.createAddress(addressData);
      const newAddress = res.data;

      const current = get().addresses;

      // nếu backend đã set default thì reset list
      const updatedList = newAddress.isDefault
        ? current.map((a) => ({ ...a, isDefault: false }))
        : current;

      set({
        addresses: [...updatedList, newAddress],
        isLoading: false,
      });

      return res;
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        message: err?.response?.data?.message || "Create address failed",
      };
    }
  },

  // ───────────────────────── UPDATE ─────────────────────────
  editAddress: async (id, addressData) => {
    set({ isLoading: true });

    try {
      const res = await AddressService.updateAddress(id, addressData);
      const updated = res.data;

      const updatedList = get().addresses.map((item) => {
        if (item.id === Number(id)) {
          return updated;
        }

        // nếu địa chỉ này được set default → reset các item khác
        if (updated.isDefault) {
          return { ...item, isDefault: false };
        }

        return item;
      });

      set({
        addresses: updatedList,
        isLoading: false,
      });

      return res;
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        message: err?.response?.data?.message || "Update address failed",
      };
    }
  },

  // ───────────────────────── DELETE ─────────────────────────
  removeAddress: async (id) => {
    set({ isLoading: true });

    try {
      await AddressService.deleteAddress(id);

      set({
        addresses: get().addresses.filter((a) => a.id !== Number(id)),
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        message: err?.response?.data?.message || "Delete address failed",
      };
    }
  },

  // ───────────────────────── SET DEFAULT ─────────────────────────
  markAsDefault: async (id) => {
    set({ isLoading: true });

    try {
      await AddressService.setDefaultAddress(id);

      set({
        addresses: get().addresses.map((a) => ({
          ...a,
          isDefault: a.id === Number(id),
        })),
        isLoading: false,
      });

      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        message:
          err?.response?.data?.message || "Set default address failed",
      };
    }
  },
}));