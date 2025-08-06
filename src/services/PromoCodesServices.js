import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getPromoCodes = async () => {
  try {
    let getOrdersResponse = await axios.get(`${API_URL}/promoCodes`);

    if (getOrdersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrdersResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const createPromoCode = async (promoCode) => {
  try {
    let createPromoCodeResponse = await axios.post(
      `${API_URL}/promoCodes/create`,
      promoCode
    );

    if (createPromoCodeResponse?.status === 201) {
      return {
        status: true,
        message: "Promo code created successfully",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.error,
    };
  }
};
const deletePromoCode = async (id) => {
  try {
    let deletePromoCodeResponse = await axios.delete(
      `${API_URL}/promoCodes/${id}`
    );

    if (deletePromoCodeResponse?.status === 200) {
      return {
        status: true,
        message: "Promo code deleted successfully",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const updatePromoCode = async (id, promoCode) => {
  try {
    let updatePromoCodeResponse = await axios.put(
      `${API_URL}/promoCodes/${id}`,
      promoCode
    );

    if (updatePromoCodeResponse?.status === 200) {
      return {
        status: true,
        message: "Promo code updated successfully",
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return { status: false, message: error.message };
  }
};

export { getPromoCodes, createPromoCode, deletePromoCode, updatePromoCode };
