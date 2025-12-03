// navigationTheme.ts
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
} from "@react-navigation/native";

export const LightNavTheme = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    background: "#f9f9f9",
    card: "#fff",
    text: "#111",
    border: "#e5e5e5",
    primary: "#007AFF", // iOS blue
  },
};

export const DarkNavTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    background: "#121212",
    card: "#1e1e1e",
    text: "#fff",
    border: "#333",
    primary: "#0A84FF", // iOS dark mode blue
  },
};
