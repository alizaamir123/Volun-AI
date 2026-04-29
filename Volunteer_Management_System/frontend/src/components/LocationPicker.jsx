// src/components/LocationPicker.jsx
import { useState, useEffect, useRef } from 'react'
import {
  Box, TextField, Paper, MenuItem, Typography, CircularProgress,
  IconButton, Button, Stack, Chip, Alert
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { useGoogleMaps } from '../hooks/useGoogleMaps'

export function LocationPicker({ value, onChange, error, helperText }) {
  const [query, setQuery] = useState(value?.address || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(value || null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  
  const { searchLocation, getCurrentLocation, loading } = useGoogleMaps()
  const timeoutRef = useRef(null)

  // Search when user types
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    if (query.length >= 3 && !selectedLocation) {
      timeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(query)
        setSuggestions(results)
        setShowSuggestions(true)
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query, searchLocation, selectedLocation])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    if (selectedLocation) {
      setSelectedLocation(null)
      onChange?.(null)
    }
    setLocationError(null)
  }

  const handleSelectLocation = (location) => {
    setSelectedLocation(location)
    setQuery(location.display_name)
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.(location)
    setLocationError(null)
  }

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true)
    setLocationError(null)
    try {
      const location = await getCurrentLocation()
      if (location) {
        handleSelectLocation(location)
      } else {
        setLocationError('Could not get your location. Please try searching manually.')
      }
    } catch (err) {
      setLocationError('Location access denied. Please search manually.')
    } finally {
      setLoadingLocation(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSelectedLocation(null)
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.(null)
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            size="small"
            label="Event Location *"
            placeholder="Start typing to search real locations..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            error={!!error || !!locationError}
            helperText={error || locationError || "Search for a real place (city, street, landmark)"}
            InputProps={{
              startAdornment: <LocationIcon sx={{ color: '#ff7a18', mr: 1 }} />,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={20} />}
                  {query && !selectedLocation && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          
          <Button
            variant="outlined"
            onClick={handleGetCurrentLocation}
            disabled={loadingLocation}
            sx={{ 
              minWidth: 'auto', 
              px: 2, 
              borderColor: '#ff7a18', 
              color: '#ff7a18',
              whiteSpace: 'nowrap'
            }}
            title="Use my current location"
          >
            {loadingLocation ? <CircularProgress size={20} /> : <MyLocationIcon />}
          </Button>
        </Box>

        {/* Selected Location Confirmation */}
        {selectedLocation && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ borderRadius: 2, py: 0 }}
            action={
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            }
          >
            <Typography variant="body2">
              <strong>Verified Location:</strong> {selectedLocation.display_name?.substring(0, 100)}
            </Typography>
          </Alert>
        )}

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Paper sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 1000, 
            maxHeight: 300, 
            overflow: 'auto',
            mt: 0.5,
            boxShadow: 3
          }}>
            {suggestions.map((suggestion) => (
              <MenuItem 
                key={suggestion.place_id} 
                onClick={() => handleSelectLocation(suggestion)}
                divider
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {suggestion.address?.road || suggestion.address?.city || suggestion.display_name?.substring(0, 50)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.address?.city && `${suggestion.address.city}, `}
                    {suggestion.address?.state}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Paper>
        )}

        {/* Info Text */}
        <Typography variant="caption" color="text.secondary">
          📍 Search for real places only. Volunteers will see this exact location.
        </Typography>
      </Stack>
    </Box>
  )
}