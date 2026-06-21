import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { inventoryMock } from "../assets/data/mocks/warehouse/inventoryList";
import { inventoryTransactionMock } from "../assets/data/mocks/warehouse/inventoryTransaction";

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
| GET INVENTORY
|--------------------------------------------------------------------------
*/
/* Chuyền params vào */
const getInventory = async (
  params = {},
  options = {}
) => {
  console.log("params", params);
  if (shouldUseApi(options)) {
    // Nếu bạn cần xử lý field trùng lặp như productId/id trước khi gửi lên API
    const queryParams = { ...params };
    if (queryParams.id && !queryParams.productId) {
      queryParams.productId = queryParams.id;
    }

    // Truyền params vào object config (đối số thứ 2 của api.get)
    const resp = await api.get(
      URL_CONSTANT.Inventory.GET_INVENTORY_LIST,
      { params: queryParams } // <-- Thêm dòng này
    );
    console.log("getInventory", resp);

    return resp.data;
  }
};

/*
|--------------------------------------------------------------------------
| GET TRANSACTIONS
|--------------------------------------------------------------------------
*/
const getTransactions = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Inventory.GET_INVENTORY_TRANSACTION_HISTORY,
      {
        params,
      }
    );
    console.log("resp transaction :", resp);
    return resp.data;
  }
  await delay(500);

  let result = [
    ...inventoryTransactionMock.result,
  ];

  const {
    keyword,
    productId,
    type,
    fromDate,
    toDate,
  } = params;

  // SEARCH
  if (keyword) {
    result = result.filter((item) =>
      item.productName
        ?.toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
    );
  }

  // FILTER PRODUCT
  if (productId) {
    result = result.filter(
      (item) =>
        String(item.productId) ===
        String(productId)
    );
  }

  // FILTER TYPE
  if (type) {
    result = result.filter(
      (item) =>
        item.type === type
    );
  }

  // FILTER FROM DATE
  if (fromDate) {
    result = result.filter(
      (item) =>
        new Date(
          item.createdDate
        ) >=
        new Date(fromDate)
    );
  }

  // FILTER TO DATE
  if (toDate) {
    result = result.filter(
      (item) =>
        new Date(
          item.createdDate
        ) <=
        new Date(toDate)
    );
  }

  return {
    success: true,
    message:
      inventoryTransactionMock.message ||
      "Get inventory transactions successfully",

    data: {
      meta: {
        ...(inventoryTransactionMock.meta ||
          {}),
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| CREATE TRANSACTION
|--------------------------------------------------------------------------
*/
const createTransaction = async (
  transactionData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const type =
      transactionData.type ||
      "IMPORT";

    let resp;

    switch (type) {
      case "IMPORT":
        resp = await api.post(
          URL_CONSTANT.Inventory.IMPORT_PRODUCT,
          transactionData
        );
        break;

      case "EXPORT":
        resp = await api.post(
          URL_CONSTANT.Inventory.EXPORT_PRODUCT,
          transactionData
        );
        break;

      case "ADJUST":
        resp = await api.post(
          URL_CONSTANT.Inventory.ADJUST_PRODUCT,
          transactionData
        );
        break;

      default:
        throw new Error(
          `Unsupported transaction type: ${type}`
        );
    }

    return resp.data;
  }

  await delay(700);

  const type =
    transactionData.type ||
    "IMPORT";

  return {
    success: true,

    message:
      type === "IMPORT"
        ? "Import stock successfully"
        : type === "EXPORT"
        ? "Export stock successfully"
        : "Adjust stock successfully",

    data: {
      productId: Number(
        transactionData.productId
      ),

      productName:
        transactionData.productName,

      type,

      quantity: Number(
        transactionData.quantity
      ),

      currentStock:
        Number(
          transactionData.currentStock
        ) || 0,

      note:
        transactionData.note || "",

      createdBy:
        "admin@gmail.com",

      lastModifiedBy:
        "admin@gmail.com",

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

const importProduct = async (
  request,
  options = {}
) => {

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Inventory.IMPORT_PRODUCT,
      request
    );

    return resp.data;
  }

  await delay(500);

  return {
    status: "SUCCESS",
    data: {
      ...request,
    },
  };
};

const exportProduct = async (
  request,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Inventory.EXPORT_PRODUCT,
      request
    );

    return resp.data;
  }

  await delay(500);

  return {
    status: "SUCCESS",
    data: {
      ...request,
    },
  };
};

const adjustProduct = async (
  request,
  options = {}
) => {
  console.log("request: ", request);
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Inventory.ADJUST_PRODUCT,
      request
    );

    return resp.data;
  }

  await delay(500);

  return {
    status: "SUCCESS",
    data: {
      ...request,
    },
  };
};

export default {
  setApi,
  getInventory,
  getTransactions,
  createTransaction,
  importProduct,
  exportProduct,
  adjustProduct
};