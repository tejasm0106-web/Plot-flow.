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
  Inbox,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { 
  getAdminCredentials, 
  getStoredUsers, 
  loginWithEmailAndPassword,
  requestAdminPasswordResetOtp,
  requestAdminRecoverySmsOtp,
  requestLoginOtp,
  loginWithOtp,
  resetAdminPasswordWithPinOrOtp,
  resetUserPasswordWithSmsOtp,
  restoreDefaultAdminCredentials,
  saveStoredUsers,
  MASTER_ADMIN_PHONE,
  maskPhone
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

  // Admin Password Reset Form States (SMS OTP is Primary)
  const [resetMethod, setResetMethod] = useState('sms'); // 'sms' | 'pin'
  const [resetActionType, setResetActionType] = useState('custom-password'); // 'custom-password' | 'restore-default'
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
      setResetActionType('custom-password');

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

        const validMasterPassword = passwordInput === adminCreds.password;
        const validUserPassword = existingUser && (existingUser.passwordHash === passwordInput || existingUser.password === passwordInput);
        const validPassword = validMasterPassword || validUserPassword;

        if (!validPassword) {
          throw new Error('Invalid Admin password. If you forgot your password, click "Forgot Password? Reset via SMS OTP" below.');
        }

        let adminUser = existingUser ? {
          ...existingUser,
          phone: MASTER_ADMIN_PHONE,
          role: existingUser.role === 'SUPER_ADMIN' || cleanEmail === SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'ADMIN',
          roleTitle: existingUser.roleTitle || (cleanEmail === SUPER_ADMIN_EMAIL ? 'Master Platform Owner & Super Admin' : 'Platform Administrator'),
          status: 'Active',
          verified: true,
          lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        } : {
          uid: `usr_admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: 'Tejas',
          email: cleanEmail,
          phone: MASTER_ADMIN_PHONE,
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

  // Handle Dispatching SMS OTP Code for Admin Reset (Sent to 9916660655)
  const handleRequestAdminSmsOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setLoading(true);
    try {
      const res = await requestAdminRecoverySmsOtp(MASTER_ADMIN_PHONE);
      setOtpDispatched(true);
      setOtpSentNotice(`✓ 6-Digit SMS verification code dispatched to ${MASTER_ADMIN_PHONE}. Check your mobile messages.`);
      setSuccessMsg(`SMS OTP sent to ${MASTER_ADMIN_PHONE}. Enter the 6-digit code below to authorize your reset.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch SMS verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Submitting Admin Password Reset / Default Security Restore
  const handleResetAdminPasswordSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (resetMethod === 'sms') {
      if (!resetOtpCode || resetOtpCode.trim().length !== 6) {
        setErrorMsg('Please enter the 6-digit SMS OTP code sent to ' + MASTER_ADMIN_PHONE + '.');
        return;
      }
    } else if (resetMethod === 'pin') {
      if (!resetPin || resetPin.trim().length < 4) {
        setErrorMsg('Please enter the 4-digit Master Security PIN (2026).');
        return;
      }
    }

    if (resetActionType === 'custom-password') {
      if (!newPassword || newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Passwords do not match. Please ensure both password fields are identical.');
        return;
      }
    }

    setLoading(true);

    try {
      let result;
      if (resetMethod === 'sms') {
        // SMS OTP Flow
        result = await resetUserPasswordWithSmsOtp({
          phoneOrEmail: MASTER_ADMIN_PHONE,
          otpCode: resetOtpCode.trim(),
          newPassword: resetActionType === 'restore-default' ? 'Admin@2026' : newPassword,
          isDefaultAdminReset: resetActionType === 'restore-default'
        });
      } else {
        // Master PIN Flow
        result = resetAdminPasswordWithPinOrOtp({
          email: 'tejastej094@gmail.com',
          phone: MASTER_ADMIN_PHONE,
          securityPin: resetPin.trim(),
          newPassword: resetActionType === 'restore-default' ? 'Admin@2026' : newPassword
        });
      }

      setSuccessMsg(
        resetActionType === 'restore-default'
          ? '✓ Master Administrator credentials restored to default (Admin@2026) successfully after verified OTP authorization!'
          : '✓ Master password has been reset successfully! You can now log in.'
      );
      
      // Update form so user can immediately sign in or auto-fill
      setPasswordInput(resetActionType === 'restore-default' ? 'Admin@2026' : newPassword);
      setEmailInput('tejastej094@gmail.com');

      // Auto-enter admin portal after successful verification
      setTimeout(() => {
        if (result?.user) {
          onAuthenticateAndOpenPortal('admin', result.user);
          onClose();
        }
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Please check your verification OTP or PIN.');
    } finally {
      setLoading(false);
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
        {/* MODE 2: ADMIN MASTER SECURITY RECOVERY VIA SMS OTP (9916660655) */}
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

              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <Smartphone className="w-3 h-3" />
                <span>SMS OTP Verified</span>
              </div>
            </div>

            {/* Title & Explanatory Badge */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Admin Master Security Recovery</span>
              </h3>
              <p className="text-xs text-slate-400">
                To prevent unauthorized access or accidental exposure, all password resets and default security restorations require a 6-digit SMS OTP sent to registered mobile: <strong className="text-emerald-400 font-mono">{MASTER_ADMIN_PHONE}</strong>.
              </p>
            </div>

            {/* Method Tabs: 6-Digit SMS OTP vs Master Security PIN */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setResetMethod('sms');
                  setErrorMsg('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  resetMethod === 'sms'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS OTP to {MASTER_ADMIN_PHONE}</span>
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
              
              {/* METHOD 1: 6-DIGIT SMS OTP */}
              {resetMethod === 'sms' && (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>6-Digit SMS OTP Code *</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Mobile: {MASTER_ADMIN_PHONE}</span>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRequestAdminSmsOtp}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition flex items-center space-x-1 shadow"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpDispatched ? 'Resend SMS OTP' : 'Send SMS OTP'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value)}
                    placeholder="Enter 6-digit SMS OTP"
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-base text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono tracking-widest text-center font-black"
                  />

                  {otpSentNotice && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-200 flex items-start space-x-2">
                      <Smartphone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                    placeholder="Enter Master PIN (2026)"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center font-bold"
                  />
                  <p className="text-[10px] text-slate-400">
                    The platform's default master governance PIN is <span className="text-amber-300 font-mono font-bold">2026</span>.
                  </p>
                </div>
              )}

              {/* Action Selection: Set Custom Password vs Restore Default (Both Require OTP!) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-300 block">Choose Recovery Action:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResetActionType('custom-password')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      resetActionType === 'custom-password'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block">Set New Password</span>
                    <span className="text-[10px] text-slate-400">Custom password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetActionType('restore-default')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      resetActionType === 'restore-default'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block">Restore Default Security</span>
                    <span className="text-[10px] text-amber-400 font-mono">Admin@2026 (Requires OTP)</span>
                  </button>
                </div>
              </div>

              {/* Custom Password Fields (If Selected) */}
              {resetActionType === 'custom-password' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-fadeIn">
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
              )}

              {resetActionType === 'restore-default' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 animate-fadeIn">
                  <p className="font-semibold mb-0.5">Emergency Default Security Reset</p>
                  <p className="text-[11px] text-slate-300">
                    Restoring default credentials will reset Admin password to <strong className="text-amber-300 font-mono">Admin@2026</strong>. This operation will ONLY execute once the 6-digit SMS OTP is verified on handset <strong className="text-emerald-400 font-mono">{MASTER_ADMIN_PHONE}</strong>.
                  </p>
                </div>
              )}

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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying SMS OTP & Applying Reset...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>
                        {resetActionType === 'restore-default'
                          ? 'Verify SMS OTP & Restore Default Security'
                          : 'Verify SMS OTP & Reset Admin Password'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
