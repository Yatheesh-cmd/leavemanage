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
  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' })
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localLeaves, setLocalLeaves] = useState(leaves)
  const [yearlyLeaveDays, setYearlyLeaveDays] = useState(0)

  // Get current date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    dispatch(fetchLeaves())
  }, [dispatch])

  useEffect(() => {
    setLocalLeaves(leaves)
    // Calculate total approved leave days for the current year
    const currentYear = new Date().getFullYear()
    const total = leaves
      .filter(l => new Date(l.fromDate).getFullYear() === currentYear && l.status === 'Approved')
      .reduce((total, l) => total + calculateLeaveDays(l.fromDate, l.toDate), 0)
    setYearlyLeaveDays(total)
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

  const onSubmit = async (data) => {
    try {
      await dispatch(applyLeave(data)).unwrap()
      toast.success('Leave applied successfully')
      reset()
      dispatch(fetchLeaves())
    } catch (error) {
      toast.error(error.message || 'Failed to apply leave')
    }
  }

  const handleCancel = async (id) => {
    try {
      await dispatch(cancelLeave(id)).unwrap()
      toast.success('Leave cancelled')
      dispatch(fetchLeaves())
    } catch (error) {
      toast.error(error.message || 'Failed to cancel leave')
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text('Leave Summary', 20, 10)
    autoTable(doc, {
      head: [['From Date', 'To Date', 'Type', 'Reason', 'Status']],
      body: localLeaves.map(l => [
        new Date(l.fromDate).toLocaleDateString(),
        new Date(l.toDate).toLocaleDateString(),
        l.type,
        l.reason,
        l.status
      ]),
    })
    doc.save('leave_summary.pdf')
  }

  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modal */}
      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  Leave Request Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLeave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      selectedLeave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedLeave.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Type</p>
                    <p className="text-lg text-slate-800 capitalize">
                      {selectedLeave.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">From Date</p>
                    <p className="text-lg text-slate-800">
                      {new Date(selectedLeave.fromDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">To Date</p>
                    <p className="text-lg text-slate-800">
                      {new Date(selectedLeave.toDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Total Leave Days</p>
                  <p className="text-lg text-slate-800">
                    {calculateLeaveDays(selectedLeave.fromDate, selectedLeave.toDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Reason</p>
                  <p className="text-lg text-slate-800 whitespace-pre-line">
                    {selectedLeave.reason}
                  </p>
                </div>

                {selectedLeave.status === 'Pending' && (
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        handleCancel(selectedLeave._id)
                        setIsModalOpen(false)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Cancel Leave
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-slate-800 mb-8">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
            <h2 className="text-xl font-semibold text-white">Apply for Leave</h2>
            <p className="text-sm text-white mt-2">
              Leave Quota for {new Date().getFullYear()}: {yearlyLeaveDays} days used, {20 - yearlyLeaveDays} days remaining
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    {...register('fromDate', { required: 'From Date is required' })}
                    min={today}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                      errors.fromDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.fromDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.fromDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"> To Date</label>
                  <input
                    type="date"
                    {...register('toDate', { required: 'To Date is required' })}
                    min={today}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                      errors.toDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.toDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.toDate.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select
                  {...register('type', { required: 'Leave Type is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                    errors.type ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  {...register('reason', { required: 'Reason is required' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                    errors.reason ? 'border-red-500' : 'border-slate-300'
                  }`}
                  rows="3"
                  placeholder="Briefly explain the reason for your leave"
                ></textarea>
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={status === 'loading' || !isValid}
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Leave History</h2>
            <button
              onClick={downloadPDF}
              className="bg-white text-teal-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download as PDF
            </button>
          </div>
          
          <div className="p-6">
            {localLeaves.length > 0 ? (
              <div className="space-y-4">
                {localLeaves.map((leave) => (
                  <div 
                    key={leave._id} 
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {leave.status}
                          </span>
                          <span className="text-sm text-slate-500 capitalize">{leave.type}</span>
                        </div>
                        <p className="mt-2 font-medium text-slate-800">
                          {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                        </p>
                        <p className="text-slate-600 mt-1 line-clamp-2">{leave.reason}</p>
                      </div>
                      <button
                        onClick={() => openLeaveDetails(leave)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-slate-900">No leave history</h3>
                <p className="mt-1 text-sm text-slate-500">You haven't applied for any leaves yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard