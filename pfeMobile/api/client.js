import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseCandidates } from "../utils/network";

const API_URLS = getApiBaseCandidates();

const api = axios.create({
  baseURL: API_URLS[0],
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 12000
});

export async function setApiBaseUrl(url) {
  api.defaults.baseURL = url;
}

export async function autoDetectApiBaseUrl() {
  for (const url of API_URLS) {
    try {
      await axios.options(`${url}/auth/login`, { timeout: 1500 });
      api.defaults.baseURL = url;
      return url;
    } catch (error) {
      // 400/401 means server reachable; network errors mean unreachable.
      if (error?.response) {
        api.defaults.baseURL = url;
        return url;
      }
      continue;
    }
  }
  return api.defaults.baseURL;
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "user"]);
    }
    return Promise.reject(error);
  }
);

export default api;
