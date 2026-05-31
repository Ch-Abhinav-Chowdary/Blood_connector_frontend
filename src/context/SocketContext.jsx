import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { addNotification } from '@/features/notifications/notificationSlice'
import toast from 'react-hot-toast'

const SocketContext = createContext({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Determine backend URL (proxy handles /api, but we connect directly for WebSockets in development)
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'https://blood-connector-backend.onrender.com' 
      : window.location.origin

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('📡 Socket connected:', newSocket.id)
      setIsConnected(true)
      
      // Register this socket to the user's personal room
      newSocket.emit('register', user.id || user._id)
    })

    // Listen for live notifications pushed from backend mongoose hooks
    newSocket.on('notification', (notif) => {
      console.log('📢 Live notification received:', notif)
      // Push to redux store
      dispatch(addNotification(notif))
      // Show dynamic toast banner
      toast((t) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-blood-light)' }}>
            {notif.title}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {notif.message}
          </span>
        </div>
      ), {
        icon: '🩸',
        duration: 5000,
        style: {
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
        }
      })
    })

    newSocket.on('disconnect', () => {
      console.log('📡 Socket disconnected')
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user, dispatch])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
