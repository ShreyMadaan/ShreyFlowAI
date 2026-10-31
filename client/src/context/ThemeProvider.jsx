
import {
  useEffect,
  useState,
} from "react";

import { ThemeContext } from "./ThemeContext";

function getInitialTheme() {
  try {
    const savedTheme =
      localStorage.getItem(
        "shreyflow-theme"
      );

    if (
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {
      return savedTheme;
    }
  } catch {
    // Storage may be unavailable.
  }

  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] =
    useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.style.colorScheme =
      theme;

    try {
      localStorage.setItem(
        "shreyflow-theme",
        theme
      );
    } catch {
      // Continue without persistence.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
