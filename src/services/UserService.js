import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

// const getUsers = async (params = {}) => {
//   const response = await api.get(
//     URL_CONSTANT.User.GET_USERS,
//     { params }
//   );

//   return response.data;
// };

const getUsers = async (params = {}) => {
  const response = await api.get(
    URL_CONSTANT.User.GET_USERS,
    { params }
  );

  const baseUrl = `${import.meta.env.VITE_API_URL}/upload/avatars`;

  const users = (response.data?.data?.result || []).map(user => ({
    ...user,
    avatarUrl: user?.avatarUrl
      ? `${baseUrl}/${user.avatarUrl}`
      : "",
  }));

  return {
    ...response.data,
    data: {
      ...response.data.data,
      result: users,
    },
  };
};

const getUserById = async (id) => {
  const response = await api.get(
    URL_CONSTANT.User.GET_USER.replace("{id}", id)
  );

  const data = response.data?.data;

  const mappedData = {
    ...data,
    avatarUrl: data?.avatarUrl
      ? `${import.meta.env.VITE_API_URL}/upload/avatars/${data.avatarUrl}`
      : "",
  };

  console.log("mapped response:", mappedData);

  return {
    ...response.data,
    data: mappedData,
  };
};

const createUser = async (userData) => {
  console.log("create user payload: ", userData);
  const payload = {
  email: userData.email,
  password: userData.password,
  name: userData.name,
  dateOfBirth: userData.dateOfBirth?.split("T")[0],
    gender: userData.gender,
   role: {
    id: Number(userData.role.id || userData.role)
  }
};
  const response = await api.post(
    URL_CONSTANT.User.CREATE_USER, payload);
  return response.data;
};

const updateUser = async (userData) => {
  console.log("update payload: ", userData);
  const payload = {
  id: userData.id,
  password: userData.password,
  name: userData.name,
  dateOfBirth: userData.dateOfBirth?.split("T")[0],
  gender: userData.gender,
  role: {
    id: Number(userData.role.id || userData.role)
  }
};
  
  const response = await api.put(
    URL_CONSTANT.User.UPDATE_USER,payload
  );

  return response.data;
};

const updateUserStatus = async (id) => {
  const response = await api.patch(
    URL_CONSTANT.User.CHANGE_USER_STATUS.replace(
      ":id",
      id
    )
  );

  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(
    URL_CONSTANT.User.DELETE_USER.replace("{id}", id)
  );

  return response.data;
};

const uploadAvatar = async (userId, file) => {
  const formData = new FormData();

  formData.append("file", file); // MUST MATCH BACKEND

  const res = await api.post(
    `/users/${userId}/avatar`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
};

// const getProfile = async () => {
  
//   const response = await api.get(
//     URL_CONSTANT.User.GET_PROFILE
//   );

// console.log("get profile", response);
//   return response.data;
// };

const getProfile = async () => {
  const response = await api.get(
    URL_CONSTANT.User.GET_PROFILE
  );

  const data = response.data?.data;

  const mappedData = {
    ...data,
    avatarUrl: data?.avatarUrl
      ? `${import.meta.env.VITE_API_URL}/upload/avatars/${data.avatarUrl}`
      : "",
  };

  console.log("mapped profile:", mappedData);

  return {
    ...response.data,
    data: mappedData,
  };
};

const updateProfile = async (profileData) => {
  const response = await api.put(
    URL_CONSTANT.User.UPDATE_PROFILE,
    profileData
  );

  return response.data;
};

const UserService = {
  getUsers,
  getUserById,

  createUser,
  updateUser,

  updateUserStatus,

  deleteUser,

  uploadAvatar,

  getProfile,
  updateProfile,
};

export default UserService;