import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    number: '01',
    icon: '📋',
    title: 'Create a Request',
    description: 'Post an emergency blood request with your patient\'s blood group, hospital details, and urgency level in under 2 minutes.',
    color: '#E8323C',
  },
  {
    number: '02',
    icon: '🔍',
    title: 'Find a Donor',
    description: 'Our system instantly matches compatible donors in your city based on blood type and availability, notifying them in real-time.',
    color: '#F59E0B',
  },
  {
    number: '03',
    icon: '❤️',
    title: 'Save a Life',
    description: 'The matched donor accepts and connects with you directly. A life is saved, and a new bond of humanity is formed.',
    color: '#22C55E',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '100px 0', background: 'var(--color-bg)' }}>
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '72px' }}
        >
          <span style={{
            display: 'inline-block', padding: '4px 16px',
            background: 'rgba(232,50,60,0.1)', border: '1px solid rgba(232,50,60,0.2)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--color-blood-light)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Simple Process
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
            Three simple steps stand between a patient and the blood they urgently need.
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          position: 'relative',
        }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute',
            top: '48px', left: '20%', right: '20%',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(232,50,60,0.4), rgba(34,197,94,0.4))',
            display: 'none', // visible on desktop only
          }} />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card"
              style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
              }} />

              {/* Step number */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '3.5rem',
                fontWeight: 900,
                color: `${step.color}18`,
                position: 'absolute',
                top: '12px', right: '20px',
                lineHeight: 1,
              }}>
                {step.number}
              </div>

              {/* Icon */}
              <div style={{
                width: '56px', height: '56px',
                background: `${step.color}18`,
                border: `1px solid ${step.color}30`,
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '24px',
              }}>
                {step.icon}
              </div>

              {/* Step indicator dot */}
              <div style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                background: step.color,
                marginBottom: '16px',
                boxShadow: `0 0 12px ${step.color}`,
              }} />

              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '12px',
              }}>
                {step.title}
              </h3>

              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: '56px' }}
        >
          <Link to="/register" className="btn-brand" style={{ fontSize: '1rem', padding: '16px 40px' }}>
            Get Started — It's Free
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
