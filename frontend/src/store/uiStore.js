import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],
  unreadCount: 0,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  collapseSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  openModal: (name, data = null) => set({ activeModal: { name, data } }),
  closeModal: () => set({ activeModal: null }),

  addNotification: (notif) =>
    set((s) => ({
      notifications: [{ id: Date.now(), read: false, createdAt: new Date(), ...notif }, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))
