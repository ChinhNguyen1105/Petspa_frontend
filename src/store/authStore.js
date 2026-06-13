import { create } from "zustand";
import AuthService from "../services/authService";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/
const getUser = () => {
  try {
    const userStr = localStorage.getItem("petspa_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem("petspa_token");

/*
|--------------------------------------------------------------------------
| AUTH STORE
|--------------------------------------------------------------------------
*/
export const useAuthStore = create((set, get) => ({
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */
  user: getUser(),
  token: getToken(),
  isAuthenticated: !!getUser() && !!getToken(),
  loading: false,
  error: null,

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */
  loginAction: async (credentials) => {
    set({ loading: true, error: null });

    try {
      const res = await AuthService.login(credentials);
      console.log("LOGIN RESPONSE", res);
      // Bóc tách dữ liệu theo cấu trúc mới: res.data.resLoginDTO
      const user = res?.data?.user;
      const accessToken = res?.data?.accessToken;

      if (!user || !accessToken) {
        throw new Error("Không nhận được thông tin xác thực từ hệ thống.");
      }

      localStorage.setItem("petspa_user", JSON.stringify(user));
      localStorage.setItem("petspa_token", accessToken);

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      const userRole = user?.role?.name?.toUpperCase() || "";

      return {
        success: true,
        role: userRole,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại";

      set({ loading: false, error: msg });

      return {
        success: false,
        error: msg,
      };
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */
  registerAction: async (registerData) => {
  set({ loading: true, error: null });
    console.log("register payload", registerData);
  try {
    const res = await AuthService.register(registerData);

    // ========================
    // UNIFY RESPONSE FORMAT
    // ========================
    const responseData = res?.data ?? res;

    const user = responseData?.user;
    const accessToken = responseData?.accessToken;

    // ========================
    // VALIDATE RESPONSE
    // ========================
    if (!user || !accessToken) {
      throw new Error("Invalid register response structure");
    }

    // ========================
    // SAVE TO STORAGE
    // ========================
    localStorage.setItem("petspa_user", JSON.stringify(user));
    localStorage.setItem("petspa_token", accessToken);

    // ========================
    // UPDATE STORE
    // ========================
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      loading: false,
      error: null,
    });

    return {
      success: true,
      data: responseData,
    };
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Đăng ký thất bại";

    set({
      loading: false,
      error: msg,
      isAuthenticated: false,
    });

    return {
      success: false,
      error: msg,
    };
  }
},

  /*
  |--------------------------------------------------------------------------
  | MANUAL LOGIN
  |--------------------------------------------------------------------------
  */
  login: (user, token) => {
    if (!user || !token) return;

    localStorage.setItem("petspa_user", JSON.stringify(user));
    localStorage.setItem("petspa_token", token);

    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | MANUAL REGISTER
  |--------------------------------------------------------------------------
  */
  register: (user, token) => {
    if (!user || !token) return;

    localStorage.setItem("petspa_user", JSON.stringify(user));
    localStorage.setItem("petspa_token", token);

    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  logout: () => {
    localStorage.removeItem("petspa_user");
    localStorage.removeItem("petspa_token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | SYNC
  |--------------------------------------------------------------------------
  */
  sync: () => {
    const currentToken = getToken();
    const currentUser = getUser();

    set({
      user: currentUser,
      token: currentToken,
      isAuthenticated: !!currentUser && !!currentToken,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */
  reset: () => {
    localStorage.clear();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /*
  |--------------------------------------------------------------------------
  | GET CURRENT USER
  |--------------------------------------------------------------------------
  */
  getCurrentUser: () => get().user,
}));
