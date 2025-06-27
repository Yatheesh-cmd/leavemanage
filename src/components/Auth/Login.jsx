import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login({ setIsLogin, defaultRole, setRole }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: { role: defaultRole || 'employee' },
  });

  const selectedRole = watch('role');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setValue('role', defaultRole || 'employee');
  }, [defaultRole, setValue]);

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Login successful');
      navigate(data.role === 'admin' ? '/admin' : '/employee');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleRoleChange = (role) => {
    setValue('role', role);
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white">
   
         <div className="lg:w-1/2 bg-gradient-to-br from-teal-600 to-cyan-600 p-12 text-white flex flex-col items-center justify-center">
      
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/030/940/508/large_2x/leave-icon-vector.jpg" 
              alt="Leave Icon"
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome to LeaveHub</h1>
          <p className="text-lg mb-6 text-center">Streamline your leave management with a secure and intuitive platform.</p>
          <p className="text-sm opacity-90 text-center">Login as an Employee or Admin to access your personalized dashboard.</p>
        </div>

        <div className="lg:w-1/2 p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
          <p className="text-slate-600 mb-8">Access your account to manage your leaves.</p>

      
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange('employee')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                selectedRole === 'employee'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                selectedRole === 'admin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('role')} />

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email',
                    },
                  })}
                  className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="you@example.com"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="••••••••"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              Sign In
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h8.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L12.586 11H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                onClick={() => setIsLogin(false)}
                className="text-teal-600 hover:text-teal-800 font-medium transition"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;