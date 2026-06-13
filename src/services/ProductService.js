import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { productDetailMock } from "../assets/data/mocks/product/productDetailMock";
import productList from "../assets/data/mocks/product/productList";

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
| NORMALIZE RESPONSE
|--------------------------------------------------------------------------
*/
const normalizeResponse = (resp) => ({
  success: resp?.data?.status === "SUCCESS",
  message: resp?.data?.message || "",
  data: resp?.data?.data ?? null,
});

/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
*/
const getProducts = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Product.GET_PRODUCTS,
      { params }
    );

    console.log(
      "product from service:",
      resp.data
    );

    return normalizeResponse(resp);
  }

  await delay(500);

  let finalResult = [...productList.result];

  const {
    keyword,
    categoryId,
    status,
    sortBy,
    sortDirection = "asc",
  } = params;

  if (keyword) {
    finalResult = finalResult.filter(
      (product) =>
        product.name
          ?.toLowerCase()
          .includes(
            keyword.toLowerCase()
          )
    );
  }

  if (categoryId) {
    finalResult = finalResult.filter(
      (product) =>
        String(product.categoryId) ===
        String(categoryId)
    );
  }

  if (status) {
    finalResult = finalResult.filter(
      (product) =>
        product.status === status
    );
  }

  if (sortBy) {
    finalResult.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (
        typeof valA === "string" &&
        typeof valB === "string"
      ) {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === "asc"
        ? valA - valB
        : valB - valA;
    });
  }

  return {
    success: true,
    message:
      "Get products successfully",
    data: {
      meta: {
        ...(productList.meta || {}),
        total: finalResult.length,
      },
      result: finalResult,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT DETAIL
|--------------------------------------------------------------------------
*/
const getProductById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Product.GET_PRODUCT.replace(
        "{id}",
        id
      )
    );

    return normalizeResponse(resp);
  }

  await delay(500);

  const isFoundMockDetail =
    String(productDetailMock?.id) ===
    String(id);

  let productData = null;

  if (isFoundMockDetail) {
    productData = productDetailMock;
  } else {
    const basicProduct =
      productList.result.find(
        (product) =>
          String(product.id) ===
          String(id)
      );

    if (basicProduct) {
      productData = {
        ...basicProduct,
        images: [
          {
            id: 1,
            imageUrl:
              basicProduct.thumbnailUrl,
            isThumbnail: true,
          },
        ],
        reviews: [],
      };
    }
  }

  return {
    success: !!productData,
    message: productData
      ? "Get product detail successfully"
      : "Product not found",
    data: productData,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/
const createProduct = async (
  productData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Product.CREATE_PRODUCT,
      productData
    );

    return normalizeResponse(resp);
  }

  await delay(600);

  return {
    success: true,
    message:
      "Create product successfully",
    data: {
      id: Date.now(),

      thumbnailUrl:
        productData.thumbnailUrl ||
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb",

      averageRating: 0,
      reviewCount: 0,

      images: [],
      reviews: [],

      activeFlag: true,
      deleteFlag: false,

      status:
        Number(
          productData.stockQuantity
        ) > 0
          ? "ACTIVE"
          : "OUT_OF_STOCK",

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),

      ...productData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/
const updateProduct = async (
  id,
  productData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Product.UPDATE_PRODUCT,
      {
        id,
        ...productData,
      }
    );

    return normalizeResponse(resp);
  }

  await delay(600);

  return {
    success: true,
    message:
      "Update product successfully",
    data: {
      id: Number(id),

      ...productData,

      status:
        Number(
          productData.stockQuantity
        ) > 0
          ? "ACTIVE"
          : "OUT_OF_STOCK",

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/
const deleteProduct = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Product.DELETE_PRODUCT.replace(
        "{id}",
        id
      )
    );

    return normalizeResponse(resp);
  }

  await delay(400);

  return {
    success: true,
    message: `Delete product #${id} successfully`,
    data: null,
  };
};

export default {
  setApi,

  getProducts,
  getProductById,

  createProduct,
  updateProduct,
  deleteProduct,
};