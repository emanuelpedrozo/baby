import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiSession } from "./api";

type AppStore = {
  session?: ApiSession;
  darkMode: boolean;
  setSession: (session?: ApiSession) => void;
  toggleDarkMode: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: false,
      setSession: (session) => set({ session }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
    }),
    { name: "baby-enxoval-store" }
  )
);
