import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllLeaves, updateLeaveStatus } from '../features/admin/adminSlice'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function AdminDashboard() {
  const { leaves, status, error } = useSelector((state) => state.admin)
  const dispatch = useDispatch()
  const [filter, setFilter] = useState({ employee: '', status: '' })
  const [search, setSearch] = useState('')
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAllLeaves({ employee: filter.employee, status: filter.status, search }))
  }, [dispatch, filter, search])

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateLeaveStatus({ id, status })).unwrap()
      toast.success(`Leave ${status}`)
      dispatch(fetchAllLeaves({ employee: filter.employee, status: filter.status, search }))
    } catch (error) {
      toast.error(error || 'Failed to update status')
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.text('All Leave Requests', 20, 10)
    autoTable(doc, {
      head: [['Employee', 'From Date', 'To Date', 'Type', 'Reason', 'Status']],
      body: leaves.map(l => [
        l.employeeId?.name || 'Unknown',
        new Date(l.fromDate).toLocaleDateString(),
        new Date(l.toDate).toLocaleDateString(),
        l.type,
        l.reason,
        l.status
      ]),
    })
    doc.save('all_leaves.pdf')
  }

  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave)
    setIsModalOpen(true)
  }

  const calculateLeaveDays = (fromDate, toDate) => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Including both start and end dates
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
                    <p className="text-sm font-medium text-slate-500">Employee</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedLeave.employeeId?.name || 'Unknown'}
                    </p>
                  </div>
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
                  <p className="text(Meow)sm font-medium text-slate-500">Leave Type</p>
                  <p className="text-lg text-slate-800 capitalize">
                    {selectedLeave.type}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">Reason</p>
                  <p className="text-lg text-slate-800 whitespace-pre-line">
                    {selectedLeave.reason}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-500 mb-2">Update Status</p>
                  <select
                    value={selectedLeave.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedLeave._id, e.target.value)
                      setIsModalOpen(false)
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4 md:mb-0">Admin Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={downloadPDF}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>
            {error === 'Session expired, please log in again' || error === 'Access denied'
              ? `${error}. Please log in as an admin.`
              : error}
          </p>
        </div>
      )}

      {status === 'loading' ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : leaves.length > 0 ? (
        <div className="grid gap-6">
          {leaves.map((leave) => (
            <div 
              key={leave._id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">{leave.employeeId?.name || 'Unknown Employee'}</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        {leave.type}
                      </div>
                    </div>
                    <p className="text-slate-700 mt-2 line-clamp-2">{leave.reason}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-900">No leave requests found</h3>
          <p className="mt-1 text-slate-500">There are currently no leave requests to display.</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard