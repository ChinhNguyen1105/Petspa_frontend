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
| GET ALL MENUS
|--------------------------------------------------------------------------
*/
const getMenus = async (
  params = {},
  options = {}
) => {
   
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Menu.GET_ALL_MENUS,
      {
        params,
      }
    );
      console.log("menu from service:", resp);
    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    data: [],
  };
};

/*
|--------------------------------------------------------------------------
| GET MENU TREE
|--------------------------------------------------------------------------
*/
const getMenuTree = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Menu.GET_MENUS_TREE
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    data: [],
  };
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE MENUS
|--------------------------------------------------------------------------
*/
const getActiveMenus = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Menu.GET_ACTIVE_MENUS
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    data: [],
  };
};

/*
|--------------------------------------------------------------------------
| GET MENU BY ID
|--------------------------------------------------------------------------
*/
const getMenuById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Menu.GET_MENU.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    data: null,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE MENU
|--------------------------------------------------------------------------
*/
const createMenu = async (
  menuData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Menu.CREATE_MENU,
      {
        name: menuData.name,
        path: menuData.path,
        icon: menuData.icon,
        parentId:
          menuData.parentId || null,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Create menu successfully",
    data: {
      id: Date.now(),
      ...menuData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE MENU
|--------------------------------------------------------------------------
*/
const updateMenu = async (
  id,
  menuData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Menu.UPDATE_MENU.replace(
        "{id}",
        id
      ),
      {
        name: menuData.name,
        path: menuData.path,
        icon: menuData.icon,
        parentId:
          menuData.parentId || null,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Update menu successfully",
    data: {
      id,
      ...menuData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE MENU
|--------------------------------------------------------------------------
*/
const deleteMenu = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Menu.DELETE_MENU.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Delete menu successfully",
  };
};

export default {
  setApi,

  getMenus,
  getMenuTree,
  getActiveMenus,
  getMenuById,

  createMenu,
  updateMenu,
  deleteMenu,
};