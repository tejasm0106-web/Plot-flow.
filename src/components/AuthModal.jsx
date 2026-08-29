import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Building2, 
  Scale,
  CheckCircle2, 
  Mail, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { 
  loginWithEmailAndPassword, 
  registerNewUser,
  sendPasswordResetLink,
  getStoredUsers,
  resetAdminPasswordWithPinOrOtp,
  getAdminCredentials
} from '../services/userService';
import { auth, GoogleAuthProvider, signInWithPopup } from '../services/firebase';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  // Navigation Mode: 'login' | 'register' | 'forgot-password'
  const [activeMode, setActiveMode] = useState('login');
  
  // Registration Role: 'BUYER' | 'DEVELOPER' | 'LEGAL_AUDITOR'
  const [registerRole, setRegisterRole] = useState('BUYER');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    reraId: '',
    specialization: '',
    city: 'Bengaluru'
  });

  // Status & Error States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setResetSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Standard Sign In with Firebase Auth
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithEmailAndPassword(loginEmail, loginPassword);
      setSuccessMsg(`Welcome back, ${user.name}! (${user.roleTitle || user.role})`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle User Registration with Firebase Auth
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regForm.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regForm.email.trim() || !regForm.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!regForm.password || regForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (registerRole === 'DEVELOPER' && !regForm.company.trim()) {
      setError('Please enter your Developer/Builder company name.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerNewUser({
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        phone: regForm.phone,
        role: registerRole,
        company: regForm.company,
        reraId: regForm.reraId,
        specialization: regForm.specialization,
        city: regForm.city
      });

      setSuccessMsg(`Account created successfully with Firebase Auth! Logged in as ${newUser.name}.`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(newUser);
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset via Firebase Auth
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordResetLink(resetEmail);
      setResetSent(true);
      setSuccessMsg(result.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to dispatch password reset link.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const fbUser = result.user;
          const users = getStoredUsers();
          const cleanEmail = (fbUser.email || '').toLowerCase().trim();
          const existingUser = users.find(u => (u.email || '').toLowerCase() === cleanEmail);

          const role = existingUser?.role || (cleanEmail.includes('admin') ? 'SUPER_ADMIN' : 'BUYER');
          const roleTitle = existingUser?.roleTitle || (role === 'SUPER_ADMIN' ? 'Platform Administrator & Governance' : 'Verified Plot Buyer');

          const userPayload = {
            uid: fbUser.uid,
            name: fbUser.displayName || existingUser?.name || cleanEmail.split('@')[0],
            email: fbUser.email,
            role,
            roleTitle,
            authProvider: 'firebase.google',
            verified: true
          };
          if (onLoginSuccess) onLoginSuccess(userPayload);
          onClose();
          return;
        } catch (popupErr) {
          console.info('Google popup notice:', popupErr);
        }
      }
      
      // Fallback for environment if popup blocked
      if (loginEmail.trim()) {
        const user = await loginWithEmailAndPassword(loginEmail, loginPassword);
        if (onLoginSuccess) onLoginSuccess(user);
        onClose();
      } else {
        setError('Please enter your email and password to log in directly.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              activeMode === 'register'
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : activeMode === 'forgot-password'
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {activeMode === 'register' ? (
                <UserPlus className="w-6 h-6" />
              ) : activeMode === 'forgot-password' ? (
                <KeyRound className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  {activeMode === 'register' 
                    ? 'Create Platform Account' 
                    : activeMode === 'forgot-password'
                    ? 'Reset Account Password'
                    : 'Firebase Authentication'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                  Auth Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeMode === 'register'
                  ? 'Sign up with any email & password to explore 3D plots, tokens, or SaaS'
                  : activeMode === 'forgot-password'
                  ? 'Enter your registered email to receive a password reset link'
                  : 'Sign in with your email and password or Google identity'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Tabs: Sign In | Create Account */}
        {activeMode !== 'forgot-password' && (
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-center">
            <button
              onClick={() => { setActiveMode('login'); setError(''); setSuccessMsg(''); }}
              className={`py-3.5 transition border-b-2 flex items-center justify-center space-x-1.5 ${
                activeMode === 'login' 
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setActiveMode('register'); setError(''); setSuccessMsg(''); }}
              className={`py-3.5 transition border-b-2 flex items-center justify-center space-x-1.5 ${
                activeMode === 'register' 
                  ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= MODE 1: SIGN IN ================= */}
          {activeMode === 'login' && (
            <div className="space-y-4">
              {/* Standard Email & Password Form */}
              <form onSubmit={handleSignIn} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email (e.g. user@domain.com)"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Password *</label>
                    <button
                      type="button"
                      onClick={() => { setActiveMode('forgot-password'); setResetEmail(loginEmail); setError(''); setSuccessMsg(''); }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mt-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50"
                >
                  {loading ? (
                    <span>Authenticating with Firebase...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Google Social Login */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-950 px-2 text-slate-500 font-bold">Or Continue With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2.5 transition shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                New to PlotFlow?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline ml-1"
                >
                  Create an account in seconds →
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: CREATE ACCOUNT (REGISTER) ================= */}
          {activeMode === 'register' && (
            <div className="space-y-4">
              {/* Account Type Toggle */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-2">Choose Your Account Role:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('BUYER')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      registerRole === 'BUYER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <User className={`w-4 h-4 ${registerRole === 'BUYER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {registerRole === 'BUYER' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Plot Buyer</span>
                      <span className="text-[10px] text-slate-400">Explore & buy plots</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('DEVELOPER')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      registerRole === 'DEVELOPER'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className={`w-4 h-4 ${registerRole === 'DEVELOPER' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {registerRole === 'DEVELOPER' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Developer / Builder</span>
                      <span className="text-[10px] text-slate-400">List 3D townships</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('LEGAL_AUDITOR')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      registerRole === 'LEGAL_AUDITOR'
                        ? 'bg-teal-500/10 border-teal-500 text-white shadow-lg shadow-teal-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Scale className={`w-4 h-4 ${registerRole === 'LEGAL_AUDITOR' ? 'text-teal-400' : 'text-slate-500'}`} />
                      {registerRole === 'LEGAL_AUDITOR' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Legal Auditor</span>
                      <span className="text-[10px] text-slate-400">Verify title search</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {registerRole === 'DEVELOPER' ? 'Representative Name *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Extra Developer Fields */}
                {registerRole === 'DEVELOPER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl animate-fadeIn">
                    <div>
                      <label className="text-indigo-300 font-semibold block mb-1">Builder Entity / Company *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prestige Plotted Lands"
                        value={regForm.company}
                        onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-indigo-300 font-semibold block mb-1">RERA Registration No.</label>
                      <input
                        type="text"
                        placeholder="PRM/KA/RERA/1250/..."
                        value={regForm.reraId}
                        onChange={(e) => setRegForm({ ...regForm, reraId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Extra Legal Auditor Fields */}
                {registerRole === 'LEGAL_AUDITOR' && (
                  <div className="p-3 bg-teal-950/20 border border-teal-500/20 rounded-2xl animate-fadeIn">
                    <label className="text-teal-300 font-semibold block mb-1">Legal Specialization / Bar Council No.</label>
                    <input
                      type="text"
                      placeholder="e.g. Land Title Search & 30-Year Encumbrance Audit (KAR/1245/2018)"
                      value={regForm.specialization}
                      onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98450 12345"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">City / Region</label>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mt-3 ${
                    registerRole === 'DEVELOPER'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50'
                      : registerRole === 'LEGAL_AUDITOR'
                      ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  }`}
                >
                  {loading ? (
                    <span>Registering with Firebase Auth...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Sign Up ({registerRole === 'DEVELOPER' ? 'Developer' : registerRole === 'LEGAL_AUDITOR' ? 'Legal Auditor' : 'Buyer'})</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setError(''); }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline ml-1"
                >
                  Sign In to existing account →
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 3: FORGOT PASSWORD ================= */}
          {activeMode === 'forgot-password' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setActiveMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                <p className="font-semibold mb-1">Account & Admin Password Recovery</p>
                <p className="text-[11px] text-slate-300">
                  Enter your registered account email. A secure password reset link will be dispatched through Firebase Auth. Platform Administrators can also use the Staff Gateway Master PIN (<strong className="text-amber-300 font-mono">2026</strong>).
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Your Registered Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@domain.com or tejastej094@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 shadow-amber-950/50"
                >
                  {loading ? (
                    <span>Dispatching Reset Link...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Password Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
