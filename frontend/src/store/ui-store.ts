import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  isDark: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDark: (dark: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  isDark: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDark: (dark) => set({ isDark: dark }),
}));
