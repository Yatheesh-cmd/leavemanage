import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register({ setIsLogin, defaultRole, setRole }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: { role: defaultRole || 'employee' },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setValue('role', defaultRole || 'employee');
  }, [defaultRole, setValue]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        })
      ).unwrap();
      toast.success('Registration successful');
      setIsLogin(true);
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleRoleChange = (role) => {
    setValue('role', role);
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Left Panel */}
        <div className="lg:w-1/2 bg-gradient-to-br from-teal-600 to-cyan-600 p-12 text-white flex flex-col items-center justify-center">
          {/* Leave Icon - Centered and Larger */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/031/002/183/original/leave-icon-vector.jpg" 
              alt="Leave Icon"
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-center">Join LeaveHub</h1>
          <p className="text-lg mb-6 text-center">Create your account to manage leaves seamlessly.</p>
          <p className="text-sm opacity-90 text-center">Choose your role and get started with our intuitive platform.</p>
        </div>

        {/* Right Panel - Form */}
        <div className="lg:w-1/2 p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
          <p className="text-slate-600 mb-8">Join as an Employee or Admin to access LeaveHub.</p>

          {/* Role Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange('employee')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                watch('role') === 'employee'
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
                watch('role') === 'admin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('role')} />

           
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email',
                  },
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

         
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

         
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watch('password') || 'Passwords do not match',
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              Create Account
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                onClick={() => setIsLogin(true)}
                className="text-teal-600 hover:text-teal-800 font-medium transition"
              >
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;