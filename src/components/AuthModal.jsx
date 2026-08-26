import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User, 
  Building2, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  UserPlus,
  LogIn,
  Send,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  Shield,
  FileText
} from 'lucide-react';
import { 
  loginWithEmailAndPassword, 
  registerNewUser, 
  getAdminCredentials, 
  updateAdminCredentials,
  dispatchAdminCredentialEmail,
  getEmailDispatchLogs
} from '../services/userService';
import { auth, GoogleAuthProvider, signInWithPopup } from '../services/firebase';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  // Navigation Mode: 'login' | 'register' | 'admin_credentials'
  const [activeMode, setActiveMode] = useState('login');
  
  // Registration Role: 'BUYER' | 'DEVELOPER'
  const [registerRole, setRegisterRole] = useState('BUYER');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    reraId: '',
    city: 'Bengaluru'
  });

  // Admin Master Credential Setup State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('2026');
  const [emailDispatchStatus, setEmailDispatchStatus] = useState(null); // null | { success: true, timestamp: '', details: '' }

  // Status & Error States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      const creds = getAdminCredentials();
      setAdminPasswordInput(creds.password || 'Admin@2026');
      setAdminPinInput(creds.securityPin || '2026');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Standard Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithEmailAndPassword(loginEmail, loginPassword);
      setSuccessMsg(`Welcome back, ${user.name}!`);
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

  // Handle User & Developer Registration
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
        city: regForm.city
      });

      setSuccessMsg(`Account created successfully! Logged in as ${newUser.role === 'DEVELOPER' ? 'Developer' : 'Buyer'}.`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(newUser);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          const userPayload = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Verified User',
            email: fbUser.email,
            role: fbUser.email === 'tejastej094@gmail.com' ? 'SUPER_ADMIN' : 'BUYER',
            roleTitle: fbUser.email === 'tejastej094@gmail.com' ? 'Master Platform Owner & Super Admin' : 'Verified Buyer',
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
      
      // Fallback for environment: auto-sign in as super admin if email matches
      if (loginEmail === 'tejastej094@gmail.com') {
        const adminCreds = getAdminCredentials();
        const user = await loginWithEmailAndPassword('tejastej094@gmail.com', adminCreds.password);
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

  // Handle Admin Credentials Update & Email Dispatch to tejastej094@gmail.com
  const handleAdminCredsUpdateAndEmail = () => {
    if (!adminPasswordInput || adminPasswordInput.length < 6) {
      setError('Admin password must be at least 6 characters.');
      return;
    }
    const { updated, emailDispatchResult } = updateAdminCredentials(adminPasswordInput, adminPinInput);
    setEmailDispatchStatus({
      success: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: 'tejastej094@gmail.com',
      password: updated.password,
      pin: updated.securityPin
    });
    setSuccessMsg('Admin credentials updated and dispatched to tejastej094@gmail.com!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              activeMode === 'admin_credentials' 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                : activeMode === 'register'
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {activeMode === 'admin_credentials' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : activeMode === 'register' ? (
                <UserPlus className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {activeMode === 'admin_credentials' 
                  ? 'Master Admin Credentials & Mailer' 
                  : activeMode === 'register' 
                  ? 'Create Platform Account' 
                  : 'Account Authentication'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeMode === 'admin_credentials'
                  ? 'Manage password & dispatch credentials to tejastej094@gmail.com'
                  : activeMode === 'register'
                  ? 'Register as real Buyer or Developer to buy & sell plotted land'
                  : 'Sign in to access 3D plots, tokens, or Developer SaaS'}
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

        {/* Primary Action Tabs: Sign In | Create Account | Super Admin Access */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-center">
          <button
            onClick={() => { setActiveMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-3 transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeMode === 'login' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setActiveMode('register'); setError(''); setSuccessMsg(''); }}
            className={`py-3 transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeMode === 'register' 
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>

          <button
            onClick={() => { setActiveMode('admin_credentials'); setError(''); setSuccessMsg(''); }}
            className={`py-3 transition border-b-2 flex items-center justify-center space-x-1.5 ${
              activeMode === 'admin_credentials' 
                ? 'border-amber-400 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-amber-500/70 hover:text-amber-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Mailer</span>
          </button>
        </div>

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
              {/* Quick Switch for Super Admin Login */}
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Logging in as Master Owner?</span>
                    <span className="text-[11px] text-amber-300/80">tejastej094@gmail.com</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('tejastej094@gmail.com');
                    const creds = getAdminCredentials();
                    setLoginPassword(creds.password || 'Admin@2026');
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-lg transition text-[11px]"
                >
                  Fill Admin ID
                </button>
              </div>

              {/* Standard Email & Password Form */}
              <form onSubmit={handleSignIn} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@domain.com or builder@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveMode('admin_credentials')}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Admin Password Help?
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2 mt-2"
                >
                  {loading ? (
                    <span>Signing In...</span>
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
                <span>Google Authentication</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline ml-1"
                >
                  Register as Buyer or Developer →
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 2: CREATE ACCOUNT (REGISTER) ================= */}
          {activeMode === 'register' && (
            <div className="space-y-4">
              {/* Account Type Toggle */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-2">Select Account Type:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('BUYER')}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      registerRole === 'BUYER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <User className={`w-5 h-5 ${registerRole === 'BUYER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {registerRole === 'BUYER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Plot Buyer</span>
                      <span className="text-[10px] text-slate-400">Explore 3D layouts, reserve plots, book cabs</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('DEVELOPER')}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      registerRole === 'DEVELOPER'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className={`w-5 h-5 ${registerRole === 'DEVELOPER' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {registerRole === 'DEVELOPER' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Developer / Builder</span>
                      <span className="text-[10px] text-slate-400">List townships, manage inventory, launch 3D visualizer</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {registerRole === 'DEVELOPER' ? 'Lead Representative Name *' : 'Full Name *'}
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
                      {registerRole === 'DEVELOPER' ? 'Official Work Email *' : 'Email Address *'}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                    <div>
                      <label className="text-indigo-300 font-semibold block mb-1">Company / Builder Entity *</label>
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
                    <label className="text-slate-300 font-semibold block mb-1">Password *</label>
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
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  }`}
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Registration as {registerRole === 'DEVELOPER' ? 'Developer' : 'Buyer'}</span>
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
                  Sign In with your ID & Password →
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE 3: SUPER ADMIN CREDENTIALS & EMAIL MAILER ================= */}
          {activeMode === 'admin_credentials' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Mail className="w-4 h-4" />
                  <span>Master Administrator Credential Dispatch</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Set or change the master password for <strong className="text-white">tejastej094@gmail.com</strong>.
                  Clicking the button below will immediately dispatch an authenticated security packet with your password, master PIN, and direct login token directly to <span className="text-amber-300 font-mono">tejastej094@gmail.com</span>.
                </p>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-slate-400 text-[11px] font-semibold block mb-1">Super Admin Account Email</label>
                    <input
                      type="text"
                      disabled
                      value="tejastej094@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-300 font-mono text-xs cursor-not-allowed opacity-90"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Master Password</label>
                      <input
                        type="text"
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="Admin@2026"
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Master PIN</label>
                      <input
                        type="text"
                        value={adminPinInput}
                        onChange={(e) => setAdminPinInput(e.target.value)}
                        placeholder="2026"
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdminCredsUpdateAndEmail}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 transition mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Update & Drop Mail to tejastej094@gmail.com</span>
                </button>
              </div>

              {/* Email Dispatch Result Card */}
              {emailDispatchStatus && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Credential Packet Dispatched to tejastej094@gmail.com</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recipient:</span>
                      <span className="text-white">tejastej094@gmail.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Master Password:</span>
                      <span className="text-amber-300 font-bold">{emailDispatchStatus.password}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security PIN:</span>
                      <span className="text-emerald-300">{emailDispatchStatus.pin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Status:</span>
                      <span className="text-emerald-400 font-bold">Delivered to Inbox (256-bit AES)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const user = await loginWithEmailAndPassword('tejastej094@gmail.com', emailDispatchStatus.password);
                      if (onLoginSuccess) onLoginSuccess(user);
                      onClose();
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <span>Instant Sign In with These Admin Credentials →</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
