import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";
import { APP_CONFIG } from "./config";

let useApi = APP_CONFIG.USE_REAL_API;

export const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined ? !!options.api : useApi;

const unwrap = (res) => res?.data ?? res;

/* =====================================================
| GET SERVICE RECOMMENDATIONS
===================================================== */
const getRecommendServices = async (itemIds = [], options = {}) => {
    console.log("REQUEST itemIds:", itemIds);

  if (shouldUseApi(options)) {
  const resp = await api.post(
  URL_CONSTANT.PetService.GET_RECOMMENDATIONS,
  {
    params: {
      itemIds
    }
  }
);
    console.log("PRODUCT RECOMMEND RESPONSE:", resp);

    return unwrap(resp);
  }

  return {
    success: true,
    data: {
      recommendedItemIds: [],
    },
  };
};

/* =====================================================
| GET PRODUCT RECOMMENDATIONS
===================================================== */
const getRecommendProducts = async (itemIds = [], options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Product.GET_RECOMMENDATIONS,
      { itemIds }
    );
    return unwrap(resp);
  }

  return {
    success: true,
    data: {
      recommendedItemIds: [],
    },
  };
};

/* =====================================================
| EXPORT
===================================================== */
const recommendationService = {
  getRecommendServices,
  getRecommendProducts,
  setApi,
};

export default recommendationService;