import { create } from "zustand";
import CategoryService from "../services/CategoryService";

export const useCategoryStore = create((set, get) => ({
  // ───────────────────────── STATES ─────────────────────────
  categories: [],

  categoryMeta: {
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },

  loading: false,
  error: null,

  // filters
  keyword: "",
  selectedType: "",

  // ───────────────────────── FILTER ACTIONS ─────────────────────────
  setKeyword: (keyword) => set({ keyword }),

  setSelectedType: (type) => set({ selectedType: type }),

  clearFilters: () =>
    set({
      keyword: "",
      selectedType: "",
    }),

  // ───────────────────────── GET CATEGORIES ─────────────────────────
  fetchCategories: async (overrideParams = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const state = get();

      const params = {
        keyword: state.keyword || undefined,
        type: state.selectedType || undefined,
        ...overrideParams,
      };

      const res = await CategoryService.getCategories(params);

      console.log("categories from store:", res);

      if (res?.success) {
        const categories = res.data?.result || [];

        set({
          categories,
          categoryMeta: res.data?.meta || {
            page: 1,
            pageSize: categories.length,
            total: categories.length,
            pages: 1,
          },
        });
      } else {
        set({
          categories: [],
          categoryMeta: {
            page: 1,
            pageSize: 10,
            total: 0,
            pages: 0,
          },
        });
      }

      return res;
    } catch (err) {
      console.error("Lỗi khi load categories:", err);

      set({
        categories: [],
        categoryMeta: {
          page: 1,
          pageSize: 10,
          total: 0,
          pages: 0,
        },
        error:
          err?.response?.data?.message ||
          err.message ||
          "Đã xảy ra lỗi khi tải danh mục.",
      });

      return {
        success: false,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── CREATE ─────────────────────────
  createCategory: async (newCategoryData) => {
    try {
      set({ loading: true });

      const res = await CategoryService.createCategory(newCategoryData);

      if (res?.status === "SUCCESS") {
        set((state) => ({
          categories: [res.data, ...state.categories],
        }));
      }

      return res;
    } catch (err) {
      console.error("Lỗi create category:", err);

      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── UPDATE ─────────────────────────
  updateCategory: async (id, updatedData) => {
    try {
      set({ loading: true });

      const res = await CategoryService.updateCategory(id, updatedData);

      if (res?.status === "SUCCESS") {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === Number(id)
              ? {
                  ...cat,
                  ...res.data,
                }
              : cat,
          ),
        }));
      }

      return res;
    } catch (err) {
      console.error(`Lỗi update category ${id}:`, err);

      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── DELETE ─────────────────────────
  deleteCategory: async (id) => {
    try {
      set({ loading: true });

      const res = await CategoryService.deleteCategory(id);

      if (res?.status === "SUCCESS" || res?.success) {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== Number(id)),
        }));
      }

      return res;
    } catch (err) {
      console.error(`Lỗi delete category ${id}:`, err);

      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ loading: false });
    }
  },
}));
