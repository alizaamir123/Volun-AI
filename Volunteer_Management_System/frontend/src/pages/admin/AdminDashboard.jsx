import { useState, useEffect } from 'react'
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, Collapse,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
  Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, useMediaQuery, useTheme, TextField,
  Badge, Tab, Tabs, Paper, TablePagination, Menu, MenuItem, Divider,
  CircularProgress,
} from '@mui/material'
import {
  Visibility, Dashboard as DashboardIcon, Event as EventIcon,
  People as PeopleIcon, Verified as VerifiedIcon,
  Menu as MenuIcon, Logout as LogoutIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  VolunteerActivism as VolunteerIcon,
  Settings as SettingsIcon, Person as PersonIcon,
  Email as EmailIcon, Lock as LockIcon, Save as SaveIcon,
  Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Refresh as RefreshIcon,
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { api, errorMessage } from '../../lib/api'
import { useAuthStore } from '../../state/authStore'
import {
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'

const drawerWidth = 280

const COLORS = ['#ff7a18', '#ffd200', '#4caf50', '#2196f3', '#9c27b0', '#f44336']

function StatCard({ label, value, icon, color, trend, trendValue }) {
  const trendIcon = trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : trend === 'down' ? <TrendingDownIcon sx={{ fontSize: 14 }} /> : null
  const trendColor = trend === 'up' ? '#4caf50' : trend === 'down' ? '#f44336' : '#ff9800'
  
  return (
    <Card sx={{ 
      borderRadius: 4, 
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 28px rgba(255,122,24,0.15)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: color || '#0c1f2f' }}>{value}</Typography>
            {trend && trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Box sx={{ color: trendColor, display: 'flex', alignItems: 'center' }}>{trendIcon}</Box>
                <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>{trendValue}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>vs last month</Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color || '#ff7a18'}20`, width: 56, height: 56, color: color || '#ff7a18' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

function EventCard({ event, actions }) {
  const statusColor = {
    active: { bg: '#4caf5020', color: '#2e7d32', label: 'Active' },
    pending: { bg: '#ff980020', color: '#ed6c02', label: 'Pending' },
    inactive: { bg: '#9e9e9e20', color: '#616161', label: 'Inactive' }
  }[event.status] || { bg: '#9e9e9e20', color: '#616161', label: 'Inactive' }

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
      <CardContent sx={{ p: 2.5 }}>
        <img src={event.image} alt={event.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 12 }} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>{event.name}</Typography>
        <Typography variant="body2" color="text.secondary">{event.location} - {event.date}</Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#555' }} noWrap>{event.details}</Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`Skills: ${event.skillset}`} size="small" variant="outlined" />
          <Chip label={`Required: ${event.candidates_required}`} size="small" variant="outlined" />
          <Chip label={`Applied: ${event.candidates_applied}`} size="small" variant="outlined" />
          <Chip label={event.status} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.color, fontWeight: 600 }} />
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2.5, pt: 0 }}>
        {actions}
      </CardActions>
    </Card>
  )
}

// Profile Settings Component - WORKING
function ProfileSettings({ open, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [user])

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })
    setError(null)
  }

  const handleSubmit = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
      }
      if (formData.currentPassword && formData.newPassword) {
        payload.current_password = formData.currentPassword
        payload.new_password = formData.newPassword
      }
      
      const res = await api.put('/api/v1/auth/update-profile', payload)
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' })
      if (onUpdate) onUpdate(res.data.user)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Update failed'
      setError(msg)
      enqueueSnackbar(msg, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Profile Settings
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField 
            label="Full Name" 
            value={formData.fullName} 
            onChange={handleChange('fullName')} 
            fullWidth 
            InputProps={{ startAdornment: <PersonIcon sx={{ color: '#ff7a18', mr: 1 }} /> }}
          />
          <TextField 
            label="Email" 
            type="email"
            value={formData.email} 
            onChange={handleChange('email')} 
            fullWidth 
            InputProps={{ startAdornment: <EmailIcon sx={{ color: '#ff7a18', mr: 1 }} /> }}
          />
          
          <Divider>Change Password (Optional)</Divider>
          
          <TextField 
            label="Current Password" 
            type="password" 
            value={formData.currentPassword} 
            onChange={handleChange('currentPassword')} 
            fullWidth 
            InputProps={{ startAdornment: <LockIcon sx={{ color: '#ff7a18', mr: 1 }} /> }}
          />
          <TextField 
            label="New Password" 
            type="password" 
            value={formData.newPassword} 
            onChange={handleChange('newPassword')} 
            fullWidth 
            InputProps={{ startAdornment: <LockIcon sx={{ color: '#ff7a18', mr: 1 }} /> }}
          />
          <TextField 
            label="Confirm New Password" 
            type="password" 
            value={formData.confirmPassword} 
            onChange={handleChange('confirmPassword')} 
            fullWidth 
            InputProps={{ startAdornment: <LockIcon sx={{ color: '#ff7a18', mr: 1 }} /> }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a15' } }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function AdminDashboard() {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedOrganizerId, setExpandedOrganizerId] = useState(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiContext, setAiContext] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [analyticsTab, setAnalyticsTab] = useState(0)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const [volunteerPage, setVolunteerPage] = useState(0)
  const [volunteerRowsPerPage, setVolunteerRowsPerPage] = useState(10)
  const [organizerPage, setOrganizerPage] = useState(0)
  const [organizerRowsPerPage, setOrganizerRowsPerPage] = useState(5)
  
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  // Queries
  const overview = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      console.log('Fetching overview data...')
      const result = (await api.get('/api/v1/admin/analytics/overview')).data
      console.log('Overview data:', result)
      return result
    },
    onError: (error) => {
      console.error('Overview query error:', error)
      enqueueSnackbar(`Failed to load overview data: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
    enabled: !!user && user.role === 'admin'
  })

  const pendingOrganizers = useQuery({
    queryKey: ['admin', 'pending-organizers'],
    queryFn: async () => {
      console.log('Fetching pending organizers...')
      const result = (await api.get('/api/v1/admin/pending-organizers')).data
      console.log('Pending organizers:', result)
      return result
    },
    onError: (error) => {
      console.error('Pending organizers query error:', error)
      enqueueSnackbar(`Failed to load pending organizers: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
    enabled: !!user && user.role === 'admin'
  })

  const allOrganizers = useQuery({
    queryKey: ['admin', 'organizers'],
    queryFn: async () => {
      console.log('Fetching all organizers...')
      const result = (await api.get('/api/v1/admin/organizers')).data
      console.log('All organizers:', result)
      return result
    },
    onError: (error) => {
      console.error('All organizers query error:', error)
      enqueueSnackbar(`Failed to load organizers: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
    enabled: !!user && user.role === 'admin'
  })

  const events = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Fetching events...')
      const result = (await api.get('/api/v1/events/')).data
      console.log('Events:', result?.length, 'items')
      return result
    },
    onError: (error) => {
      console.error('Events query error:', error)
      enqueueSnackbar(`Failed to load events: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    }
  })

  const detailedAnalytics = useQuery({
    queryKey: ['admin', 'detailed-analytics'],
    queryFn: async () => {
      console.log('Fetching detailed analytics...')
      const result = (await api.get('/api/v1/admin/analytics/detailed')).data
      console.log('Detailed analytics:', result)
      return result
    },
    retry: false,
    onError: (error) => {
      console.error('Detailed analytics query error:', error)
      enqueueSnackbar(`Failed to load detailed analytics: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
    enabled: !!user && user.role === 'admin'
  })

  const refreshData = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['admin'] })
    await queryClient.invalidateQueries({ queryKey: ['events'] })
    await queryClient.refetchQueries({ queryKey: ['admin'] })
    await queryClient.refetchQueries({ queryKey: ['events'] })
    enqueueSnackbar('Data refreshed successfully!', { variant: 'success' })
    setRefreshing(false)
  }

  // Prepare chart data from real API
  const getMonthlyData = () => {
    const monthlyStats = detailedAnalytics.data?.monthlyStats || []
    if (monthlyStats.length > 0) return monthlyStats
    return [
      { name: 'Jan', volunteers: 0, events: 0, hours: 0, organizers: 0 },
      { name: 'Feb', volunteers: 0, events: 0, hours: 0, organizers: 0 },
      { name: 'Mar', volunteers: 0, events: 0, hours: 0, organizers: 0 },
      { name: 'Apr', volunteers: 0, events: 0, hours: 0, organizers: 0 },
      { name: 'May', volunteers: 0, events: 0, hours: 0, organizers: 0 },
      { name: 'Jun', volunteers: 0, events: 0, hours: 0, organizers: 0 },
    ]
  }

  const getOrganizerData = () => {
    const organizerData = overview.data || { totalOrganizers: 0, pendingApprovals: 0 }
    return [
      { name: 'Approved', value: organizerData.totalOrganizers || 0, color: '#4caf50' },
      { name: 'Pending', value: organizerData.pendingApprovals || 0, color: '#ff9800' },
    ].filter(item => item.value > 0)
  }

  const getEventDistribution = () => {
    const eventsData = overview.data || { totalActiveEvents: 0, totalPendingEvents: 0, totalCompletedEvents: 0 }
    return [
      { name: 'Active Events', value: eventsData.totalActiveEvents || 0, color: '#4caf50' },
      { name: 'Pending Events', value: eventsData.totalPendingEvents || 0, color: '#ff9800' },
      { name: 'Completed Events', value: eventsData.totalCompletedEvents || 0, color: '#2196f3' },
    ].filter(item => item.value > 0)
  }

  const getTopOrganizers = () => {
    return detailedAnalytics.data?.topOrganizers || []
  }

  const getKeyMetrics = () => {
    const eventsData = overview.data || { totalEvents: 0, totalActiveEvents: 0, totalApplications: 0, totalVolunteers: 0 }
    const totalEvents = eventsData.totalEvents || 1
    const approvalRate = totalEvents > 0 ? ((eventsData.totalActiveEvents / totalEvents) * 100).toFixed(0) : 0
    const avgVolunteersPerEvent = totalEvents > 0 ? (eventsData.totalApplications / totalEvents).toFixed(0) : 0
    return { approvalRate, avgVolunteersPerEvent }
  }

  const getOrganizerStatus = (organizer) => {
    if (!organizer?.is_active) return 'Rejected'
    if (organizer?.is_approved) return 'Approved'
    return 'Pending'
  }

  const getOrganizerStatusStyles = (organizer) => {
    const status = getOrganizerStatus(organizer)
    if (status === 'Approved') return { bgcolor: '#4caf5020', color: '#2e7d32' }
    if (status === 'Rejected') return { bgcolor: '#f4433620', color: '#c62828' }
    return { bgcolor: '#ff980020', color: '#ed6c02' }
  }

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (userId) => api.post(`/api/v1/admin/approve-organizer/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-organizers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
      enqueueSnackbar('Organizer approved successfully', { variant: 'success' })
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to approve organizer: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (userId) => api.post(`/api/v1/admin/reject-organizer/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-organizers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })
      enqueueSnackbar('Organizer rejected', { variant: 'success' })
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to reject organizer: ${errorMessage(error, 'Unknown error')}`, { variant: 'error' })
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => api.delete(`/api/v1/admin/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      enqueueSnackbar('Event deleted successfully', { variant: 'success' })
    },
  })

  const approveEventMutation = useMutation({
    mutationFn: (eventId) => api.post(`/api/v1/admin/events/${eventId}/approve`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      const aiScore = data?.data?.ai_score ?? data?.ai_score
      enqueueSnackbar(
        aiScore
          ? `Event approved successfully (AI score: ${aiScore}/10)`
          : 'Event approved successfully',
        { variant: 'success' },
      )
    },
    onError: (error) => {
      enqueueSnackbar(`Event approval blocked: ${errorMessage(error, 'AI verification failed')}`, { variant: 'error' })
    },
  })

  const toggleEventStatusMutation = useMutation({
    mutationFn: (eventId) => api.post(`/api/v1/admin/events/${eventId}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      enqueueSnackbar('Event status updated', { variant: 'success' })
    },
  })

  const activeEvents = events.data?.filter((e) => e.status === 'active') ?? []
  const inactiveEvents = events.data?.filter((e) => e.status === 'inactive') ?? []
  const pendingEvents = events.data?.filter((e) => e.status === 'pending') ?? []

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Checking permissions...</Typography>
        </Stack>
      </Box>
    )
  }

  const handleDeleteEvent = (eventId) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return
    deleteEventMutation.mutate(eventId)
  }

  const handleToggleStatus = (eventId) => {
    if (!window.confirm('Are you sure you want to change this event status?')) return
    toggleEventStatusMutation.mutate(eventId)
  }

  const runOrganizerAi = async (id, name) => {
    setAiContext(`Organizer: ${name}`)
    setAiResult(null)
    setAiDialogOpen(true)
    setAiLoading(true)
    try {
      const res = await api.post(`/api/v1/admin/ai-evaluate/organizer/${id}`)
      setAiResult(res.data)
    } catch (e) {
      setAiResult({ score: 0, recommendation: 'review', summary: `Error: ${errorMessage(e, 'AI evaluation failed')}`, method: 'error', checks: {} })
    } finally {
      setAiLoading(false)
    }
  }

  const runEventAi = async (id, name) => {
    setAiContext(`Event: ${name}`)
    setAiResult(null)
    setAiDialogOpen(true)
    setAiLoading(true)
    try {
      const res = await api.post(`/api/v1/admin/ai-evaluate/event/${id}`)
      setAiResult(res.data)
    } catch (e) {
      setAiResult({ score: 0, recommendation: 'review', summary: `Error: ${errorMessage(e, 'AI evaluation failed')}`, method: 'error', checks: {} })
    } finally {
      setAiLoading(false)
    }
  }

  const recColor = (rec) => {
    if (rec === 'approve') return 'success'
    if (rec === 'reject') return 'error'
    return 'warning'
  }

  const handleLogout = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      })
      logout()
      enqueueSnackbar('Logged out successfully!', { variant: 'success' })
      navigate('/login', { replace: true })
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    } catch (error) {
      window.location.href = '/login'
    }
  }

  const handleProfileMenu = (event) => setAnchorEl(event.currentTarget)
  const handleProfileClose = () => setAnchorEl(null)

  const handleProfileUpdate = (updatedUser) => {
    if (updatedUser) {
      const token = localStorage.getItem('token')
      setSession(token, updatedUser)
    }
    queryClient.invalidateQueries({ queryKey: ['admin'] })
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'volunteers', label: 'Volunteers', icon: <VolunteerIcon /> },
    { id: 'organizers', label: 'Organizers', icon: <PeopleIcon />, badge: pendingOrganizers.data?.length },
    { id: 'events', label: 'Events', icon: <EventIcon /> },
    { id: 'approvals', label: 'Approvals', icon: <VerifiedIcon />, badge: pendingOrganizers.data?.length },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0c1f2f' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #ff7a18, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'center' }}>
          VolunAI Management
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => { setActiveTab(item.id); if (isMobile) setMobileOpen(false) }}
              sx={{
                borderRadius: 3,
                bgcolor: activeTab === item.id ? 'rgba(255,122,24,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,122,24,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: activeTab === item.id ? '#ff7a18' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ '& .MuiTypography-root': { color: activeTab === item.id ? '#ff7a18' : 'rgba(255,255,255,0.8)', fontWeight: activeTab === item.id ? 600 : 400 } }}
              />
              {item.badge > 0 && (
                <Chip label={item.badge} size="small" sx={{ bgcolor: '#ff7a18', color: '#fff', fontWeight: 600, fontSize: 10, height: 20 }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button 
          fullWidth 
          onClick={handleLogout}
          sx={{ 
            justifyContent: 'flex-start', 
            color: 'rgba(255,255,255,0.8)', 
            borderRadius: 3, 
            py: 1.5,
            '&:hover': { bgcolor: 'rgba(255,122,24,0.15)', color: '#ff7a18' }
          }}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  const volunteers = detailedAnalytics.data?.volunteers || []
  const paginatedVolunteers = volunteers.slice(volunteerPage * volunteerRowsPerPage, volunteerPage * volunteerRowsPerPage + volunteerRowsPerPage)
  const organizers = pendingOrganizers.data || []
  const paginatedOrganizers = organizers.slice(organizerPage * organizerRowsPerPage, organizerPage * organizerRowsPerPage + organizerRowsPerPage)

  const approvedOrganizersCount = detailedAnalytics.data?.organizers?.approved ?? overview.data?.totalOrganizers ?? 0
  const rejectedOrganizersCount = detailedAnalytics.data?.organizers?.rejected ?? 0
  const metrics = getKeyMetrics()
  const eventDistribution = getEventDistribution()
  const monthlyStats = getMonthlyData()
  const organizerDistribution = getOrganizerData()
  const topOrganizers = getTopOrganizers()

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        if (overview.isLoading || detailedAnalytics.isLoading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Loading dashboard data...</Typography>
              </Stack>
            </Box>
          )
        }
        
        if (overview.isError || detailedAnalytics.isError) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                <Typography color="error">Failed to load dashboard data</Typography>
                <Typography variant="body2" color="text.secondary">Check console for details</Typography>
                <Button variant="outlined" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin'] })}>
                  Retry
                </Button>
              </Stack>
            </Box>
          )
        }

        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshData} disabled={refreshing} sx={{ borderRadius: 2 }}>
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Active Events" value={overview.data?.totalActiveEvents ?? '—'} icon={<EventIcon />} color="#4caf50" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Total Volunteers" value={overview.data?.totalVolunteers ?? '—'} icon={<PeopleIcon />} color="#2196f3" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Total Organizers" value={overview.data?.totalOrganizers ?? '—'} icon={<VerifiedIcon />} color="#4caf50" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Pending Approvals" value={overview.data?.pendingApprovals ?? '—'} icon={<NotificationsIcon />} color="#f44336" />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Approved Organizers" value={approvedOrganizersCount ?? '—'} icon={<VerifiedIcon />} color="#4caf50" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Rejected Organizers" value={rejectedOrganizersCount ?? '—'} icon={<ErrorIcon />} color="#f44336" />
              </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, p: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0c1f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon /> Monthly Growth
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="volunteers" fill="#ff7a18" name="Volunteers" />
                      <Bar dataKey="events" fill="#2196f3" name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, p: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0c1f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon /> Event Status
                  </Typography>
                  {eventDistribution.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', py: 10 }}>No event data</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={eventDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                          {eventDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Grid>
            </Grid>

            {/* Organizer Stats Card */}
            <Card sx={{ borderRadius: 4, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0c1f2f' }}>Organizer Statistics</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={organizerDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {organizerDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={600}>Top Organizers</Typography>
                      {topOrganizers.length === 0 ? (
                        <Typography color="text.secondary">No organizer data available</Typography>
                      ) : (
                        topOrganizers.slice(0, 5).map((org, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff7a18' }}>{org.name?.charAt(0) || 'O'}</Avatar>
                              <Typography variant="body2" fontWeight={500}>{org.name}</Typography>
                            </Box>
                            <Chip label={`${org.event_count || 0} events`} size="small" sx={{ bgcolor: '#ff7a1820', color: '#ff7a18' }} />
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0c1f2f' }}>
                  Active Volunteers ({volunteers.length})
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id} hover>
                        <TableCell>{volunteer.name}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>{volunteer.phone || '—'}</TableCell>
                        <TableCell>{volunteer.city && volunteer.province ? `${volunteer.city}, ${volunteer.province}` : '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>{volunteer.skills || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={volunteers.length}
                  rowsPerPage={volunteerRowsPerPage}
                  page={volunteerPage}
                  onPageChange={(e, p) => setVolunteerPage(p)}
                  onRowsPerPageChange={(e) => { setVolunteerRowsPerPage(parseInt(e.target.value, 10)); setVolunteerPage(0) }}
                />
              </CardContent>
            </Card>
          </>
        )

      case 'analytics':
        if (overview.isLoading || detailedAnalytics.isLoading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Loading analytics...</Typography>
              </Stack>
            </Box>
          )
        }

        if (overview.isError || detailedAnalytics.isError) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                <Typography color="error">Failed to load analytics</Typography>
                <Typography variant="body2" color="text.secondary">Check console for details</Typography>
                <Button variant="outlined" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin'] })}>
                  Retry
                </Button>
              </Stack>
            </Box>
          )
        }

        return (
          <Stack spacing={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f' }}>Analytics Dashboard</Typography>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshData} disabled={refreshing} sx={{ borderRadius: 2 }}>
                {refreshing ? 'Refreshing...' : 'Refresh Analytics'}
              </Button>
            </Box>
            
            <Tabs value={analyticsTab} onChange={(e, v) => setAnalyticsTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Monthly Trends" />
              <Tab label="Volunteer Growth" />
              <Tab label="Event Distribution" />
              <Tab label="Organizer Stats" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {analyticsTab === 0 && (
                <Card sx={{ borderRadius: 4, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Monthly Volunteer & Event Growth</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="volunteers" stroke="#ff7a18" strokeWidth={3} name="Volunteers" />
                      <Line yAxisId="right" type="monotone" dataKey="events" stroke="#2196f3" strokeWidth={3} name="Events" />
                      <Line yAxisId="left" type="monotone" dataKey="organizers" stroke="#4caf50" strokeWidth={3} name="Organizers" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
              
              {analyticsTab === 1 && (
                <Card sx={{ borderRadius: 4, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Total Hours Donated</Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Area type="monotone" dataKey="hours" stroke="#4caf50" fill="#4caf5020" name="Hours Donated" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              )}
              
              {analyticsTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, p: 3, height: '100%' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Event Status Distribution</Typography>
                      {eventDistribution.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', py: 10 }}>No event data available</Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={eventDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                              {eventDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <ChartTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 4, p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Key Metrics</Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><VerifiedIcon sx={{ color: '#4caf50' }} /> Approval Rate</Box>
                          <Typography variant="h6" fontWeight={700}>{metrics.approvalRate}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUpIcon sx={{ color: '#ff7a18' }} /> Event Approval Rate</Box>
                          <Typography variant="h6" fontWeight={700}>{metrics.approvalRate}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PeopleIcon sx={{ color: '#2196f3' }} /> Avg Volunteers/Event</Box>
                          <Typography variant="h6" fontWeight={700}>{metrics.avgVolunteersPerEvent}</Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {analyticsTab === 3 && (
                <Card sx={{ borderRadius: 4, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Organizer Statistics</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={organizerDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                            {organizerDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <ChartTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Top Performing Organizers</Typography>
                      <Stack spacing={1.5}>
                        {topOrganizers.length === 0 ? (
                          <Typography color="text.secondary">No organizer data available</Typography>
                        ) : (
                          topOrganizers.map((org, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#ff7a18' }}>{org.name?.charAt(0) || 'O'}</Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight={600}>{org.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{org.email}</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip label={`${org.event_count || 0} events`} size="small" sx={{ bgcolor: '#ff7a1820', color: '#ff7a18' }} />
                                <Typography variant="caption" display="block" color="text.secondary">{org.city || 'Location not set'}</Typography>
                              </Box>
                            </Box>
                          ))
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Card>
              )}
            </Box>
          </Stack>
        )

      case 'volunteers':
        if (detailedAnalytics.isLoading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Loading volunteers...</Typography>
              </Stack>
            </Box>
          )
        }

        if (detailedAnalytics.isError) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                <Typography color="error">Failed to load volunteers</Typography>
                <Typography variant="body2" color="text.secondary">Check console for details</Typography>
                <Button variant="outlined" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'detailed-analytics'] })}>
                  Retry
                </Button>
              </Stack>
            </Box>
          )
        }

        return (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>All Volunteers ({volunteers.length})</Typography>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Interests</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id} hover>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>{volunteer.email}</TableCell>
                      <TableCell>{volunteer.phone || '—'}</TableCell>
                      <TableCell>{volunteer.city && volunteer.province ? `${volunteer.city}, ${volunteer.province}` : '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>{volunteer.skills || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>{volunteer.interests || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 120 }}>{volunteer.availability || '—'}</TableCell>
                      <TableCell><Chip label="Active" size="small" sx={{ bgcolor: '#4caf5020', color: '#2e7d32', fontWeight: 600 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={volunteers.length}
                rowsPerPage={volunteerRowsPerPage}
                page={volunteerPage}
                onPageChange={(e, p) => setVolunteerPage(p)}
                onRowsPerPageChange={(e) => { setVolunteerRowsPerPage(parseInt(e.target.value, 10)); setVolunteerPage(0) }}
              />
            </CardContent>
          </Card>
        )

      case 'organizers':
        if (allOrganizers.isLoading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Loading organizers...</Typography>
              </Stack>
            </Box>
          )
        }

        if (allOrganizers.isError) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <Stack spacing={2} alignItems="center">
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
                <Typography color="error">Failed to load organizers</Typography>
                <Typography variant="body2" color="text.secondary">Check console for details</Typography>
                <Button variant="outlined" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'organizers'] })}>
                  Retry
                </Button>
              </Stack>
            </Box>
          )
        }

        const displayedOrganizers = allOrganizers.data || []

        return (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>
                All Organizers ({displayedOrganizers.length})
              </Typography>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Approved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrganizers.slice(organizerPage * organizerRowsPerPage, organizerPage * organizerRowsPerPage + organizerRowsPerPage).map((organizer) => (
                    <TableRow key={organizer.id} hover>
                      <TableCell>{organizer.full_name}</TableCell>
                      <TableCell>{organizer.email}</TableCell>
                      <TableCell>{organizer.phone_number || '—'}</TableCell>
                      <TableCell>{organizer.city && organizer.province ? `${organizer.city}, ${organizer.province}` : '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getOrganizerStatus(organizer)}
                          size="small"
                          sx={{
                            ...getOrganizerStatusStyles(organizer),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{organizer.is_active && organizer.is_approved ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={displayedOrganizers.length}
                rowsPerPage={organizerRowsPerPage}
                page={organizerPage}
                onPageChange={(e, p) => setOrganizerPage(p)}
                onRowsPerPageChange={(e) => { setOrganizerRowsPerPage(parseInt(e.target.value, 10)); setOrganizerPage(0) }}
              />
            </CardContent>
          </Card>
        )

      case 'approvals':
        return (
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f' }}>Pending Organizer Approvals ({organizers.length})</Typography>
            {pendingOrganizers.isLoading && <LinearProgress />}
            {organizers.length === 0 ? (
              <Typography color="text.secondary">No pending approvals</Typography>
            ) : (
              <>
                {paginatedOrganizers.map((organizer) => (
                  <Card key={organizer.id} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{organizer.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{organizer.email}</Typography>
                          <Typography variant="body2" color="text.secondary">{organizer.city}, {organizer.province}</Typography>
                        </Box>
                        <IconButton onClick={() => setExpandedOrganizerId((c) => c === organizer.id ? null : organizer.id)} sx={{ color: '#ff7a18' }}>
                          <Visibility />
                        </IconButton>
                      </Box>
                    </CardContent>
                    <Collapse in={expandedOrganizerId === organizer.id} timeout="auto">
                      <CardContent sx={{ bgcolor: '#f8f9fa' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Phone:</Typography><Typography variant="body2">{organizer.phone_number || '—'}</Typography></Grid>
                          <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Skills:</Typography><Typography variant="body2">{organizer.skills || '—'}</Typography></Grid>
                          <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Interests:</Typography><Typography variant="body2">{organizer.interests || '—'}</Typography></Grid>
                          <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Availability:</Typography><Typography variant="body2">{organizer.availability || '—'}</Typography></Grid>
                          <Grid item xs={12}><Typography variant="caption" color="text.secondary">LinkedIn:</Typography><Typography variant="body2"><a href={organizer.linkedin} target="_blank" rel="noopener noreferrer">{organizer.linkedin || '—'}</a></Typography></Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                    <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2, pt: 0 }}>
                      <Button variant="outlined" onClick={() => runOrganizerAi(organizer.id, organizer.full_name)} disabled={aiLoading} sx={{ borderRadius: 2 }}>AI Review</Button>
                      <Button variant="contained" onClick={() => approveMutation.mutate(organizer.id)} disabled={approveMutation.isPending} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' }, borderRadius: 2 }}>Approve</Button>
                      <Button variant="contained" onClick={() => rejectMutation.mutate(organizer.id)} disabled={rejectMutation.isPending} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#da190b' }, borderRadius: 2 }}>Reject</Button>
                    </CardActions>
                  </Card>
                ))}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={organizers.length}
                  rowsPerPage={organizerRowsPerPage}
                  page={organizerPage}
                  onPageChange={(e, p) => setOrganizerPage(p)}
                  onRowsPerPageChange={(e) => { setOrganizerRowsPerPage(parseInt(e.target.value, 10)); setOrganizerPage(0) }}
                />
              </>
            )}
          </Stack>
        )

      case 'events':
        return (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Active Events ({activeEvents.length})</Typography>
              {events.isLoading ? <LinearProgress /> : events.isError ? <Alert severity="error">Error loading events</Alert> : activeEvents.length === 0 ? <Typography color="text.secondary">No active events</Typography> : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {activeEvents.map((event) => (
                    <EventCard key={event.id} event={event} actions={
                      <>
                        <Button variant="contained" onClick={() => handleDeleteEvent(event.id)} disabled={deleteEventMutation.isPending} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#da190b' }, borderRadius: 2 }}>Remove</Button>
                        <Button variant="contained" onClick={() => handleToggleStatus(event.id)} disabled={toggleEventStatusMutation.isPending} sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#fb8c00' }, borderRadius: 2 }}>Change Status</Button>
                      </>
                    } />
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Pending Events ({pendingEvents.length})</Typography>
              {events.isLoading ? <LinearProgress /> : events.isError ? <Alert severity="error">Error loading events</Alert> : pendingEvents.length === 0 ? <Typography color="text.secondary">No pending events</Typography> : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {pendingEvents.map((event) => (
                    <EventCard key={event.id} event={event} actions={
                      <>
                        <Button variant="outlined" onClick={() => runEventAi(event.id, event.name)} disabled={aiLoading} sx={{ borderRadius: 2 }}>AI Review</Button>
                        <Button variant="contained" onClick={() => approveEventMutation.mutate(event.id)} disabled={approveEventMutation.isPending} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' }, borderRadius: 2 }}>Approve</Button>
                        <Button variant="contained" onClick={() => handleDeleteEvent(event.id)} disabled={deleteEventMutation.isPending} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#da190b' }, borderRadius: 2 }}>Remove</Button>
                      </>
                    } />
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Inactive Events ({inactiveEvents.length})</Typography>
              {events.isLoading ? <LinearProgress /> : events.isError ? <Alert severity="error">Error loading events</Alert> : inactiveEvents.length === 0 ? <Typography color="text.secondary">No inactive events</Typography> : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                  {inactiveEvents.map((event) => (
                    <EventCard key={event.id} event={event} actions={
                      <>
                        <Button variant="contained" onClick={() => handleDeleteEvent(event.id)} disabled={deleteEventMutation.isPending} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#da190b' }, borderRadius: 2 }}>Remove</Button>
                        <Button variant="contained" onClick={() => handleToggleStatus(event.id)} disabled={toggleEventStatusMutation.isPending} sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#fb8c00' }, borderRadius: 2 }}>Change Status</Button>
                      </>
                    } />
                  ))}
                </Box>
              )}
            </Box>
          </Stack>
        )

      default:
        return <Typography>Coming soon...</Typography>
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Debug Info - Remove in production */}
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', p: 1, borderRadius: 1, fontSize: '12px' }}>
        User: {user?.email} ({user?.role})<br/>
        Overview: {overview.isLoading ? 'Loading' : overview.isError ? 'Error' : 'Loaded'}<br/>
        Analytics: {detailedAnalytics.isLoading ? 'Loading' : detailedAnalytics.isError ? 'Error' : 'Loaded'}
      </Box>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, background: 'linear-gradient(135deg, #0c1f2f, #0a1a28)', boxShadow: 'none', borderBottom: '1px solid rgba(255,122,24,0.2)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
          </Typography>
          
          <IconButton sx={{ color: 'white', mr: 1 }} onClick={refreshData} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
          
          <IconButton sx={{ color: 'white', mr: 1 }}>
            <Badge badgeContent={pendingOrganizers.data?.length || 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleProfileMenu}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#ff7a18' }}>
              {user?.fullName?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{user?.fullName || 'Admin'}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Administrator</Typography>
            </Box>
          </Box>
          
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileClose}>
            <MenuItem onClick={() => { handleProfileClose(); setProfileDialogOpen(true); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleProfileClose(); setActiveTab('analytics'); }}>
              <ListItemIcon><AnalyticsIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Analytics</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleProfileClose(); handleLogout(); }}>
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#f44336' }} /></ListItemIcon>
              <ListItemText sx={{ color: '#f44336' }}>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none', bgcolor: '#0c1f2f' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        {renderContent()}
      </Box>

      {/* Profile Settings Dialog */}
      <ProfileSettings 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)} 
        user={user}
        onUpdate={handleProfileUpdate}
      />

      {/* AI Dialog */}
      <Dialog open={aiDialogOpen} onClose={() => !aiLoading && setAiDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>AI-Assisted Review</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{aiContext}</Typography>
          {aiLoading ? <LinearProgress sx={{ my: 2 }} /> : null}
          {aiResult && (
            <Stack spacing={2}>
              <Alert severity={aiResult.method === 'error' ? 'error' : (aiResult.method === 'gemini' ? 'success' : 'info')}>
                {aiResult.method === 'error' ? 'Request failed' : (aiResult.method === 'gemini' ? 'Gemini AI Review' : 'Rule-based Scoring')}
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h2" fontWeight={800} sx={{ color: '#ff7a18' }}>{aiResult.score}</Typography>
                <Typography variant="h6" color="text.secondary">/10</Typography>
                <Chip label={aiResult.recommendation} color={recColor(aiResult.recommendation)} />
              </Box>
              <Typography variant="body1">{aiResult.summary}</Typography>
              <Typography variant="subtitle2" fontWeight={700}>Checks</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(aiResult.checks).map(([k, v]) => (
                  <Chip key={k} label={`${k.replace(/_/g, ' ')}: ${v ? '✓' : '✗'}`} size="small" color={v ? 'success' : 'default'} variant={v ? 'filled' : 'outlined'} />
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)} disabled={aiLoading}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}