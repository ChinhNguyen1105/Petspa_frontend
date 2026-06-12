import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { categoryMock } from "../assets/data/mocks/categories/categoryMock";

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
| GET CATEGORIES
|--------------------------------------------------------------------------
*/
const getCategories = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Category.GET_CATEGORIES,
      { params }
    );

    return resp.data;
  }

  await delay(500);

  let result = [...categoryMock.result];
  const { keyword, type } = params;

  if (keyword) { result = result.filter((cat) => cat.name?.toLowerCase().includes(keyword.toLowerCase())); }
  // FILTER by type (PRODUCT | SERVICE) 
  if (type) { result = result.filter( (cat) => cat.categoryType === type ); }
  
console.log("result from service: ", result);
  return {
    success: true,
    message:
      categoryMock.message ||
      "Get categories successfully",
    data: {
      meta: {
        ...(categoryMock.meta || {}),
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY DETAIL
|--------------------------------------------------------------------------
*/
const getCategoryById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Category.GET_CATEGORY.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(300);

  const category =
    categoryMock.result.find(
      (item) => item.id === Number(id)
    ) || null;

  return {
    success: !!category,
    message: category
      ? "Get category successfully"
      : "Category not found",
    data: category,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/
const createCategory = async (
  categoryData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Category.CREATE_CATEGORY,
      categoryData
    );

    return resp.data;
  }

  await delay(400);

  return {
    success: true,
    message: "Create category successfully",
    data: {
      id: Date.now(),

      name: categoryData.name,

      type: categoryData.type,

      description:
        categoryData.description || "",

      activeFlag: true,
      deleteFlag: false,

      createdBy: "admin@gmail.com",
      lastModifiedBy: "admin@gmail.com",

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/
const updateCategory = async (
  id,
  categoryData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Category.UPDATE_CATEGORY,
      {
        id,
        ...categoryData,
      }
    );

    return resp.data;
  }

  await delay(400);

  return {
    success: true,
    message: "Update category successfully",
    data: {
      id: Number(id),

      ...categoryData,

      lastModifiedBy:
        "staff@gmail.com",

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/
const deleteCategory = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Category.DELETE_CATEGORY.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: `Deleted category #${id} successfully`,
  };
};

export default {
  setApi,

  getCategories,
  getCategoryById,

  createCategory,
  updateCategory,
  deleteCategory,
};