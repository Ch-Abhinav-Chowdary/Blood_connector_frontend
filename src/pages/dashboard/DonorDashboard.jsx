import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiCheckCircle, FiSearch, FiSliders, FiClock, FiHeart, FiMapPin, FiCalendar, FiPhone, FiAlertTriangle, FiMessageSquare, FiList, FiMap } from 'react-icons/fi'
import { GiDroplets } from 'react-icons/gi'
import Navbar from '@/components/ui/Navbar'
import ProfileEditModal from '@/components/dashboard/ProfileEditModal'
import ChatPanel from '@/components/dashboard/ChatPanel'
import MapSelector from '@/components/dashboard/MapSelector'
import { selectCurrentUser, fetchCurrentUser, updateUser } from '@/features/auth/authSlice'
import { requestsAPI, usersAPI } from '@/services/api'
import { useSocket } from '@/context/SocketContext'
import toast from 'react-hot-toast'

export default function DonorDashboard() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const { socket } = useSocket()

  const userCoords = user?.location?.coordinates
  const userLat = userCoords?.[1]
  const userLng = userCoords?.[0]

  // Modals & Tabs
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('feed') // 'feed', 'active', 'history'
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatRequestId, setChatRequestId] = useState(null)
  const [chatRecipientName, setChatRecipientName] = useState('')

  const handleOpenChat = (requestId, recipientName) => {
    setChatRequestId(requestId)
    setChatRecipientName(recipientName)
    setIsChatOpen(true)
  }

  // Data States
  const [feedRequests, setFeedRequests] = useState([])
  const [activeRequests, setActiveRequests] = useState([])
  const [donationHistory, setDonationHistory] = useState([])

  // Loadings
  const [isFeedLoading, setIsFeedLoading] = useState(false)
  const [isActiveLoading, setIsActiveLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [isStatusToggling, setIsStatusToggling] = useState(false)

  // Filters & Views & Pagination
  const [cityFilter, setCityFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [radiusFilter, setRadiusFilter] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

  const [feedPage, setFeedPage] = useState(1)
  const [feedTotalPages, setFeedTotalPages] = useState(1)
  
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)

  // ─── Fetching Logic ────────────────────────────────────────────────────────
  
  const fetchFeed = useCallback(async (pageNum = 1) => {
    setIsFeedLoading(true)
    try {
      const params = { page: pageNum, limit: 6 }
      if (cityFilter.trim() && !radiusFilter) params.city = cityFilter.trim()
      if (urgencyFilter) params.urgencyLevel = urgencyFilter
      
      if (radiusFilter && userLat && userLng) {
        params.latitude = userLat
        params.longitude = userLng
        params.radius = radiusFilter
      }
      
      const response = await requestsAPI.getAvailable(params)
      setFeedRequests(response.data.data.requests || [])
      setFeedPage(response.data.data.pagination?.page || 1)
      setFeedTotalPages(response.data.data.pagination?.totalPages || 1)
    } catch (err) {
      toast.error('Failed to fetch available requests')
    } finally {
      setIsFeedLoading(false)
    }
  }, [cityFilter, urgencyFilter, radiusFilter, userLat, userLng])

  const fetchActive = useCallback(async () => {
    setIsActiveLoading(true)
    try {
      const response = await requestsAPI.getAvailable({ acceptedByMe: 'true' })
      setActiveRequests(response.data.data.requests || [])
    } catch (err) {
      toast.error('Failed to fetch active commitments')
    } finally {
      setIsActiveLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async (pageNum = 1) => {
    setIsHistoryLoading(true)
    try {
      const response = await usersAPI.getDonationHistory({ page: pageNum, limit: 10 })
      setDonationHistory(response.data.data.donations || [])
      setHistoryPage(response.data.data.pagination?.page || 1)
      setHistoryTotalPages(response.data.data.pagination?.totalPages || 1)
    } catch (err) {
      toast.error('Failed to fetch donation history')
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  // Refetch based on active tab & filters
  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed(1)
    }
    if (activeTab === 'active') {
      fetchActive()
    }
    if (activeTab === 'history') {
      fetchHistory(1)
    }
  }, [activeTab, fetchFeed, fetchActive, fetchHistory])

  // Initial stats fetch
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  // Listen for socket notifications to auto-refresh data in real-time
  useEffect(() => {
    if (!socket) return

    const handleNotification = (notif) => {
      console.log('🔄 Donor Dashboard auto-refreshing from socket notification:', notif)
      if (activeTab === 'feed') {
        fetchFeed(feedPage)
      } else if (activeTab === 'active') {
        fetchActive()
      } else if (activeTab === 'history') {
        fetchHistory(historyPage)
      }
      // Also update user profile/stats to refresh the counts
      dispatch(fetchCurrentUser())
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, activeTab, fetchFeed, fetchActive, fetchHistory, feedPage, historyPage, dispatch])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleAvailability = async () => {
    if (!user || user.availabilityStatus === 'cooldown') return

    const newStatus = user.availabilityStatus === 'available' ? 'unavailable' : 'available'
    setIsStatusToggling(true)
    try {
      const response = await usersAPI.updateAvailability({ availabilityStatus: newStatus })
      dispatch(updateUser({ availabilityStatus: response.data.data.availabilityStatus }))
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setIsStatusToggling(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    if (user.availabilityStatus !== 'available') {
      toast.error('You must set your status to Available to accept requests')
      return
    }

    try {
      await requestsAPI.accept(requestId)
      toast.success('Request accepted successfully! Contact details unlocked.')
      // Refresh feed and stats
      fetchFeed()
      dispatch(fetchCurrentUser())
      // Switch to active tab to see accepted request
      setActiveTab('active')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request')
    }
  }

  const handleCompleteRequest = async (requestId) => {
    try {
      await requestsAPI.complete(requestId)
      toast.success('Donation recorded successfully! Thank you for your support.')
      // Refresh lists and stats
      fetchActive()
      dispatch(fetchCurrentUser())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete request')
    }
  }

  // ─── Rendering Helpers ──────────────────────────────────────────────────────

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="badge badge-critical urgent-pulse">🚨 Critical</span>
      case 'urgent':
        return <span className="badge badge-urgent">⚠️ Urgent</span>
      default:
        return <span className="badge badge-normal">📋 Normal</span>
    }
  }

  const getCooldownInfo = () => {
    if (user.availabilityStatus !== 'cooldown' || !user.lastDonationDate) return null
    const lastDate = new Date(user.lastDonationDate)
    const nextEligible = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    const daysLeft = Math.ceil((nextEligible.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    
    return {
      dateString: nextEligible.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysLeft: daysLeft > 0 ? daysLeft : 0
    }
  }

  const cooldownInfo = getCooldownInfo()

  return (
    <div className="page-wrapper" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container section-sm" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Profile / Hero Overview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-text-primary)' }}>
              Welcome back, <span className="gradient-text">{user?.fullName || 'Donor'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Your blood donation can save lives today. Manage your status and compatible requests below.
            </p>
          </div>
          <button className="btn-outline" onClick={() => setIsProfileModalOpen(true)} style={{ padding: '10px 24px' }}>
            Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid-auto-fill">
          {/* Availability Status */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
              Donor Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                {user?.availabilityStatus === 'available' && (
                  <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>🟢 Available to Donate</span>
                )}
                {user?.availabilityStatus === 'unavailable' && (
                  <span className="badge" style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', padding: '6px 12px' }}>
                    ⚫ Unavailable
                  </span>
                )}
                {user?.availabilityStatus === 'cooldown' && (
                  <span className="badge badge-urgent" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>🕒 In Cooldown</span>
                )}
              </div>
              
              {user?.availabilityStatus !== 'cooldown' && (
                <button 
                  disabled={isStatusToggling}
                  onClick={handleToggleAvailability}
                  className="btn-brand" 
                  style={{ padding: '6px 14px', fontSize: '0.8rem', minWidth: '90px' }}
                >
                  {isStatusToggling ? <span className="spinner" /> : user?.availabilityStatus === 'available' ? 'Go Offline' : 'Go Online'}
                </button>
              )}
            </div>

            {user?.availabilityStatus === 'cooldown' && cooldownInfo && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', marginTop: '4px' }}>
                You will be eligible to donate again on <strong>{cooldownInfo.dateString}</strong> ({cooldownInfo.daysLeft} days left).
              </p>
            )}
          </div>

          {/* Total Donations */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(232,50,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blood)' }}>
              <FiHeart size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Total Donations
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {user?.totalDonations || 0}
              </h2>
            </div>
          </div>

          {/* Blood Group */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)' }}>
              <GiDroplets size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Your Blood Type
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {user?.bloodGroup}
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '24px' }}>
          <button 
            onClick={() => setActiveTab('feed')}
            style={{
              padding: '12px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'feed' ? '2px solid var(--color-blood)' : '2px solid transparent',
              color: activeTab === 'feed' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Compatible Requests
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              padding: '12px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'active' ? '2px solid var(--color-blood)' : '2px solid transparent',
              color: activeTab === 'active' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            My Active Commitments ({activeRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '12px 4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--color-blood)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Donation History
          </button>
        </div>

        {/* Tab Content Panels */}
        <div style={{ minHeight: '300px' }}>
          {/* TAB 1: AVAILABLE COMPATIBLE FEED */}
          {activeTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Search & Filter bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ flexGrow: 1, position: 'relative', minWidth: '200px' }}>
                  <FiSearch size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder={radiusFilter ? "City search disabled (Radius active)" : "Search by city (e.g. Mumbai)..."}
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    disabled={!!radiusFilter}
                    className="form-input"
                    style={{ paddingLeft: '38px', opacity: radiusFilter ? 0.6 : 1 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                  <FiMapPin size={18} style={{ color: 'var(--color-text-muted)' }} />
                  <select
                    value={radiusFilter}
                    onChange={(e) => {
                      setRadiusFilter(e.target.value)
                      if (e.target.value) setCityFilter('')
                    }}
                    className="form-select"
                  >
                    <option value="">All Distances</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                  <FiSliders size={18} style={{ color: 'var(--color-text-muted)' }} />
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Urgencies</option>
                    <option value="critical">🚨 Critical</option>
                    <option value="urgent">⚠️ Urgent</option>
                    <option value="normal">📋 Normal</option>
                  </select>
                </div>
                
                {/* View Mode Toggle Buttons */}
                <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '10px 14px',
                      background: viewMode === 'list' ? 'var(--color-blood)' : 'transparent',
                      color: viewMode === 'list' ? 'white' : 'var(--color-text-secondary)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <FiList size={16} /> List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    style={{
                      padding: '10px 14px',
                      background: viewMode === 'map' ? 'var(--color-blood)' : 'transparent',
                      color: viewMode === 'map' ? 'white' : 'var(--color-text-secondary)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <FiMap size={16} /> Map
                  </button>
                </div>

                <button className="btn-outline" onClick={() => fetchFeed(1)} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  Refresh
                </button>
              </div>

              {/* Feed List or Map Selector */}
              {isFeedLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
                  ))}
                </div>
              ) : feedRequests.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <GiDroplets size={48} style={{ margin: '0 auto 16px', color: 'var(--color-border-hover)' }} />
                  <h3>No matching requests found</h3>
                  <p style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '0.9rem' }}>
                    There are currently no pending requests matching compatible blood types in your location. Try checking back later!
                  </p>
                </div>
              ) : viewMode === 'map' ? (
                <div 
                  className="glass-card" 
                  style={{ 
                    height: '480px', 
                    borderRadius: 'var(--radius-lg)', 
                    overflow: 'hidden', 
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <MapSelector 
                    center={userLat && userLng ? [userLat, userLng] : [20.5937, 78.9629]}
                    userLocation={userLat && userLng ? [userLat, userLng] : null}
                    markers={feedRequests}
                    radius={radiusFilter ? Number(radiusFilter) : null}
                    zoom={radiusFilter ? (Number(radiusFilter) <= 5 ? 13 : Number(radiusFilter) <= 10 ? 12 : Number(radiusFilter) <= 25 ? 10 : 9) : 11}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {feedRequests.map((req) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="surface-card"
                      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: req.urgencyLevel === 'critical' ? 'linear-gradient(135deg, rgba(255,51,102,0.04) 0%, var(--color-surface) 100%)' : 'var(--color-surface)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="badge badge-blood" style={{ fontSize: '1rem', padding: '4px 10px' }}>{req.bloodGroup} Needed</span>
                        </div>
                        {getUrgencyBadge(req.urgencyLevel)}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{req.patientName}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <FiMapPin size={12} /> {req.hospitalName}, {req.city}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Units Needed</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{req.unitsRequired} Unit(s)</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Required Date</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                            {new Date(req.requiredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      {req.additionalNotes && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--color-border)', paddingLeft: '8px' }}>
                          "{req.additionalNotes}"
                        </p>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                        <button 
                          disabled={user.availabilityStatus !== 'available'}
                          onClick={() => handleAcceptRequest(req._id)}
                          className="btn-brand" 
                          style={{ width: '100%', padding: '10px 0' }}
                        >
                          Accept & Contact
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Feed Pagination Controls */}
              {!isFeedLoading && feedTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <button 
                    disabled={feedPage === 1} 
                    onClick={() => {
                      const prevPage = feedPage - 1;
                      setFeedPage(prevPage);
                      fetchFeed(prevPage);
                    }}
                    className="btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Previous
                  </button>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Page <strong>{feedPage}</strong> of <strong>{feedTotalPages}</strong>
                  </span>
                  <button 
                    disabled={feedPage === feedTotalPages} 
                    onClick={() => {
                      const nextPage = feedPage + 1;
                      setFeedPage(nextPage);
                      fetchFeed(nextPage);
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

          {/* TAB 2: ACTIVE ACCEPTED COMMITMENTS */}
          {activeTab === 'active' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isActiveLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <FiCheckCircle size={48} style={{ margin: '0 auto 16px', color: 'var(--color-success)', opacity: 0.6 }} />
                  <h3>No Active Commitments</h3>
                  <p style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '0.9rem' }}>
                    You don't have any active blood requests to fulfill. Check the compatible requests tab to accept one.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {activeRequests.map((req) => (
                    <motion.div
                      key={req._id}
                      className="surface-card"
                      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--color-info)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-blood">{req.bloodGroup} Needed</span>
                        {getUrgencyBadge(req.urgencyLevel)}
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{req.patientName}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <FiMapPin size={12} /> {req.hospitalName}, {req.city}
                        </p>
                      </div>

                      {/* Recipient Contact Card */}
                      <div style={{ padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Requester:</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{req.requesterId?.fullName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Phone Number:</span>
                          <a href={`tel:${req.contactNumber}`} style={{ fontWeight: 700, color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiPhone size={12} /> {req.contactNumber}
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '10px' }}>
                        {req.status === 'accepted' ? (
                          <>
                            <button 
                              onClick={() => handleCompleteRequest(req._id)}
                              className="btn-brand" 
                              style={{ flexGrow: 1, padding: '10px 0', background: 'var(--color-success)', color: 'white', border: 'none', boxShadow: 'none' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-success)'}
                            >
                              Mark Completed
                            </button>
                            <button
                              onClick={() => handleOpenChat(req._id, req.requesterId?.fullName)}
                              className="btn-outline"
                              style={{ flexGrow: 1, padding: '10px 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              <FiMessageSquare size={14} /> Chat
                            </button>
                          </>
                        ) : (
                          <span className="badge badge-success" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                            Donation Completed
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DONATION HISTORY */}
          {activeTab === 'history' && (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {isHistoryLoading ? (
                <div style={{ padding: '24px' }} className="skeleton-list">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="skeleton" style={{ height: '48px', marginBottom: '12px', borderRadius: 'var(--radius-sm)' }} />
                  ))}
                </div>
              ) : donationHistory.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <FiClock size={48} style={{ margin: '0 auto 16px', color: 'var(--color-border-hover)' }} />
                  <h3>No completed donations yet</h3>
                  <p style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '0.9rem' }}>
                    When you accept and complete emergency blood requests, your record history will be generated here!
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Patient Name</th>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Hospital & City</th>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</th>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Units</th>
                        <th style={{ padding: '16px 24px', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationHistory.map((don) => (
                        <tr key={don._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                            {new Date(don.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {don.requestId?.patientName || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            <div style={{ color: 'var(--color-text-primary)' }}>{don.requestId?.hospitalName || don.hospitalName}</div>
                            <div>{don.requestId?.city || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span className="badge badge-blood">{don.requestId?.bloodGroup || user.bloodGroup}</span>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                            {don.unitsDonated} Unit(s)
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span className="badge badge-success">✓ Completed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {historyTotalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
                      <button 
                        disabled={historyPage === 1} 
                        onClick={() => {
                          const prevPage = historyPage - 1;
                          setHistoryPage(prevPage);
                          fetchHistory(prevPage);
                        }}
                        className="btn-outline"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Previous
                      </button>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Page <strong>{historyPage}</strong> of <strong>{historyTotalPages}</strong>
                      </span>
                      <button 
                        disabled={historyPage === historyTotalPages} 
                        onClick={() => {
                          const nextPage = historyPage + 1;
                          setHistoryPage(nextPage);
                          fetchHistory(nextPage);
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
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        requestId={chatRequestId}
        recipientName={chatRecipientName}
      />
    </div>
  )
}
