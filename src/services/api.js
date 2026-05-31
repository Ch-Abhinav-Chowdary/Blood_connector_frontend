import axios from 'axios'

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api/v1',       // Proxied to http://localhost:5000 via Vite proxy
  withCredentials: true,    // Include cookies for HTTP-only tokens
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Inject access token from Redux store on every request
api.interceptors.request.use(
  (config) => {
    // Access token from localStorage (set after login/register)
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle token expiry and auto-refresh

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying — attempt token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/auth/refresh-token')
        const newToken = response.data.data.accessToken

        localStorage.setItem('accessToken', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')

        // Redirect to login on complete auth failure
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
}

// ─── Requests API ─────────────────────────────────────────────────────────────
export const requestsAPI = {
  getAvailable: (params) => api.get('/requests', { params }),
  getMy: (params) => api.get('/requests/my', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  accept: (id) => api.patch(`/requests/${id}/accept`),
  complete: (id) => api.patch(`/requests/${id}/complete`),
  cancel: (id) => api.patch(`/requests/${id}/cancel`),
}

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getDonors: (params) => api.get('/users/donors', { params }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updateAvailability: (data) => api.patch('/users/availability', data),
  getDonationHistory: (params) => api.get('/users/donations', { params }),
  getNotifications: (params) => api.get('/users/notifications', { params }),
  markNotificationsRead: () => api.patch('/users/notifications/read-all'),
}

// ─── Chats API ────────────────────────────────────────────────────────────────
export const chatsAPI = {
  getHistory: (requestId) => api.get(`/chats/${requestId}`),
}

// ─── Home/Landing API ─────────────────────────────────────────────────────────
export const homeAPI = {
  getStats: () => api.get('/stats'),
}

export default api
