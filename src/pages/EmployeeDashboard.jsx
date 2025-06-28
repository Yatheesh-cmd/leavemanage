import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { fetchLeaves, applyLeave, cancelLeave } from '../features/leaves/leaveSlice'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function EmployeeDashboard() {
  const { user } = useSelector((state) => state.auth)
  const { leaves, status } = useSelector((state) => state.leaves)
  const dispatch = useDispatch()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localLeaves, setLocalLeaves] = useState(leaves)
  const [dateError, setDateError] = useState('') // New state for date validation error

  useEffect(() => {
    dispatch(fetchLeaves())
  }, [dispatch])

  useEffect(() => {
    setLocalLeaves(leaves)
  }, [leaves])

  // Watch for changes in fromDate and toDate
  const fromDate = watch('fromDate')
  const toDate = watch('toDate')

  const calculateLeaveDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0
    const from = new Date(fromDate)
    const to = new Date(toDate)
    if (to < from) return 0 // Prevent negative days
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  // Validate dates in real-time
  useEffect(() => {
    if (fromDate && toDate) {
      const leaveDays = calculateLeaveDays(fromDate, toDate)
      const currentYear = new Date().getFullYear()
      const yearlyLeaveDays = localLeaves
        .filter(l => new Date(l.fromDate).getFullYear() === currentYear && l.status === 'Approved')
        .reduce((total, l) => total + calculateLeaveDays(l.fromDate, l.toDate), 0)

      if (leaveDays > 20) {
        setDateError('Leave duration cannot exceed 20 days')
      } else if (yearlyLeaveDays + leaveDays > 20) {
        setDateError(`Only ${20 - yearlyLeaveDays} days remaining for ${currentYear}`)
      } else {
        setDateError('')
      }
    } else {
      setDateError('')
    }
  }, [fromDate, toDate, localLeaves])

  const onSubmit = async (data) => {
    const leaveDays = calculateLeaveDays(data.fromDate, data.toDate)

    // Double-check validation (in case of direct submission)
    const currentYear = new Date().getFullYear()
    const yearlyLeaveDays = localLeaves
      .filter(l => new Date(l.fromDate).getFullYear() === currentYear && l.status === 'Approved')
      .reduce((total, l) => total + calculateLeaveDays(l.fromDate, l.toDate), 0)

    if (leaveDays > 20) {
      toast.error('Leave duration cannot exceed 20 days')
      return
    }

    if (yearlyLeaveDays + leaveDays > 20) {
      toast.error(`Only ${20 - yearlyLeaveDays} days remaining for ${currentYear}`)
      return
    }

    try {
      await dispatch(applyLeave(data)).unwrap()
      toast.success('Leave applied successfully')
      reset()
      dispatch(fetchLeaves())
    } catch (error) {
      toast.error(error.message || 'Failed to apply leave')
    }
  }

  // Rest of the code (handleCancel, downloadPDF, openLeaveDetails, etc.) remains unchanged

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal code remains unchanged */}
      
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
            <h2 className="text-xl font-semibold text-white">Apply for Leave</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    {...register('fromDate', { required: 'From Date is required' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                  {errors.fromDate && <p className="mt-1 text-sm text-red-600">{errors.fromDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    {...register('toDate', { required: 'To Date is required' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                  {errors.toDate && <p className="mt-1 text-sm text-red-600">{errors.toDate.message}</p>}
                </div>
              </div>
              
              {dateError && (
                <p className="text-sm text-red-600">{dateError}</p>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select
                  {...register('type', { required: 'Leave Type is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  {...register('reason', { required: 'Reason is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  rows="3"
                  placeholder="Briefly explain the reason for your leave"
                ></textarea>
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={status === 'loading' || !!dateError}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Apply Leave'}
              </button>
            </form>
          </div>
        </div>

        {/* Leave History section remains unchanged */}
      </div>
    </div>
  )
}

export default EmployeeDashboard