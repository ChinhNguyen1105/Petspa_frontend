import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

/*
|--------------------------------------------------------------------------
| GET PRODUCT IMAGES
|--------------------------------------------------------------------------
*/
const getProductImages = async (
  productId
) => {
  const resp = await api.get(
    URL_CONSTANT.ProductImages.GET_IMAGES.replace(
      "{productId}",
      productId
    )
  );

  return resp.data;
};

/*
|--------------------------------------------------------------------------
| ADD IMAGES
|--------------------------------------------------------------------------
*/
const addImages = async (
  productId,
  files
) => {
  const formData = new FormData();

  formData.append(
    "productId",
    productId
  );

  files.forEach((file) => {
    formData.append(
      "files",
      file
    );
  });

  const resp = await api.post(
    URL_CONSTANT.ProductImages.ADD_IMAGES,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return resp.data;
};

/*
|--------------------------------------------------------------------------
| DELETE IMAGE
|--------------------------------------------------------------------------
*/
const deleteImage = async (
  imageId
) => {
  const resp = await api.delete(
    URL_CONSTANT.ProductImages.DELETE_IMAGE.replace(
      "{id}",
      imageId
    )
  );

  return resp.data;
};

/*
|--------------------------------------------------------------------------
| SET THUMBNAIL IMAGE
|--------------------------------------------------------------------------
*/
const setMainImage = async (
  productId,
  imageId
) => {
  const payload = {
    productId,
    imageId,
  };

  const resp = await api.put(
    URL_CONSTANT.ProductImages.SET_MAIN_IMAGE,
    payload
  );

  return resp.data;
};

export default {
  getProductImages,
  addImages,
  deleteImage,
  setMainImage,
};