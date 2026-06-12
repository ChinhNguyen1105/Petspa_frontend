import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { reviewProduct } from "../assets/data/mocks/review/reviewProduct";
import { reviewService } from "../assets/data/mocks/review/reviewService";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/
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
| CHECK REVIEW ELIGIBILITY
|--------------------------------------------------------------------------
*/
const checkReviewEligibility = async (
  orderId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      `/reviews/eligibility/${orderId}`
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    data: {
      orderId,
      canReview: true,
      status: "COMPLETED",
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET REVIEW ITEMS
|--------------------------------------------------------------------------
*/
const getReviewItems = async (
  orderId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      `/reviews/items/${orderId}`
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Get review items successfully",
    data: [
      {
        type: "PRODUCT",
        targetId: 1,
        name:
          "Thức ăn cho chó Pedigree",
        image:
          "https://picsum.photos/200",
        reviewed: false,
      },
      {
        type: "SERVICE",
        targetId: 1,
        name:
          "Tắm và vệ sinh cho chó",
        image:
          "https://picsum.photos/201",
        reviewed: false,
      },
    ],
  };
};

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/
const createReview = async (
  {
    targetType,
    targetId,
    rating,
    comment,
  },
  options = {}
) => {
  if (shouldUseApi(options)) {
    let resp;

    if (targetType === "PRODUCT") {
      resp = await api.post(
        URL_CONSTANT.ProductReview.CREATE_REVIEW,
        {
          productId: targetId,
          rating,
          comment,
        }
      );
    } else {
      resp = await api.post(
        URL_CONSTANT.PetServiceReviews.CREATE_REVIEW,
        {
          serviceId: targetId,
          rating,
          comment,
        }
      );
    }

    return resp.data;
  }

  await delay(400);

  const review = {
    id: Date.now(),

    userId: 101,
    userName: "Nguyễn Văn A",

    ...(targetType === "PRODUCT"
      ? { productId: targetId }
      : { serviceId: targetId }),

    rating,
    comment,

    createdDate:
      new Date().toISOString(),
  };

  return {
    success: true,
    message:
      "Review created successfully",
    data: review,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE REVIEW
|--------------------------------------------------------------------------
*/
const updateReview = async (
  reviewId,
  {
    rating,
    comment,
  },
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      "/reviews",
      {
        reviewId,
        rating,
        comment,
      }
    );

    return resp.data;
  }

  await delay(400);

  return {
    success: true,
    message:
      "Review updated successfully",
    data: {
      id: reviewId,
      rating,
      comment,

      updatedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
*/
const deleteReview = async (
  reviewId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      `/reviews/${reviewId}`
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Review deleted successfully",
    data: {
      reviewId,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT REVIEWS
|--------------------------------------------------------------------------
*/
const getProductReviews = async (
  productId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.ProductReview.GET_REVIEWS_BY_PRODUCT.replace(
        "{productId}",
        productId
      )
    );

    return resp.data;
  }

  await delay(300);

  const reviews =
    reviewProduct.result;

  return {
    success: true,
    data: reviews,
  };
};

/*
|--------------------------------------------------------------------------
| GET SERVICE REVIEWS
|--------------------------------------------------------------------------
*/
const getServiceReviews = async (
  serviceId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.PetServiceReviews.GET_SERVICE_REVIEWS.replace(
        "{serviceId}",
        serviceId
      )
    );

    return resp.data;
  }

  await delay(300);

  const reviews =
    reviewService.result.filter(
      (item) =>
        String(item.serviceId) ===
        String(serviceId)
    );

  return {
    success: true,
    data: reviews,
  };
};

/*
|--------------------------------------------------------------------------
| GET REVIEWS BY ITEM
|--------------------------------------------------------------------------
*/
const getReviewsByItem = async (
  targetType,
  targetId,
  options = {}
) => {
  if (targetType === "PRODUCT") {
    return getProductReviews(
      targetId,
      options
    );
  }

  if (targetType === "SERVICE") {
    return getServiceReviews(
      targetId,
      options
    );
  }

  return {
    success: false,
    message: "Invalid target type",
    data: [

    ],
  };
};

export default {
  setApi,

  checkReviewEligibility,
  getReviewItems,

  createReview,
  updateReview,
  deleteReview,

  getProductReviews,
  getServiceReviews,
  getReviewsByItem,
};