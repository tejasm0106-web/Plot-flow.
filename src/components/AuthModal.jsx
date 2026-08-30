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
  ShieldCheck,
  Send,
  Inbox
} from 'lucide-react';
import { 
  loginWithEmailAndPassword, 
  registerNewUser,
  sendPasswordResetLink,
  getStoredUsers,
  resetAdminPasswordWithPinOrOtp,
  getAdminCredentials,
  requestAdminPasswordResetOtp,
  requestAdminRecoverySmsOtp,
  requestUserSmsOtp,
  resetUserPasswordWithSmsOtp,
  requestLoginOtp,
  loginWithOtp,
  MASTER_ADMIN_PHONE,
  maskPhone
} from '../services/userService';
import { auth, GoogleAuthProvider, signInWithPopup } from '../services/firebase';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  // Navigation Mode: 'login' | 'register' | 'forgot-password'
  const [activeMode, setActiveMode] = useState('login');
  
  // Login Sub-mode: 'password' | 'email-otp'
  const [loginMethod, setLoginMethod] = useState('password');
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Registration Role: 'BUYER' | 'DEVELOPER' | 'LEGAL_AUDITOR'
  const [registerRole, setRegisterRole] = useState('BUYER');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [forgotTab, setForgotTab] = useState('sms-otp'); // 'sms-otp' | 'email-link' | 'admin-instant'
  
  // User SMS OTP Reset State
  const [userResetPhoneOrEmail, setUserResetPhoneOrEmail] = useState('');
  const [userResetOtpCode, setUserResetOtpCode] = useState('');
  const [userResetNewPassword, setUserResetNewPassword] = useState('');
  const [userResetConfirmPassword, setUserResetConfirmPassword] = useState('');
  const [userOtpDispatched, setUserOtpDispatched] = useState(false);
  const [userOtpSentNotice, setUserOtpSentNotice] = useState('');
  const [showUserResetPassword, setShowUserResetPassword] = useState(false);

  // Admin Reset State
  const [adminResetPin, setAdminResetPin] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmNewPassword, setAdminConfirmNewPassword] = useState('');
  const [adminResetMethod, setAdminResetMethod] = useState('sms'); // 'sms' | 'pin'
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminOtpDispatched, setAdminOtpDispatched] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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
      setLoginOtpCode('');
      setLoginOtpSent(false);
      setAdminOtpCode('');
      setAdminOtpDispatched(false);
      setAdminResetPin('');
      setAdminNewPassword('');
      setAdminConfirmNewPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Requesting OTP for Login
  const handleRequestLoginOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = loginEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address to receive your OTP.');
      return;
    }

    setLoading(true);
    try {
      await requestLoginOtp(targetEmail, 'user');
      setLoginOtpSent(true);
      setSuccessMsg(`✓ 6-Digit login verification code has been dispatched to ${targetEmail}. Please check your email inbox.`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Sign In with Firebase Auth / Password or Real Email OTP
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = loginEmail.trim().toLowerCase();

    if (!targetEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (loginMethod === 'email-otp') {
        if (!loginOtpCode || loginOtpCode.length !== 6) {
          throw new Error('Please enter the 6-digit code sent to your email.');
        }

        const user = await loginWithOtp({
          email: targetEmail,
          otpCode: loginOtpCode,
          portalType: 'user'
        });

        setSuccessMsg(`Welcome back, ${user.name}! Verified via email OTP.`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user);
          onClose();
        }, 500);
        return;
      }

      // Password Login
      if (!loginPassword) {
        throw new Error('Please enter your password.');
      }

      const user = await loginWithEmailAndPassword(targetEmail, loginPassword);
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

      setSuccessMsg(`Account created successfully! Logged in as ${newUser.name}.`);
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

  // Handle Requesting SMS OTP for User Password Reset
  const handleRequestUserSmsOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    const target = userResetPhoneOrEmail.trim();
    if (!target) {
      setError('Please enter your registered phone number or email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestUserSmsOtp(target);
      setUserOtpDispatched(true);
      setUserOtpSentNotice(`✓ 6-Digit SMS OTP dispatched to ${res.maskedPhone}.`);
      setSuccessMsg(`SMS verification code sent to ${res.maskedPhone}. Enter the code below to reset password.`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch SMS verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle User Password Reset via SMS OTP
  const handleUserSmsOtpReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const target = userResetPhoneOrEmail.trim();
    if (!target) {
      setError('Please enter your registered phone number or email.');
      return;
    }

    if (!userResetOtpCode || userResetOtpCode.trim().length !== 6) {
      setError('Please enter the 6-digit SMS OTP code sent to your phone.');
      return;
    }

    if (!userResetNewPassword || userResetNewPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (userResetNewPassword !== userResetConfirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetUserPasswordWithSmsOtp({
        phoneOrEmail: target,
        otpCode: userResetOtpCode.trim(),
        newPassword: userResetNewPassword
      });

      setSuccessMsg(result.message || 'Password reset successfully! You can now sign in.');
      setLoginEmail(result.user?.email || target);
      setLoginPassword(userResetNewPassword);
      setTimeout(() => {
        setActiveMode('login');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please verify your SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset via Firebase Auth Email Link
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

  // Handle Dispatching OTP Code for Admin Reset in AuthModal (SMS to 9916660655)
  const handleRequestAdminOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    setLoading(true);
    try {
      const res = await requestAdminRecoverySmsOtp(MASTER_ADMIN_PHONE);
      setAdminOtpDispatched(true);
      setSuccessMsg(`✓ 6-Digit security recovery code has been dispatched via SMS to ${MASTER_ADMIN_PHONE}. Check your mobile.`);
    } catch (err) {
      setError(err.message || 'Failed to dispatch recovery SMS.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Instant Reset with Master PIN or SMS OTP in AuthModal
  const handleAdminInstantReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!adminNewPassword || adminNewPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (adminNewPassword !== adminConfirmNewPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (adminResetMethod === 'sms') {
        if (!adminOtpCode || adminOtpCode.trim().length !== 6) {
          throw new Error('Please enter the 6-digit SMS OTP code sent to ' + MASTER_ADMIN_PHONE);
        }
        result = await resetUserPasswordWithSmsOtp({
          phoneOrEmail: MASTER_ADMIN_PHONE,
          otpCode: adminOtpCode.trim(),
          newPassword: adminNewPassword
        });
      } else {
        result = resetAdminPasswordWithPinOrOtp({
          email: 'tejastej094@gmail.com',
          phone: MASTER_ADMIN_PHONE,
          securityPin: adminResetPin,
          newPassword: adminNewPassword
        });
      }

      setSuccessMsg(`Admin password updated successfully! You can now log in with your new password.`);
      setLoginEmail('tejastej094@gmail.com');
      setLoginPassword(adminNewPassword);
      setTimeout(() => {
        setActiveMode('login');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to reset Admin password. Please check your SMS OTP or PIN.');
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
              {/* Login Method Toggle: Password vs Instant Real Email OTP */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'password'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email-otp');
                    setError('');
                    setSuccessMsg('');
                    if (!loginOtpSent && loginEmail) {
                      handleRequestLoginOtp();
                    }
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                    loginMethod === 'email-otp'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Real Email OTP</span>
                </button>
              </div>

              {/* Standard Email & Password / OTP Form */}
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

                {/* Password input */}
                {loginMethod === 'password' && (
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
                )}

                {/* Real Email OTP input */}
                {loginMethod === 'email-otp' && (
                  <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                        <Inbox className="w-3.5 h-3.5" />
                        <span>6-Digit Verification Code *</span>
                      </label>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleRequestLoginOtp}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>{loginOtpSent ? 'Resend Code' : 'Send Code to Email'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={loginOtpCode}
                      onChange={(e) => setLoginOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code from email"
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono tracking-widest text-center font-bold"
                    />

                    <p className="text-[10px] text-slate-400">
                      An authentic one-time code is sent to your email inbox. Please check inbox and spam.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mt-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{loginMethod === 'email-otp' ? 'Verify Code & Sign In' : 'Sign In to Account'}</span>
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
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => { setForgotTab('email-link'); setError(''); }}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      forgotTab === 'email-link' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Email Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForgotTab('admin-instant'); setError(''); }}
                    className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${
                      forgotTab === 'admin-instant' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    <span>Admin PIN / OTP</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: SMS OTP TO REGISTERED PHONE (FOR ALL USERS) */}
              {forgotTab === 'sms-otp' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-200">
                    <p className="font-bold mb-1 flex items-center space-x-1.5">
                      <span>SMS OTP Mobile Verification</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Enter your registered 10-digit mobile number or email. A 6-digit SMS verification code will be sent immediately to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleUserSmsOtpReset} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Registered Mobile Number or Email *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9845012345 or user@domain.com"
                          value={userResetPhoneOrEmail}
                          onChange={(e) => setUserResetPhoneOrEmail(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleRequestUserSmsOtp}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 shadow disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{userOtpDispatched ? 'Resend SMS' : 'Send SMS OTP'}</span>
                        </button>
                      </div>
                    </div>

                    {userOtpSentNotice && (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 font-medium flex items-center space-x-1.5">
                        <span>{userOtpSentNotice}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">
                        Enter 6-Digit SMS OTP Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit OTP from SMS"
                        value={userResetOtpCode}
                        onChange={(e) => setUserResetOtpCode(e.target.value)}
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-400 tracking-widest text-center font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showUserResetPassword ? 'text' : 'password'}
                            required
                            placeholder="Min 6 characters"
                            value={userResetNewPassword}
                            onChange={(e) => setUserResetNewPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowUserResetPassword(!showUserResetPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showUserResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Confirm New Password *
                        </label>
                        <input
                          type={showUserResetPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={userResetConfirmPassword}
                          onChange={(e) => setUserResetConfirmPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50 mt-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Verifying SMS OTP & Updating Password...</span>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Verify SMS OTP & Reset Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: EMAIL RESET LINK */}
              {forgotTab === 'email-link' && (
                <>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                    <p className="font-semibold mb-1">Standard Email Password Reset</p>
                    <p className="text-[11px] text-slate-300">
                      Enter your registered account email. A secure password reset link will be dispatched through Firebase Auth.
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
                </>
              )}

              {/* TAB 3: ADMIN MASTER RECOVERY */}
              {forgotTab === 'admin-instant' && (
                <>
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-200">
                    <p className="font-semibold mb-1 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span>Admin Master Security Recovery</span>
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Admins can securely reset passwords via 6-digit SMS OTP dispatched to Master Phone (<strong className="text-emerald-400 font-mono">{MASTER_ADMIN_PHONE}</strong>) or using the Master Security PIN (<strong className="text-indigo-300 font-mono">2026</strong>).
                    </p>
                  </div>

                  <form onSubmit={handleAdminInstantReset} className="space-y-3 text-xs">
                    {/* Method Selector: SMS vs PIN */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminResetMethod('sms')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                          adminResetMethod === 'sms'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SMS OTP to {MASTER_ADMIN_PHONE}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminResetMethod('pin')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                          adminResetMethod === 'pin'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Master PIN (Default: 2026)
                      </button>
                    </div>

                    {adminResetMethod === 'sms' ? (
                      <div className="space-y-2 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-semibold block text-xs">
                            6-Digit SMS OTP ({MASTER_ADMIN_PHONE}) *
                          </label>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleRequestAdminOtp}
                            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>{adminOtpDispatched ? 'Resend SMS' : 'Send SMS OTP'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 6-digit SMS OTP"
                          value={adminOtpCode}
                          onChange={(e) => setAdminOtpCode(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-400 tracking-widest text-center font-bold"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Master Security PIN (Default: 2026) *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Enter 4-digit PIN (2026)"
                          value={adminResetPin}
                          onChange={(e) => setAdminResetPin(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          New Admin Password *
                        </label>
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={adminConfirmNewPassword}
                          onChange={(e) => setAdminConfirmNewPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50 mt-2"
                    >
                      {loading ? (
                        <span>Updating Admin Password...</span>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Verify SMS OTP & Save Admin Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
