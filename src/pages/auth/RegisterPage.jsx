import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import useAuth from '@/hooks/useAuth'
import { registerUser, clearError } from '@/features/auth/authSlice'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['male', 'female', 'other']

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'donor' ? 'donor' : 'receiver'

  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    phoneNumber: '', bloodGroup: '', age: '',
    gender: '', city: '', state: '', role: defaultRole,
  })

  const { isAuthenticated, isLoading, error, user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      const map = { donor: '/dashboard/donor', receiver: '/dashboard/receiver', admin: '/dashboard/admin' }
      navigate(map[user.role] || '/', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error, dispatch])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validateStep1 = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) { toast.error('Full name must be at least 2 characters'); return false }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { toast.error('Please enter a valid email'); return false }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return false }
    if (!/[A-Z]/.test(form.password)) { toast.error('Password must contain an uppercase letter'); return false }
    if (!/[0-9]/.test(form.password)) { toast.error('Password must contain a number'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) { toast.error('Enter a valid 10-digit Indian phone number'); return false }
    if (!form.bloodGroup) { toast.error('Please select your blood group'); return false }
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 65) { toast.error('Age must be between 18 and 65'); return false }
    if (!form.gender) { toast.error('Please select your gender'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.city.trim() || !form.state.trim()) { toast.error('City and state are required'); return }

    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      const { accessToken, user: newUser } = result.payload
      if (accessToken) localStorage.setItem('accessToken', accessToken)
      toast.success(`Welcome to BloodConnect, ${newUser.fullName.split(' ')[0]}! 🩸`)
      const map = { donor: '/dashboard/donor', receiver: '/dashboard/receiver' }
      navigate(map[newUser.role] || '/')
    }
  }

  const STEPS = ['Account', 'Profile', 'Location']

  return (
    <div className="auth-page" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
      <div style={{
        position: 'fixed', top: '15%', right: '10%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(232,50,60,0.07) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <div className="glass-card" style={{ padding: '40px 40px' }}>
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: 48, height: 48, background: 'var(--gradient-brand)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', boxShadow: 'var(--shadow-brand)',
            }}>
              <GiDroplets size={24} color="white" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Join BloodConnect
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              {form.role === 'donor' ? 'Register as a blood donor' : 'Register to request blood'}
            </p>
          </div>

          {/* Role Toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
            padding: '4px', marginBottom: '28px',
          }}>
            {['donor', 'receiver'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role }))}
                style={{
                  padding: '10px',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  background: form.role === role ? 'var(--gradient-brand)' : 'transparent',
                  color: form.role === role ? 'white' : 'var(--color-text-muted)',
                  fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: form.role === role ? 'var(--shadow-brand)' : 'none',
                }}
              >
                {role === 'donor' ? '🩸 Donor' : '🏥 Receiver'}
              </button>
            ))}
          </div>

          {/* Step Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                }}>
                  <div style={{
                    width: '100%', height: '3px',
                    background: i + 1 <= step
                      ? 'var(--gradient-brand)'
                      : 'var(--color-surface-3)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'background 0.3s ease',
                  }} />
                  <span style={{
                    fontSize: '0.7rem', color: i + 1 <= step ? 'var(--color-blood-light)' : 'var(--color-text-muted)',
                    fontWeight: 600,
                  }}>
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* Step 1: Account */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Abhinav Sharma" className="form-input" style={{ paddingLeft: '38px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <FiMail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="form-input" style={{ paddingLeft: '38px' }} autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 chars, 1 uppercase, 1 number" className="form-input" style={{ paddingLeft: '38px', paddingRight: '40px' }} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}>
                        {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      At least 8 characters, one uppercase letter and one number
                    </p>
                  </div>
                  <button type="button" onClick={handleNext} className="btn-brand" style={{ width: '100%', padding: '13px', marginTop: '4px' }}>
                    Next <FiArrowRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <FiPhone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" className="form-input" style={{ paddingLeft: '38px' }} maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Blood Group</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {BLOOD_GROUPS.map(bg => (
                        <button key={bg} type="button" onClick={() => setForm(prev => ({ ...prev, bloodGroup: bg }))}
                          style={{
                            padding: '10px 6px', borderRadius: 'var(--radius-sm)',
                            border: form.bloodGroup === bg ? '2px solid var(--color-blood)' : '1px solid var(--color-border)',
                            background: form.bloodGroup === bg ? 'rgba(232,50,60,0.15)' : 'var(--color-surface-2)',
                            color: form.bloodGroup === bg ? 'var(--color-blood-light)' : 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                        >{bg}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Age</label>
                      <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" className="form-input" min={18} max={65} />
                    </div>
                    <div>
                      <label className="form-label">Gender</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                        <option value="">Select</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: '0 0 auto', padding: '13px 20px' }}>
                      <FiArrowLeft size={15} />
                    </button>
                    <button type="button" onClick={handleNext} className="btn-brand" style={{ flex: 1, padding: '13px' }}>
                      Next <FiArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <motion.div key="step3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label className="form-label">City</label>
                    <div style={{ position: 'relative' }}>
                      <FiMapPin size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input name="city" value={form.city} onChange={handleChange} placeholder="Hyderabad" className="form-input" style={{ paddingLeft: '38px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <div style={{ position: 'relative' }}>
                      <FiMapPin size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input name="state" value={form.state} onChange={handleChange} placeholder="Telangana" className="form-input" style={{ paddingLeft: '38px' }} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{
                    padding: '16px', background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                    fontSize: '0.85rem', color: 'var(--color-text-secondary)',
                  }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Review your details</p>
                    <p>👤 {form.fullName} · {form.role === 'donor' ? '🩸 Donor' : '🏥 Receiver'}</p>
                    <p>✉️ {form.email}</p>
                    {form.bloodGroup && <p>🩸 Blood Group: <strong>{form.bloodGroup}</strong></p>}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setStep(2)} className="btn-outline" style={{ flex: '0 0 auto', padding: '13px 20px' }}>
                      <FiArrowLeft size={15} />
                    </button>
                    <button type="submit" disabled={isLoading} className="btn-brand" style={{ flex: 1, padding: '13px' }}>
                      {isLoading ? <><span className="spinner" /> Creating Account...</> : <>Create Account <FiArrowRight size={15} /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-blood-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            ← Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
