import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/*
|--------------------------------------------------------------------------
| PRODUCT REVIEW
|--------------------------------------------------------------------------
*/

const getProductReviews = async (
  productId,
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.ProductReview.GET_REVIEWS_BY_PRODUCT.replace(
        "{productId}",
        productId
      ),
      { params }
    );

    return resp.data;
  }

  await delay(300);

  return {
    avgRating: 0,
    totalReviews: 0,
    reviews: {
      meta: {},
      result: [],
    },
  };
};

const createProductReview =
  async (
    request,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.post(
        URL_CONSTANT.ProductReview.CREATE_REVIEW,
        request
      );

      return resp.data;
    }

    await delay(300);

    return request;
  };

const updateProductReview =
  async (
    request,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.put(
        URL_CONSTANT.ProductReview.UPDATE_REVIEW,
        request
      );

      return resp.data;
    }

    await delay(300);

    return request;
  };

const deleteProductReview =
  async (
    reviewId,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.delete(
        URL_CONSTANT.ProductReview.DELETE_REVIEW.replace(
          "{reviewId}",
          reviewId
        )
      );

      return resp.data;
    }

    await delay(300);

    return {
      status: true,
      message:
        "Delete review successfully",
    };
  };

/*
|--------------------------------------------------------------------------
| SERVICE REVIEW
|--------------------------------------------------------------------------
*/

const getServiceReviews = async (
  serviceId,
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.PetServiceReviews.GET_SERVICE_REVIEWS.replace(
        "{serviceId}",
        serviceId
      ),
      { params }
    );
    console.log("get service reviews", resp);
    return resp.data;
  }

  await delay(300);

  return {
    meta: {},
    result: [],
  };
};

const createServiceReview =
  async (
    request,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.post(
        URL_CONSTANT.PetServiceReviews.CREATE_REVIEW,
        request
      );

      return resp.data;
    }

    await delay(300);

    return request;
  };

const deleteServiceReview =
  async (
    reviewId,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.delete(
        URL_CONSTANT.PetServiceReviews.DELETE_REVIEW.replace(
          "{id}",
          reviewId
        )
      );

      return resp.data;
    }

    await delay(300);

    return {
      status: true,
      message:
        "Delete review successfully",
    };
  };

const getAverageRating =
  async (
    serviceId,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.get(
        URL_CONSTANT.PetServiceReviews.GET_AVERAGE_RATING.replace(
          "{serviceId}",
          serviceId
        )
      );

      return resp.data;
    }

    await delay(300);

    return 0;
  };

const getReviewCount =
  async (
    serviceId,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.get(
        URL_CONSTANT.PetServiceReviews.GET_REVIEW_COUNT.replace(
          "{serviceId}",
          serviceId
        )
      );

      return resp.data;
    }

    await delay(300);

    return 0;
  };

const ReviewService = {
  setApi,

  // Product
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,

  // Service
  getServiceReviews,
  createServiceReview,
  deleteServiceReview,
  getAverageRating,
  getReviewCount,
};

export default ReviewService;