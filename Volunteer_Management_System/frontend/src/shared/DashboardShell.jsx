import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/authStore'
import { DarkModeToggle } from './DarkModeToggle'

export function DashboardShell({ title, children, headerActions }) {
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  const logout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100%' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Container maxWidth="lg" disableGutters>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography fontWeight={800}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.fullName} {user?.email ? `• ${user.email}` : ''} • {user?.role}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                {headerActions}
                <DarkModeToggle />
                <Button onClick={logout} variant="outlined" size="small">
                  Logout
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}
