import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const sendNotifications = async (title, body) => {
  try {
    let notifyResponse = await axios.post(
      `${API_URL}/notifiers/notifications`,
      { title, body }
    );

    if (notifyResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: notifyResponse?.data,
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
      message: error.response.data.message,
    };
  }
};
const sendSMS = async (body) => {
  try {
    let deleteOfferResponse = await axios.post(`${API_URL}/notifiers/sms/`, {
      body,
    });

    if (deleteOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteOfferResponse?.data,
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
      message: error.response.data.message,
    };
  }
};
const sendEmails = async (title, body) => {
  try {
    let deleteOfferResponse = await axios.post(`${API_URL}/notifiers/emails/`, {
      title,
      body,
    });

    if (deleteOfferResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteOfferResponse?.data,
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
      message: error.response.data.message,
    };
  }
};

export { sendNotifications, sendEmails, sendSMS };
