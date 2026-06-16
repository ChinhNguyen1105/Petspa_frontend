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
| MAPPER
|--------------------------------------------------------------------------
*/
const mapRoleRequest = (
  request
) => ({
  id: request.id,

  name: request.name,

  description:
    request.description,

  permissions:
    request.permissions?.map(
      (permission) => ({
        id:
          permission.id ??
          permission,
      })
    ) || [],
});

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/
const createRole = async (
  request,
  options = {}
) => {
  const payload =
    mapRoleRequest(request);

  delete payload.id;

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Role.CREATE_ROLE,
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
const updateRole = async (
  request,
  options = {}
) => {
  const payload =
    mapRoleRequest(request);

  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Role.UPDATE_ROLE,
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
const getRoles = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Role.GET_ALL_ROLES,
      {
        params,
      }
    );
    console.log("all role = ", resp);
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
const getRoleById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Role.GET_ROLE_BY_ID.replace(
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
    description: "",
    activeFlag: true,
    permissions: [],
  };
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
const deleteRole = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Role.DELETE_ROLE.replace(
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
      "Delete role successfully",
  };
};

const RoleService = {
  setApi,

  createRole,
  updateRole,

  getRoles,
  getRoleById,

  deleteRole,
};

export default RoleService;