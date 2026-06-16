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

const shouldUseApi = (
  options = {}
) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/* ───────────────────────── NORMALIZE ───────────────────────── */

const normalizeService = (
  item
) => ({
  id: item.id,

  name: item.name,
  description:
    item.description,

  basePrice:
    item.basePrice,

  durationMin:
    item.durationMin,

  categoryId:
    item.categoryId,

  categoryName:
    item.categoryName,

  serviceImages:
    item.serviceImages ||
    [],

  averageRating:
    item.averageRating || 0,

  totalReviews:
    item.totalReviews || 0,

  createdDate:
    item.createdDate,

  lastModifiedDate:
    item.lastModifiedDate,
});

/* ───────────────────────── GET ALL ───────────────────────── */

const getServices = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp =
      await api.get(
        URL_CONSTANT.PetService
          .GET_ALL_SERVICES,
        {
          params,
        }
      );
    console.log("get services: ", resp);
    const data =
      resp.data?.data ||
      resp.data;

    return {
      success: true,

      data: {
        meta:
          data?.meta || {},

        result:
          data?.result?.map(
            normalizeService
          ) || [],
      },
    };
  }

  await delay(300);

  return {
    success: true,
    data: {
      meta: {},
      result: [],
    },
  };
};

/* ───────────────────────── SEARCH ───────────────────────── */

const searchServices =
  async (
    keyword,
    params = {},
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.get(
          URL_CONSTANT.PetService
            .SEARCH_SERVICES,
          {
            params: {
              keyword,
              ...params,
            },
          }
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,

        data: {
          meta:
            data?.meta || {},

          result:
            data?.result?.map(
              normalizeService
            ) || [],
        },
      };
    }

    await delay(300);

    return {
      success: true,
      data: {
        meta: {},
        result: [],
      },
    };
  };

/* ───────────────────────── BY CATEGORY ───────────────────────── */

const getServicesByCategory =
  async (
    categoryId,
    params = {},
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.get(
          URL_CONSTANT.PetService.GET_SERVICES_BY_CATEGORY.replace(
            "{categoryId}",
            categoryId
          ),
          {
            params,
          }
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,

        data: {
          meta:
            data?.meta || {},

          result:
            data?.result?.map(
              normalizeService
            ) || [],
        },
      };
    }

    await delay(300);

    return {
      success: true,
      data: {
        meta: {},
        result: [],
      },
    };
  };

/* ───────────────────────── TOP SERVICES ───────────────────────── */

const getTopServices =
  async (
    limit = 10,
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.get(
          URL_CONSTANT.PetService
            .GET_TOP_SERVICES,
          {
            params: { limit },
          }
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,

        data:
          data?.map(
            normalizeService
          ) || [],
      };
    }

    await delay(300);

    return {
      success: true,
      data: [],
    };
  };

/* ───────────────────────── DETAIL ───────────────────────── */

const getServiceById =
  async (
    serviceId,
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.get(
          URL_CONSTANT.PetService.GET_SERVICE.replace(
            "{id}",
            serviceId
          )
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,
        data:
          normalizeService(
            data
          ),
      };
    }

    await delay(300);

    return {
      success: true,
      data: null,
    };
  };

/* ───────────────────────── CREATE ───────────────────────── */

const createService =
  async (
    payload,
    options = {}
  ) => {
    console.log("payload create service: ", payload);
    const request = {
      name: payload.name,

      description:
        payload.description,

      basePrice: Number(
        payload.basePrice
      ),

      durationMin:
        Number(
          payload.durationMin
        ),

      categoryId:
        Number(
          payload.categoryId
        ),
    };

    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.post(
          URL_CONSTANT.PetService
            .CREATE_SERVICE,
          request
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,
        data:
          normalizeService(
            data
          ),
      };
    }

    await delay(300);

    return {
      success: true,
      data: request,
    };
  };

/* ───────────────────────── UPDATE ───────────────────────── */

const updateService =
  async (
    serviceId,
    payload,
    options = {}
  ) => {
    const request = {
      id: Number(
        serviceId
      ),

      name: payload.name,

      description:
        payload.description,

      basePrice:
        payload.basePrice,

      durationMin:
        payload.durationMin,

      categoryId:
        payload.categoryId,
    };

    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.put(
          URL_CONSTANT.PetService
            .UPDATE_SERVICE,
          request
        );

      const data =
        resp.data?.data ||
        resp.data;

      return {
        success: true,
        data:
          normalizeService(
            data
          ),
      };
    }

    await delay(300);

    return {
      success: true,
      data: request,
    };
  };

/* ───────────────────────── DELETE ───────────────────────── */

const deleteService =
  async (
    serviceId,
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.delete(
          URL_CONSTANT.PetService.DELETE_SERVICE.replace(
            "{id}",
            serviceId
          )
        );

      return (
        resp.data?.data ||
        resp.data
      );
    }

    await delay(300);

    return {
      status: true,
      message:
        "Delete service successfully",
    };
  };

export default {
  setApi,

  getServices,
  searchServices,

  getTopServices,

  getServicesByCategory,

  getServiceById,

  createService,
  updateService,
  deleteService,
};