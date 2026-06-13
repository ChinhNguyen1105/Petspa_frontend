import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { userMock } from "../assets/data/mocks/user/userList";

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
| GET USERS
|--------------------------------------------------------------------------
*/
const getUsers = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.User.GET_USERS,
      {
        params,
      }
    );
    console.log("getUsers", resp);
    return resp.data;
  }

  await delay(500);

  let filteredResult = [
    ...userMock.result,
  ];

  const {
    keyword,
    role,
    activeFlag,
    deleteFlag,
    page = 1,
    pageSize = 10,
  } = params;

  // SEARCH
  if (keyword) {
    const cleanKeyword =
      keyword
        .trim()
        .toLowerCase();

    filteredResult =
      filteredResult.filter(
        (user) =>
          user.name
            ?.toLowerCase()
            .includes(
              cleanKeyword
            ) ||
          user.email
            ?.toLowerCase()
            .includes(
              cleanKeyword
            )
      );
  }

  // FILTER ROLE
  if (
    role &&
    role !== "ALL"
  ) {
    filteredResult =
      filteredResult.filter(
        (user) =>
          user.roleName === role
      );
  }

  // FILTER ACTIVE
  if (
    activeFlag !== undefined &&
    activeFlag !== null &&
    activeFlag !== ""
  ) {
    const isActive =
      activeFlag === true ||
      activeFlag === "true";

    filteredResult =
      filteredResult.filter(
        (user) =>
          user.activeFlag ===
          isActive
      );
  }

  // FILTER DELETE
  if (
    deleteFlag !== undefined &&
    deleteFlag !== null &&
    deleteFlag !== ""
  ) {
    const isDeleted =
      deleteFlag === true ||
      deleteFlag === "true";

    filteredResult =
      filteredResult.filter(
        (user) =>
          user.deleteFlag ===
          isDeleted
      );
  }

  const totalItems =
    filteredResult.length;

  const totalPages =
    Math.ceil(
      totalItems / pageSize
    ) || 1;

  const startIndex =
    (page - 1) * pageSize;

  const paginatedResult =
    filteredResult.slice(
      startIndex,
      startIndex +
        Number(pageSize)
    );

  return {
    success: true,
    message:
      "Get users successfully",
    data: {
      meta: {
        page: Number(page),
        pageSize:
          Number(pageSize),
        pages: totalPages,
        total: totalItems,
      },
      result: paginatedResult,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET USER DETAIL
|--------------------------------------------------------------------------
*/
const getUserById = async (
  userId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.User.GET_USER.replace(
        "{id}",
        userId
      )
    );

    return resp.data;
  }

  await delay(500);

  const user =
    userMock.result.find(
      (u) =>
        String(u.id) ===
        String(userId)
    );

  return {
    success: true,
    message:
      "Get user detail successfully",
    data: user || null,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/
const createUser = async (
  userData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.User.CREATE_USER,
      userData
    );
    console.log("user create:", userData);
    return resp.data;
  }

  await delay(800);

  return {
    success: true,
    message:
      "Create user successfully",
    data: {
      id: `USR${String(
        Date.now()
      ).slice(-3)}`,

      activeFlag: true,
      deleteFlag: false,

      createdBy:
        "admin@gmail.com",

      lastModifiedBy:
        "admin@gmail.com",

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),

      ...userData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/
const updateUser = async (
  userId,
  userData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.User.UPDATE_USER,
      {
        id: userId,
        ...userData,
      }
    );

    return resp.data;
  }

  await delay(700);

  return {
    success: true,
    message:
      "Update user successfully",
    data: {
      id: userId,

      ...userData,

      lastModifiedBy:
        "admin@gmail.com",

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE USER STATUS
|--------------------------------------------------------------------------
*/
const updateUserStatus =
  async (
    userId,
    activeFlag,
    options = {}
  ) => {
    if (
      shouldUseApi(options)
    ) {
      const resp =
        await api.patch(
          URL_CONSTANT.User.CHANGE_USER_STATUS.replace(
            "{id}",
            userId
          ),
          {
            activeFlag,
          }
        );

      return resp.data;
    }

    await delay(500);

    return {
      success: true,
      message: activeFlag
        ? "Activate user successfully"
        : "Deactivate user successfully",

      data: {
        id: userId,

        activeFlag,

        lastModifiedBy:
          "admin@gmail.com",

        lastModifiedDate:
          new Date().toISOString(),
      },
    };
  };

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/
const deleteUser = async (
  userId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp =
      await api.delete(
        URL_CONSTANT.User.DELETE_USER.replace(
          "{id}",
          userId
        )
      );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      "Delete user successfully",

    data: {
      id: userId,

      deleteFlag: true,

      lastModifiedBy:
        "admin@gmail.com",

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

export default {
  setApi,

  getUsers,
  getUserById,

  createUser,
  updateUser,

  updateStatus:
    updateUserStatus,

  deleteUser,
};