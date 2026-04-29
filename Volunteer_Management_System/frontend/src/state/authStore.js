import { create } from 'zustand'

const STORAGE_KEY = 'vms.auth.session'

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    set({ token, user })
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ token: null, user: null })
  },

  logout: () => {
    get().clearSession()
  },

  hydrate: () => {
    if (get().hydrated) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return set({ hydrated: true })
      const parsed = JSON.parse(raw)
      set({ token: parsed.token ?? null, user: parsed.user ?? null, hydrated: true })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      set({ token: null, user: null, hydrated: true })
    }
  },
}))
