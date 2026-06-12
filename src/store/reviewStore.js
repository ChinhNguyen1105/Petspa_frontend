import { create } from "zustand";
import reviewService from "../services/reviewService";

export const useReviewStore = create((set) => ({
  reviews: [],
  reviewItems: [],
  eligibility: null,

  loading: false,
  error: null,

  /*
  |--------------------------------------------------------------------------
  | Check Review Eligibility
  |--------------------------------------------------------------------------
  */
  checkReviewEligibility: async (orderId) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.checkReviewEligibility(orderId);

      set({
        eligibility: response.data,
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get Review Items
  |--------------------------------------------------------------------------
  */
  getReviewItems: async (orderId) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.getReviewItems(orderId);

      set({
        reviewItems: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get Product Reviews
  |--------------------------------------------------------------------------
  */
  getProductReviews: async (productId) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.getProductReviews(productId);
      set({
        reviews: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get Service Reviews
  |--------------------------------------------------------------------------
  */
  getServiceReviews: async (serviceId) => {
     console.log("serviceId:", serviceId, typeof serviceId);
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.getServiceReviews(serviceId);
      console.log("response data:", response.data);
      set({
        reviews: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Get Reviews By Item
  |--------------------------------------------------------------------------
  */
  getReviewsByItem: async (targetType, targetId) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.getReviewsByItem(
          targetType,
          targetId
        );
      set({
        reviews: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Create Review
  |--------------------------------------------------------------------------
  */
  createReview: async (reviewData) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.createReview(reviewData);

      set((state) => ({
        reviews: [response.data, ...state.reviews],
        loading: false,
      }));

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Update Review
  |--------------------------------------------------------------------------
  */
  updateReview: async (reviewId, reviewData) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.updateReview(
          reviewId,
          reviewData
        );

      set((state) => ({
        reviews: state.reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                ...response.data,
              }
            : review
        ),
        loading: false,
      }));

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Review
  |--------------------------------------------------------------------------
  */
  deleteReview: async (reviewId) => {
    try {
      set({ loading: true, error: null });

      const response =
        await reviewService.deleteReview(reviewId);

      set((state) => ({
        reviews: state.reviews.filter(
          (review) => review.id !== reviewId
        ),
        loading: false,
      }));

      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Utilities
  |--------------------------------------------------------------------------
  */
  clearReviews: () =>
    set({
      reviews: [],
    }),

  clearReviewItems: () =>
    set({
      reviewItems: [],
    }),

  clearEligibility: () =>
    set({
      eligibility: null,
    }),

  clearError: () =>
    set({
      error: null,
    }),
}));