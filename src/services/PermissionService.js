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
| CREATE
|--------------------------------------------------------------------------
*/
const createPermission = async (
  request,
  options = {}
) => {
  const payload = {
    name: request.name,
    apiPath: request.apiPath,
    method: request.method,
    module: request.module,
  };

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Permission.CREATE_PERMISSION,
      payload
    );

    return resp.data;
  }

  await delay(500);

  return {
    id: Date.now(),
    ...payload,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/
const updatePermission = async (
  request,
  options = {}
) => {
  const payload = {
    id: request.id,
    name: request.name,
    apiPath: request.apiPath,
    method: request.method,
    module: request.module,
  };

  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Permission.UPDATE_PERMISSION,
      payload
    );

    return resp.data;
  }

  await delay(500);

  return payload;
};

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/
const getPermissions = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Permission.GET_ALL_PERMISSIONS,
      {
        params,
      }
    );

    return resp.data;
  }

  await delay(500);

  return {
    meta: {
      page: 1,
      pageSize: 10,
      pages: 1,
      total: 0,
    },
    result: [],
  };
};

/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/
const getPermissionById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Permission.GET_PERMISSION_BY_ID.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    id,
    name: "",
    apiPath: "",
    method: "",
    module: "",
  };
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
const deletePermission = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Permission.DELETE_PERMISSION.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    status: true,
    message:
      "Delete permission successfully",
  };
};

const PermissionService = {
  setApi,

  createPermission,
  updatePermission,

  getPermissions,
  getPermissionById,

  deletePermission,
};

export default PermissionService;