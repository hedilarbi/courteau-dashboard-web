import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getSettings = async () => {
  try {
    let getSettingsResponse = await axios.get(`${API_URL}/settings`);

    if (getSettingsResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: getSettingsResponse?.data,
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

const updateSettingsService = async (settings) => {
  try {
    let updateSettingsResponse = await axios.put(
      `${API_URL}/settings/update/${settings._id}`,
      {
        settings,
      }
    );

    if (updateSettingsResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: updateSettingsResponse?.data,
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

export { getSettings, updateSettingsService };
