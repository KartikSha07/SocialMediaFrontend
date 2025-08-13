// src/utils/axiosClient.js
import axios from "axios";
import { getItem, KEY_ACCESS_TOKEN, removeItem, setItem } from "./localStorageManager";
import store from "../redux/store";
import { setLoading, showToast } from "../redux/slice/appConfigSlice";
import { TOAST_FAILURE } from "../App";

let baseURL = "https://blinksybackend.onrender.com";
if (process.env.NODE_ENV === "production") {
  baseURL = process.env.REACT_APP_SERVER_BASE_URL;
}

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((request) => {
  const token = getItem(KEY_ACCESS_TOKEN);
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  store.dispatch(setLoading(true));
  return request;
});

axiosClient.interceptors.response.use(
  async (response) => {
    store.dispatch(setLoading(false));
    const data = response.data;

    if (data.status === "ok") return response;

    const originalRequest = response.config;

    // Token expired or invalid — try refresh
    if ((data.statusCode === 401 || data.statusCode === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${baseURL}/auth/refresh`, { withCredentials: true });
        if (res.data.status === "ok" && res.data.result?.accessToken) {
          setItem(KEY_ACCESS_TOKEN, res.data.result.accessToken);
          originalRequest.headers["Authorization"] = `Bearer ${res.data.result.accessToken}`;
          return axios(originalRequest);
        }
      } catch {
        removeItem(KEY_ACCESS_TOKEN);
        window.location.replace("/login");
      }
    }

    store.dispatch(showToast({ type: TOAST_FAILURE, message: data.message || "Something went wrong" }));
    return Promise.reject(data.message);
  },
  (error) => {
    store.dispatch(setLoading(false));
    store.dispatch(showToast({ type: TOAST_FAILURE, message: error?.message || "Request failed" }));

    // Handle unauthorized globally
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      removeItem(KEY_ACCESS_TOKEN);
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);
