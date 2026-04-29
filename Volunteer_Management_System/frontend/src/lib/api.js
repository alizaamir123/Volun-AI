import axios from 'axios'
import { useAuthStore } from '../state/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const API_TIMEOUT = 10000

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(err)
  },
)

export function errorMessage(e, fallback) {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const data = e.response?.data
    if (data && typeof data === 'object' && 'detail' in data) {
      return String(data.detail)
    }
  }
  if (e instanceof Error) return e.message
  return fallback
}
