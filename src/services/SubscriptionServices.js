import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getSubscriptionConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/config`);
    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur de chargement.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

const updateSubscriptionConfig = async (monthlyPrice) => {
  try {
    const response = await axios.put(`${API_URL}/subscriptions/config`, {
      monthlyPrice,
    });

    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur de mise à jour.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export { getSubscriptionConfig, updateSubscriptionConfig };
