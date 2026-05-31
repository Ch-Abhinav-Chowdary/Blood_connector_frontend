import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiX } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useSocket } from '@/context/SocketContext'
import { chatsAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function ChatPanel({ isOpen, onClose, requestId, recipientName }) {
  const user = useSelector(selectCurrentUser)
  const { socket, isConnected } = useSocket()
  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load chat history & Socket join room
  useEffect(() => {
    if (!isOpen || !requestId) return

    const loadChatHistory = async () => {
      setIsLoading(true)
      try {
        const response = await chatsAPI.getHistory(requestId)
        setMessages(response.data.data.messages || [])
      } catch (err) {
        toast.error('Failed to load chat history')
      } finally {
        setIsLoading(false)
      }
    }

    loadChatHistory()

    if (socket) {
      // Join the socket room for this blood request
      socket.emit('join_room', requestId)

      // Listen for message events
      socket.on('receive_message', (msg) => {
        setMessages((prev) => {
          // Avoid duplicate messages if any
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      })
    }

    return () => {
      if (socket) {
        socket.emit('leave_room', requestId)
        socket.off('receive_message')
      }
    }
  }, [isOpen, requestId, socket])

  // Scroll on message change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    // Emit send_message event to backend
    socket.emit('send_message', {
      requestId,
      senderId: user.id || user._id,
      messageText: newMessage.trim(),
    })

    setNewMessage('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 5, 8, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 'var(--z-modal)',
            }}
          />

          {/* Chat Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '440px',
              background: 'rgba(17, 17, 24, 0.95)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--color-border)',
              zIndex: 'calc(var(--z-modal) + 1)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
                  Chat with {recipientName || 'User'}
                </h3>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isConnected ? 'var(--color-success)' : 'var(--color-text-muted)',
                      display: 'inline-block',
                    }}
                  />
                  {isConnected ? 'Real-time connected' : 'Connecting...'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost"
                style={{ padding: '8px', borderRadius: '50%', color: 'var(--color-text-muted)' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Message Area */}
            <div
              style={{
                flexGrow: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <span className="spinner" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0 20px' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No messages yet</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Send a message to start coordinating the blood donation.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = (msg.senderId?._id || msg.senderId) === (user?.id || user?._id)
                  const showSenderName = index === 0 || messages[index - 1].senderId?._id !== msg.senderId?._id

                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        gap: '4px',
                      }}
                    >
                      {!isMe && showSenderName && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                          {msg.senderId?.fullName || recipientName}
                        </span>
                      )}
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: '16px',
                          borderTopRightRadius: isMe ? '4px' : '16px',
                          borderTopLeftRadius: isMe ? '16px' : '4px',
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          background: isMe ? 'var(--gradient-brand)' : 'var(--color-surface-2)',
                          color: isMe ? 'white' : 'var(--color-text-primary)',
                          border: isMe ? 'none' : '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {msg.messageText}
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--color-text-muted)',
                          margin: isMe ? '0 4px 0 0' : '0 0 0 4px',
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="form-input"
                style={{ flexGrow: 1, borderRadius: 'var(--radius-full)' }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="btn-brand"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}
              >
                <FiSend size={16} style={{ transform: 'translateX(1px)' }} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
