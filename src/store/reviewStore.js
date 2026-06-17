import { create } from "zustand";
import ReviewService from "../services/ReviewService";

const toArray = (data) =>
  Array.isArray(data)
    ? data
    : data?.result || [];

export const useReviewStore = create(
  (set, get) => ({
    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    reviews: [],
    productReviewData: null,

    averageRating: 0,
    reviewCount: 0,

    meta: {
      page: 1,
      pageSize: 10,
      pages: 0,
      total: 0,
    },

    loading: false,
    error: null,

    /*
    |--------------------------------------------------------------------------
    | PRODUCT REVIEW
    |--------------------------------------------------------------------------
    */

    fetchProductReviews:
      async (
        productId,
        params = {}
      ) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.getProductReviews(
              productId,
              params
            );

          const data =
            response?.data ||
            response;

          set({
            productReviewData:
              data,

            reviews:
              data?.reviews
                ?.result || [],

            meta:
              data?.reviews
                ?.meta || {},

            averageRating:
              data?.avgRating ||
              0,

            reviewCount:
              data?.totalReviews ||
              0,

            loading: false,
          });

          return data;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    createProductReview:
      async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.createProductReview(
              payload
            );

          set({
            loading: false,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    updateProductReview:
      async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.updateProductReview(
              payload
            );

          set({
            loading: false,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    deleteProductReview:
      async (reviewId) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.deleteProductReview(
              reviewId
            );

          set({
            loading: false,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    /*
    |--------------------------------------------------------------------------
    | SERVICE REVIEW
    |--------------------------------------------------------------------------
    */

    fetchServiceReviews:
      async (
        serviceId,
        params = {}
      ) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.getServiceReviews(
              serviceId,
              params
            );

          const data =
            response?.data ||
            response;

          set({
            reviews:
              toArray(data),

            meta:
              data?.meta ||
              {},

            loading: false,
          });

          return data;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    fetchAverageRating:
      async (serviceId) => {
        try {
          const response =
            await ReviewService.getAverageRating(
              serviceId
            );

          const rating =
            response?.data ??
            response ??
            0;

          set({
            averageRating:
              rating,
          });

          return rating;
        } catch (error) {
          set({ error });

          throw error;
        }
      },

    fetchReviewCount:
      async (serviceId) => {
        try {
          const response =
            await ReviewService.getReviewCount(
              serviceId
            );

          const count =
            response?.data ??
            response ??
            0;

          set({
            reviewCount:
              count,
          });

          return count;
        } catch (error) {
          set({ error });

          throw error;
        }
      },

    createServiceReview:
      async (payload) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.createServiceReview(
              payload
            );

          set({
            loading: false,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    deleteServiceReview:
      async (reviewId) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const response =
            await ReviewService.deleteServiceReview(
              reviewId
            );

          set({
            loading: false,
          });

          return response;
        } catch (error) {
          set({
            loading: false,
            error,
          });

          throw error;
        }
      },

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    resetReviews: () =>
      set({
        reviews: [],
        productReviewData:
          null,

        averageRating: 0,
        reviewCount: 0,

        meta: {
          page: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },

        error: null,
      }),
  })
);