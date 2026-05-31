import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsInitializing } from '@/features/auth/authSlice'

/**
 * ProtectedRoute — Redirects unauthenticated users to /login
 * Shows nothing while session is being restored (isInitializing)
 */
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isInitializing = useSelector(selectIsInitializing)

  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
