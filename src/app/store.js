import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import requestReducer from '@/features/requests/requestSlice'
import notificationReducer from '@/features/notifications/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths for non-serializable values (dates etc.)
        ignoredActions: ['auth/setCredentials'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export default store
