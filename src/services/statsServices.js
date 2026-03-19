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

const getInitialStats = async (date, from, to, restaurantId) => {
  await applyAuthHeader();
  try {
    let getInitialStatsResponse = await axios.get(`${API_URL}/stats/initial`, {
      params: {
        date,
        from,
        to,
        restaurantId,
      },
    });

    if (getInitialStatsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getInitialStatsResponse?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const getRestaurantStats = async (id) => {
  try {
    await applyAuthHeader();
    let getInitialStatsResponse = await axios.get(
      `${API_URL}/stats/initial/${id}`,
    );

    if (getInitialStatsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getInitialStatsResponse?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const getDashboardAnalytics = async ({
  preset,
  date,
  from,
  to,
  restaurantId,
  orderType,
}) => {
  try {
    await applyAuthHeader();
    const response = await axios.get(`${API_URL}/stats/analytics`, {
      params: {
        preset,
        date,
        from,
        to,
        restaurantId,
        orderType,
      },
    });

    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data || null,
      };
    }

    return {
      status: false,
      message: "Erreur de chargement des statistiques.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export { getInitialStats, getRestaurantStats, getDashboardAnalytics };
