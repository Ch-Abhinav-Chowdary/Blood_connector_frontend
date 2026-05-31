import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import { loginUser, clearError } from '@/features/auth/authSlice'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { isAuthenticated, isLoading, error, user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const map = { donor: '/dashboard/donor', receiver: '/dashboard/receiver', admin: '/dashboard/admin' }
      navigate(map[user.role] || '/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      const { accessToken, user: loggedInUser } = result.payload
      if (accessToken) localStorage.setItem('accessToken', accessToken)
      toast.success(`Welcome back, ${loggedInUser.fullName.split(' ')[0]}! 🩸`)
      const map = { donor: '/dashboard/donor', receiver: '/dashboard/receiver', admin: '/dashboard/admin' }
      navigate(map[loggedInUser.role] || '/')
    }
  }

  return (
    <div className="auth-page">
      {/* Background glows */}
      <div style={{
        position: 'fixed', top: '20%', left: '15%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(232,50,60,0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        {/* Card */}
        <div className="glass-card" style={{ padding: '48px 40px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: 52, height: 52,
              background: 'var(--gradient-brand)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-brand)',
            }}>
              <GiDroplets size={28} color="white" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.7rem', fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Sign in to continue saving lives
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px',
                  }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-brand"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
            >
              {isLoading ? (
                <><span className="spinner" />Signing In...</>
              ) : (
                <>Sign In <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: 'center', marginTop: '24px',
            fontSize: '0.9rem', color: 'var(--color-text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--color-blood-light)', fontWeight: 600,
              transition: 'color 0.2s',
            }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
