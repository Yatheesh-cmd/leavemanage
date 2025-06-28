import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { logout } from '../auth/authSlice'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token found, please log in')
  }
  return { Authorization: `Bearer ${token}` }
}

export const fetchAllLeaves = createAsyncThunk(
  'admin/fetchAllLeaves',
  async ({ employee, status, search }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get(
        `https://backendofl.onrender.com/api/admin/leaves?employee=${employee}&status=${status}&search=${search}`,
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      if (error.message === 'No token found, please log in') {
        dispatch(logout())
        return rejectWithValue('Session expired, please log in again')
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves')
    }
  }
)

export const updateLeaveStatus = createAsyncThunk(
  'admin/updateLeaveStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(
        `https://backendofl.onrender.com/api/admin/leaves/${id}/status`,
        { status },
        { headers: getAuthHeaders() }
      )
      return res.data
    } catch (error) {
      if (error.message === 'No token found, please log in') {
        dispatch(logout())
        return rejectWithValue('Session expired, please log in again')
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update status')
    }
  }
)


const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    leaves: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLeaves.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.leaves = action.payload
        state.error = null
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateLeaveStatus.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateLeaveStatus.fulfilled, (state) => {
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default adminSlice.reducer