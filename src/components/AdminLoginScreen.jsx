import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  Scale, 
  UserCheck,
  Compass,
  Zap,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { 
  getAdminCredentials, 
  loginWithEmailAndPassword,
  requestLoginOtp,
  loginWithOtp,
  getStoredUsers,
  MASTER_ADMIN_PHONE
} from '../services/userService';
import { SUPER_ADMIN_EMAIL } from '../services/rbacService';

export default function AdminLoginScreen({ onLoginSuccess, onReturnToMarketplace }) {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [emailInput, setEmailInput] = useState(SUPER_ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Quick Executive Role Profiles
  const executiveProfiles = [
    {
      name: 'Tejas (Master Super Admin)',
      email: SUPER_ADMIN_EMAIL,
      role: 'SUPER_ADMIN',
      roleTitle: 'Master Platform Super Administrator',
      department: 'Executive Governance',
      badge: 'Full Root Access',
      avatarLetter: 'T',
      color: 'amber'
    },
    {
      name: 'Alex Morgan (AI Co-Founder)',
      email: 'alex.cofounder@plotflow.in',
      role: 'SUPER_ADMIN',
      roleTitle: 'AI Co-Founder & Executive Proxy',
      department: 'Executive Strategy & Operations',
      badge: 'Autonomous AI Operator',
      avatarLetter: 'A',
      color: 'indigo'
    },
    {
      name: 'Advocate Rajeshwari Iyer',
      email: 'legal.auditor@plotflow.in',
      role: 'LEGAL_AUDITOR',
      roleTitle: 'Chief Title & Statutory Auditor',
      department: 'Legal Compliance',
      badge: 'Kaveri-2 Certified',
      avatarLetter: 'R',
      color: 'teal'
    }
  ];

  const handleQuickLogin = (profile) => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const userSession = {
        uid: `exec_${Date.now()}`,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        roleTitle: profile.roleTitle,
        department: profile.department,
        status: 'ACTIVE',
        badge: profile.badge,
        loginAt: new Date().toISOString()
      };
      sessionStorage.setItem('plotflow_active_user', JSON.stringify(userSession));
      onLoginSuccess(userSession);
      setLoading(false);
    }, 400);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your authorized admin email.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithEmailAndPassword(cleanEmail, passwordInput, 'admin');
      sessionStorage.setItem('plotflow_active_user', JSON.stringify(user));
      setSuccessMsg('✓ Authentication verified. Opening Enterprise Admin Console...');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }

    setLoading(true);
    try {
      await requestLoginOtp(cleanEmail, 'admin');
      setOtpSent(true);
      setSuccessMsg(`✓ 6-Digit security OTP dispatched to ${cleanEmail}. Check your inbox / SMS.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch security OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the valid 6-digit security OTP.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithOtp(cleanEmail, cleanOtp, 'admin');
      sessionStorage.setItem('plotflow_active_user', JSON.stringify(user));
      setSuccessMsg('✓ OTP verified. Launching Admin Web...');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-950/50">
            PF
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight">PlotFlow Admin Web</span>
            <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              GOVERNANCE AUTHENTICATION
            </span>
          </div>
        </div>

        <button
          onClick={onReturnToMarketplace}
          className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          <span>Return to Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Title */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xl mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enterprise Admin Authentication
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Secure gateway for Platform Super Admins, AI Co-Founder Operations, Inventory Governance & Legal Audit Vault.
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Auth Method Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold relative z-10">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'password'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                loginMethod === 'otp'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>OTP Security Code</span>
            </button>
          </div>

          {/* Form: Password Login */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="tejastej094@gmail.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password (e.g., PlotFlowAdmin@2026)"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs tracking-wide shadow-lg shadow-amber-950/60 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Authenticate & Access Admin Web</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: OTP Login */}
          {loginMethod === 'otp' && (
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Registered Admin Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="tejastej094@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition whitespace-nowrap"
                  >
                    {otpSent ? 'Resend OTP' : 'Send Code'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleOtpLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      className="w-full text-center tracking-widest text-lg font-mono font-black bg-slate-950 border border-amber-500/50 rounded-xl py-2.5 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs tracking-wide shadow-lg shadow-amber-950/60 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <span>Verifying OTP...</span> : <span>Verify & Open Admin Console</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick 1-Click Executive Access Profiles */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Executive Fast-Track Access</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Auth</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {executiveProfiles.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-left transition group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[11px] group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      {p.avatarLetter}
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-[11px] font-bold text-white block truncate leading-tight">
                        {p.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate">
                        {p.badge}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        PlotFlow Enterprise RBAC Security Engine • Master Administrator & AI Multi-Agent Workforce Portal
      </footer>
    </div>
  );
}
