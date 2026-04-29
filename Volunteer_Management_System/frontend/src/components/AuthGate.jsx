import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/authStore'

function defaultDashboardPath(role) {
  if (role === 'admin') return '/admin'
  if (role === 'organizer') return '/organizer'
  return '/volunteer'
}

export function AuthGate({ children }) {
  const hydrate = useAuthStore((s) => s.hydrate)
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!hydrated) return

    // ✅ FIX: Proper PUBLIC ROUTES include support
    const isPublicRoute =
      location.pathname === '/' ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/volunteer-signup') ||
      location.pathname.startsWith('/organizer-signup') ||
      location.pathname.startsWith('/support')   // ✅ ADDED

    // 🔴 If NOT logged in → only protect private routes
    if (!token && !isPublicRoute) {
      navigate('/login', { replace: true })
      return
    }

    // 🔵 If logged in → redirect away from login/signup only (NOT support/home)
    const isAuthPage =
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/volunteer-signup') ||
      location.pathname.startsWith('/organizer-signup')

    if (token && isAuthPage) {
      navigate(defaultDashboardPath(user?.role), { replace: true })
    }

  }, [hydrated, token, user?.role, location.pathname, navigate])

  return children
}