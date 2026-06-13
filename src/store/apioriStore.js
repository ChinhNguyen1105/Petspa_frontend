import { create } from "zustand";
import recommendationService from "../services/AprioriService";

const useRecommendationStore = create((set, get) => ({
  /* =====================================================
  | STATE
  ===================================================== */
  serviceRecommendations: [],
  productRecommendations: [],
  loading: false,
  error: null,

  /* =====================================================
  | GET SERVICE RECOMMENDATIONS
  ===================================================== */
  fetchServiceRecommendations: async (itemIds = [], options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await recommendationService.getRecommendServices(
        itemIds,
        options
      );

      set({
        serviceRecommendations: res?.data?.recommendedItemIds || [],
        loading: false,
      });

      return res;
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch service recommendations",
      });
      throw error;
    }
  },

  /* =====================================================
  | GET PRODUCT RECOMMENDATIONS
  ===================================================== */
  fetchProductRecommendations: async (itemIds = [], options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await recommendationService.getRecommendProducts(
        itemIds,
        options
      );

      set({
        productRecommendations: res?.data?.recommendedItemIds || [],
        loading: false,
      });

      return res;
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch product recommendations",
      });
      throw error;
    }
  },

  /* =====================================================
  | RESET STATE
  ===================================================== */
  resetRecommendations: () => {
    set({
      serviceRecommendations: [],
      productRecommendations: [],
      loading: false,
      error: null,
    });
  },
}));

export default useRecommendationStore;