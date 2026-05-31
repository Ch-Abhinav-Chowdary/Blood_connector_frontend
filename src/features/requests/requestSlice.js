import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { requestsAPI } from '@/services/api'

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAvailableRequests = createAsyncThunk(
  'requests/fetchAvailable',
  async (params, { rejectWithValue }) => {
    try {
      const response = await requestsAPI.getAvailable(params)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch requests')
    }
  }
)

export const fetchMyRequests = createAsyncThunk(
  'requests/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const response = await requestsAPI.getMy(params)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your requests')
    }
  }
)

export const createBloodRequest = createAsyncThunk(
  'requests/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await requestsAPI.create(data)
      return response.data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message ||
        'Failed to create request'
      )
    }
  }
)

export const acceptBloodRequest = createAsyncThunk(
  'requests/accept',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await requestsAPI.accept(requestId)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept request')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const requestSlice = createSlice({
  name: 'requests',
  initialState: {
    available: [],
    myRequests: [],
    pagination: null,
    isLoading: false,
    isCreating: false,
    error: null,
  },
  reducers: {
    clearRequestError: (state) => {
      state.error = null
    },
    updateRequestStatus: (state, action) => {
      const { id, status, acceptedBy } = action.payload
      const req = state.available.find(r => r._id === id)
      if (req) {
        req.status = status
        if (acceptedBy) req.acceptedBy = acceptedBy
      }
      const myReq = state.myRequests.find(r => r._id === id)
      if (myReq) {
        myReq.status = status
        if (acceptedBy) myReq.acceptedBy = acceptedBy
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAvailableRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.available = action.payload.requests
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAvailableRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    builder
      .addCase(fetchMyRequests.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.myRequests = action.payload.requests
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    builder
      .addCase(createBloodRequest.pending, (state) => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createBloodRequest.fulfilled, (state, action) => {
        state.isCreating = false
        state.myRequests.unshift(action.payload.request)
      })
      .addCase(createBloodRequest.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload
      })

    builder
      .addCase(acceptBloodRequest.fulfilled, (state, action) => {
        const updatedRequest = action.payload.request
        state.available = state.available.filter(r => r._id !== updatedRequest._id)
      })
  },
})

export const { clearRequestError, updateRequestStatus } = requestSlice.actions

export const selectAvailableRequests = (state) => state.requests.available
export const selectMyRequests = (state) => state.requests.myRequests
export const selectRequestsLoading = (state) => state.requests.isLoading
export const selectIsCreating = (state) => state.requests.isCreating
export const selectRequestError = (state) => state.requests.error
export const selectPagination = (state) => state.requests.pagination

export default requestSlice.reducer
