import { create } from "zustand";
import ProductService from "../services/ProductService";

export const useProductStore = create((set, get) => ({
  // ─── STATE ────────────────────────────────────────────────
  products: [],
  categories: [],
  meta: null,
  currentProduct: null,

  selectedCategory: 0,
  keyword: "",
  page: 1,
  pageSize: 10,

  loading: false,
  detailLoading: false,

  // ─── FILTER ───────────────────────────────────────────────
  setSelectedCategory: (id) => set({ selectedCategory: id, page: 1 }),
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setPage: (page) => set({ page }),
  clearCurrentProduct: () => set({ currentProduct: null }),

  // ─── FETCH LIST ───────────────────────────────────────────
  fetchProducts: async (overrideParams = {}) => {
    try {
      set({ loading: true });

      const { keyword, selectedCategory, page, pageSize } = get();

      const params = {
        keyword,
        categoryId: selectedCategory || null,
        page,
        pageSize,
        ...overrideParams,
      };

      const res = await ProductService.getProducts(params);

      set({
        products: res?.success ? res.data?.result || [] : [],
        meta: res?.success ? res.data?.meta || null : null,
      });
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
      set({ products: [], meta: null });
    } finally {
      set({ loading: false });
    }
  },

  // ─── FETCH DETAIL ─────────────────────────────────────────
  fetchProductById: async (id) => {
    if (get().currentProduct?.id === Number(id)) return;

    try {
      set({ detailLoading: true, currentProduct: null });

      const res = await ProductService.getProductById(id);

      set({ currentProduct: res?.success ? res.data : null });
    } catch (err) {
      console.error(`Lỗi khi tải chi tiết sản phẩm ID ${id}:`, err);
      set({ currentProduct: null });
    } finally {
      set({ detailLoading: false });
    }
  },

  // ─── CREATE ───────────────────────────────────────────────
  createProduct: async (data) => {
    try {
      set({ loading: true });

      const res = await ProductService.createProduct(data);

      if (res?.success) {
        set((state) => ({ products: [res.data, ...state.products] }));
      }

      return res;
    } catch (err) {
      console.error("Lỗi khi tạo sản phẩm:", err);
      return { success: false, message: "Lỗi hệ thống không thể tạo sản phẩm." };
    } finally {
      set({ loading: false });
    }
  },

  // ─── UPDATE ───────────────────────────────────────────────
  updateProduct: async (id, data) => {
    try {
      set({ loading: true });

      const res = await ProductService.updateProduct(id, data);

      if (res?.success) {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === Number(id) ? { ...p, ...res.data } : p
          ),
          currentProduct:
            state.currentProduct?.id === Number(id)
              ? { ...state.currentProduct, ...res.data }
              : state.currentProduct,
        }));
      }

      return res;
    } catch (err) {
      console.error(`Lỗi khi cập nhật sản phẩm ID ${id}:`, err);
      return { success: false, message: "Lỗi hệ thống không thể cập nhật sản phẩm." };
    } finally {
      set({ loading: false });
    }
  },

  // ─── DELETE ───────────────────────────────────────────────
  deleteProduct: async (id) => {
    try {
      set({ loading: true });

      const res = await ProductService.deleteProduct(id);

      if (res?.success) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== Number(id)),
          currentProduct:
            state.currentProduct?.id === Number(id) ? null : state.currentProduct,
        }));
      }

      return res;
    } catch (err) {
      console.error(`Lỗi khi xóa sản phẩm ID ${id}:`, err);
      return { success: false, message: "Lỗi hệ thống không thể xóa sản phẩm." };
    } finally {
      set({ loading: false });
    }
  },
}));