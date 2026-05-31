import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersAPI } from '@/services/api'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getNotifications(params)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await usersAPI.markNotificationsRead()
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    // Used by Socket.IO in Phase 8 to push live notifications
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      state.unreadCount += 1
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    builder
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0
        state.items = state.items.map(n => ({ ...n, isRead: true }))
      })
  },
})

export const { addNotification, setUnreadCount } = notificationSlice.actions

export const selectNotifications = (state) => state.notifications.items
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectNotificationsLoading = (state) => state.notifications.isLoading

export default notificationSlice.reducer
