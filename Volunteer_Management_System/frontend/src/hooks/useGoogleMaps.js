// src/hooks/useGoogleMaps.js
// FREE - No API Key Required! Using OpenStreetMap Nominatim API

import { useState, useCallback } from 'react'

// FREE API - No key needed!
const NOMINATIM_API = 'https://nominatim.openstreetmap.org'

export function useGoogleMaps() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Search locations - FREE, unlimited
  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 3) return []
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=pk`
      )
      const data = await response.json()
      return data.map(item => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: {
          road: item.address?.road,
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country,
          postcode: item.address?.postcode
        }
      }))
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get address from coordinates - FREE, unlimited
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      return {
        address: data.display_name,
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        city: data.address?.city || data.address?.town,
        state: data.address?.state,
        country: data.address?.country
      }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Get current user location - Browser geolocation
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = await reverseGeocode(position.coords.latitude, position.coords.longitude)
          resolve(location)
        },
        (error) => {
          reject(error)
        }
      )
    })
  }, [reverseGeocode])

  return {
    searchLocation,
    reverseGeocode,
    getCurrentLocation,
    loading,
    error
  }
}