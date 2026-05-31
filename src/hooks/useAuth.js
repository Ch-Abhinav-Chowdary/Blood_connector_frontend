import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from '@/features/auth/authSlice'

/**
 * useAuth — Convenience hook for all auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  const login = (credentials) => dispatch(loginUser(credentials))
  const register = (userData) => dispatch(registerUser(userData))
  const logout = () => dispatch(logoutUser())
  const clearAuthError = () => dispatch(clearError())

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin: user?.role === 'admin',
    isDonor: user?.role === 'donor',
    isReceiver: user?.role === 'receiver',
    login,
    register,
    logout,
    clearAuthError,
  }
}

export default useAuth
