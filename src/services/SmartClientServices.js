import { getToken } from "@/actions";

export const SMART_CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getSmartClientAuthHeaders = async (json = false) => {
  const token = await getToken();
  return {
    ...(token?.value ? { Authorization: `Bearer ${token.value}` } : {}),
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
};
