import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

// Ruta de redirección según el rol (fallback si el backend no la envía)
const redirectFor = (role) => {
  if (role === 'admin')  return '/admin'
  if (role === 'seller') return '/vendedor'
  return '/dashboard'
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { token, user, redirect } = res.data.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, redirect: redirect || redirectFor(user.role) }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Error al iniciar sesión' }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const res = await api.post('/auth/register', { name, email, password })
          const { token, user, redirect } = res.data.data
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { success: true, redirect: redirect || redirectFor(user.role) }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Error al registrarse' }
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'nexapanel-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
