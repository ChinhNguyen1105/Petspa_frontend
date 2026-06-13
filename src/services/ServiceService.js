import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined ? !!options.api : useApi;

/* ───────────────────────── NORMALIZER ───────────────────────── */
const unwrap = (res) => {
  return res?.data?.data ?? res?.data ?? res;
};

/* ───────────────────────── GET SERVICES ───────────────────────── */
const getServices = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(URL_CONSTANT.PetService.GET_ALL_SERVICES, {
      params,
    });

    const data = unwrap(res);

    return {
      success: res?.status === 200,
      message: "Get services successfully",
      data: {
        meta: data?.meta || {
          page: 0,
          pageSize: 0,
          total: 0,
          pages: 0,
        },
        result: data?.result || [],
      },
    };
  }

  await delay(300);

  return {
    success: true,
    data: { meta: {}, result: [] },
  };
};

/* ───────────────────────── BY CATEGORY ───────────────────────── */
const getServicesByCategory = async (categoryId, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.PetService.GET_SERVICES_BY_CATEGORY.replace(
        "{categoryId}",
        categoryId
      )
    );

    return unwrap(res);
  }

  await delay(300);

  return {
    success: true,
    data: [],
  };
};

/* ───────────────────────── DETAIL ───────────────────────── */
const getServiceById = async (serviceId, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.PetService.GET_SERVICE.replace("{id}", serviceId)
    );
    console.log("getServiceById:", res);
    return unwrap(res);
  }

  await delay(200);

  return {
    success: true,
    data: null,
  };
};

/* ───────────────────────── CREATE ───────────────────────── */
const createService = async (serviceData, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.post(
      URL_CONSTANT.PetService.CREATE_SERVICE,
      serviceData
    );

    return unwrap(res);
  }

  await delay(500);

  return {
    success: true,
    data: {
      id: Date.now(),
      ...serviceData,
    },
  };
};

/* ───────────────────────── UPDATE ───────────────────────── */
const updateService = async (serviceId, serviceData, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.put(
      URL_CONSTANT.PetService.UPDATE_SERVICE,
      {
        id: serviceId,
        ...serviceData,
      }
    );

    return unwrap(res);
  }

  await delay(400);

  return {
    success: true,
    data: {
      id: serviceId,
      ...serviceData,
    },
  };
};

/* ───────────────────────── DELETE ───────────────────────── */
const deleteService = async (serviceId, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.delete(
      URL_CONSTANT.PetService.DELETE_SERVICE.replace("{id}", serviceId)
    );

    return unwrap(res);
  }

  await delay(300);

  return {
    success: true,
    data: null,
  };
};

/* ───────────────────────── EXPORT ───────────────────────── */
export default {
  setApi,
  getServices,
  getServicesByCategory,
  getServiceById,
  createService,
  updateService,
  deleteService,
};