import api from "./api";
import { APP_CONFIG } from "./config";

import permissionsMock from "../assets/data/mocks/auth/permissionMock";
import { roleMock } from "../assets/data/mocks/auth/roleMock";

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
| PERMISSIONS
|--------------------------------------------------------------------------
*/
const getAllPermissions = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      "/permissions"
    );

    return resp.data;
  }

  await delay(300);

  return permissionsMock;
};

/*
|--------------------------------------------------------------------------
| ROLES
|--------------------------------------------------------------------------
*/
const getAllRoles = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      "/roles"
    );

    return resp.data;
  }

  await delay(300);

  return roleMock;
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
|--------------------------------------------------------------------------
*/
const updateRolePermissions = async (
  roleId,
  permissionIds,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      `/roles/${roleId}/permissions`,
      {
        permissionIds,
      }
    );

    return resp.data;
  }

  await delay(300);

  const targetRole =
    roleMock.data.find(
      (role) =>
        String(role.id) ===
        String(roleId)
    );

  if (targetRole) {
    targetRole.permissionIds =
      permissionIds;
  }

  return {
    success: true,
    message:
      "Update role permissions successfully",
    data: {
      roleId,
      permissionIds,
    },
  };
};

export default {
  setApi,

  getAllPermissions,

  getAllRoles,
  updateRolePermissions,
};