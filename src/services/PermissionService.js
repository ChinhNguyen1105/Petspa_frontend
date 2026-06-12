import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import permissionsMock from "../assets/data/mocks/auth/permissionMock";

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
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/
const getPermissions = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    // Nếu sau này backend có API permissions
    const resp = await api.get(
      URL_CONSTANT.Permission
        ?.GET_PERMISSIONS ||
        "/permissions"
    );

    return resp.data;
  }

  await delay(300);

  return permissionsMock;
};

export default {
  setApi,

  getPermissions,
};