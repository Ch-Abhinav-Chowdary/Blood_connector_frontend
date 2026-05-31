import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '@/features/auth/authSlice'

/**
 * RoleRoute — Ensures the user has one of the required roles
 * Usage: <Route element={<RoleRoute roles={['donor']} />}>
 */
const RoleRoute = ({ roles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    const dashboardMap = {
      donor: '/dashboard/donor',
      receiver: '/dashboard/receiver',
      admin: '/dashboard/admin',
    }
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />
  }

  return <Outlet />
}

export default RoleRoute
