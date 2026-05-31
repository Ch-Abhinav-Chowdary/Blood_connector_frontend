import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GiDroplets } from 'react-icons/gi'
import { FiArrowRight, FiHeart } from 'react-icons/fi'

const floatVariants = {
  animate: {
    y: [0, -18, 0],
    rotate: [0, 3, -3, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

const pulseVariants = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.5, 0.9, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function HeroSection({ stats }) {
  const dynamicHeroStats = [
    { value: stats?.registeredDonors?.toLocaleString() || '0', label: 'Registered Donors' },
    { value: stats?.livesSaved?.toLocaleString() || '0', label: 'Lives Saved' },
    { value: stats?.citiesCovered?.toString() || '0', label: 'Cities Covered' },
  ]
  return (
    <section style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      background: 'var(--gradient-hero)',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(232,50,60,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          paddingTop: '80px',
        }}>

          {/* Left — Text Content */}
          <div>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px',
                background: 'rgba(232,50,60,0.1)',
                border: '1px solid rgba(232,50,60,0.25)',
                borderRadius: 'var(--radius-full)',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--color-blood-light)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                🩸 Emergency Blood Network
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
                marginBottom: '24px',
              }}
            >
              Every Donation{' '}
              <span className="gradient-text">Can Save</span>
              {' '}a Life
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                maxWidth: '480px',
                marginBottom: '40px',
              }}
            >
              Connect blood donors with patients in emergency. Real-time matching, instant notifications, and life-saving connections — powered by community.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
            >
              <Link to="/register?role=donor" className="btn-brand" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                <GiDroplets size={18} />
                Become a Donor
              </Link>
              <Link to="/register?role=receiver" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                Request Blood
                <FiArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px' }}
            >
              <div style={{ display: 'flex' }}>
                {['#E8323C','#F59E0B','#22C55E','#3B82F6','#8B5CF6'].map((color, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: color,
                    border: '2px solid var(--color-bg)',
                    marginLeft: i === 0 ? 0 : -10,
                  }} />
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>3,800+</strong> donors helped patients this month
              </p>
            </motion.div>
          </div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              height: '480px',
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              variants={pulseVariants}
              animate="animate"
              style={{
                position: 'absolute',
                width: '380px', height: '380px',
                borderRadius: '50%',
                border: '1px solid rgba(232,50,60,0.2)',
              }}
            />
            <motion.div
              variants={pulseVariants}
              animate="animate"
              style={{
                position: 'absolute',
                width: '300px', height: '300px',
                borderRadius: '50%',
                border: '1px solid rgba(232,50,60,0.15)',
                animationDelay: '1s',
              }}
            />

            {/* Central blood drop icon */}
            <motion.div
              variants={floatVariants}
              animate="animate"
              style={{
                width: '180px', height: '180px',
                background: 'var(--gradient-brand)',
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 80px rgba(232,50,60,0.5), 0 0 160px rgba(232,50,60,0.2)',
                position: 'relative', zIndex: 2,
              }}
            >
              <GiDroplets size={80} color="rgba(255,255,255,0.95)" />
            </motion.div>

            {/* Floating stat cards */}
            {dynamicHeroStats.map((stat, i) => {
              const positions = [
                { top: '8%', left: '-8%' },
                { top: '50%', right: '-12%', transform: 'translateY(-50%)' },
                { bottom: '8%', left: '10%' },
              ]
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    ...positions[i],
                    padding: '14px 20px',
                    textAlign: 'center',
                    minWidth: '130px',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-blood-light)' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {stat.label}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(transparent, var(--color-bg))',
        pointerEvents: 'none',
      }} />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: 'var(--color-text-muted)', fontSize: '0.75rem',
        }}
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1, height: 32, background: 'linear-gradient(var(--color-blood), transparent)' }}
        />
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
