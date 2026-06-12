import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { cartMock } from "../assets/data/mocks/cart/cartMock";

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
    success: true,
    message: "Get cart successfully",
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
      URL_CONSTANT.CartItem.ADD_CART_ITEM,
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
    message:
      "Product added to cart successfully",
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/
const updateCartItem = async (
  itemId,
  quantity,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.CartItem.UPDATE_CART_ITEM,
      {
        id: itemId,
        quantity,
      }
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Cart item updated successfully",
  };
};

/*
|--------------------------------------------------------------------------
| REMOVE CART ITEM
|--------------------------------------------------------------------------
*/
const removeCartItem = async (
  itemId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.CartItem.DELETE_CART_ITEM.replace(
        "{id}",
        itemId
      )
    );

    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message:
      "Cart item removed successfully",
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

  await delay(200);

  return {
    success: true,
    message:
      "Cart cleared successfully",
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