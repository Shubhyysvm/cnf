'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { adminLoginSchema, adminSignupSchema } from '@countrynaturalfoods/admin-services';
import { AdminApiClient } from '@countrynaturalfoods/admin-api-client';
import { useAuth } from '@/context/AuthContext';
import { Loader, AlertCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
};

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const apiClient = useMemo(
    () => new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'),
    []
  );

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(adminSignupSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await apiClient.auth.login(data.email, data.password);

      if (response.data?.token) {
        login(response.data.token, response.data.user);
        toast.success('✅ Login successful!');
        router.push('/admin');
      } else {
        setApiError('Login failed. Please try again.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid email or password';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await apiClient.auth.signup(data);

      if (response.data?.token) {
        toast.success('✅ Account created successfully! Redirecting to login...');
        // Don't auto-login, redirect to login page instead
        setTimeout(() => {
          setShowSignup(false);
          resetSignup();
          resetLogin();
          setApiError(null);
        }, 2000);
      } else {
        setApiError('Account creation failed. Please try again.');
      }
    } catch (error: any) {
      // Handle validation errors array or string message
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error?.response?.data?.message) {
        const msg = error.response.data.message;
        // Handle array of validation errors
        if (Array.isArray(msg)) {
          errorMessage = msg[0];
        } else if (typeof msg === 'string') {
          errorMessage = msg;
        }
      }
      
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setShowSignup(!showSignup);
    resetLogin();
    resetSignup();
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-emerald-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Cinematic Right Panel Background Layer */}
      <style>{`
        @keyframes ambient-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
          50% { transform: translate(20px, -30px) scale(1.1); opacity: 0.05; }
        }
        @keyframes ambient-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.02; }
          50% { transform: translate(-25px, 40px) scale(1.05); opacity: 0.04; }
        }
        @keyframes breathing-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.15), 0 0 100px rgba(16, 185, 129, 0.08); }
          50% { box-shadow: 0 0 80px rgba(16, 185, 129, 0.25), 0 0 120px rgba(16, 185, 129, 0.12); }
        }
        @keyframes input-focus-glow {
          from { box-shadow: inset 0 0 0 0 rgba(16, 185, 129, 0); }
          to { box-shadow: inset 0 0 12px rgba(16, 185, 129, 0.1), 0 0 20px rgba(16, 185, 129, 0.15); }
        }
        @keyframes button-hover-lift {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-4px) scale(1.02); }
        }
        .ambient-orb-1 { animation: ambient-drift-1 40s ease-in-out infinite; }
        .ambient-orb-2 { animation: ambient-drift-2 50s ease-in-out infinite; }
        .breathing-glow { animation: breathing-glow 6s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .glow-pulse-active { animation: glow-pulse 3s ease-in-out infinite; }
        .button-hover-lift { animation: button-hover-lift 0.3s ease-out forwards; }
        
        /* Vignette edge fade */
        .vignette::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.08) 100%);
          pointer-events: none;
        }
      `}</style>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center text-white space-y-8 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-lg mb-4">
            <span className="text-4xl">🌿</span>
          </div>
          
          <div>
            <h2 className="text-5xl font-black mb-3 leading-tight">Country Natural Foods</h2>
            <p className="text-xl text-emerald-50 font-light">Premium Admin Management Portal</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Advanced Analytics</h3>
                <p className="text-emerald-50 text-sm">Real-time insights into your business</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enterprise Security</h3>
                <p className="text-emerald-50 text-sm">Bank-grade encryption protection</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-emerald-50 text-sm">Dedicated team always ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Cinematic Auth Panel */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-8 sm:p-16 lg:p-20 overflow-hidden vignette">
        
        {/* PLANE 1: Enhanced Background Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-white -z-40"></div>
        
        {/* PLANE 1.5: Geometric Pattern Overlay */}
        <div className="absolute inset-0 -z-35 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(16 185 129) 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
        
        {/* PLANE 2: Ambient Motion Layer - Floating Orbs */}
        <div className="absolute inset-0 -z-30 overflow-hidden">
          {/* Orb 1 - Top Right */}
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/15 via-teal-300/8 to-transparent rounded-full blur-3xl ambient-orb-1"></div>
          {/* Orb 2 - Bottom Left */}
          <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-400/12 via-emerald-300/6 to-transparent rounded-full blur-3xl ambient-orb-2"></div>
          {/* Orb 3 - Center Deep */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-emerald-200/20 via-white/30 to-transparent rounded-full blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
          {/* Orb 4 - Accent Spotlight */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-full blur-2xl ambient-orb-1"></div>
        </div>

        {/* PLANE 3: Radial Breathing Glow */}
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[700px] bg-gradient-radial from-emerald-300/25 via-emerald-200/12 to-transparent rounded-full blur-3xl breathing-glow opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
        </div>
        
        {/* PLANE 3.5: Gradient Beams */}
        <div className="absolute inset-0 -z-18 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-teal-400/30 to-transparent"></div>
        </div>

        {/* PLANE 4: Subtle Noise Texture */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlUGVydHVyYk5vaXNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSI0IiByZXN1bHQ9Im5vaXNlIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] pointer-events-none"></div>

        {/* PLANE 5: Floating Form Container */}
        <div className="w-full max-w-lg relative z-10 group">
          
          {/* Mobile Logo - Animated */}
          <div className="lg:hidden text-center mb-14 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-5 shadow-lg shadow-emerald-500/20 group-focus-within:glow-pulse-active transition-all duration-300">
              <span className="text-4xl">🌿</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 leading-tight">Country Natural Foods</h1>
            <p className="text-gray-500 text-base mt-3 font-medium">Admin Portal</p>
          </div>

          {/* Premium Form Card - Main Container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl shadow-gray-900/10 p-10 sm:p-12 lg:p-14 animate-fade-in-up opacity-0 group-focus-within:glow-pulse-active transition-all duration-300" style={{ animationDelay: '0.2s' }}>
            
            {/* Persuasion Layer - Premium Trust Block */}
            <div className="mb-12 pb-10 border-b border-gray-200/60 animate-slide-in-left opacity-0 relative" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
              
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">Welcome Back</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">Securely manage your products, orders, and operations in one unified workspace with enterprise-grade tools and analytics.</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200/50">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                      <span className="text-xs font-medium text-emerald-700">Enterprise Access</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/50">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                      <span className="text-xs font-medium text-gray-700">Internal Only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Switch - Enhanced */}
            <div className="flex gap-2 mb-12 bg-gradient-to-r from-gray-50/80 to-gray-50/80 p-2 rounded-xl border border-gray-200/50 backdrop-blur-sm animate-slide-in-left opacity-0" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={() => showSignup && handleToggle()}
                className={`flex-1 py-3.5 px-5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  !showSignup
                    ? 'bg-white text-emerald-600 shadow-md shadow-emerald-500/20 scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => !showSignup && handleToggle()}
                className={`flex-1 py-3.5 px-5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  showSignup
                    ? 'bg-white text-emerald-600 shadow-md shadow-emerald-500/20 scale-105'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Alert - Animated */}
            {apiError && (
              <div className="mb-10 p-5 bg-gradient-to-r from-red-50/80 to-rose-50/80 border border-red-200/60 rounded-xl flex gap-3.5 text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{apiError}</p>
              </div>
            )}

            {/* Sign In Form */}
            {!showSignup && (
              <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
                {/* Email Field */}
                <div className="group/input">
                  <label className="block text-sm font-semibold text-gray-900 mb-5">Email Address</label>
                  <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                    <input
                      {...registerLogin('email')}
                      type="email"
                      className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                      autoComplete="email"
                      autoCorrect="on"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={isLoading}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-red-600 text-xs mt-2.5 flex items-center gap-1.5 animate-in fade-in duration-200">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="group/input">
                  <label className="block text-sm font-semibold text-gray-900 mb-5">Password</label>
                  <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                    <input
                      {...registerLogin('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                      autoComplete="current-password"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={isLoading}
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-600 text-xs mt-2.5 flex items-center gap-1.5 animate-in fade-in duration-200">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Sign In Button - Cinematic CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-5 rounded-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 mt-16 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 group/btn"
                  onMouseEnter={(e) => !isLoading && e.currentTarget.classList.add('button-hover-lift')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('button-hover-lift')}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Sign In Securely</span>
                      <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {showSignup && (
              <form onSubmit={handleSubmitSignup(onSignup)} className="space-y-12 animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s' }}>
                {/* First & Last Name Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="group/input">
                    <label className="block text-sm font-semibold text-gray-900 mb-5">First Name</label>
                    <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                      <input
                        {...registerSignup('firstName')}
                        type="text"
                        className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                        autoComplete="given-name"
                        autoCorrect="on"
                        autoCapitalize="words"
                        spellCheck={true}
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.firstName && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {signupErrors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="group/input">
                    <label className="block text-sm font-semibold text-gray-900 mb-5">Last Name</label>
                    <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                      <input
                        {...registerSignup('lastName')}
                        type="text"
                        className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                        autoComplete="family-name"
                        autoCorrect="on"
                        autoCapitalize="words"
                        spellCheck={true}
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.lastName && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {signupErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="group/input">
                  <label className="block text-sm font-semibold text-gray-900 mb-5">Email Address</label>
                  <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                    <input
                      autoComplete="email"
                      autoCorrect="on"
                      autoCapitalize="none"
                      spellCheck={false}
                      {...registerSignup('email')}
                      type="email"
                      className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="group/input">
                    <label className="block text-sm font-semibold text-gray-900 mb-5">Password</label>
                    <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                      <input
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        {...registerSignup('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.password && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="group/input">
                    <label className="block text-sm font-semibold text-gray-900 mb-5">Confirm</label>
                    <div className="relative focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-shadow duration-300 rounded-xl">
                      <input
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        {...registerSignup('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full pl-5 pr-5 py-5 text-base leading-[1.6] bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white outline-none transition-all duration-300 text-gray-900 hover:border-gray-300"
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {signupErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Create Account Button - Cinematic CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-5 rounded-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 mt-16 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 group/btn"
                  onMouseEnter={(e) => !isLoading && e.currentTarget.classList.add('button-hover-lift')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('button-hover-lift')}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Create Secure Account</span>
                      <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Divider & Support Link */}
            <div className="mt-12 pt-10 border-t border-gray-100 animate-slide-in-left opacity-0" style={{ animationDelay: '0.8s' }}>
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                Questions or concerns? <a href="mailto:support@countrynaturalfoods.com" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors">Contact our support team</a>
              </p>
            </div>
          </div>

          {/* Security Trust Badge - Bottom */}
          <div className="mt-10 flex items-center justify-center gap-3 text-gray-500 text-sm animate-fade-in-up opacity-0" style={{ animationDelay: '0.9s' }}>
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">Enterprise-grade security • ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
