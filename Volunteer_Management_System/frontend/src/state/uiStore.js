import { create } from 'zustand'
import { createTheme } from '@mui/material'

const STORAGE_KEY = 'vms.ui.mode'

function getInitialMode() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

export const useUiStore = create((set) => ({
  mode: getInitialMode(),

  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    set({ mode })
  },

  toggleMode: () =>
    set((s) => {
      const next = s.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return { mode: next }
    }),
}))

export function buildTheme(mode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#FF6B35', contrastText: '#ffffff' },
      secondary: { main: '#FF8C42', contrastText: '#ffffff' },
      background: {
        default: isDark ? '#121212' : '#f4f5f7',
        paper: isDark ? '#1f1f1f' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f1f1' : '#202020',
        secondary: isDark ? '#b0b0b0' : '#4d4d4d',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#121212' : '#f4f5f7',
          },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
    },
  })
}
