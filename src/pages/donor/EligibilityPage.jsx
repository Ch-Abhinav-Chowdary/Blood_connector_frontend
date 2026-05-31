import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import Navbar from '@/components/ui/Navbar'
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiChevronRight, FiChevronLeft, FiHeart } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'

const QUESTIONS = [
  {
    id: 'age',
    question: 'How old are you?',
    type: 'number',
    placeholder: 'Enter your age',
    validate: (val) => Number(val) >= 18 && Number(val) <= 65,
    errorMsg: 'You must be between 18 and 65 years old to donate blood.',
  },
  {
    id: 'weight',
    question: 'What is your weight in kilograms?',
    type: 'number',
    placeholder: 'Enter your weight (kg)',
    validate: (val) => Number(val) >= 45,
    errorMsg: 'You must weigh at least 45 kg to donate blood.',
  },
  {
    id: 'donationInterval',
    question: 'Have you donated blood in the last 90 days?',
    type: 'boolean',
    validate: (val) => val === 'no',
    errorMsg: 'Male donors must wait 90 days and female donors 120 days between whole blood donations.',
  },
  {
    id: 'tattooPiercing',
    question: 'Have you had a tattoo or body piercing in the last 6 months?',
    type: 'boolean',
    validate: (val) => val === 'no',
    errorMsg: 'You must wait 6 months after getting a tattoo or body piercing to ensure no risk of bloodborne pathogens.',
  },
  {
    id: 'symptoms',
    question: 'Are you currently experiencing a cold, flu, sore throat, or active infection?',
    type: 'boolean',
    validate: (val) => val === 'no',
    errorMsg: 'You must be in good health and completely free of symptoms on the day of donation.',
  },
  {
    id: 'majorSurgeries',
    question: 'Have you had any major surgery in the last 6 months?',
    type: 'boolean',
    validate: (val) => val === 'no',
    errorMsg: 'You must wait 6 months post-surgery before donating blood to allow complete recovery.',
  }
]

export default function EligibilityPage() {
  const user = useSelector(selectCurrentUser)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [failedSteps, setFailedSteps] = useState([])

  const handleNext = () => {
    const q = QUESTIONS[currentStep]
    const val = answers[q.id]

    if (val === undefined || String(val).trim() === '') {
      setErrors(prev => ({ ...prev, [q.id]: 'Please answer this question.' }))
      return
    }

    // Run validation
    const isValid = q.validate(val)
    const newFailedSteps = [...failedSteps]
    const idx = newFailedSteps.indexOf(q.id)

    if (!isValid) {
      if (idx === -1) newFailedSteps.push(q.id)
    } else {
      if (idx !== -1) newFailedSteps.splice(idx, 1)
    }
    setFailedSteps(newFailedSteps)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setQuizFinished(true)
      setFailedSteps(newFailedSteps)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleValueChange = (val) => {
    const q = QUESTIONS[currentStep]
    setAnswers(prev => ({ ...prev, [q.id]: val }))
    if (errors[q.id]) {
      setErrors(prev => ({ ...prev, [q.id]: null }))
    }
  }

  const handleReset = () => {
    setAnswers({})
    setErrors({})
    setCurrentStep(0)
    setQuizFinished(false)
    setFailedSteps([])
  }

  const isEligible = failedSteps.length === 0
  const progressPercent = ((currentStep + 1) / QUESTIONS.length) * 100

  // Calculate user cooldown info if they have user stats
  const getCooldownStatus = () => {
    if (user?.availabilityStatus === 'cooldown' && user?.lastDonationDate) {
      const lastDate = new Date(user.lastDonationDate)
      const nextEligible = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000)
      const daysLeft = Math.ceil((nextEligible.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      return {
        nextDate: nextEligible.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        daysLeft: daysLeft > 0 ? daysLeft : 0
      }
    }
    return null
  }
  const cooldown = getCooldownStatus()

  return (
    <div className="page-wrapper" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container section-sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-text-primary)' }} className="gradient-text">
            Donor Eligibility Tracker
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Check your physical eligibility, review active cooldowns, and prepare for your next life-saving donation.
          </p>
        </div>

        {/* Cooldown Info Box if applicable */}
        {cooldown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: '20px 24px',
              borderLeft: '4px solid var(--color-warning)',
              background: 'linear-gradient(90deg, rgba(245,158,11,0.05) 0%, rgba(0,0,0,0) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <FiAlertTriangle size={24} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--color-text-primary)', fontSize: '1rem' }}>Active Donation Cooldown</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Your profile registers a recent donation. You will be eligible to donate again on <strong>{cooldown.nextDate}</strong>.
                </p>
              </div>
            </div>
            <div style={{ padding: '8px 16px', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-warning)', display: 'block' }}>{cooldown.daysLeft}</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Days Left</span>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="glass-card" style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
          
          <AnimatePresence mode="wait">
            {!quizFinished ? (
              <motion.div
                key="quiz-body"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                {/* Step indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    Question {currentStep + 1} of {QUESTIONS.length}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-blood-light)', fontWeight: 700 }}>
                    {Math.round(progressPercent)}% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'var(--color-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--gradient-brand)', transition: 'width 0.3s ease' }} />
                </div>

                {/* Question Section */}
                <div style={{ minHeight: '140px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '20px', lineHeight: 1.3 }}>
                    {QUESTIONS[currentStep].question}
                  </h3>

                  {/* Input Rendering */}
                  {QUESTIONS[currentStep].type === 'number' ? (
                    <div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder={QUESTIONS[currentStep].placeholder}
                        value={answers[QUESTIONS[currentStep].id] || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        style={{ maxWidth: '280px', height: '48px' }}
                      />
                      {errors[QUESTIONS[currentStep].id] && (
                        <div className="error-text" style={{ marginTop: '8px' }}>
                          <FiInfo size={14} /> {errors[QUESTIONS[currentStep].id]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleValueChange('yes')}
                        className={answers[QUESTIONS[currentStep].id] === 'yes' ? 'btn-brand' : 'btn-outline'}
                        style={{ padding: '12px 32px', flexGrow: 1, maxWidth: '160px' }}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleValueChange('no')}
                        className={answers[QUESTIONS[currentStep].id] === 'no' ? 'btn-brand' : 'btn-outline'}
                        style={{ padding: '12px 32px', flexGrow: 1, maxWidth: '160px' }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="btn-ghost"
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', opacity: currentStep === 0 ? 0.3 : 1 }}
                  >
                    <FiChevronLeft /> Back
                  </button>

                  <button
                    onClick={handleNext}
                    className="btn-brand"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Next'} <FiChevronRight />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="quiz-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                {/* Result Icon Banner */}
                <div>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: isEligible ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${isEligible ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: isEligible ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {isEligible ? <FiCheckCircle size={44} /> : <FiXCircle size={44} />}
                  </div>

                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {isEligible ? 'You Are Eligible to Donate!' : 'Deferred from Donation'}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0' }}>
                    {isEligible
                      ? 'Based on your health quiz answers, you satisfy the whole blood donor eligibility criteria. You can go online and accept requests!'
                      : 'Based on your answers, you are currently deferred from blood donation due to medical safety guidelines.'
                    }
                  </p>
                </div>

                {/* Explanations if ineligible */}
                {!isEligible && (
                  <div style={{ textAlign: 'left', background: 'var(--color-surface-2)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--color-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiInfo style={{ color: 'var(--color-error)' }} /> Please review the deferral guidelines:
                    </h4>
                    <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {failedSteps.map(stepId => {
                        const q = QUESTIONS.find(qi => qi.id === stepId)
                        return (
                          <li key={stepId} style={{ display: 'flex', gap: '10px', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>✖</span>
                            <div>
                              <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>{q.question}</strong>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginTop: '2px', display: 'block' }}>{q.errorMsg}</span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Pre-donation guidelines if eligible */}
                {isEligible && (
                  <div style={{ textAlign: 'left', background: 'var(--color-surface-2)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="guidelines-grid">
                    <div>
                      <h4 style={{ color: 'var(--color-success)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>✓ Before You Donate</h4>
                      <ul style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '14px' }}>
                        <li>Hydrate: Drink plenty of water (500ml)</li>
                        <li>Eat: Have a healthy meal, avoid fatty foods</li>
                        <li>Sleep: Get at least 7-8 hours of sleep</li>
                        <li>ID: Bring a government-issued photo ID</li>
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--color-blood-light)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>✗ After You Donate</h4>
                      <ul style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '14px' }}>
                        <li>Rest: Keep bandage on for at least 4 hours</li>
                        <li>Fluids: Drink extra fluids for the next 24h</li>
                        <li>Exercise: Avoid strenuous heavy lifting</li>
                        <li>Nutrition: Eat iron-rich meals (spinach, beans)</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button onClick={handleReset} className="btn-outline" style={{ padding: '12px 32px' }}>
                    Retake Quiz
                  </button>
                  {isEligible ? (
                    <Link to="/dashboard/donor" className="btn-brand" style={{ padding: '12px 32px' }}>
                      Go to Live Feed
                    </Link>
                  ) : (
                    <Link to="/dashboard/donor" className="btn-ghost" style={{ padding: '12px 32px' }}>
                      Back to Dashboard
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Donation preparation stats card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="stats-tips-grid">
          {/* Preparation details */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiHeart style={{ color: 'var(--color-blood)' }} /> Why Regular Donation Matters
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              A single whole blood donation can save up to **three lives**! The blood is separated into its key components: red blood cells, plasma, and platelets, which are given to different patients undergoing surgery, cancer therapy, or trauma recovery.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Whole blood has a shelf life of only **35-42 days**, and platelets last only **5 days**, making constant voluntary donations absolutely vital.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Total Donations</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-blood-light)', marginTop: '2px' }}>
                {user?.totalDonations || 0}
              </h2>
            </div>
            <div style={{ height: '1px', background: 'var(--color-border)' }}></div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Blood Type</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {user?.bloodGroup || 'Not Specified'}
              </h3>
            </div>
          </div>
        </div>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .stats-tips-grid {
            grid-template-columns: 1fr !important;
          }
          .guidelines-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
