import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'
import { FiCheckCircle, FiInfo, FiSearch, FiSliders } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'

const COMPATIBILITY_MAP = {
  'A+': {
    receive: ['A+', 'A-', 'O+', 'O-'],
    give: ['A+', 'AB+'],
    desc: 'Patients with A+ can receive blood from A and O donors, and can donate to A+ and AB+ individuals.'
  },
  'A-': {
    receive: ['A-', 'O-'],
    give: ['A+', 'A-', 'AB+', 'AB-'],
    desc: 'A- is a critical emergency backup type. A- patients can only receive from A- and O- donors.'
  },
  'B+': {
    receive: ['B+', 'B-', 'O+', 'O-'],
    give: ['B+', 'AB+'],
    desc: 'Patients with B+ can receive from B and O groups, and can safely donate to B+ and AB+.'
  },
  'B-': {
    receive: ['B-', 'O-'],
    give: ['B+', 'B-', 'AB+', 'AB-'],
    desc: 'B- patients can only receive B- and O- blood, and can donate to all B and AB groups.'
  },
  'AB+': {
    receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
    give: ['AB+'],
    desc: 'AB+ is the Universal Recipient. Individuals can receive whole blood from any blood type. However, they can only donate to other AB+ patients.'
  },
  'AB-': {
    receive: ['A-', 'B-', 'AB-', 'O-'],
    give: ['AB+', 'AB-'],
    desc: 'AB- is the rarest blood group. Patients can receive from all negative blood types and can donate to both AB+ and AB-.'
  },
  'O+': {
    receive: ['O+', 'O-'],
    give: ['A+', 'B+', 'AB+', 'O+'],
    desc: 'O+ is the most common blood type. O+ patients can only receive O+ and O- blood, but can donate to any positive blood group.'
  },
  'O-': {
    receive: ['O-'], // Universal Donor
    give: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    desc: 'O- is the Universal Donor. O- whole blood can be transfused to patients of any blood type in emergency situations. However, O- patients can only receive O- blood.'
  }
}

export default function CompatibilityPage() {
  const [selectedGroup, setSelectedGroup] = useState('A+')

  const currentInfo = COMPATIBILITY_MAP[selectedGroup]

  return (
    <div className="page-wrapper" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container section-sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-text-primary)' }} className="gradient-text">
            Blood Compatibility Checker
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Verify safe blood transfusion matches, view red blood cell compatibility tables, and quickly locate matching donors.
          </p>
        </div>

        {/* Dynamic Compatibility Checker Card */}
        <div className="glass-card" style={{ padding: '36px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '48px', alignItems: 'start' }} className="checker-grid">
            
            {/* Left Column — Select Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Select Patient Blood Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                  {Object.keys(COMPATIBILITY_MAP).map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGroup(g)}
                      className={selectedGroup === g ? 'btn-brand' : 'btn-outline'}
                      style={{ padding: '10px 0', fontSize: '0.9rem', width: '100%', borderRadius: 'var(--radius-sm)' }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Info Box */}
              <div style={{ padding: '16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', gap: '10px', alignItems: 'start' }}>
                <FiInfo size={18} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Universal donor is **O-** (can give to anyone). Universal recipient is **AB+** (can receive from anyone).
                </p>
              </div>
            </div>

            {/* Right Column — Compatibility Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Heading */}
              <div>
                <span className="badge badge-blood" style={{ fontSize: '1.1rem', padding: '6px 14px', marginBottom: '8px' }}>
                  Patient Blood Group: {selectedGroup}
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
                  {currentInfo.desc}
                </p>
              </div>

              {/* Compatibility Lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="matching-lists">
                {/* Can Receive From */}
                <div style={{ background: 'rgba(34,197,94,0.02)', border: '1px solid rgba(34,197,94,0.1)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--color-success)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCheckCircle size={14} /> Compatible Donors
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentInfo.receive.map(g => (
                      <span key={g} className="badge badge-success" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>{g}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '12px' }}>
                    Patient can safely receive transfusions from these donor groups.
                  </span>
                </div>

                {/* Can Donate To */}
                <div style={{ background: 'rgba(59,130,246,0.02)', border: '1px solid rgba(59,130,246,0.1)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--color-info)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GiDroplets size={14} /> Compatible Recipients
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentInfo.give.map(g => (
                      <span key={g} className="badge badge-normal" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>{g}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '12px' }}>
                    Patient can safely donate blood to these recipient groups.
                  </span>
                </div>
              </div>

              {/* Call to Action: Search on Dashboard */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/dashboard/receiver" className="btn-brand" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                  <FiSearch /> Search Matching Donors
                </Link>
              </div>

            </div>

          </div>
        </div>

        {/* Visual Compatibility Matrix Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSliders style={{ color: 'var(--color-blood)' }} /> Transfusion Compatibility Matrix
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Red blood cell compatibility is determined by presence of A, B, and Rh antigens on the surface of red blood cells. Using the table below, cross-reference donor and recipient groups.
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.82rem', minWidth: '550px' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Recipient (▼) / Donor (►)</th>
                  {Object.keys(COMPATIBILITY_MAP).map(g => (
                    <th key={g} style={{ padding: '12px', color: 'var(--color-text-primary)', fontWeight: 700 }}>{g}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(COMPATIBILITY_MAP).map(recipient => (
                  <tr key={recipient} style={{ borderBottom: '1px solid var(--color-border)', background: selectedGroup === recipient ? 'rgba(232,50,60,0.03)' : 'transparent' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text-primary)', background: 'var(--color-surface-2)' }}>{recipient}</td>
                    {Object.keys(COMPATIBILITY_MAP).map(donor => {
                      const isCompatible = COMPATIBILITY_MAP[recipient].receive.includes(donor)
                      return (
                        <td key={donor} style={{ padding: '12px', color: isCompatible ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          {isCompatible ? <strong style={{ fontSize: '1rem', color: 'var(--color-success)' }}>✓</strong> : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .checker-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .matching-lists {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
