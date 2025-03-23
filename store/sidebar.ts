import { create } from 'zustand';

interface SidebarState {
  collapse: boolean;
  toggleCollapse: () => void;
  setCollapse: (value: any) => void;
}

export const useCollapseStore = create<SidebarState>((set) => ({
  collapse: false,
  toggleCollapse: () => set((state: any) => ({ collapse: !state.collapse })),
  setCollapse: (value: any) => set({ collapse: value }),
}));
