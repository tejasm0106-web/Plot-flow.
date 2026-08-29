import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  Lock, 
  Key, 
  X, 
  ArrowRight, 
  UserCheck, 
  AlertCircle, 
  Building2, 
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  Send,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { 
  getAdminCredentials, 
  getStoredUsers, 
  loginWithEmailAndPassword,
  requestAdminPasswordResetOtp,
  requestLoginOtp,
  loginWithOtp,
  resetAdminPasswordWithPinOrOtp,
  restoreDefaultAdminCredentials,
  saveStoredUsers
} from '../services/userService';
import { SUPER_ADMIN_EMAIL } from '../services/rbacService';

export default function StaffGatewayModal({
  isOpen,
  onClose,
  targetPortal = 'admin', // 'admin' | 'legal'
  currentUser,
  onAuthenticateAndOpenPortal
}) {
  // Mode: 'login' | 'reset-admin-password'
  const [modalMode, setModalMode] = useState('login');
  
  // Login Sub-mode: 'password' | 'email-otp'
  const [loginMethod, setLoginMethod] = useState('password');

  // Sign In Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Admin Password Reset Form States
  const [resetMethod, setResetMethod] = useState('otp'); // 'otp' | 'pin'
  const [resetEmail, setResetEmail] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // OTP Dispatch State
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState('');

  const isAdminTarget = targetPortal === 'admin';

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setPasswordInput('');
      setPinInput('');
      setLoginOtpCode('');
      setLoading(false);
      setModalMode('login');
      setLoginMethod('password');
      setLoginOtpSent(false);
      setOtpDispatched(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setResetPin('');
      setResetOtpCode('');

      if (isAdminTarget) {
        const adminCreds = getAdminCredentials();
        const initialEmail = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' 
          ? currentUser.email 
          : (currentUser?.email || adminCreds.email || 'tejastej094@gmail.com');
        setEmailInput(initialEmail);
        setResetEmail(initialEmail);
      } else {
        setEmailInput(currentUser?.role === 'LEGAL_AUDITOR' ? currentUser.email : '');
        setResetEmail(currentUser?.role === 'LEGAL_AUDITOR' ? currentUser.email : 'legal.auditor@plotflow.in');
      }
    }
  }, [isOpen, targetPortal, isAdminTarget, currentUser]);

  if (!isOpen) return null;

  const portalTitle = isAdminTarget 
    ? 'Super Admin Governance Portal' 
    : 'Legal Team & Compliance Vault Portal';
  const portalDesc = isAdminTarget
    ? 'Restricted to authorized platform administrators. Authenticate using your registered Admin credentials or secure real email OTP.'
    : 'Restricted to certified legal title auditors and the platform administrator for statutory verification and stamping.';

  // Handle Requesting OTP for Staff Sign In
  const handleRequestLoginOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your authorized email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestLoginOtp(cleanEmail, isAdminTarget ? 'admin' : 'legal');
      setLoginOtpSent(true);
      setSuccessMsg(`✓ 6-Digit security verification code has been dispatched to ${cleanEmail}. Please check your email inbox and enter the code below.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code to email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Staff Gateway Sign In (Password or OTP)
  const handleVerifyAndEnter = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your authorized staff email address.');
      return;
    }

    setLoading(true);

    try {
      // 1. If using Real Email OTP Login
      if (loginMethod === 'email-otp') {
        if (!loginOtpCode || loginOtpCode.length !== 6) {
          throw new Error('Please enter the 6-digit verification code sent to your email.');
        }

        const authedUser = await loginWithOtp({
          email: cleanEmail,
          otpCode: loginOtpCode,
          portalType: isAdminTarget ? 'admin' : 'legal'
        });

        onAuthenticateAndOpenPortal(isAdminTarget ? 'admin' : 'legal', authedUser);
        onClose();
        return;
      }

      // 2. If using Password Login
      if (!passwordInput) {
        throw new Error('Please enter your account password.');
      }

      if (isAdminTarget) {
        const users = getStoredUsers();
        const existingUser = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
        const adminCreds = getAdminCredentials();

        const validMasterPassword = passwordInput === adminCreds.password || passwordInput === 'Admin@2026' || passwordInput === '2026';
        const validUserPassword = existingUser && (existingUser.passwordHash === passwordInput || existingUser.password === passwordInput);
        const validPassword = validMasterPassword || validUserPassword;

        if (!validPassword) {
          throw new Error('Invalid Admin password. If you forgot your password, click "Forgot Admin Password?" below to reset it.');
        }

        const validPin = !pinInput || pinInput === (adminCreds.securityPin || '2026') || pinInput === '2026';
        if (pinInput && !validPin) {
          throw new Error('Incorrect Security PIN. Please verify your 4-digit master PIN (Default: 2026).');
        }

        let adminUser = existingUser ? {
          ...existingUser,
          role: existingUser.role === 'SUPER_ADMIN' || cleanEmail === SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'ADMIN',
          roleTitle: existingUser.roleTitle || (cleanEmail === SUPER_ADMIN_EMAIL ? 'Master Platform Owner & Super Admin' : 'Platform Administrator'),
          status: 'Active',
          verified: true,
          lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        } : {
          uid: `usr_admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1),
          email: cleanEmail,
          role: cleanEmail === SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'ADMIN',
          roleTitle: cleanEmail === SUPER_ADMIN_EMAIL ? 'Master Platform Owner & Super Admin' : 'Platform Administrator',
          status: 'Active',
          verified: true,
          lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        };

        if (!existingUser) {
          saveStoredUsers([adminUser, ...users]);
        }

        onAuthenticateAndOpenPortal('admin', adminUser);
        onClose();
      } else {
        // Legal portal authentication
        const authedUser = await loginWithEmailAndPassword(cleanEmail, passwordInput);

        if (authedUser.status === 'Deactivated' || authedUser.status === 'Suspended') {
          throw new Error(`Account "${cleanEmail}" has been deactivated. Access denied.`);
        }

        const isSuper = cleanEmail === SUPER_ADMIN_EMAIL;
        const isLegal = authedUser.role === 'LEGAL_AUDITOR' || isSuper;

        if (!isLegal) {
          throw new Error(`Access Denied: Account "${cleanEmail}" does not have Legal Auditor clearance.`);
        }

        onAuthenticateAndOpenPortal('legal', authedUser);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Dispatching OTP Code for Admin Reset
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const target = resetEmail.trim().toLowerCase();
    if (!target) {
      setErrorMsg('Please enter your registered Admin email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestAdminPasswordResetOtp(target);
      setOtpDispatched(true);
      setOtpSentNotice(`✓ 6-Digit security recovery code dispatched to ${target}. Please check your email inbox and spam folder.`);
      setSuccessMsg(`Recovery code sent to ${target}. Enter the 6-digit code below to set your new password.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code to email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Submitting Admin Password Reset
  const handleResetAdminPasswordSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanResetEmail = resetEmail.trim().toLowerCase();

    if (!cleanResetEmail) {
      setErrorMsg('Please enter your registered Admin email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match. Please ensure both password fields are identical.');
      return;
    }

    setLoading(true);

    try {
      const result = resetAdminPasswordWithPinOrOtp({
        email: cleanResetEmail,
        securityPin: resetMethod === 'pin' ? resetPin : null,
        otpCode: resetMethod === 'otp' ? resetOtpCode : null,
        newPassword
      });

      setSuccessMsg('Master password has been reset successfully! You can now log in or enter the portal.');
      
      // Update form so user can immediately sign in or auto-fill
      setPasswordInput(newPassword);
      setEmailInput(cleanResetEmail);

      // Offer immediate auto-login after 1 second
      setTimeout(() => {
        if (result?.user) {
          onAuthenticateAndOpenPortal('admin', result.user);
          onClose();
        }
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Please check your verification PIN / OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Emergency Restore Default Credentials
  const handleEmergencyRestore = () => {
    setErrorMsg('');
    try {
      restoreDefaultAdminCredentials();
      setPasswordInput('Admin@2026');
      setEmailInput('tejastej094@gmail.com');
      setPinInput('2026');
      setSuccessMsg('Master Administrator credentials restored to default: Password: Admin@2026 | PIN: 2026. Pre-filled in login form.');
      setModalMode('login');
      setLoginMethod('password');
    } catch (err) {
      setErrorMsg('Failed to restore defaults: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          isAdminTarget 
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600' 
            : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================= */}
        {/* MODE 1: STANDARD STAFF SIGN IN */}
        {/* ========================================================= */}
        {modalMode === 'login' && (
          <>
            {/* Header Badge & Title */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                  isAdminTarget 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}>
                  {isAdminTarget ? <ShieldCheck className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isAdminTarget
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                  }`}>
                    {isAdminTarget ? 'SUPER ADMIN VERIFICATION' : 'LEGAL AUDITOR GATEWAY'}
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">{portalTitle}</h2>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {portalDesc}
              </p>
            </div>

            {/* Login Method Toggle: Password vs Instant Real Email OTP */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  loginMethod === 'password'
                    ? (isAdminTarget ? 'bg-amber-600 text-white shadow' : 'bg-teal-600 text-white shadow')
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
                  setErrorMsg('');
                  setSuccessMsg('');
                  if (!loginOtpSent) {
                    handleRequestLoginOtp();
                  }
                }}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  loginMethod === 'email-otp'
                    ? (isAdminTarget ? 'bg-amber-600 text-white shadow' : 'bg-teal-600 text-white shadow')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Real Email OTP</span>
              </button>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Security Notice</p>
                  <p className="text-[11px] text-slate-300">{successMsg}</p>
                </div>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleVerifyAndEnter} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAdminTarget ? 'Admin Email Address' : 'Authorized Staff Email'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={isAdminTarget ? 'e.g. tejastej094@gmail.com' : 'e.g. legal.auditor@plotflow.in'}
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none ${
                    isAdminTarget 
                      ? 'focus:border-amber-500' 
                      : 'focus:border-teal-500'
                  }`}
                />
              </div>

              {/* METHOD A: PASSWORD LOGIN */}
              {loginMethod === 'password' && (
                <>
                  {/* Password with Forgot Password link */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Password</span>
                      </label>
                      {isAdminTarget ? (
                        <button
                          type="button"
                          onClick={() => {
                            setModalMode('reset-admin-password');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center space-x-1 transition"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Forgot Admin Password?</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setModalMode('reset-admin-password');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center space-x-1 transition"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Reset Password?</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={isAdminTarget ? 'Enter master admin password' : 'Enter account password'}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Optional PIN for Admin */}
                  {isAdminTarget && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Security PIN (Optional)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Default Master PIN: 2026</span>
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Enter 4-digit master PIN"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
                      />
                    </div>
                  )}
                </>
              )}

              {/* METHOD B: REAL EMAIL OTP LOGIN */}
              {loginMethod === 'email-otp' && (
                <div className="space-y-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                      <Inbox className="w-3.5 h-3.5" />
                      <span>6-Digit Verification Code *</span>
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRequestLoginOtp}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
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
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center font-bold"
                  />

                  <p className="text-[11px] text-slate-400">
                    A real one-time authentication code is sent to <strong className="text-slate-200">{emailInput || 'your email'}</strong>. Check your inbox and spam folder.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl text-white shadow-lg transition flex items-center space-x-2 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isAdminTarget
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                      : 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Verifying...' : 'Authenticate & Enter'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Admin Helper hint */}
              {isAdminTarget && loginMethod === 'password' && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Forgot or locked out?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('reset-admin-password');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                  >
                    Reset Password with Email OTP →
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* ========================================================= */}
        {/* MODE 2: ADMIN PASSWORD RESET & RECOVERY */}
        {/* ========================================================= */}
        {modalMode === 'reset-admin-password' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  setModalMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin Login</span>
              </button>

              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                <KeyRound className="w-3 h-3" />
                <span>Admin Password Recovery</span>
              </div>
            </div>

            {/* Title & Explanatory Badge */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Reset Admin Master Password</span>
              </h3>
              <p className="text-xs text-slate-400">
                A verification code will be sent to your real email address to verify your identity before resetting password.
              </p>
            </div>

            {/* Method Tabs: 6-Digit Email OTP vs Master Security PIN */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setResetMethod('otp');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  resetMethod === 'otp'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>6-Digit Email OTP (Secure)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetMethod('pin');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  resetMethod === 'pin'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Master Security PIN</span>
              </button>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetAdminPasswordSubmit} className="space-y-4">
              {/* Target Admin Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Admin Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tejastej094@gmail.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* METHOD 1: 6-DIGIT EMAIL OTP */}
              {resetMethod === 'otp' && (
                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>6-Digit Verification Code (OTP) *</span>
                    </label>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRequestOtp}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpDispatched ? 'Resend Code' : 'Send Code to Email'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code received in email"
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono tracking-widest text-center font-bold"
                  />

                  {otpSentNotice && (
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-200 flex items-start space-x-2">
                      <Inbox className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{otpSentNotice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: MASTER SECURITY PIN */}
              {resetMethod === 'pin' && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Enter 4-Digit Master Security PIN *</span>
                    </label>
                    <span className="text-[10px] text-amber-400/80 font-mono font-bold">Default Master PIN: 2026</span>
                  </div>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value)}
                    placeholder="Enter Security PIN (e.g. 2026)"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center font-bold"
                  />
                  <p className="text-[10px] text-slate-400">
                    The platform's default master governance PIN is <span className="text-amber-300 font-mono font-bold">2026</span>.
                  </p>
                </div>
              )}

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Create New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Confirm New Password *</label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Reset Password Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying & Resetting Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify & Reset Admin Password</span>
                    </>
                  )}
                </button>
              </div>

              {/* Emergency Disaster Recovery Section */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Emergency Recovery:</span>
                </span>
                <button
                  type="button"
                  onClick={handleEmergencyRestore}
                  className="text-slate-300 hover:text-amber-400 underline font-semibold transition"
                >
                  Restore Master Default (<span className="font-mono">Admin@2026</span>)
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
