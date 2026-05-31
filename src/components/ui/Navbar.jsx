import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { FiMenu, FiX, FiBell, FiLogOut, FiUser } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import useAuth from '@/hooks/useAuth'
import { logoutUser } from '@/features/auth/authSlice'
import { selectUnreadCount } from '@/features/notifications/notificationSlice'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { label: 'Find Donors', href: '/#find-donors' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, isDonor, isReceiver } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useSelector(selectUnreadCount)

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Find Donors', href: '/#find-donors' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'About', href: '/#about' },
      ]
    }
    if (isDonor) {
      return [
        { label: 'Dashboard', href: '/dashboard/donor' },
        { label: 'Eligibility Quiz', href: '/donor/eligibility' },
      ]
    }
    if (isReceiver) {
      return [
        { label: 'Dashboard', href: '/dashboard/receiver' },
        { label: 'Compatibility Tool', href: '/receiver/compatibility' },
      ]
    }
    return [{ label: 'Dashboard', href: '/dashboard' }]
  }
  const links = getNavLinks()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    localStorage.removeItem('accessToken')
    toast.success('Logged out successfully')
    navigate('/')
  }

  const dashboardHref = isDonor
    ? '/dashboard/donor'
    : isReceiver
    ? '/dashboard/receiver'
    : '/dashboard/admin'

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--z-sticky)',
          padding: scrolled ? '12px 0' : '20px 0',
          background: scrolled
            ? 'rgba(10,10,15,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--gradient-brand)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-brand)',
            }}>
              <GiDroplets size={20} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Blood<span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-links-desktop">
            {links.map(link => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  padding: '8px 16px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                  e.currentTarget.style.background = 'var(--color-surface-2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="nav-actions-desktop">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link to={dashboardHref} style={{ position: 'relative', padding: '8px', color: 'var(--color-text-secondary)', display: 'flex' }}>
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 8, height: 8,
                      background: 'var(--color-blood)',
                      borderRadius: '50%',
                      border: '2px solid var(--color-bg)',
                    }} />
                  )}
                </Link>
                {/* Dashboard Button */}
                <Link to={dashboardHref} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'var(--transition-fast)',
                }}>
                  <FiUser size={14} />
                  {user?.fullName?.split(' ')[0]}
                </Link>
                <button className="btn-ghost" onClick={handleLogout} style={{ padding: '8px', color: 'var(--color-text-muted)' }}>
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost" style={{ fontSize: '0.9rem' }}>Log In</Link>
                <Link to="/register" className="btn-brand" style={{ fontSize: '0.9rem', padding: '10px 22px' }}>
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="btn-ghost mobile-menu-btn"
            style={{ padding: '8px', display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '280px',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 'var(--z-modal)',
              padding: '80px 24px 24px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            {links.map(link => (
              <Link key={link.href} to={link.href} style={{
                padding: '14px 16px',
                color: 'var(--color-text-primary)',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-2)',
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isAuthenticated ? (
                <button className="btn-brand" onClick={handleLogout}>Log Out</button>
              ) : (
                <>
                  <Link to="/login" className="btn-outline" style={{ textAlign: 'center' }}>Log In</Link>
                  <Link to="/register" className="btn-brand" style={{ textAlign: 'center' }}>Join Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 'calc(var(--z-modal) - 1)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop, .nav-actions-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
