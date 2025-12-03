

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = {
  background: string;
  text: string;
  card: string;
  border: string;
  primary: string;
  subtext: string
};

const lightTheme: Theme = {
  background: "#fff",
  text: "#000",
  card: "#f8f8f8",
  subtext: "#444",
  border: "#ddd",
    primary: "#007AFF", // iOS blue, good accent
};

const darkTheme: Theme = {
  background: "#000",
  text: "#fff",
  card: "#111",
  subtext: "#aaa",
  border: "#333",
    primary:  "#0A84FF", // iOS blue, good accent
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
