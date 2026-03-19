import { getToken } from "@/actions";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const applyAuthHeader = async () => {
  const token = await getToken();
  const tokenValue = token?.value;
  if (tokenValue) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const getSubscriptionConfig = async () => {
  try {
    await applyAuthHeader();
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

const updateSubscriptionConfig = async (payload) => {
  try {
    await applyAuthHeader();
    const requestPayload =
      payload && typeof payload === "object"
        ? payload
        : { monthlyPrice: payload };
    const response = await axios.put(
      `${API_URL}/subscriptions/config`,
      requestPayload,
    );

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

const getSubscriptionAdminStats = async () => {
  try {
    await applyAuthHeader();
    const response = await axios.get(`${API_URL}/subscriptions/admin/stats`);
    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur de chargement des statistiques abonnement.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

const getSubscriptionAdminUserDetails = async (userId) => {
  try {
    await applyAuthHeader();
    const response = await axios.get(`${API_URL}/subscriptions/admin/user/${userId}`);
    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur de chargement du détail abonnement.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

const createSubscriptionHediPayout = async ({ amount, paidAt, note }) => {
  try {
    await applyAuthHeader();
    const response = await axios.post(`${API_URL}/subscriptions/admin/hedi-payout`, {
      amount,
      paidAt,
      note,
    });
    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur lors de l'enregistrement du paiement.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export {
  getSubscriptionConfig,
  updateSubscriptionConfig,
  getSubscriptionAdminStats,
  getSubscriptionAdminUserDetails,
  createSubscriptionHediPayout,
};
