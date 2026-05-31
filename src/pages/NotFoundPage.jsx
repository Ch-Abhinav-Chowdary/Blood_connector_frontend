import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textAlign: 'center',
    padding: '24px',
  }}>
    <div style={{ fontSize: '6rem', lineHeight: 1 }}>🩸</div>
    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', color: 'var(--color-text-primary)' }}>404</h1>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>This page doesn't exist.</p>
    <Link to="/" className="btn-brand" style={{ marginTop: '8px' }}>Go Home</Link>
  </div>
)

export default NotFoundPage
