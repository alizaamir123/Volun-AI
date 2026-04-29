import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { api, errorMessage } from '../../lib/api'
import { useAuthStore } from '../../state/authStore'
import { AsyncButton } from '../../shared/AsyncButton'
import { DarkModeToggle } from '../../shared/DarkModeToggle'
import { Event as EventIcon, Margin, People as PeopleIcon, VolunteerActivism as VolunteerIcon } from '@mui/icons-material'
import './AuthLandingPage.css'

const ORANGE_THEME = {
  primary: '#FF6B35',
  secondary: '#FF8C42',
  light: '#FFE8D6',
  dark: '#E55100',
  text: '#2C2C2C',
}

function dashboardPath(role) {
  if (role === 'admin') return '/admin'
  if (role === 'organizer') return '/organizer'
  return '/volunteer'
}

export function AuthLandingPage() {
  const theme = useTheme()
  const textColor = theme.palette.mode === 'dark' ? '#FFFFFF' : ORANGE_THEME.text
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  const onLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      const res = await api.post('/api/v1/auth/access-token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const u = res.data.user
      const user = {
        id: u.id,
        role: u.role,
        fullName: u.full_name,
        email: u.email,
        city: u.city ?? null,
        province: u.province ?? null,
        isApproved: u.is_approved,
        is_approved: u.is_approved,
      }
      setSession(res.data.access_token, user)
      enqueueSnackbar('Logged in successfully!', { variant: 'success' })
      navigate(dashboardPath(res.data.user.role), { replace: true })
    } catch (e) {
      const msg = errorMessage(e, 'Login failed')
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="auth-landing-wrapper">
      <Box className="particles-container">
        {Array.from({ length: 10 }).map((_, index) => (
          <Box key={index} className={`particle particle-${index + 1}`} />
        ))}
      </Box>

      <Box className="auth-topbar">
        <Typography variant="h5" className="auth-logo" onClick={() => window.location.href = '/'}>
<img 
  src="/logoimg.png" 
  alt="VolunAI Logo" 
  className="auth-logo-img"
  style={{ height: "120px", width: "200px", marginTop: "-20px" }}
/>         
        </Typography>
        <DarkModeToggle />
      </Box>

      <Box className="auth-main"  style={{ marginTop: "-40px" }}
>
        <Box className="auth-left">
          <Typography variant="h3" className="auth-heading">
            Build your impact as a <span>Volunteer</span> or <span>Organizer</span>
          </Typography>
<br />          <Typography className="auth-subtitle">
            Jump into a beautiful experience designed for community builders. Fast signup, smooth login, and a fresh modern interface .
          </Typography>
<br />
          <Box className="feature-list">
            <Box className="feature-item">
              <Box className="feature-icon"><VolunteerIcon /></Box>
              <Typography>Effortless volunteer onboarding</Typography>
            </Box>
            <Box className="feature-item">
              <Box className="feature-icon"><EventIcon /></Box>
              <Typography>Instant access to events and applications</Typography>
            </Box>
            <Box className="feature-item">
              <Box className="feature-icon"><PeopleIcon /></Box>
              <Typography>Clear organizer approval flow</Typography>
            </Box>
          </Box>
        </Box>

        <Box className="auth-right">
          <Box className="auth-card">
            <Box className="auth-card-header">
              <Typography variant="h4">Welcome Back to VolunAI</Typography>
              <Typography className="auth-card-subtitle">Sign in to continue your mission with VolunAI.</Typography>
            </Box>

            <Box className="auth-card-body">
              <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  fullWidth
                  variant="filled"
                  className="auth-input"
                />
                <TextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  variant="filled"
                  className="auth-input"
                />

                <AsyncButton
                  loading={loading}
                  onClick={onLogin}
                  variant="contained"
                  fullWidth
                  sx={{
                    background: `linear-gradient(135deg, ${ORANGE_THEME.primary} 0%, ${ORANGE_THEME.secondary} 100%)`,
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 30px rgba(255,107,53,0.25)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In
                </AsyncButton>

                <Divider className="auth-divider" style={{ marginTop: "20px" }}>Create a new account</Divider>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/volunteer-signup"
                    size="large"
                    variant="outlined"
                    fullWidth
                    className="auth-link-button"
                  >
                    Volunteer
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/organizer-signup"
                    size="large"
                    variant="outlined"
                    fullWidth
                    className="auth-link-button"
                  >
                    Organizer
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
