import { motion } from 'framer-motion'
import { FiTarget, FiActivity, FiMessageSquare, FiShield } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'

const FEATURES = [
  {
    icon: <FiTarget size={24} />,
    title: 'Precision Matching',
    description: 'Our proprietary DonorMatcher system instantly filters and targets compatible blood groups within the exact same city or state, avoiding generic broadcasts.',
    color: '#E8323C'
  },
  {
    icon: <FiActivity size={24} />,
    title: 'Real-Time WebSockets',
    description: 'Instant notification delivery driven by socket.io. When a hospital requests blood, eligible donors are notified dynamically in seconds without delay.',
    color: '#F59E0B'
  },
  {
    icon: <FiMessageSquare size={24} />,
    title: 'Direct Private Chat',
    description: 'Connect safely and privately through in-app real-time chat once a donor accepts a request, coordinating logistics without sharing personal handles publicly.',
    color: '#3B82F6'
  },
  {
    icon: <FiShield size={24} />,
    title: 'Privacy Guard',
    description: 'Donor details and contact information remain completely hidden until a matching request is accepted, ensuring spam protection and high privacy.',
    color: '#22C55E'
  }
]

export default function AboutSection() {
  return (
    <section id="about" style={{ padding: '100px 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.02) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '64px',
          alignItems: 'center'
        }} className="about-grid">

          {/* Left Column — Mission Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span style={{
              display: 'inline-block', padding: '4px 16px',
              background: 'rgba(232,50,60,0.1)', border: '1px solid rgba(232,50,60,0.2)',
              borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
              color: 'var(--color-blood-light)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '16px',
            }}>
              Our Mission
            </span>
            
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '20px',
              lineHeight: 1.15
            }}>
              Connecting Donors, <span className="gradient-text">Saving Lives</span> Instantly
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }}>
              In critical situations, every second counts. Finding a compatible blood donor should not depend on viral social media shares or desperate calls. 
            </p>
            
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px' }}>
              <strong>BloodConnect</strong> was founded to bridge the critical gap between blood banks, hospitals, and voluntary donors. By introducing local proximity search and automated notification dispatch, we simplify the search so you can focus on patient care.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'rgba(232,50,60,0.06)', border: '1px solid rgba(232,50,60,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blood)'
              }}>
                <GiDroplets size={32} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', fontWeight: 700 }}>100% Voluntary & Safe</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  No middlemen, no transaction charges, just pure human connections.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }} className="features-grid-columns">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
              >
                {/* Icon wrapper */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '10px',
                  background: `${feature.color}15`, border: `1px solid ${feature.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: feature.color
                }}>
                  {feature.icon}
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)'
                }}>
                  {feature.title}
                </h3>

                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 576px) {
          .features-grid-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
