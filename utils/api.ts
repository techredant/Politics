// src/utils/api.ts
import axios from "axios";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

const api = axios.create({
  baseURL: `http://${API_URL}/api`,
  timeout: 10000,
});

export default api;
