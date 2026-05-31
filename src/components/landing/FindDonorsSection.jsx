import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiSearch, FiMapPin, FiHeart, FiUser, FiInfo } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import { usersAPI } from '@/services/api'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function FindDonorsSection() {
  const [bloodGroup, setBloodGroup] = useState('')
  const [city, setCity] = useState('')
  const [donors, setDonors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch some initial active donors on load to populate the section
  useEffect(() => {
    const fetchInitialDonors = async () => {
      setIsLoading(true)
      try {
        const response = await usersAPI.getDonors({ limit: 4 })
        setDonors(response.data.data.donors || [])
      } catch (err) {
        console.error('Failed to load initial donors')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialDonors()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setHasSearched(true)
    try {
      const params = {}
      if (bloodGroup) params.bloodGroup = bloodGroup
      if (city.trim()) params.city = city.trim()
      
      const response = await usersAPI.getDonors(params)
      setDonors(response.data.data.donors || [])
      toast.success(`Found ${response.data.data.donors?.length || 0} active donors!`)
    } catch (err) {
      toast.error('Search failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="find-donors" style={{ padding: '100px 0', background: 'linear-gradient(180deg, var(--color-bg) 0%, #0F0F16 100%)', position: 'relative' }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(232,50,60,0.03) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <span style={{
            display: 'inline-block', padding: '4px 16px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
            color: 'var(--color-info)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Real-time Database
          </span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Find Blood <span className="gradient-text">Donors</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
            Search our directory of active, verified blood donors who are ready to help in emergencies.
          </p>
        </motion.div>

        {/* Search Bar Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card"
          style={{ padding: '24px', maxWidth: '800px', margin: '0 auto 56px' }}
        >
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: '16px', alignItems: 'center' }} className="search-form-grid">
            {/* Blood Group Dropdown */}
            <div style={{ position: 'relative' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Blood Group</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <GiDroplets size={16} style={{ position: 'absolute', left: '14px', color: 'var(--color-blood-light)' }} />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '38px', height: '48px' }}
                >
                  <option value="" style={{ background: 'var(--color-surface-2)' }}>All Groups</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group} style={{ background: 'var(--color-surface-2)' }}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City Field */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>City</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiMapPin size={16} style={{ position: 'absolute', left: '14px', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Pune, Mumbai, Delhi..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', height: '48px' }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ alignSelf: 'end' }}>
              <button type="submit" className="btn-brand" style={{ height: '48px', width: '100%', padding: '0 32px' }} disabled={isLoading}>
                {isLoading ? <div className="spinner" /> : <><FiSearch /> Search</>}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Grid */}
        <div style={{ position: 'relative', minHeight: '200px' }}>
          {isLoading ? (
            <div className="grid-auto-fill">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : donors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}
            >
              <FiInfo size={44} style={{ margin: '0 auto 16px', color: 'var(--color-text-muted)' }} />
              <h3>No available donors found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                {hasSearched
                  ? 'We couldn\'t find any donors matching your criteria. Try widening your search or removing the city filter.'
                  : 'No active donors listed at this moment. Join as a donor to be the first!'
                }
              </p>
            </motion.div>
          ) : (
            <div>
              <div className="grid-auto-fill" style={{ marginBottom: '40px' }}>
                <AnimatePresence mode="popLayout">
                  {donors.map((donor, idx) => (
                    <motion.div
                      key={donor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="surface-card"
                      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid var(--color-blood)' }}
                    >
                      {/* Top stats */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-blood" style={{ fontSize: '0.85rem' }}>{donor.bloodGroup}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 8px var(--color-success)' }}></span>
                          Available
                        </span>
                      </div>

                      {/* Donor Info */}
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '50%',
                          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)'
                        }}>
                          <FiUser size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                            {donor.fullName.split(' ')[0]} {donor.fullName.split(' ')[1] ? donor.fullName.split(' ')[1][0] + '.' : ''}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <FiMapPin size={12} /> {donor.city}, {donor.state}
                          </p>
                        </div>
                      </div>

                      {/* Stat summary */}
                      <div style={{ padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiHeart size={14} style={{ color: 'var(--color-blood-light)' }} /> Completed Donations
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                          {donor.totalDonations || 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Login CTA banner below results */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="glass-card"
                style={{
                  padding: '20px 24px', display: 'flex', flexWrap: 'wrap',
                  alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  background: 'linear-gradient(90deg, rgba(232,50,60,0.05) 0%, rgba(59,130,246,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <FiInfo size={20} style={{ color: 'var(--color-blood-light)', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                    To protect donor privacy, contact details and exact maps are restricted. Log in or create an account to request donations directly.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Log In</Link>
                  <Link to="/register" className="btn-brand" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Join Now</Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
