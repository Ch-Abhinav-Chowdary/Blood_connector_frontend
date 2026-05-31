import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { end: 12400, suffix: '+', label: 'Registered Donors', icon: '🩸', color: '#E8323C' },
  { end: 3800,  suffix: '+', label: 'Lives Saved',        icon: '❤️', color: '#F59E0B' },
  { end: 98,    suffix: '',  label: 'Cities Covered',     icon: '🏙️', color: '#3B82F6' },
  { end: 99,    suffix: '%', label: 'Match Success Rate', icon: '✅', color: '#22C55E' },
]

function AnimatedCounter({ end, suffix, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!isInView) return
    let startTime = null
    const startValue = 0

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startValue + (end - startValue) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function StatsSection({ stats }) {
  const displayStats = [
    { end: stats?.registeredDonors || 0, suffix: '', label: 'Registered Donors', icon: '🩸', color: '#E8323C' },
    { end: stats?.livesSaved || 0,        suffix: '', label: 'Lives Saved',        icon: '❤️', color: '#F59E0B' },
    { end: stats?.citiesCovered || 0,     suffix: '',  label: 'Cities Covered',     icon: '🏙️', color: '#3B82F6' },
    { end: stats?.matchSuccessRate || 99,  suffix: '%', label: 'Match Success Rate', icon: '✅', color: '#22C55E' },
  ]

  return (
    <section style={{
      padding: '80px 0',
      background: 'var(--color-bg)',
      position: 'relative',
    }}>
      {/* Top border glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(232,50,60,0.5), transparent)',
      }} />

      <div className="container">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <span style={{
            display: 'inline-block',
            padding: '4px 16px',
            background: 'rgba(232,50,60,0.1)',
            border: '1px solid rgba(232,50,60,0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-blood-light)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Our Impact
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Numbers That <span className="gradient-text">Matter</span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card"
              style={{
                padding: '32px 28px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute', bottom: -20, right: -20,
                width: '100px', height: '100px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }} />

              <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>{stat.icon}</div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 900,
                color: stat.color,
                lineHeight: 1,
                marginBottom: '8px',
              }}>
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              </div>

              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom border glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(232,50,60,0.3), transparent)',
      }} />
    </section>
  )
}
