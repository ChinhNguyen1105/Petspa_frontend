import loginMock from "../assets/data/mocks/auth/loginMock";
import registerMock from "../assets/data/mocks/auth/registerMock";
import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";
import { APP_CONFIG } from "./config";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const login = async (loginData, options = {}) => {
  const useReal = options.api !== undefined ? !!options.api : useApi;

  if (useReal) {
    const resp = await api.post(URL_CONSTANT.Auth.LOGIN, loginData);
    return resp.data;
  }

  await delay(800);

  const { email } = loginData;
  const mockUser = loginMock.data.resLoginDTO.user;

  // Giả lập kiểm tra nếu email khớp với tài khoản mock admin
  if (email !== mockUser.email) {
    throw {
      response: {
        data: {
          message: "Email hoặc mật khẩu không chính xác",
        },
      },
    };
  }

  return {
    success: true,
    message: "Login successfully",
    data: loginMock.data,
  };
};

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/
const register = async (registerData, options = {}) => {
  const useReal = options.api !== undefined ? !!options.api : useApi;

  // ========================
  // PAYLOAD CHỈ THEO BACKEND
  // ========================
  const payload = {
    name: registerData.name,
    email: registerData.email,
    password: registerData.password,
    confirmPassword: registerData.confirmPassword,
  };

  if (useReal) {
    const resp = await api.post(
      URL_CONSTANT.Auth.REGISTER, payload
    );
    return resp.data;
  }

};

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/
const getProfile = async (options = {}) => {
  const useReal = options.api !== undefined ? !!options.api : useApi;

  if (useReal) {
    const resp = await api.get(URL_CONSTANT.User.GET_CURRENT_USER);
    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message: "Get profile successfully",
    data: loginMock.data.resLoginDTO.user,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/
const updateProfile = async (profileData, options = {}) => {
  const useReal = options.api !== undefined ? !!options.api : useApi;

  if (useReal) {
    const resp = await api.put(URL_CONSTANT.User.UPDATE_USER, profileData);
    return resp.data;
  }

  await delay(700);

  return {
    success: true,
    message: "Update profile successfully",
    data: {
      ...loginMock.data.resLoginDTO.user,
      ...profileData,
      updatedAt: new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/
const logout = async (options = {}) => {
  const useReal = options.api !== undefined ? !!options.api : useApi;

  if (useReal) {
    const resp = await api.post(URL_CONSTANT.Auth.LOGOUT);
    return resp.data;
  }

  await delay(300);

  return {
    success: true,
    message: "Logout successfully",
  };
};

export default {
  setApi,
  login,
  register,
  getProfile,
  updateProfile,
  logout,
};