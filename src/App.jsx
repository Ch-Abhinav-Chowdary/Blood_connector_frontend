import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

import { fetchCurrentUser, selectCurrentUser } from '@/features/auth/authSlice'
import ProtectedRoute from '@/routes/ProtectedRoute'
import RoleRoute from '@/routes/RoleRoute'

// Pages — Phase 6+ will fill these in
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DonorDashboard from '@/pages/dashboard/DonorDashboard'
import ReceiverDashboard from '@/pages/dashboard/ReceiverDashboard'
import EligibilityPage from '@/pages/donor/EligibilityPage'
import CompatibilityPage from '@/pages/receiver/CompatibilityPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  const dispatch = useDispatch()

  // Restore session on app mount (checks HTTP-only cookie)
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: 'var(--color-success)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: 'var(--color-error)', secondary: 'white' },
          },
        }}
      />

      <Routes>
        {/* ── Public Routes ─────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected Routes (any authenticated user) ──────── */}
        <Route element={<ProtectedRoute />}>

          {/* Donor-only routes */}
          <Route element={<RoleRoute roles={['donor', 'admin']} />}>
            <Route path="/dashboard/donor" element={<DonorDashboard />} />
            <Route path="/donor/eligibility" element={<EligibilityPage />} />
          </Route>

          {/* Receiver-only routes */}
          <Route element={<RoleRoute roles={['receiver', 'admin']} />}>
            <Route path="/dashboard/receiver" element={<ReceiverDashboard />} />
            <Route path="/receiver/compatibility" element={<CompatibilityPage />} />
          </Route>

          {/* Redirect /dashboard → role-specific dashboard */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

        </Route>

        {/* ── 404 ───────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

// Smart redirect based on user role
function DashboardRedirect() {
  const user = useSelector(selectCurrentUser)
  if (!user) return <Navigate to="/" replace />
  const map = { donor: '/dashboard/donor', receiver: '/dashboard/receiver', admin: '/dashboard/admin' }
  return <Navigate to={map[user.role] || '/'} replace />
}

export default App
