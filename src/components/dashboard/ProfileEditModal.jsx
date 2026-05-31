import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiUser, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice'
import { usersAPI } from '@/services/api'
import toast from 'react-hot-toast'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export default function ProfileEditModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    gender: 'male',
    city: '',
    state: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data when modal opens and user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        phoneNumber: currentUser.phoneNumber || '',
        age: currentUser.age || '',
        gender: currentUser.gender || 'male',
        city: currentUser.city || '',
        state: currentUser.state || '',
      })
    }
    setErrors({})
  }, [currentUser, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Must be a valid 10-digit Indian phone number'
    }

    const ageNum = Number(formData.age)
    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      newErrors.age = 'Age must be between 18 and 65 years'
    }

    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await usersAPI.updateProfile(formData)
      const updatedUser = response.data.data.user
      dispatch(updateUser(updatedUser))
      toast.success('Profile updated successfully!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 5, 8, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 'var(--z-modal)',
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 'calc(var(--z-modal) + 1)',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '520px',
                pointerEvents: 'auto',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                  }}
                >
                  Edit Profile Settings
                </h3>
                <button
                  onClick={onClose}
                  className="btn-ghost"
                  style={{ padding: '6px', borderRadius: '50%', color: 'var(--color-text-muted)' }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Full Name */}
                  <div>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-muted)',
                        }}
                      />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="John Doe"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                    {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <FiPhone
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-muted)',
                        }}
                      />
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="9876543210"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                    {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
                  </div>

                  {/* Age & Gender */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">Age</label>
                      <div style={{ position: 'relative' }}>
                        <FiCalendar
                          size={16}
                          style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                          }}
                        />
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="25"
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                      {errors.age && <div className="error-text">{errors.age}</div>}
                    </div>

                    <div>
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value} style={{ background: 'var(--color-surface-2)' }}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City & State */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">City</label>
                      <div style={{ position: 'relative' }}>
                        <FiMapPin
                          size={16}
                          style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                          }}
                        />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Mumbai"
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                      {errors.city && <div className="error-text">{errors.city}</div>}
                    </div>

                    <div>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Maharashtra"
                      />
                      {errors.state && <div className="error-text">{errors.state}</div>}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '28px',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '20px',
                  }}
                >
                  <button type="button" onClick={onClose} className="btn-outline" style={{ padding: '8px 20px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-brand" style={{ padding: '8px 24px' }}>
                    {isSubmitting ? <span className="spinner" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
