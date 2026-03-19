"use client";

import { useEffect } from "react";

const fontMap: Record<string, string> = {
  "Geist Sans": "var(--font-geist-sans)",
  "Inter": "var(--font-inter)",
  "Outfit": "var(--font-outfit)",
  "Roboto": "var(--font-roboto)",
};

interface ThemeProviderProps {
  primaryColor: string;
  fontFamily: string;
}

export default function ThemeProvider({ primaryColor, fontFamily }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor);
    document.documentElement.style.setProperty(
      "--font-family",
      fontMap[fontFamily] || "var(--font-geist-sans)"
    );
  }, [primaryColor, fontFamily]);

  return null;
}
