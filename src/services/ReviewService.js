import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
| CREATE PRODUCT REVIEW
|--------------------------------------------------------------------------
*/
const createProductReview = async (
  {
    productId,
    rating,
    comment,
  },
  options = {}
) => {
  if (!productId) {
    throw new Error(
      "productId is required"
    );
  }

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.ProductReview.CREATE_REVIEW,
      {
        productId: Number(productId),
        rating: Number(rating),
        comment,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Review created successfully",
  };
};

/*
|--------------------------------------------------------------------------
| CREATE SERVICE REVIEW
|--------------------------------------------------------------------------
*/
const createServiceReview = async (
  {
    serviceId,
    rating,
    comment,
  },
  options = {}
) => {
  if (!serviceId) {
    throw new Error(
      "serviceId is required"
    );
  }

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.PetServiceReviews
        .CREATE_REVIEW,
      {
        serviceId: Number(serviceId),
        rating: Number(rating),
        comment,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Review created successfully",
  };
};

export default {
  setApi,
  createProductReview,
  createServiceReview,
};