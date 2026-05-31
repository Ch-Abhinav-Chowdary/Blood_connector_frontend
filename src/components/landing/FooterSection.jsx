import { Link } from 'react-router-dom'
import { GiDroplets } from 'react-icons/gi'
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const LINKS = {
  Platform: [
    { label: 'Find Donors', href: '/donors' },
    { label: 'Request Blood', href: '/register?role=receiver' },
    { label: 'Become a Donor', href: '/register?role=donor' },
    { label: 'Blood Compatibility', href: '/#compatibility' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

export default function FooterSection() {
  return (
    <footer style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '64px 0 32px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '48px',
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: 36, height: 36,
                background: 'var(--gradient-brand)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GiDroplets size={20} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: '1.1rem', color: 'var(--color-text-primary)',
              }}>
                Blood<span className="gradient-text">Connect</span>
              </span>
            </Link>

            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              maxWidth: '280px',
              marginBottom: '24px',
            }}>
              Bridging the gap between blood donors and patients in emergency situations. Every second counts.
            </p>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: FiMail, text: 'support@bloodconnect.in' },
                { icon: FiPhone, text: '+91 98765 43210' },
                { icon: FiMapPin, text: 'Hyderabad, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p style={{
                fontSize: '0.8rem', fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                {section}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(link => (
                  <Link
                    key={link.label}
                    to={link.href}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Social */}
          <div>
            <p style={{
              fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Connect
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 40, height: 40,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-blood)'
                    e.currentTarget.style.color = 'var(--color-blood-light)'
                    e.currentTarget.style.background = 'rgba(232,50,60,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                    e.currentTarget.style.background = 'var(--color-surface-2)'
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Blood group badges */}
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>All blood groups welcome</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <span key={g} className="badge badge-blood" style={{ fontSize: '0.65rem' }}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            © 2026 BloodConnect. Made with ❤️ to save lives.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Building a healthier India, one donation at a time.
          </p>
        </div>
      </div>
    </footer>
  )
}
