import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Navbar from './components/Layout/Navbar.jsx'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth)
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <div className="scale-[0.9] origin-top-left"> {/* ↓ Scale wrapper for entire app */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login setIsLogin={() => {}} defaultRole="employee" setRole={() => {}} />} />
          <Route path="/register" element={<Register setIsLogin={() => {}} defaultRole="employee" setRole={() => {}} />} />
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
