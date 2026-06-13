import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

const addImage = async (
  serviceId,
  imageUrl,
  isThumbnail = false
) => {
  const resp =
    await api.post(
      URL_CONSTANT.PetServiceImages.ADD_IMAGES,
      {
        serviceId,
        imageUrl,
        isThumbnail,
      }
    );

  return resp.data;
};

const getServiceImages =
  async (serviceId) => {
    const resp =
      await api.get(
        URL_CONSTANT.PetServiceImages.GET_SERVICE_IMAGES.replace(
          "{serviceId}",
          serviceId
        )
      );

    return resp.data;
  };

const deleteImage = async (
  imageId
) => {
  const resp =
    await api.delete(
      URL_CONSTANT.PetServiceImages.DELETE_IMAGE.replace(
        "{id}",
        imageId
      )
    );

  return resp.data;
};

const setMainImage = async (
  imageId
) => {
  const resp =
    await api.patch(
      URL_CONSTANT.PetServiceImages.SET_MAIN_IMAGE,
      null,
      {
        params: {
          imageId,
        },
      }
    );

  return resp.data;
};

export default {
  addImage,
  getServiceImages,
  deleteImage,
  setMainImage,
};