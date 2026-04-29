import { useState, useEffect, useRef } from 'react'
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
  Add as AddIcon, Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon, LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon,
  Visibility as VisibilityIcon, CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon, MyLocation as MyLocationIcon,
} from '@mui/icons-material'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../state/authStore'
import { enqueueSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../../lib/api'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'


const drawerWidth = 280

function formatPostedAt(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return String(iso) }
}

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
            <Typography variant="h3" fontWeight={800} sx={{ color: color || '#0c1f2f' }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color || '#ff7a18'}20`, width: 56, height: 56, color: color || '#ff7a18' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

function EventCard({ event, onViewStats }) {
  const statusColor = {
    active: { bg: '#4caf5020', color: '#2e7d32', label: 'Active' },
    pending: { bg: '#ff980020', color: '#ed6c02', label: 'Pending' },
    inactive: { bg: '#9e9e9e20', color: '#616161', label: 'Inactive' }
  }[event.status] || { bg: '#9e9e9e20', color: '#616161', label: event.status || 'Unknown' }

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
      <CardContent sx={{ p: 2.5 }}>
        <img src={event.image} alt={event.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 12 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{event.name}</Typography>
          <Chip label={statusColor.label} size="small" sx={{ bgcolor: statusColor.bg, color: statusColor.color, fontWeight: 600 }} />
        </Box>
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
          variant="outlined" 
          fullWidth 
          sx={{ mt: 2, borderRadius: 2 }}
          onClick={() => onViewStats(event.id)}
          startIcon={<AnalyticsIcon />}
        >
          View Applicants
        </Button>
      </CardContent>
    </Card>
  )
}

// Skills Selection Component
function SkillsSelector({ selectedSkills, onSkillsChange }) {
  const presetSkills = ['Event Planning', 'Volunteer Management', 'Fundraising', 'Marketing', 'Community Engagement', 'Project Management', 'Teaching', 'Healthcare', 'Social Media', 'Data Entry', 'Excel', 'Accounts', 'Document Handling', 'Customer Service']
  const [customSkill, setCustomSkill] = useState('')

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill])
    }
  }

  const removeSkill = (skill) => {
    onSkillsChange(selectedSkills.filter(s => s !== skill))
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      onSkillsChange([...selectedSkills, customSkill.trim()])
      setCustomSkill('')
    }
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#ff7a18', fontWeight: 600, mb: 1 }}>Popular Skills</Typography>
        <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
          {presetSkills.map(skill => (
            <Chip
              key={skill}
              label={skill}
              onClick={() => addSkill(skill)}
              variant={selectedSkills.includes(skill) ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 2,
                bgcolor: selectedSkills.includes(skill) ? '#ff7a18' : 'transparent',
                color: selectedSkills.includes(skill) ? 'white' : '#666',
                borderColor: '#ddd',
                '&:hover': { bgcolor: '#ff7a18', color: 'white' }
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ color: '#ff7a18', fontWeight: 600, mb: 1 }}>Add Custom Skill</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Enter your skill"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button 
            size="small" 
            onClick={addCustomSkill} 
            sx={{ bgcolor: '#f5f5f5', color: '#ff7a18', border: '1px solid #e0e0e0', borderRadius: 2 }}
          >
            Add +
          </Button>
        </Stack>
      </Box>

      {selectedSkills.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#ff7a18', fontWeight: 600, mb: 1 }}>Selected Skills ({selectedSkills.length})</Typography>
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
            {selectedSkills.map(skill => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => removeSkill(skill)}
                size="small"
                sx={{ bgcolor: '#f5f5f5', color: '#ff7a18', borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}

// Location Picker with OpenStreetMap
function LocationPicker({ location, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [marker, setMarker] = useState(null)
  const [map, setMap] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)
  
  const mapRef = useRef(null)
  const inputRef = useRef(null)
  const initAttempted = useRef(false)
  const initInProgress = useRef(false)
  const initCompleted = useRef(false)
  
  const { searchLocation, reverseGeocode, getCurrentLocation, loading, error } = useGoogleMaps()

  // Pakistan bounds
  const pakistanBounds = {
    north: 37.0841,
    south: 23.6345,
    west: 60.8724,
    east: 77.8375,
  }

  // Initialize map on component mount
  useEffect(() => {
    // Prevent multiple initialization attempts (fixes React Strict Mode double-run issue)
    if (initAttempted.current) return
    initAttempted.current = true
    
    const initializeMap = () => {
      // Prevent any initialization attempts if already completed or in progress
      if (initCompleted.current || initInProgress.current || mapInitialized || map) {
        console.log('Map initialization already completed or in progress')
        return
      }
      
      if (mapRef.current && !map && window.L && !mapLoading && mapRef.current.offsetWidth > 0) {
        initInProgress.current = true
        console.log('Initializing Leaflet map...')
        setMapLoading(true)
        
        try {
          // Initialize Leaflet map centered on Pakistan
          const mapInstance = window.L.map(mapRef.current).setView([30.3753, 69.3451], 6)

          // Add OpenStreetMap tiles (try multiple providers for reliability)
          const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            errorTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' // Fallback
          }).addTo(mapInstance)

          // Handle tile loading errors
          tileLayer.on('tileerror', (e) => {
            console.warn('Tile loading error, trying fallback provider')
            // Try a different tile provider if the main one fails
            mapInstance.removeLayer(tileLayer)
            window.L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
              maxZoom: 18,
            }).addTo(mapInstance)
          })

          // Restrict map to Pakistan bounds
          const bounds = window.L.latLngBounds(
            [pakistanBounds.south, pakistanBounds.west],
            [pakistanBounds.north, pakistanBounds.east]
          )
          mapInstance.setMaxBounds(bounds)
          mapInstance.on('drag', () => {
            mapInstance.panInsideBounds(bounds, { animate: false })
          })

          setMap(mapInstance)
          setMapInitialized(true)

          // Handle map clicks
          mapInstance.on('click', async (e) => {
            const { lat, lng } = e.latlng
            await handleMapClick(lat, lng)
          })
          
          // Force map to recalculate size after initialization
          setTimeout(() => {
            mapInstance.invalidateSize()
            console.log('Map size invalidated')
          }, 100)
          
          console.log('Leaflet map initialized successfully')
          setMapLoading(false)
          initInProgress.current = false
          initCompleted.current = true
          
          // Show success message
          enqueueSnackbar('Map loaded successfully!', { variant: 'success' })
        } catch (error) {
          console.error('Error initializing map:', error)
          setMapLoading(false)
          initInProgress.current = false
          initCompleted.current = true
          enqueueSnackbar('Failed to load map. Please refresh and try again.', { variant: 'error' })
        }
      } else {
        console.log('Map initialization conditions not met:', {
          mapRef: !!mapRef.current,
          map: !!map,
          windowL: !!window.L,
          mapLoading,
          mapInitialized
        })
      }
    }

    // Try to initialize immediately with a small delay to ensure DOM is ready
    setTimeout(() => {
      initializeMap()
    }, 50)
    
    // If Leaflet is not loaded yet, wait for it
    if (!window.L) {
      const checkLeaflet = setInterval(() => {
        if (window.L && !initAttempted.current) {
          clearInterval(checkLeaflet)
          setTimeout(() => {
            initializeMap()
          }, 50)
        }
      }, 100)
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLeaflet)
        if (!window.L) {
          console.error('Leaflet failed to load within 5 seconds')
        }
      }, 5000)
    }

    return () => {
      if (map && mapInitialized) {
        map.remove()
        setMap(null)
        setMarker(null)
        setMapInitialized(false)
      }
      // Reset all initialization flags on cleanup
      initAttempted.current = false
      initInProgress.current = false
      initCompleted.current = false
    }
  }, []) // Empty dependency array - only run once on mount

  // Update marker when location changes
  useEffect(() => {
    if (!map) return
    
    const lat = location.lat || 30.3753
    const lng = location.lng || 69.3451
    
    if (marker) {
      // Update existing marker position
      marker.setLatLng([lat, lng])
    } else {
      // Create new marker
      const newMarker = window.L.marker([lat, lng], { draggable: true }).addTo(map)
      setMarker(newMarker)

      newMarker.on('dragend', async (e) => {
        const { lat: dragLat, lng: dragLng } = e.target.getLatLng()
        await handleMapClick(dragLat, dragLng)
      })
    }
  }, [map, marker, location.lat, location.lng])

  // Handle map resize
  useEffect(() => {
    if (map) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(() => {
        map.invalidateSize()
      }, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [map])

  // Handle search input
  const handleSearchChange = async (value) => {
    setSearchQuery(value)
    if (value.length >= 3) {
      const results = await searchLocation(value)
      setSuggestions(results)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    // Check if location is within Pakistan bounds
    if (suggestion.lat >= pakistanBounds.south && suggestion.lat <= pakistanBounds.north && 
        suggestion.lon >= pakistanBounds.west && suggestion.lon <= pakistanBounds.east) {
      onLocationChange({
        address: suggestion.display_name,
        lat: suggestion.lat,
        lng: suggestion.lon
      })
      
      // Update map center and zoom
      if (map) {
        map.setView([suggestion.lat, suggestion.lon], 13)
      }
      
      // Update marker
      if (marker) {
        marker.setLatLng([suggestion.lat, suggestion.lon])
      } else {
        const newMarker = window.L.marker([suggestion.lat, suggestion.lon], { draggable: true }).addTo(map)
        setMarker(newMarker)
        
        newMarker.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng()
          await handleMapClick(lat, lng)
        })
      }
      
      setSearchQuery('')
      setSuggestions([])
      setShowSuggestions(false)
      enqueueSnackbar('Location selected successfully!', { variant: 'success' })
    } else {
      enqueueSnackbar('Please select a location within Pakistan', { variant: 'warning' })
    }
  }

  // Handle map click
  const handleMapClick = async (lat, lng) => {
    // Check if clicked location is within Pakistan
    if (lat >= pakistanBounds.south && lat <= pakistanBounds.north && 
        lng >= pakistanBounds.west && lng <= pakistanBounds.east) {
      
      try {
        const locationData = await reverseGeocode(lat, lng)
        if (locationData) {
          onLocationChange({
            address: locationData.display_name,
            lat: locationData.lat,
            lng: locationData.lon
          })
          
          // Update marker
          if (marker) {
            marker.setLatLng([lat, lng])
          } else {
            const newMarker = window.L.marker([lat, lng], { draggable: true }).addTo(map)
            setMarker(newMarker)
            
            newMarker.on('dragend', async (e) => {
              const { lat: dragLat, lng: dragLng } = e.target.getLatLng()
              await handleMapClick(dragLat, dragLng)
            })
          }
          
          enqueueSnackbar('Location selected successfully!', { variant: 'success' })
        }
      } catch (err) {
        // Fallback to coordinates if reverse geocoding fails
        onLocationChange({
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat: lat,
          lng: lng
        })
        
        // Update marker
        if (marker) {
          marker.setLatLng([lat, lng])
        } else {
          const newMarker = window.L.marker([lat, lng], { draggable: true }).addTo(map)
          setMarker(newMarker)
          
          newMarker.on('dragend', async (e) => {
            const { lat: dragLat, lng: dragLng } = e.target.getLatLng()
            await handleMapClick(dragLat, dragLng)
          })
        }
        
        enqueueSnackbar('Location selected (coordinates only)', { variant: 'info' })
      }
    } else {
      enqueueSnackbar('Please select a location within Pakistan', { variant: 'warning' })
    }
  }

  // Get current location
  const getCurrentLocationHandler = async () => {
    try {
      const locationData = await getCurrentLocation()
      if (locationData) {
        // Check if current location is in Pakistan
        if (locationData.lat >= pakistanBounds.south && locationData.lat <= pakistanBounds.north && 
            locationData.lon >= pakistanBounds.west && locationData.lon <= pakistanBounds.east) {
          onLocationChange({
            address: locationData.display_name,
            lat: locationData.lat,
            lng: locationData.lon
          })
          
          // Update map
          if (map) {
            map.setView([locationData.lat, locationData.lon], 13)
          }
          
          // Update marker
          if (marker) {
            marker.setLatLng([locationData.lat, locationData.lon])
          } else {
            const newMarker = window.L.marker([locationData.lat, locationData.lon], { draggable: true }).addTo(map)
            setMarker(newMarker)
            
            newMarker.on('dragend', async (e) => {
              const { lat, lng } = e.target.getLatLng()
              await handleMapClick(lat, lng)
            })
          }
          
          enqueueSnackbar('Location detected successfully!', { variant: 'success' })
        } else {
          enqueueSnackbar('Your current location is outside Pakistan. Please select a location within Pakistan.', { variant: 'warning' })
        }
      }
    } catch (err) {
      enqueueSnackbar('Unable to get location. Please enter manually.', { variant: 'error' })
    }
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#ff7a18', fontWeight: 600, mb: 1 }}>Event Location (Pakistan Only) *</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="Search for a location in Pakistan"
            value={location.address || ''}
            onChange={(e) => onLocationChange({ ...location, address: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button 
            variant="outlined" 
            onClick={getCurrentLocationHandler}
            sx={{ minWidth: 'auto', px: 2, borderColor: '#ff7a18', color: '#ff7a18' }}
            title="Get Current Location"
          >
            <MyLocationIcon />
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Click on the map or search to select a location within Pakistan
        </Typography>
      </Box>

      <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        {mapLoading ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              🗺️ Loading Map...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Initializing OpenStreetMap for Pakistan locations.
            </Typography>
            <LinearProgress sx={{ mt: 2, maxWidth: 200, mx: 'auto' }} />
          </Box>
        ) : window.L ? (
          <div 
            ref={mapRef} 
            style={{ 
              height: '100%', 
              width: '100%', 
              borderRadius: '8px',
              minHeight: '300px' 
            }} 
          />
        ) : (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              🗺️ OpenStreetMap
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loading map... Free OpenStreetMap integration.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              If map doesn't load, check your internet connection.
            </Typography>
          </Box>
        )}
      </Box>
      
      {location.address && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Selected Location:</strong> {location.address}
          </Typography>
          {location.lat && location.lng && (
            <Typography variant="caption" color="text.secondary">
              Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </Typography>
          )}
        </Alert>
      )}
    </Stack>
  )
}

// Image Upload Component
function ImageUploader({ imageUrl, onImageChange }) {
  const [preview, setPreview] = useState(imageUrl || '')
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar('Please upload JPG, PNG, or WEBP image', { variant: 'error' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image size must be less than 5MB', { variant: 'error' })
      return
    }

    setUploading(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      onImageChange(reader.result)
      setUploading(false)
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success' })
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (url) => {
    setPreview(url)
    onImageChange(url)
  }

  const clearImage = () => {
    setPreview('')
    onImageChange('')
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ color: '#ff7a18', fontWeight: 600 }}>Event Image *</Typography>
      
      {/* Image Preview */}
      {preview && (
        <Box sx={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
          <img src={preview} alt="Preview" style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: 8 }} />
          <IconButton
            size="small"
            onClick={clearImage}
            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#f44336', color: 'white', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Upload Options */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          sx={{ borderColor: '#ff7a18', color: '#ff7a18' }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileUpload}
          />
        </Button>
        
        <TextField
          size="small"
          fullWidth
          placeholder="Or paste image URL"
          value={imageUrl || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Stack>
    </Stack>
  )
}

export function OrganizerDashboard() {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [statsEventId, setStatsEventId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [applicationNoticeOpen, setApplicationNoticeOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [eventLocation, setEventLocation] = useState({ address: '', lat: null, lng: null })
  const [eventImage, setEventImage] = useState('')
  const [form, setForm] = useState({ 
    name: '', details: '', date: '', 
    candidates_required: 1, 
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectingApplicant, setSelectingApplicant] = useState(null)

  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const organizerStatus = user?.organizerStatus ?? (user?.role === 'organizer' ? (user.isApproved ?? user.is_approved) ? 'approved' : 'pending' : undefined)
  const canCreate = user?.role === 'organizer' && organizerStatus === 'approved'

  // Queries
  const applicationSummary = useQuery({
    queryKey: ['organizer', 'application-summary'],
    queryFn: async () => (await api.get('/api/v1/organizer/application-summary')).data,
    enabled: organizerStatus === 'approved',
  })

  const dashboardStats = useQuery({
    queryKey: ['organizer', 'dashboard-stats'],
    queryFn: async () => (await api.get('/api/v1/organizer/dashboard-stats')).data,
    enabled: organizerStatus === 'approved',
  })

  const myEvents = useQuery({
    queryKey: ['organizer', 'my-events'],
    queryFn: async () => (await api.get('/api/v1/organizer/my-events')).data,
    enabled: organizerStatus === 'approved',
  })

  const applicantStats = useQuery({
    queryKey: ['organizer', 'event-stats', statsEventId],
    queryFn: async () => (await api.get(`/api/v1/organizer/events/${statsEventId}/applicant-stats`)).data,
    enabled: organizerStatus === 'approved' && statsEventId != null,
  })

  // Create Event Mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData) => api.post('/api/v1/events/', eventData),
    onSuccess: () => {
      enqueueSnackbar('Event submitted for admin approval', { variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'my-events'] })
      queryClient.invalidateQueries({ queryKey: ['organizer', 'dashboard-stats'] })
      setDialogOpen(false)
      setForm({ name: '', details: '', date: '', candidates_required: 1 })
      setSelectedSkills([])
      setEventLocation({ address: '', lat: null, lng: null })
      setEventImage('')
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, 'Failed to submit event'), { variant: 'error' })
    },
  })

  const handleChange = (field, value) => setForm((c) => ({ ...c, [field]: value }))

  const handleSubmit = async () => {
    if (!user) { enqueueSnackbar('Unable to submit event: user not found', { variant: 'error' }); return }
    if (!eventLocation.address && (!eventLocation.lat || !eventLocation.lng)) { enqueueSnackbar('Please select event location on the map or enter location text', { variant: 'warning' }); return }
    if (!eventImage) { enqueueSnackbar('Please upload event image', { variant: 'warning' }); return }
    if (selectedSkills.length === 0) { enqueueSnackbar('Please add at least one skill', { variant: 'warning' }); return }
    
    setSubmitting(true)
    try {
      await createEventMutation.mutateAsync({ 
        ...form, 
        organizer_id: user.id, 
        status: 'pending',
        location: eventLocation.address || `${eventLocation.lat?.toFixed(4)}, ${eventLocation.lng?.toFixed(4)}`,
        lat: eventLocation.lat?.toString(),
        lng: eventLocation.lng?.toString(),
        image: eventImage,
        skillset: selectedSkills.join(', ')
      })
    } finally {
      setSubmitting(false)
    }
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

  const handleSelectApplicant = async (eventId, volunteerId) => {
    setSelectingApplicant(volunteerId)
    try {
      await api.post(`/api/v1/organizer/events/${eventId}/applicants/${volunteerId}/select`)
      enqueueSnackbar('Applicant shortlisted successfully!', { variant: 'success' })
      // Refresh the applicant stats
      queryClient.invalidateQueries(['organizer', 'event-stats', eventId])
    } catch (error) {
      enqueueSnackbar('Failed to shortlist applicant: ' + errorMessage(error), { variant: 'error' })
    } finally {
      setSelectingApplicant(null)
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'events', label: 'My Events', icon: <EventIcon /> },
    { id: 'applications', label: 'Applications', icon: <PeopleIcon /> },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0c1f2f' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #ff7a18, #ffd200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Organizer Panel
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'center' }}>
          {user?.fullName || 'Organizer'}
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
            {organizerStatus && organizerStatus !== 'approved' && (
              <Card sx={{ borderRadius: 4, borderLeft: '4px solid #ff9800' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1, color: '#0c1f2f' }}>
                    Account Status: <Chip label={organizerStatus} size="small" sx={{ bgcolor: '#ff980020', color: '#ed6c02', fontWeight: 600, ml: 1 }} />
                  </Typography>
                  <Typography color="text.secondary">
                    Organizers can create and publish events only after admin approval. Please wait for approval.
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Total Events" value={dashboardStats.data?.total_events ?? 0} icon={<EventIcon />} color="#ff7a18" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Active Events" value={dashboardStats.data?.active_events ?? 0} icon={<VerifiedIcon />} color="#4caf50" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Pending Events" value={dashboardStats.data?.pending_events ?? 0} icon={<PendingIcon />} color="#ff9800" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard label="Total Applications" value={dashboardStats.data?.total_applications ?? 0} icon={<PeopleIcon />} color="#2196f3" />
              </Grid>
            </Grid>

            {canCreate && (
              <Card sx={{ borderRadius: 4, borderLeft: '4px solid #ff7a18' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: '#0c1f2f' }}>Create New Event</Typography>
                      <Typography color="text.secondary">Submit a new event for admin approval</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 2 }}>
                      Create Event
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {canCreate && myEvents.data?.events?.length > 0 && (
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: '#0c1f2f' }}>Recent Events</Typography>
                  <Grid container spacing={2}>
                    {myEvents.data.events.slice(0, 3).map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <EventCard event={event} onViewStats={setStatsEventId} />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f' }}>My Events</Typography>
                {canCreate && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 2 }}>
                    Create Event
                  </Button>
                )}
              </Box>
              {!canCreate && organizerStatus !== 'approved' && (
                <Alert severity="info" sx={{ mb: 2 }}>Your account is pending approval. You cannot create events yet.</Alert>
              )}
              {myEvents.isLoading ? <LinearProgress /> : myEvents.isError ? <Alert severity="error">Could not load your events.</Alert> : !myEvents.data?.events?.length ? (
                <Typography color="text.secondary">No events created yet.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {myEvents.data.events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <EventCard event={event} onViewStats={setStatsEventId} />
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
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0c1f2f', mb: 3 }}>Applications Summary</Typography>
              {applicationSummary.isLoading ? <LinearProgress /> : applicationSummary.isError ? <Alert severity="error">Could not load applications.</Alert> : !applicationSummary.data?.events?.length ? (
                <Typography color="text.secondary">No applications received yet.</Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Event Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Event Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Posted Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">Applications</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applicationSummary.data.events.map((row) => (
                      <TableRow key={row.event_id} hover>
                        <TableCell>{row.event_name}</TableCell>
                        <TableCell>{row.event_date}</TableCell>
                        <TableCell>{formatPostedAt(row.posted_at)}</TableCell>
                        <TableCell align="right">
                          <Chip label={row.volunteers_applied} size="small" sx={{ bgcolor: '#2196f320', color: '#1976d2', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="center">
                          <Button size="small" variant="outlined" onClick={() => setStatsEventId(row.event_id)} startIcon={<VisibilityIcon />}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            <Chip label={organizerStatus === 'approved' ? 'Approved' : 'Pending'} size="small" sx={{ bgcolor: organizerStatus === 'approved' ? '#4caf5020' : '#ff980020', color: organizerStatus === 'approved' ? '#2e7d32' : '#ed6c02', fontWeight: 600 }} />
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

      {/* Application Notice Dialog */}
      <Dialog open={applicationNoticeOpen} onClose={() => setApplicationNoticeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>Volunteer Applications</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Here is how many volunteers have applied to events you posted.</Typography>
          <Stack spacing={2}>
            {applicationSummary.data?.events.map((row) => (
              <Card key={row.event_id} variant="outlined">
                <CardContent sx={{ py: 2 }}>
                  <Typography fontWeight={800}>{row.event_name}</Typography>
                  <Typography variant="body2" color="text.secondary">Event date: {row.event_date}</Typography>
                  <Typography variant="body2" color="text.secondary">Posted: {formatPostedAt(row.posted_at)}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Volunteers applied: <strong>{row.volunteers_applied}</strong></Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setApplicationNoticeOpen(false)} sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a15' } }}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsEventId != null} onClose={() => setStatsEventId(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>Applicant Statistics</DialogTitle>
        <DialogContent dividers>
          {applicantStats.isLoading ? <LinearProgress />
            : applicantStats.isError ? <Alert severity="error">Could not load applicant stats.</Alert>
            : applicantStats.data ? (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>{applicantStats.data.event_name}</Typography>
                <Typography variant="body2" color="text.secondary">Required skillset: <Chip label={applicantStats.data.event_skillset} size="small" /></Typography>
                <Typography variant="body2" color="text.secondary">
                  Each volunteer is scored <strong>1–9</strong> for fit between their profile and this event's requirements.
                </Typography>
                {!applicantStats.data.applicants?.length ? (
                  <Typography color="text.secondary">No applications yet for this event.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Volunteer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Resume</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fit Score (1-9)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applicantStats.data.applicants.map((a) => (
                        <TableRow key={a.volunteer_id} hover>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight={600}>{a.full_name}</Typography>
                              {a.bio && <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.bio}</Typography>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">{a.email}</Typography>
                              {a.phone_number && <Typography variant="caption" color="text.secondary">{a.phone_number}</Typography>}
                              {a.city && <Typography variant="caption" color="text.secondary">{a.city}{a.province ? `, ${a.province}` : ''}</Typography>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {a.resume_path ? (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                startIcon={<CloudUploadIcon />}
                                onClick={() => window.open(`${api.defaults.baseURL}/uploads/resumes/${a.resume_path.split('/').pop()}`, '_blank')}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                View
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">No resume</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {a.skills ? (
                              <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.skills}</Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">No skills listed</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 160 }}>
                            <Stack spacing={0.5} alignItems="flex-end">
                              <Typography variant="body2" fontWeight={700}>{a.skill_match_score} / 9</Typography>
                              <Box sx={{ width: '100%', maxWidth: 140, bgcolor: '#e0e0e0', borderRadius: 1, height: 8 }}>
                                <Box sx={{ width: `${(a.skill_match_score / 9) * 100}%`, bgcolor: '#ff7a18', height: 8, borderRadius: 1 }} />
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={a.application_status || 'Applied'} 
                              size="small" 
                              color={a.application_status === 'shortlisted' ? 'success' : 'default'}
                              variant={a.application_status === 'shortlisted' ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>
                            {a.application_status !== 'shortlisted' && (
                              <Button 
                                size="small" 
                                variant="contained" 
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleSelectApplicant(statsEventId, a.volunteer_id)}
                                disabled={selectingApplicant === a.volunteer_id}
                                sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                              >
                                {selectingApplicant === a.volunteer_id ? 'Selecting...' : 'Select'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            ) : null}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setStatsEventId(null)} sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a15' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Event Dialog - Updated */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: '#0c1f2f', color: 'white' }}>Create New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField 
              label="Event Name" 
              value={form.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              fullWidth 
              required 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField 
              label="Event Description" 
              value={form.details} 
              onChange={(e) => handleChange('details', e.target.value)} 
              multiline 
              rows={3} 
              fullWidth 
              required 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            {/* Location Picker Component */}
            <LocationPicker location={eventLocation} onLocationChange={setEventLocation} />
            
            {/* Image Upload Component */}
            <ImageUploader imageUrl={eventImage} onImageChange={setEventImage} />
            
            <TextField 
              label="Volunteers Required" 
              type="number" 
              value={form.candidates_required} 
              onChange={(e) => handleChange('candidates_required', Number(e.target.value))} 
              fullWidth 
              required 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            {/* Skills Selector Component */}
            <SkillsSelector selectedSkills={selectedSkills} onSkillsChange={setSelectedSkills} />
            
            <TextField 
              label="Event Date" 
              type="date" 
              value={form.date} 
              onChange={(e) => handleChange('date', e.target.value)} 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
              required 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting || !form.name || !form.date || (!eventLocation.address && (!eventLocation.lat || !eventLocation.lng)) || !eventImage || selectedSkills.length === 0} 
            sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a15' } }}
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}