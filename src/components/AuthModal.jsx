import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';
import { auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from '../services/firebase';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  const [authMode, setAuthMode] = useState('buyer'); // 'buyer' | 'developer' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = (roleKey) => {
    setError('');
    const user = DEMO_USERS[roleKey];
    if (onLoginSuccess) onLoginSuccess(user);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        // In web preview / sandbox fallback or live firebase
        try {
          const result = await signInWithPopup(auth, provider);
          const fbUser = result.user;
          const userPayload = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email,
            role: fbUser.email === 'tejastej094@gmail.com' ? 'SUPER_ADMIN' : authMode === 'developer' ? 'DEVELOPER' : 'BUYER',
            roleTitle: fbUser.email === 'tejastej094@gmail.com' ? 'Master Platform Owner & Super Admin' : 'Verified Google Account',
            authProvider: 'firebase.google',
            verified: true
          };
          if (onLoginSuccess) onLoginSuccess(userPayload);
          onClose();
          return;
        } catch (popupErr) {
          console.warn("Google popup fallback:", popupErr);
        }
      }
      // Graceful fallback to verified user matching role
      if (authMode === 'admin') {
        onLoginSuccess(DEMO_USERS.superAdmin);
      } else if (authMode === 'developer') {
        onLoginSuccess(DEMO_USERS.developer);
      } else {
        onLoginSuccess(DEMO_USERS.buyer);
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Google authentication error. Using demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'admin') {
      if (pin === '2026' || email === DEMO_USERS.superAdmin.email) {
        onLoginSuccess(DEMO_USERS.superAdmin);
        onClose();
      } else {
        setError('Invalid Super Admin Security PIN. (Demo PIN is 2026)');
      }
    } else if (authMode === 'developer') {
      onLoginSuccess({
        ...DEMO_USERS.developer,
        email: email || DEMO_USERS.developer.email
      });
      onClose();
    } else {
      onLoginSuccess({
        ...DEMO_USERS.buyer,
        email: email || DEMO_USERS.buyer.email
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              authMode === 'admin' 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                : authMode === 'developer'
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">PlotFlow Identity Access</h3>
              <p className="text-xs text-slate-400">Firebase Auth & Role-Based Access</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/30 text-xs font-bold text-center">
          <button
            onClick={() => { setAuthMode('buyer'); setError(''); }}
            className={`py-3 transition border-b-2 ${
              authMode === 'buyer' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Buyer Portal
          </button>
          <button
            onClick={() => { setAuthMode('developer'); setError(''); }}
            className={`py-3 transition border-b-2 ${
              authMode === 'developer' 
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Builder SaaS
          </button>
          <button
            onClick={() => { setAuthMode('admin'); setError(''); }}
            className={`py-3 transition border-b-2 ${
              authMode === 'admin' 
                ? 'border-amber-400 text-amber-400 bg-amber-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Firebase Google One-Tap / Social Auth */}
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
            <span>Continue with Firebase Google Auth</span>
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-950 px-2 text-slate-500 font-bold">Or 1-Tap Instant Roles</span>
            </div>
          </div>

          {/* 1-Tap Instant Demo Login Buttons */}
          <div className="space-y-2">
            {authMode === 'buyer' && (
              <button
                type="button"
                onClick={() => handleQuickLogin('buyer')}
                className="w-full p-3 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Log in as Vikramaditya (Buyer)</span>
                    <span className="text-[10px] text-slate-400">vikram.sharma@techcorp.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
              </button>
            )}

            {authMode === 'developer' && (
              <button
                type="button"
                onClick={() => handleQuickLogin('developer')}
                className="w-full p-3 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/40 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Log in as Prestige Builder</span>
                    <span className="text-[10px] text-slate-400">rohit@prestigeplotted.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
              </button>
            )}

            {authMode === 'admin' && (
              <button
                type="button"
                onClick={() => handleQuickLogin('superAdmin')}
                className="w-full p-3 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/40 rounded-xl text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Log in as Tejas (Super Admin)</span>
                    <span className="text-[10px] text-amber-300 font-mono">tejastej094@gmail.com (PIN: 2026)</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
              </button>
            )}
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-950 px-2 text-slate-500 font-bold">Or Email / PIN</span>
            </div>
          </div>

          {/* Standard Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {authMode === 'admin' ? (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Super Admin Security PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter Security PIN (Demo: 2026)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-lg transition mt-2 ${
                authMode === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                  : authMode === 'developer'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
              }`}
            >
              Sign In to {authMode === 'admin' ? 'Master Admin' : authMode === 'developer' ? 'Builder SaaS' : 'Buyer Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
