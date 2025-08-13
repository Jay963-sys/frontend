import axios from "axios";

const dev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const api = axios.create({
  baseURL: dev
    ? "http://localhost:5000/api"
    : `${process.env.REACT_APP_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  if (token) {
    token = token.trim();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
