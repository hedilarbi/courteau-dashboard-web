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

const getRules = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/rules`);
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error fetching rules" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const createOrUpdateRule = async (ruleData) => {
  try {
    const response = await axios.post(`${API_URL}/personalized-offers/rules`, ruleData);
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error saving rule" };
  } catch (error) {
    return { status: false, message: error.response?.data?.error || error.message };
  }
};

const deleteRule = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/personalized-offers/rules/${id}`);
    if (response?.status === 200) {
      return { status: true };
    }
    return { status: false, message: "Error deleting rule" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const getUserProfiles = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/profiles`, { params });
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error fetching profiles" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const getOffersHistory = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/history`, { params });
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error fetching history" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const getMonitoringStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/monitoring-stats`);
    if (response?.status === 200) {
      return { status: true, data: response?.data?.data || response?.data };
    }
    return { status: false, message: "Error fetching monitoring stats" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const triggerScan = async () => {
  try {
    const response = await axios.post(`${API_URL}/personalized-offers/trigger-scan`);
    if (response?.status === 200) {
      return { status: true, message: response?.data?.message };
    }
    return { status: false, message: "Error triggering manual scan" };
  } catch (error) {
    return { status: false, message: error.response?.data?.error || error.message };
  }
};

const getCronStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/cron/status`);
    if (response?.status === 200) {
      return { status: true, isEnabled: response?.data?.isEnabled };
    }
    return { status: false, isEnabled: true };
  } catch (error) {
    return { status: false, isEnabled: true, message: error.message };
  }
};

const toggleCron = async (isEnabled) => {
  try {
    const response = await axios.post(`${API_URL}/personalized-offers/cron/toggle`, { isEnabled });
    if (response?.status === 200) {
      return { status: true, isEnabled: response?.data?.isEnabled, message: response?.data?.message };
    }
    return { status: false, message: "Error toggling cron status" };
  } catch (error) {
    return { status: false, message: error.response?.data?.error || error.message };
  }
};

const getSmartOfferHediStats = async () => {
  try {
    await applyAuthHeader();
    const response = await axios.get(`${API_URL}/personalized-offers/hedi-stats`);
    if (response?.status === 200) {
      return { status: true, data: response?.data?.data || null };
    }
    return { status: false, message: "Error fetching hedi stats" };
  } catch (error) {
    return { status: false, message: error.response?.data?.error || error.message };
  }
};

const createSmartOfferHediPayout = async ({ amount, paidAt, note }) => {
  try {
    await applyAuthHeader();
    const response = await axios.post(`${API_URL}/personalized-offers/hedi-payout`, {
      amount,
      paidAt,
      note,
    });
    if (response?.status === 200) {
      return { status: true, data: response?.data?.data || null };
    }
    return { status: false, message: "Error creating payout" };
  } catch (error) {
    return { status: false, message: error.response?.data?.error || error.message };
  }
};

export {
  getRules,
  createOrUpdateRule,
  deleteRule,
  getUserProfiles,
  getOffersHistory,
  triggerScan,
  getCronStatus,
  toggleCron,
  getSmartOfferHediStats,
  createSmartOfferHediPayout,
  getMonitoringStats,
};
