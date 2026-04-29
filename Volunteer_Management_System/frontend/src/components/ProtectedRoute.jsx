import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../state/authStore'

export function ProtectedRoute({ allow, children }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || !user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to="/login" replace />
  return children
}
