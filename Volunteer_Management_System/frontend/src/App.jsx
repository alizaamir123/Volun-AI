import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { ProtectedRoute } from './components/ProtectedRoute'
import  LandingPage  from './pages/auth/LandingPage'
import { AuthLandingPage } from './pages/auth/AuthLandingPage'
import { VolunteerSignupPage } from './pages/auth/VolunteerSignupPage'
import { OrganizerSignupPage } from './pages/auth/OrganizerSignupPage'
import { LoginPage } from './pages/auth/LoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard'
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard'
import Support from "./pages/auth/Support";

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/support" element={<Support />} />

        <Route path="/login" element={<AuthLandingPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/volunteer-signup" element={<VolunteerSignupPage />} />
        <Route path="/organizer-signup" element={<OrganizerSignupPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer"
          element={
            <ProtectedRoute allow={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute allow={['volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
       
      </Routes>
    </AuthGate>
  )
}
