import { Platform } from "react-native";

// config.ts
export const API_URL =
  Platform.OS === "android"
    ? "http://192.168.100.4:3000/api"
    : "http://192.168.100.4:3000/api";
