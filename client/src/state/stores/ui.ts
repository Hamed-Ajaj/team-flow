import { create } from "zustand";

type TaskDrawerState = {
  isOpen: boolean;
  taskId: number | null;
};

type FilterState = {
  q: string;
  assigneeId?: string;
  priority?: string;
};

type UIState = {
  notificationsOpen: boolean;
  filters: FilterState;
  taskDrawer: TaskDrawerState;
  setNotificationsOpen: (open: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  openTaskDrawer: (taskId: number) => void;
  closeTaskDrawer: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  notificationsOpen: false,
  filters: { q: "" },
  taskDrawer: { isOpen: false, taskId: null },
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  openTaskDrawer: (taskId) => set({ taskDrawer: { isOpen: true, taskId } }),
  closeTaskDrawer: () => set({ taskDrawer: { isOpen: false, taskId: null } }),
}));
