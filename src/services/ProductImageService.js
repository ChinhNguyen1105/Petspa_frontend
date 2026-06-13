import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

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

const deleteImage = async (
  imageId
) => {
  const resp =
    await api.delete(
      URL_CONSTANT.ProductImages.DELETE_IMAGE.replace(
        "{id}",
        imageId
      )
    );

  return resp.data;
};

const setMainImage = async (
  productId,
  imageId
) => {
  const resp =
    await api.put(
      URL_CONSTANT.ProductImages.SET_MAIN_IMAGE,
      {
        productId,
        imageId,
      }
    );

  return resp.data;
};

const getProductImages =
  async (serviceId) => {
    const resp =
      await api.get(
        URL_CONSTANT.ProductImages.GET_IMAGES.replace(
          "{productId}",
          serviceId
        )
      );

    return resp.data;
  };

export default {
  addImages,
  deleteImage,
    setMainImage,
    getProductImages
};