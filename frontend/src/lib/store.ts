import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiSession } from "./api";

type AppStore = {
  session?: ApiSession;
  selectedProjectId?: string;
  darkMode: boolean;
  setSession: (session?: ApiSession) => void;
  setSelectedProjectId: (id?: string) => void;
  toggleDarkMode: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: false,
      setSession: (session) => set({ session }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
    }),
    {
      name: "baby-enxoval-store",
      partialize: (state) => ({
        session: state.session,
        darkMode: state.darkMode,
        selectedProjectId: state.selectedProjectId
      })
    }
  )
);
