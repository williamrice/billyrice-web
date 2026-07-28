"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DeviconSetting } from "../types/devicons";

type PublicSettings = {
  devicons: DeviconSetting;
};

const PublicSettingsContext = createContext<PublicSettings | null>(null);

export function PublicSettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: PublicSettings;
}) {
  return (
    <PublicSettingsContext.Provider value={settings}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const settings = useContext(PublicSettingsContext);
  if (!settings) {
    throw new Error("usePublicSettings must be used within PublicSettingsProvider");
  }
  return settings;
}
