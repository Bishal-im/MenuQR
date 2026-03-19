"use client";

import { useEffect } from "react";

interface ThemeProviderProps {
  primaryColor: string;
}

export default function ThemeProvider({ primaryColor }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor);
  }, [primaryColor]);

  return null;
}
