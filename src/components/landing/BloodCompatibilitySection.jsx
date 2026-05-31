import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Who this blood group can DONATE TO
const CAN_DONATE_TO = {
  'A+':  ['A+', 'AB+'],
  'A-':  ['A+', 'A-', 'AB+', 'AB-'],
  'B+':  ['B+', 'AB+'],
  'B-':  ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+':  ['A+', 'B+', 'AB+', 'O+'],
  'O-':  ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
}

// Who can DONATE TO this blood group
const CAN_RECEIVE_FROM = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
}

const FACTS = {
  'O-': '🏆 Universal Donor — can give to anyone!',
  'AB+': '🌟 Universal Recipient — can receive from everyone!',
  'O+': '💪 Most common blood type (38% of population)',
  'AB-': '💎 Rarest blood type (only 1% of population)',
}

export default function BloodCompatibilitySection() {
  const [selected, setSelected] = useState('O+')

  const donatesTo = CAN_DONATE_TO[selected] || []
  const receivesFrom = CAN_RECEIVE_FROM[selected] || []

  return (
    <section style={{
      padding: '100px 0',
      background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 50%, var(--color-bg) 100%)',
    }}>
      <div className="container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <span style={{
            display: 'inline-block', padding: '4px 16px',
            background: 'rgba(232,50,60,0.1)', border: '1px solid rgba(232,50,60,0.2)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--color-blood-light)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Blood Compatibility
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Find Your <span className="gradient-text">Compatibility</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            Select a blood group to see who you can donate to and who can donate to you.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

          {/* Blood Group Selector */}
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Select Blood Group
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {BLOOD_GROUPS.map(group => (
                <motion.button
                  key={group}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(group)}
                  style={{
                    padding: '18px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: selected === group
                      ? '2px solid var(--color-blood)'
                      : '1px solid var(--color-border)',
                    background: selected === group
                      ? 'rgba(232,50,60,0.15)'
                      : 'var(--color-surface-2)',
                    color: selected === group
                      ? 'var(--color-blood-light)'
                      : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selected === group ? 'var(--shadow-brand)' : 'none',
                  }}
                >
                  {group}
                </motion.button>
              ))}
            </div>

            {/* Special fact */}
            {FACTS[selected] && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '20px', padding: '16px',
                  background: 'rgba(232,50,60,0.08)',
                  border: '1px solid rgba(232,50,60,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {FACTS[selected]}
              </motion.div>
            )}
          </div>

          {/* Compatibility Result */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Selected group display */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '80px', height: '80px',
                  background: 'var(--gradient-brand)',
                  borderRadius: '24px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.8rem', fontWeight: 900, color: 'white',
                  boxShadow: 'var(--shadow-brand)',
                  marginBottom: '8px',
                }}>
                  {selected}
                </div>
              </div>

              {/* Can donate to */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span>↑</span> Can Donate To
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {donatesTo.map(group => (
                    <motion.span
                      key={group}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        padding: '6px 16px',
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: 'var(--radius-full)',
                        color: '#86EFAC',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                      }}
                    >
                      {group}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Can receive from */}
              <div>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-info)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span>↓</span> Can Receive From
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {receivesFrom.map(group => (
                    <motion.span
                      key={group}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{
                        padding: '6px 16px',
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: 'var(--radius-full)',
                        color: '#93C5FD',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                      }}
                    >
                      {group}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
