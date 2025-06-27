import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const fetchLeaves = createAsyncThunk('leaves/fetchLeaves', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('https://backendofl.onrender.com/api/leaves', { headers: getAuthHeaders() })
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves')
  }
})

export const applyLeave = createAsyncThunk('leaves/applyLeave', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post('https://backendofl.onrender.com/api/leaves', data, { headers: getAuthHeaders() })
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to apply leave')
  }
})

export const cancelLeave = createAsyncThunk('leaves/cancelLeave', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`https://backendofl.onrender.com/api/leaves/${id}`, { headers: getAuthHeaders() })
    return res.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel leave')
  }
})

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    leaves: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.leaves = action.payload
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(applyLeave.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(applyLeave.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(cancelLeave.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(cancelLeave.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(cancelLeave.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default leaveSlice.reducer