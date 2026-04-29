import { useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, Chip, Collapse,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
  Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, useMediaQuery, useTheme, TextField,
  Badge, Tab, Tabs, Paper,
} from '@mui/material'
import {
  Dashboard as DashboardIcon, Event as EventIcon,
  People as PeopleIcon, Verified as VerifiedIcon,
  Menu as MenuIcon, Logout as LogoutIcon,
  CloudUpload as CloudUploadIcon, PersonSearch as PersonSearchIcon,
  Edit as EditIcon, CheckCircle as CheckCircleIcon,
  Favorite as FavoriteIcon, Schedule as ScheduleIcon,
  LocationOn as LocationIcon, Work as WorkIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { enqueueSnackbar } from 'notistack'
import { api, errorMessage } from '../../lib/api'
import { useAuthStore } from '../../state/authStore'

const drawerWidth = 280

function StatCard({ label, value, icon, color }) {
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
            <Typography variant="h4" fontWeight={800} sx={{ color: color || '#0c1f2f' }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color || '#ff7a18'}20`, width: 56, height: 56, color: color || '#ff7a18' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

function EventCard({ event, onApply, isApplied, hasCv, isPending }) {
  const statusColor = {
    active: { bg: '#4caf5020', color: '#2e7d32', label: 'Active' }
  }

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
      <CardContent sx={{ p: 2.5 }}>
        <img src={event.image} alt={event.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 12 }} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>{event.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <LocationIcon sx={{ fontSize: 14, color: '#64748b' }} />
          <Typography variant="body2" color="text.secondary">{event.location}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <ScheduleIcon sx={{ fontSize: 14, color: '#64748b' }} />
          <Typography variant="body2" color="text.secondary">{event.date}</Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1.5, color: '#475569' }} noWrap>{event.details}</Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`Skills: ${event.skillset}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
          <Chip label={`Required: ${event.candidates_required}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
          <Chip label={`Applied: ${event.candidates_applied}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
        </Box>
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2, borderRadius: 2 }}
          disabled={isApplied || !hasCv || isPending}
          onClick={() => onApply(event.id)}
        >
          {isApplied ? 'Applied' : (!hasCv ? 'Upload CV to Apply' : 'Apply Now')}
        </Button>
      </CardContent>
    </Card>
  )
}

export function VolunteerDashboard() {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [bioOpen, setBioOpen] = useState(false)
  const [bioText, setBioText] = useState('')
  const [addingBio, setAddingBio] = useState(false)
  const [profileResult, setProfileResult] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  // Queries
  const cvStatus = useQuery({
    queryKey: ['volunteer', 'cv-status'],
    queryFn: async () => (await api.get('/api/v1/volunteers/cv-status')).data,
  })

  const myApplications = useQuery({
    queryKey: ['volunteer', 'my-applications'],
    queryFn: async () => (await api.get('/api/v1/volunteers/my-applications')).data,
  })

  const myBio = useQuery({
    queryKey: ['volunteer', 'my-bio'],
    queryFn: async () => (await api.get('/api/v1/volunteers/my-bio')).data,
  })

  const events = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get('/api/v1/events/')).data,
  })

  const notifications = useQuery({
    queryKey: ['volunteer', 'notifications'],
    queryFn: async () => (await api.get('/api/v1/volunteers/notifications')).data,
  })

  // Mutations
  const applyMutation = useMutation({
    mutationFn: (eventId) => api.post(`/api/v1/volunteers/applications/${eventId}`),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'my-applications'] })
      enqueueSnackbar(`Applied to event successfully!`, { variant: 'success' })
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, 'Could not apply'), { variant: 'error' })
    },
  })

  const addBioMutation = useMutation({
    mutationFn: (bio) => api.post('/api/v1/volunteers/add-bio', { bio_text: bio }),
    onSuccess: () => {
      enqueueSnackbar('Bio added successfully!', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'my-bio'] })
      setBioOpen(false)
      setBioText('')
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, 'Could not add bio'), { variant: 'error' })
    },
  })

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId) => api.post(`/api/v1/volunteers/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer', 'notifications'] })
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, 'Could not mark notification as read'), { variant: 'error' })
    },
  })

  const hasCv = cvStatus.data?.has_cv === true
  const appliedIds = new Set(myApplications.data?.event_ids ?? [])
  const activeEvents = events.data?.filter((e) => e.status === 'active') ?? []
  const topMatches = profileResult?.suggested_events.filter((e) => e.match_score > 0).slice(0, 6) ?? []

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedExtensions = ['.pdf', '.doc', '.docx']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      if (!allowedExtensions.includes(fileExtension)) {
        enqueueSnackbar('Please upload a valid CV/Resume file (PDF, DOC, or DOCX format only)', { variant: 'error' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('File size must be less than 5MB', { variant: 'error' })
        return
      }
      setCvFile(file)
      setError(null)
    }
  }

  const handleUploadCV = async () => {
    if (!cvFile) { setError('Please select a file'); return }
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('resume', cvFile)
      await api.post('/api/v1/volunteers/upload-cv', fd)
      enqueueSnackbar('CV uploaded successfully!', { variant: 'success' })
      setCvFile(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
      await queryClient.invalidateQueries({ queryKey: ['volunteer', 'cv-status'] })
      await queryClient.invalidateQueries({ queryKey: ['volunteer', 'my-applications'] })
    } catch (e) {
      const msg = errorMessage(e, 'Upload failed')
      setError(String(msg))
      enqueueSnackbar(String(msg), { variant: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleCheckProfile = async () => {
    setProfileOpen(true)
    setProfileResult(null)
    setAnalyzing(true)
    try {
      const res = await api.post('/api/v1/volunteers/check-profile')
      setProfileResult(res.data)
      enqueueSnackbar('Profile analyzed', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(errorMessage(e, 'Profile check failed'), { variant: 'error' })
      setProfileOpen(false)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAddBio = () => {
    if (!bioText.trim()) { enqueueSnackbar('Please enter some bio text', { variant: 'warning' }); return }
    setAddingBio(true)
    addBioMutation.mutate(bioText, { onSettled: () => setAddingBio(false) })
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
      setTimeout(() => { window.location.href = '/login' }, 100)
    } catch (error) {
      window.location.href = '/login'
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'events', label: 'Events', icon: <EventIcon /> },
    { id: 'applications', label: 'My Applications', icon: <VerifiedIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'profile', label: 'My Profile', icon: <PeopleIcon /> },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0c1f2f' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #ff7a18, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Volunteer Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'center' }}>
          {user?.fullName || 'Volunteer'}
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
                {item.id === 'notifications' ? (
                  <Badge 
                    badgeContent={notifications.data?.filter(n => !n.is_read).length || 0} 
                    color="error"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ '& .MuiTypography-root': { color: activeTab === item.id ? '#ff7a18' : 'rgba(255,255,255,0.8)', fontWeight: activeTab === item.id ? 600 : 400 } }}
              />
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

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <Stack spacing={3}>
            {/* Stats Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="My Applications" value={myApplications.data?.event_ids?.length ?? 0} icon={<VerifiedIcon />} color="#4caf50" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Active Events" value={activeEvents.length} icon={<EventIcon />} color="#ff7a18" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="CV Status" value={hasCv ? 'Uploaded' : 'Pending'} icon={<CloudUploadIcon />} color={hasCv ? '#4caf50' : '#ff9800'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Bio Status" value={myBio.data?.bio ? 'Added' : 'Pending'} icon={<EditIcon />} color={myBio.data?.bio ? '#4caf50' : '#ff9800'} />
              </Grid>
            </Grid>

            {/* CV Upload Card */}
            <Card sx={{ borderRadius: 4, borderLeft: '4px solid #ff7a18' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0c1f2f' }}>Complete Your Profile</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Upload your CV to unlock personalized event recommendations and increase your chances of getting selected.
                </Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }}>CV uploaded successfully! Your profile is now complete.</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Stack spacing={2}>
                  <Box>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} id="cv-upload-input" />
                    <label htmlFor="cv-upload-input" style={{ display: 'block', cursor: 'pointer' }}>
                      <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} fullWidth sx={{ borderRadius: 2 }}>
                        Select CV (PDF/DOC/DOCX) - Max 5MB
                      </Button>
                    </label>
                    {cvFile && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Selected: {cvFile.name}</Typography>}
                  </Box>
                  <Button variant="contained" onClick={handleUploadCV} disabled={!cvFile || uploading} fullWidth sx={{ borderRadius: 2 }}>
                    {uploading ? 'Uploading...' : 'Upload CV'}
                  </Button>
                  {uploading && <LinearProgress />}
                </Stack>
              </CardContent>
            </Card>

            {/* Bio Card */}
            <Card sx={{ borderRadius: 4, borderLeft: '4px solid #2196f3' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#0c1f2f' }}>Add Your Bio</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Tell us about yourself! Our AI will correct grammar and make your bio professional.
                </Typography>
                {myBio.data?.bio ? (
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{myBio.data.bio}</Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setBioText(myBio.data.bio || ''); setBioOpen(true) }} fullWidth sx={{ borderRadius: 2 }}>
                      Edit Bio
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="outlined" onClick={() => setBioOpen(true)} fullWidth sx={{ borderRadius: 2 }}>Add Bio</Button>
                )}
              </CardContent>
            </Card>

            {/* Suggested Events */}
            {topMatches.length > 0 && hasCv && (
              <Card sx={{ borderRadius: 4, borderLeft: '4px solid #10b981' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#0c1f2f' }}>Suggested For You</Typography>
                  <Grid container spacing={2}>
                    {topMatches.map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                          <CardContent>
                            <Chip label={`${(event.match_score * 100).toFixed(0)}% Match`} size="small" sx={{ bgcolor: '#10b98120', color: '#10b981', mb: 1, fontWeight: 600 }} />
                            <img src={event.image} alt={event.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 8 }} />
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>{event.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{event.location} · {event.date}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }} noWrap>{event.details}</Typography>
                            <Button variant="contained" fullWidth sx={{ mt: 2, borderRadius: 2 }} disabled={appliedIds.has(event.id) || !hasCv} onClick={() => applyMutation.mutate(event.id)}>
                              {appliedIds.has(event.id) ? 'Applied' : 'Apply Now'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        )

      case 'events':
        return (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Live Events ({activeEvents.length})</Typography>
              {!hasCv && <Alert severity="info" sx={{ mb: 2 }}>Upload your resume to enable Apply on events.</Alert>}
              {events.isLoading ? <LinearProgress /> : events.isError ? <Alert severity="error">Error loading events</Alert> : activeEvents.length === 0 ? (
                <Typography color="text.secondary">No active events available</Typography>
              ) : (
                <Grid container spacing={3}>
                  {activeEvents.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <EventCard 
                        event={event}
                        onApply={applyMutation.mutate}
                        isApplied={appliedIds.has(event.id)}
                        hasCv={hasCv}
                        isPending={applyMutation.isPending && applyMutation.variables === event.id}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        )

      case 'applications':
        return (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>My Applications</Typography>
              {myApplications.isLoading ? <LinearProgress /> : myApplications.data?.applications?.length === 0 ? (
                <Typography color="text.secondary">No applications yet</Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Event Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myApplications.data?.applications?.map((app) => (
                      <TableRow key={app.id} hover>
                        <TableCell>{app.event_name}</TableCell>
                        <TableCell>{app.location}</TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell><Chip label={app.status} size="small" sx={{ bgcolor: '#4caf5020', color: '#2e7d32', fontWeight: 600 }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )

      case 'profile':
        return (
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 2 }}>My Profile</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{user?.fullName || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={500}>{user?.email || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={500}>{user?.phone || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1" fontWeight={500}>{user?.city ? `${user.city}, ${user.province || ''}` : '—'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {hasCv && (
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0c1f2f' }}>Profile Analysis</Typography>
                    <Button variant="contained" startIcon={<PersonSearchIcon />} onClick={handleCheckProfile} sx={{ borderRadius: 2 }}>
                      Analyze Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        )

      case 'notifications':
        return (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Notifications</Typography>
              {notifications.isLoading ? <LinearProgress /> : notifications.isError ? <Alert severity="error">Error loading notifications</Alert> : !notifications.data?.length ? (
                <Typography color="text.secondary">No notifications yet</Typography>
              ) : (
                <Stack spacing={2}>
                  {notifications.data.map((notification) => (
                    <Card key={notification.id} sx={{ 
                      borderRadius: 2, 
                      borderLeft: `4px solid ${notification.type === 'success' ? '#4caf50' : notification.type === 'error' ? '#f44336' : '#ff9800'}`,
                      bgcolor: notification.is_read ? '#f8f9fa' : 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                    }}>
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#0c1f2f', flex: 1 }}>
                            {notification.title}
                          </Typography>
                          {!notification.is_read && (
                            <Chip label="New" size="small" color="primary" sx={{ ml: 1, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.created_at).toLocaleString()}
                          </Typography>
                          {!notification.is_read && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => markNotificationReadMutation.mutate(notification.id)}
                              disabled={markNotificationReadMutation.isPending}
                              sx={{ borderRadius: 1 }}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        )

      default:
        return <Typography>Coming soon...</Typography>
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, background: 'linear-gradient(135deg, #0c1f2f, #0a1a28)', boxShadow: 'none', borderBottom: '1px solid rgba(255,122,24,0.2)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="Volunteer" size="small" sx={{ bgcolor: '#ff7a1820', color: '#ff7a18', fontWeight: 600 }} />
          </Box>
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

      {/* Bio Dialog */}
      <Dialog open={bioOpen} onClose={() => !addingBio && setBioOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>Add Bio</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Write a short bio about yourself. Our AI will correct grammar and make your text professional.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Enter your bio here..."
            disabled={addingBio}
          />
          {addingBio && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBioOpen(false)} disabled={addingBio}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBio} disabled={addingBio || !bioText.trim()} sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a15' } }}>
            {addingBio ? 'Adding...' : 'Add Bio'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Analysis Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>Profile Analysis</DialogTitle>
        <DialogContent dividers>
          {analyzing ? (
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Typography color="text.secondary">Reading your uploaded CV and matching it to active events...</Typography>
              <LinearProgress />
            </Stack>
          ) : profileResult ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>Extracted from Resume</Typography>
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="body2">{profileResult.extracted_text_preview}</Typography>
              </Paper>
              <Typography variant="subtitle2" fontWeight={700}>Skills from Resume</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {profileResult.skills_from_resume.slice(0, 20).map((s) => <Chip key={s} label={s} size="small" color="primary" variant="outlined" />)}
              </Stack>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>Recommended Events</Typography>
              <Stack spacing={1.5}>
                {profileResult.suggested_events.slice(0, 8).map((ev) => (
                  <Card key={ev.id} variant="outlined">
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography fontWeight={700}>{ev.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{ev.location} · {ev.date}</Typography>
                        </Box>
                        <Chip label={`${(ev.match_score * 100).toFixed(0)}%`} size="small" color={ev.match_score > 0.15 ? 'success' : 'default'} />
                      </Box>
                      {ev.matched_keywords.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Matches: {ev.matched_keywords.join(', ')}
                        </Typography>
                      )}
                      <Button variant="contained" size="small" sx={{ mt: 1.5 }} disabled={appliedIds.has(ev.id)} onClick={() => applyMutation.mutate(ev.id)}>
                        {appliedIds.has(ev.id) ? 'Applied' : 'Apply Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}