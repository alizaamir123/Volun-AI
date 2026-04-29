import { Button, CircularProgress } from '@mui/material'

export function AsyncButton({ loading, children, disabled, ...props }) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
      {children}
    </Button>
  )
}
