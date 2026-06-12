import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { serviceMock } from "../assets/data/mocks/service/serviceMock";
import { serviceDetailMock } from "../assets/data/mocks/service/serviceDetailMock";

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
| GET SERVICES
|--------------------------------------------------------------------------
*/
const getServices = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.PetService.SEARCH_SERVICES,
      {
        params,
      }
    );

    return resp.data;
  }

  await delay(500);

  let result = [...serviceMock.result];

  const {
    keyword,
    categoryId,
    page = 1,
    pageSize = 10,
  } = params;

  // SEARCH
  if (keyword) {
    result = result.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          keyword
            .toLowerCase()
            .trim()
        )
    );
  }

  // FILTER CATEGORY
  if (categoryId) {
    result = result.filter(
      (item) =>
        String(item.categoryId) ===
        String(categoryId)
    );
  }

  const total = result.length;
  const totalPages =
    Math.ceil(total / pageSize) || 1;

  const startIndex =
    (page - 1) * pageSize;

  const endIndex =
    startIndex + pageSize;

  const paginatedResult =
    result.slice(
      startIndex,
      endIndex
    );

  return {
    success: true,
    message:
      "Get services successfully",
    data: {
      meta: {
        page: Number(page),
        pageSize:
          Number(pageSize),
        total,
        pages: totalPages,
      },
      result: paginatedResult,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SERVICES BY CATEGORY
|--------------------------------------------------------------------------
*/
const getServicesByCategory =
  async (
    categoryId,
    options = {}
  ) => {
    if (shouldUseApi(options)) {
      const resp = await api.get(
        URL_CONSTANT.PetService.GET_SERVICES_BY_CATEGORY.replace(
          "{categoryId}",
          categoryId
        )
      );

      return resp.data;
    }

    await delay(500);

    const result =
      serviceMock.result.filter(
        (item) =>
          String(
            item.categoryId
          ) ===
          String(categoryId)
      );

    return {
      success: true,
      message:
        "Get services by category successfully",
      data: result,
    };
  };

/*
|--------------------------------------------------------------------------
| GET SERVICE DETAIL
|--------------------------------------------------------------------------
*/
const getServiceById = async (
  serviceId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.PetService.GET_SERVICE.replace(
        "{id}",
        serviceId
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      serviceDetailMock.message ||
      "Get service successfully",
    data: {
      ...serviceDetailMock.data,
      id: Number(serviceId),
    },
  };
};

/*
|--------------------------------------------------------------------------
| CREATE SERVICE
|--------------------------------------------------------------------------
*/
const createService = async (
  serviceData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.PetService.CREATE_SERVICE,
      serviceData
    );

    return resp.data;
  }

  await delay(800);

  return {
    success: true,
    message:
      "Create service successfully",
    data: {
      id: Date.now(),

      name:
        serviceData.name,

      description:
        serviceData.description,

      basePrice:
        Number(
          serviceData.basePrice
        ) || 0,

      durationMin:
        Number(
          serviceData.durationMin
        ) || 0,

      categoryId:
        Number(
          serviceData.categoryId
        ) || null,

      categoryName:
        serviceData.categoryName ||
        "",

      status: "ACTIVE",

      serviceImages:
        serviceData.serviceImages ||
        [],

      averageRating: 0,
      totalReviews: 0,

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE SERVICE
|--------------------------------------------------------------------------
*/
const updateService = async (
  serviceId,
  serviceData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.PetService.UPDATE_SERVICE,
      {
        id: serviceId,
        ...serviceData,
      }
    );

    return resp.data;
  }

  await delay(700);

  return {
    success: true,
    message:
      "Update service successfully",
    data: {
      id: Number(serviceId),

      ...serviceData,

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE SERVICE
|--------------------------------------------------------------------------
*/
const deleteService = async (
  serviceId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.PetService.DELETE_SERVICE.replace(
        "{id}",
        serviceId
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message: `Delete service #${serviceId} successfully`,
    data: null,
  };
};

export default {
  setApi,

  getServices,
  getServicesByCategory,
  getServiceById,

  createService,
  updateService,
  deleteService,
};