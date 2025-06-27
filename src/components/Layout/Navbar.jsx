import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'

function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav className="bg-slate-800 shadow-xl fixed w-full z-20 top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7603/7603479.png"
                alt="LeaveHub Logo"
                className="h-11 w-11 mr-2"
              />
              <h1 className="text-xl font-semibold text-white tracking-tight">Leave Management System</h1>
            </div>

            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 text-white font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="group relative text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            )}

            {user && (
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMenu}
                  className="text-white focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-md p-2 hover:bg-slate-700 transition-all duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            )}
          </div>

          {user && isMenuOpen && (
            <div className="md:hidden bg-slate-700 px-4 py-4 animate-slide-in">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 text-white font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="group relative text-white hover:bg-slate-600 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16"></div>
    </>
  )
}

export default Navbar