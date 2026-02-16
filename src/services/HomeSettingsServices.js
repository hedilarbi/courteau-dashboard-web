import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const appendField = (formData, key, value) => {
  if (typeof value === "undefined") {
    return;
  }

  if (value === null) {
    formData.append(key, "");
    return;
  }

  formData.append(key, value);
};

const getHomeSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/home-settings`);

    if (response?.status === 200) {
      return {
        status: true,
        data: response.data,
      };
    }

    return {
      status: false,
      message: "Erreur lors de la récupération de la configuration d'accueil",
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        status: true,
        data: null,
      };
    }

    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Erreur lors de la récupération de la configuration d'accueil",
    };
  }
};

const createHomeSetting = async ({
  title,
  subTitle,
  codePromoTitle,
  file,
  menuItemId,
  offerId,
  codePromoId,
}) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subTitle", subTitle);
    appendField(formData, "codePromoTitle", codePromoTitle);
    formData.append("file", file);
    appendField(formData, "menuItemId", menuItemId);
    appendField(formData, "offerId", offerId);
    appendField(formData, "codePromoId", codePromoId);

    const response = await axios.post(`${API_URL}/home-settings/create`, formData);

    if (response?.status === 201) {
      return {
        status: true,
        data: response.data,
      };
    }

    return {
      status: false,
      message: "Erreur lors de la création de la configuration d'accueil",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de la configuration d'accueil",
    };
  }
};

const updateHomeSetting = async (
  id,
  { title, subTitle, codePromoTitle, file, menuItemId, offerId, codePromoId }
) => {
  try {
    const formData = new FormData();
    appendField(formData, "title", title);
    appendField(formData, "subTitle", subTitle);
    appendField(formData, "codePromoTitle", codePromoTitle);

    if (file) {
      formData.append("file", file);
    }

    appendField(formData, "menuItemId", menuItemId);
    appendField(formData, "offerId", offerId);
    appendField(formData, "codePromoId", codePromoId);

    const response = await axios.put(
      `${API_URL}/home-settings/update/${id}`,
      formData
    );

    if (response?.status === 200) {
      return {
        status: true,
        data: response.data,
      };
    }

    return {
      status: false,
      message: "Erreur lors de la mise à jour de la configuration d'accueil",
    };
  } catch (error) {
    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour de la configuration d'accueil",
    };
  }
};

export { getHomeSettings, createHomeSetting, updateHomeSetting };
