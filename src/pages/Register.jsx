import { useState } from 'react'
import Login from '../components/Auth/Login'
import Register from '../components/Auth/Register'

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState('employee') // Track selected role

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl animate-fade-in">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setIsLogin(true)
              setRole('employee')
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              role === 'employee' && isLogin
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            } focus:ring-2 focus:ring-primary`}
          >
            Employee
          </button>
          <button
            onClick={() => {
              setIsLogin(true)
              setRole('admin')
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              role === 'admin' && isLogin
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            } focus:ring-2 focus:ring-primary`}
          >
            Admin
          </button>
        </div>
        {isLogin ? (
          <Login setIsLogin={setIsLogin} defaultRole={role} setRole={setRole} />
        ) : (
          <Register setIsLogin={setIsLogin} defaultRole={role} setRole={setRole} />
        )}
      </div>
    </div>
  )
}

export default LoginPage