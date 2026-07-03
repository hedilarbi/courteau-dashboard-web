import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const getUserProfiles = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/profiles`);
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error fetching profiles" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const getOffersHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-offers/history`);
    if (response?.status === 200) {
      return { status: true, data: response?.data };
    }
    return { status: false, message: "Error fetching history" };
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

export {
  getRules,
  createOrUpdateRule,
  deleteRule,
  getUserProfiles,
  getOffersHistory,
  triggerScan,
};
