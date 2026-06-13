import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";
import { cartMock } from "../assets/data/mocks/cart/cartMock";

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
| GET CART
|--------------------------------------------------------------------------
*/
const getCart = async (options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Cart.GET_CART
    );

    return resp.data;
  }

  await delay(400);

  return {
    status: "SUCCESS",
    data: cartMock.data,
  };
};

/*
|--------------------------------------------------------------------------
| ADD TO CART
|--------------------------------------------------------------------------
*/
const addToCart = async (
  productId,
  quantity = 1,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.CartItem.PREFIX,
      {
        productId,
        quantity,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: "Added successfully",
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM (SYNC ID)
|--------------------------------------------------------------------------
*/
const updateCartItem = async (
  id,
  quantity,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.CartItem.PREFIX,
      {
        itemId: id,
        quantity: quantity,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: "Updated successfully",
  };
};

/*
|--------------------------------------------------------------------------
| REMOVE CART ITEM (SYNC ID)
|--------------------------------------------------------------------------
*/
const removeCartItem = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      `${URL_CONSTANT.CartItem.PREFIX}/${id}`
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: "Removed successfully",
  };
};

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/
const clearCart = async (options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Cart.DELETE_CART
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: "Cart cleared",
  };
};

export default {
  setApi,

  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};