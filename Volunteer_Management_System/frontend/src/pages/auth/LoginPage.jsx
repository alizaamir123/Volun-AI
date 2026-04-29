
import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { api, errorMessage } from '../../lib/api'
import { useAuthStore } from '../../state/authStore'
import { AsyncButton } from '../../shared/AsyncButton'
import { DarkModeToggle } from '../../shared/DarkModeToggle'

function dashboardPath(role) {
  if (role === 'admin') return '/admin'
  if (role === 'organizer') return '/organizer'
  return '/volunteer'
}

export function LoginPage() {
  const theme = useTheme()
  const { role } = useParams()
  const normalizedRole = role ?? 'volunteer'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  const onSubmit = async () => {
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
      const authUser = {
        id: u.id,
        role: u.role,
        fullName: u.full_name,
        email: u.email,
        city: u.city ?? null,
        province: u.province ?? null,
        isApproved: u.is_approved,
        is_approved: u.is_approved,
      }
      setSession(res.data.access_token, authUser)
      enqueueSnackbar('Logged in', { variant: 'success' })
      navigate(dashboardPath(authUser.role), { replace: true })
    } catch (e) {
      const msg = errorMessage(e, 'Login failed')
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)', boxShadow: '0 2px 8px rgba(255,107,53,0.2)' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => navigate('/')}>
            VolunteerHub
          </Typography>
          <DarkModeToggle />
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.palette.mode === 'dark' ? '0 12px 28px rgba(0,0,0,0.45)' : '0 8px 24px rgba(255,107,53,0.15)' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                {normalizedRole === 'admin' ? 'Admin Login' : 'Login'}
              </Typography>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" fullWidth />
              <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" fullWidth />

              <AsyncButton loading={loading} onClick={onSubmit} variant="contained" size="large" fullWidth>
                Login
              </AsyncButton>

              <Stack direction="row" justifyContent="space-between">
                <Button component={RouterLink} to="/login" size="small">Back</Button>
                <Button component={RouterLink} to="/volunteer-signup" size="small">Create account</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
