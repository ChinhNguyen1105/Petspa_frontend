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

    const categories =
      resp.data?.data || [];

    return {
      success:
        resp.data?.status === "SUCCESS",

      message:
        resp.data?.message ||
        "Get categories successfully",

      data: {
        result: categories,
        meta: {
          page: 1,
          pageSize: categories.length,
          total: categories.length,
          pages: 1,
        },
      },
    };
  }

  await delay(500);

  let result = [...categoryMock.result];

  const { keyword, type } = params;

  if (keyword) {
    result = result.filter((cat) =>
      cat.name
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    );
  }

  if (type) {
    result = result.filter(
      (cat) =>
        cat.categoryType === type
    );
  }

  return {
    success: true,
    message:
      categoryMock.message ||
      "Get categories successfully",
    data: {
      result,
      meta: {
        ...(categoryMock.meta || {}),
        total: result.length,
      },
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

    return {
      success:
        resp.data?.status === "SUCCESS",
      message:
        resp.data?.message || "",
      data: resp.data?.data || null,
    };
  }

  await delay(300);

  const category =
    categoryMock.result.find(
      (item) =>
        item.id === Number(id)
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

    return {
      success:
        resp.data?.status === "SUCCESS",
      message:
        resp.data?.message || "",
      data: resp.data?.data,
    };
  }

  await delay(400);

  return {
    success: true,
    message:
      "Create category successfully",
    data: {
      id: Date.now(),
      name: categoryData.name,
      categoryType:
        categoryData.categoryType,

      activeFlag: true,
      deleteFlag: false,
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

    return {
      success:
        resp.data?.status === "SUCCESS",
      message:
        resp.data?.message || "",
      data: resp.data?.data,
    };
  }

  await delay(400);

  return {
    success: true,
    message:
      "Update category successfully",
    data: {
      id: Number(id),
      ...categoryData,
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

    return {
      success:
        resp.data?.status === "SUCCESS",
      message:
        resp.data?.message || "",
      data: resp.data?.data,
    };
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