import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiPlus, FiEdit2, FiTrash2, FiXCircle, FiCalendar, FiMapPin, FiPhone, FiInfo, FiSliders, FiMessageSquare, FiMap, FiSearch } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import Navbar from '@/components/ui/Navbar'
import ProfileEditModal from '@/components/dashboard/ProfileEditModal'
import ChatPanel from '@/components/dashboard/ChatPanel'
import MapSelector from '@/components/dashboard/MapSelector'
import { selectCurrentUser, fetchCurrentUser } from '@/features/auth/authSlice'
import { requestsAPI, usersAPI } from '@/services/api'
import { useSocket } from '@/context/SocketContext'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY_LEVELS = [
  { value: 'normal', label: '📋 Normal — Planned' },
  { value: 'urgent', label: '⚠️ Urgent — Within 24h' },
  { value: 'critical', label: '🚨 Critical — Immediate' }
]

export default function ReceiverDashboard() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const { socket } = useSocket()

  const userCoords = user?.location?.coordinates
  const userLat = userCoords?.[1]
  const userLng = userCoords?.[0]

  // Modals & Tabs
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestModalMode, setRequestModalMode] = useState('create') // 'create' or 'edit'
  const [editingRequestId, setEditingRequestId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatRequestId, setChatRequestId] = useState(null)
  const [chatRecipientName, setChatRecipientName] = useState('')

  const handleOpenChat = (requestId, recipientName) => {
    setChatRequestId(requestId)
    setChatRecipientName(recipientName)
    setIsChatOpen(true)
  }

  // Data States
  const [myRequests, setMyRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pagination & Donors Map States
  const [requestsPage, setRequestsPage] = useState(1)
  const [requestsTotalPages, setRequestsTotalPages] = useState(1)
  
  const [nearbyDonors, setNearbyDonors] = useState([])
  const [isDonorsLoading, setIsDonorsLoading] = useState(false)
  const [mapRadius, setMapRadius] = useState(15)
  const [bloodGroupFilter, setBloodGroupFilter] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    unitsRequired: 1,
    hospitalName: '',
    requiredDate: '',
    city: '',
    state: '',
    contactNumber: '',
    urgencyLevel: 'normal',
    additionalNotes: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Fetch Requests
  const fetchRequests = useCallback(async (pageNum = 1) => {
    setIsLoading(true)
    try {
      const response = await requestsAPI.getMy({ page: pageNum, limit: 6 })
      setMyRequests(response.data.data.requests || [])
      setRequestsPage(response.data.data.pagination?.page || 1)
      setRequestsTotalPages(response.data.data.pagination?.totalPages || 1)
    } catch (err) {
      toast.error('Failed to fetch your blood requests')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch Nearby Donors
  const fetchNearbyDonors = useCallback(async () => {
    if (!userLat || !userLng) return
    setIsDonorsLoading(true)
    try {
      const params = {
        latitude: userLat,
        longitude: userLng,
        radius: mapRadius,
        limit: 100
      }
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter
      
      const response = await usersAPI.getDonors(params)
      setNearbyDonors(response.data.data.donors || [])
    } catch (err) {
      toast.error('Failed to fetch nearby donors')
    } finally {
      setIsDonorsLoading(false)
    }
  }, [userLat, userLng, mapRadius, bloodGroupFilter])

  useEffect(() => {
    fetchRequests(1)
    dispatch(fetchCurrentUser())
  }, [fetchRequests, dispatch])

  useEffect(() => {
    if (userLat && userLng) {
      fetchNearbyDonors()
    }
  }, [fetchNearbyDonors, userLat, userLng])

  // Listen for socket notifications to auto-refresh requests in real-time
  useEffect(() => {
    if (!socket) return

    const handleNotification = (notif) => {
      console.log('🔄 Receiver Dashboard auto-refreshing from socket notification:', notif)
      fetchRequests(requestsPage)
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, requestsPage, fetchRequests])

  // Listen for real-time donor status/availability updates
  useEffect(() => {
    if (!socket) return

    const handleDonorUpdated = (updatedDonor) => {
      console.log('📡 Donor status updated in real-time:', updatedDonor)
      fetchNearbyDonors()
    }

    socket.on('donor_updated', handleDonorUpdated)

    return () => {
      socket.off('donor_updated', handleDonorUpdated)
    }
  }, [socket, fetchNearbyDonors])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenCreateModal = () => {
    setRequestModalMode('create')
    setEditingRequestId(null)
    setFormData({
      patientName: '',
      bloodGroup: 'A+',
      unitsRequired: 1,
      hospitalName: '',
      requiredDate: '',
      city: user?.city || '',
      state: user?.state || '',
      contactNumber: user?.phoneNumber || '',
      urgencyLevel: 'normal',
      additionalNotes: ''
    })
    setFormErrors({})
    setIsRequestModalOpen(true)
  }

  const handleOpenEditModal = (req) => {
    setRequestModalMode('edit')
    setEditingRequestId(req._id)
    
    // Format date to YYYY-MM-DD
    const dateObj = new Date(req.requiredDate)
    const formattedDate = dateObj.toISOString().split('T')[0]

    setFormData({
      patientName: req.patientName,
      bloodGroup: req.bloodGroup,
      unitsRequired: req.unitsRequired,
      hospitalName: req.hospitalName,
      requiredDate: formattedDate,
      city: req.city,
      state: req.state,
      contactNumber: req.contactNumber,
      urgencyLevel: req.urgencyLevel,
      additionalNotes: req.additionalNotes || ''
    })
    setFormErrors({})
    setIsRequestModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.patientName.trim()) errors.patientName = 'Patient name is required'
    if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital name is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.state.trim()) errors.state = 'State is required'

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.contactNumber.trim())) {
      errors.contactNumber = 'Must be a valid 10-digit Indian phone number'
    }

    if (!formData.requiredDate) {
      errors.requiredDate = 'Required date is required'
    } else {
      const selectedDate = new Date(formData.requiredDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.requiredDate = 'Date cannot be in the past'
      }
    }

    const units = Number(formData.unitsRequired)
    if (isNaN(units) || units < 1 || units > 10) {
      errors.unitsRequired = 'Units must be between 1 and 10'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (requestModalMode === 'create') {
        await requestsAPI.create(formData)
        toast.success('Blood request created! Donors are being notified.')
      } else {
        await requestsAPI.update(editingRequestId, formData)
        toast.success('Blood request updated successfully.')
      }
      setIsRequestModalOpen(false)
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request? This will notify any accepted donors.')) return
    try {
      await requestsAPI.cancel(id)
      toast.success('Request cancelled successfully')
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request')
    }
  }

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request permanently?')) return
    try {
      await requestsAPI.delete(id)
      toast.success('Request deleted successfully')
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete request')
    }
  }

  // ─── Rendering Helpers ──────────────────────────────────────────────────────

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">🟡 Pending</span>
      case 'accepted':
        return <span className="badge badge-accepted urgent-pulse">🔵 Accepted</span>
      case 'completed':
        return <span className="badge badge-completed">🟢 Completed</span>
      case 'cancelled':
        return <span className="badge badge-cancelled">⚫ Cancelled</span>
      default:
        return <span className="badge badge-normal">{status}</span>
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'var(--color-critical)'
      case 'urgent': return 'var(--color-warning)'
      default: return 'var(--color-info)'
    }
  }

  // Stats computation
  const totalRequests = myRequests.length
  const pendingRequests = myRequests.filter(r => r.status === 'pending' || r.status === 'accepted').length
  const fulfilledRequests = myRequests.filter(r => r.status === 'completed').length

  return (
    <div className="page-wrapper" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container section-sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Profile / Hero Overview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-text-primary)' }}>
              Hospital Dashboard — <span className="gradient-text">{user?.fullName || 'Receiver'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Create emergency blood requests and connect with matching donors in real time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" onClick={() => setIsProfileModalOpen(true)} style={{ padding: '10px 24px' }}>
              Edit Profile
            </button>
            <button className="btn-brand" onClick={handleOpenCreateModal} style={{ padding: '10px 24px' }}>
              <FiPlus /> New Request
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-auto-fill">
          {/* Total Requests */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
              <GiDroplets size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Total Requests Posted
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {totalRequests}
              </h2>
            </div>
          </div>

          {/* Active Requests */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              <FiInfo size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Active Requests
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {pendingRequests}
              </h2>
            </div>
          </div>

          {/* Fulfilled Requests */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <FiXCircle size={28} style={{ transform: 'rotate(135deg)', color: 'var(--color-success)' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Fulfilled Requests
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {fulfilledRequests}
              </h2>
            </div>
          </div>
        </div>

        {/* Nearby Donors Radar Map */}
        {userLat && userLng && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMap style={{ color: 'var(--color-blood)' }} /> Proximity Donor Radar
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Locate compatible online donors within a radius around your hospital.
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                {/* Blood Group Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Blood Group:</span>
                  <select
                    value={bloodGroupFilter}
                    onChange={(e) => setBloodGroupFilter(e.target.value)}
                    className="form-select"
                    style={{ padding: '8px 12px', minWidth: '110px' }}
                  >
                    <option value="">All Groups</option>
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Radius Slider Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Radius:</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={mapRadius}
                    onChange={(e) => setMapRadius(Number(e.target.value))}
                    style={{ flexGrow: 1, accentColor: 'var(--color-blood)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-blood)', minWidth: '50px' }}>
                    {mapRadius} km
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                style={{ 
                  height: '400px', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--color-border)' 
                }}
              >
                {isDonorsLoading ? (
                  <div className="skeleton" style={{ height: '100%', width: '100%' }} />
                ) : (
                  <MapSelector 
                    center={[userLat, userLng]}
                    userLocation={[userLat, userLng]}
                    markers={nearbyDonors}
                    radius={mapRadius}
                    zoom={mapRadius <= 5 ? 13 : mapRadius <= 10 ? 12 : mapRadius <= 25 ? 10 : 9}
                  />
                )}
              </div>
              
              {/* Short stats summary */}
              {!isDonorsLoading && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <span>
                    Found <strong>{nearbyDonors.length}</strong> available compatible donor(s) within a <strong>{mapRadius} km</strong> radius.
                  </span>
                  {nearbyDonors.length > 0 && (
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      🟢 Donors are ready to fulfill compatible emergency requests in your area.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Feed Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>Your Blood Requests</h2>
          <button className="btn-ghost" onClick={() => fetchRequests(1)} style={{ fontSize: '0.9rem' }}>Refresh List</button>
        </div>

        {/* Request Cards Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {[1, 2].map(n => (
              <div key={n} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : myRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <GiDroplets size={54} style={{ margin: '0 auto 16px', color: 'var(--color-border-hover)' }} />
            <h3>No requests posted yet</h3>
            <p style={{ maxWidth: '400px', margin: '8px auto 20px', fontSize: '0.9rem' }}>
              Create your first emergency blood request to reach eligible donors in your area immediately.
            </p>
            <button className="btn-brand" onClick={handleOpenCreateModal}>
              <FiPlus /> Create First Request
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {myRequests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    borderTop: `4px solid ${getUrgencyColor(req.urgencyLevel)}`,
                    background: 'var(--color-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-blood">{req.bloodGroup} Needed</span>
                    {getStatusBadge(req.status)}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Patient: {req.patientName}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <FiMapPin size={12} /> {req.hospitalName}, {req.city}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Units Requested</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{req.unitsRequired} Unit(s)</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Required Date</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                        {new Date(req.requiredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Donor detail section if status is accepted */}
                  {req.status === 'accepted' && req.acceptedBy && (
                    <div style={{ padding: '14px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-info)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🩸 Donor Connected!
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Donor Name:</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{req.acceptedBy.fullName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Contact Phone:</span>
                        <a href={`tel:${req.acceptedBy.phoneNumber}`} style={{ fontWeight: 700, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiPhone size={12} /> {req.acceptedBy.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {req.additionalNotes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--color-border)', paddingLeft: '8px' }}>
                      "{req.additionalNotes}"
                    </p>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                    {req.status === 'pending' && (
                      <button onClick={() => handleOpenEditModal(req)} className="btn-ghost" style={{ flexGrow: 1, padding: '8px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FiEdit2 size={14} /> Edit
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <button onClick={() => handleOpenChat(req._id, req.acceptedBy?.fullName)} className="btn-ghost" style={{ flexGrow: 1, padding: '8px 0', fontSize: '0.85rem', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FiMessageSquare size={14} /> Chat
                      </button>
                    )}
                    {(req.status === 'pending' || req.status === 'accepted') && (
                      <button onClick={() => handleCancelRequest(req._id)} className="btn-ghost" style={{ flexGrow: 1, padding: '8px 0', fontSize: '0.85rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FiXCircle size={14} /> Cancel
                      </button>
                    )}
                    {(req.status === 'pending' || req.status === 'cancelled') && (
                      <button onClick={() => handleDeleteRequest(req._id)} className="btn-ghost" style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {!isLoading && requestsTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <button 
                  disabled={requestsPage === 1} 
                  onClick={() => {
                    const prevPage = requestsPage - 1;
                    setRequestsPage(prevPage);
                    fetchRequests(prevPage);
                  }}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Previous
                </button>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Page <strong>{requestsPage}</strong> of <strong>{requestsTotalPages}</strong>
                </span>
                <button 
                  disabled={requestsPage === requestsTotalPages} 
                  onClick={() => {
                    const nextPage = requestsPage + 1;
                    setRequestsPage(nextPage);
                    fetchRequests(nextPage);
                  }}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        requestId={chatRequestId}
        recipientName={chatRecipientName}
      />

      {/* Create / Edit Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)', zIndex: 'var(--z-modal)' }}
            />

            {/* Modal Container */}
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 'calc(var(--z-modal) + 1)', padding: '20px', pointerEvents: 'none' }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '580px', pointerEvents: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                    {requestModalMode === 'create' ? 'Create Emergency Blood Request' : 'Edit Blood Request'}
                  </h3>
                  <button onClick={() => setIsRequestModalOpen(false)} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%' }}>
                    <FiCalendar size={18} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Patient Name */}
                  <div>
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="Enter patient full name"
                    />
                    {formErrors.patientName && <div className="error-text">{formErrors.patientName}</div>}
                  </div>

                  {/* Blood Group & Units */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">Blood Group Required</label>
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFormChange} className="form-select">
                        {BLOOD_GROUPS.map(g => (
                          <option key={g} value={g} style={{ background: 'var(--color-surface-2)' }}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Units Required (1 - 10)</label>
                      <input
                        type="number"
                        name="unitsRequired"
                        value={formData.unitsRequired}
                        onChange={handleFormChange}
                        className="form-input"
                        min="1"
                        max="10"
                      />
                      {formErrors.unitsRequired && <div className="error-text">{formErrors.unitsRequired}</div>}
                    </div>
                  </div>

                  {/* Hospital Name */}
                  <div>
                    <label className="form-label">Hospital Name & Address</label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="e.g. City General Hospital, Ward 4"
                    />
                    {formErrors.hospitalName && <div className="error-text">{formErrors.hospitalName}</div>}
                  </div>

                  {/* City & State */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="e.g. Pune"
                      />
                      {formErrors.city && <div className="error-text">{formErrors.city}</div>}
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="e.g. Maharashtra"
                      />
                      {formErrors.state && <div className="error-text">{formErrors.state}</div>}
                    </div>
                  </div>

                  {/* Required Date & Contact Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">Required Date</label>
                      <input
                        type="date"
                        name="requiredDate"
                        value={formData.requiredDate}
                        onChange={handleFormChange}
                        className="form-input"
                      />
                      {formErrors.requiredDate && <div className="error-text">{formErrors.requiredDate}</div>}
                    </div>
                    <div>
                      <label className="form-label">Contact Phone Number</label>
                      <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="e.g. 9876543210"
                      />
                      {formErrors.contactNumber && <div className="error-text">{formErrors.contactNumber}</div>}
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="form-label">Urgency Level</label>
                    <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleFormChange} className="form-select">
                      {URGENCY_LEVELS.map(u => (
                        <option key={u.value} value={u.value} style={{ background: 'var(--color-surface-2)' }}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="form-label">Additional Patient Notes</label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleFormChange}
                      className="form-input"
                      rows="3"
                      placeholder="Mention patient medical condition, specific instructions, or helpline details..."
                      style={{ resize: 'none' }}
                    />
                  </div>

                  {/* Footer buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button type="button" onClick={() => setIsRequestModalOpen(false)} className="btn-outline" style={{ padding: '8px 20px' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-brand" style={{ padding: '8px 24px' }}>
                      {isSubmitting ? <span className="spinner" /> : requestModalMode === 'create' ? 'Post Request' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
