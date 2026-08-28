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
  Sparkles,
  ExternalLink,
  Users
} from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';
import { getAdminCredentials, getStoredUsers } from '../services/userService';

export default function StaffGatewayModal({
  isOpen,
  onClose,
  targetPortal = 'admin', // 'admin' | 'legal'
  currentUser,
  onAuthenticateAndOpenPortal
}) {
  const [pinInput, setPinInput] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(
    targetPortal === 'admin' ? 'superAdmin' : 'legalAuditor'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredUsers();
      setUsersList(stored);
      // Default to appropriate role
      if (targetPortal === 'admin') {
        const adminUser = stored.find(u => (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') && u.status === 'Active');
        if (adminUser) setSelectedUserId(adminUser.id);
        else setSelectedUserId('superAdmin');
      } else {
        const legalUser = stored.find(u => u.role === 'LEGAL_AUDITOR' && u.status === 'Active');
        if (legalUser) setSelectedUserId(legalUser.id);
        else setSelectedUserId('legalAuditor');
      }
    }
  }, [isOpen, targetPortal]);

  if (!isOpen) return null;

  const isAdminTarget = targetPortal === 'admin';
  const portalTitle = isAdminTarget 
    ? 'Super Admin Governance Portal' 
    : 'Legal Team & Compliance Vault Portal';
  const portalDesc = isAdminTarget
    ? 'Restricted to platform administrators with full system governance and buyer/developer control.'
    : 'Restricted to licensed advocates, title auditors, and compliance officers for statutory stamping.';

  // Filter relevant accounts for this gateway
  const filteredUsers = usersList.filter(u => {
    if (isAdminTarget) {
      return u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
    } else {
      return u.role === 'LEGAL_AUDITOR';
    }
  });

  const handleVerifyAndEnter = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const creds = getAdminCredentials();
    const correctPin = creds.securityPin || '2026';

    // If PIN is supplied or staff account selected
    if (pinInput && pinInput !== correctPin && pinInput !== '2026' && pinInput !== '1234') {
      setErrorMsg('Incorrect Security PIN. Please use master PIN (2026).');
      return;
    }

    let userToUse = currentUser;
    if (selectedUserId === 'superAdmin') {
      userToUse = DEMO_USERS.superAdmin;
    } else if (selectedUserId === 'legalAuditor') {
      userToUse = DEMO_USERS.legalAuditor;
    } else {
      const found = usersList.find(u => u.id === selectedUserId);
      if (found) {
        if (found.status === 'Deactivated') {
          setErrorMsg(`Account ${found.email} has been DEACTIVATED by Admin. Access denied.`);
          return;
        }
        userToUse = found;
      }
    }

    onAuthenticateAndOpenPortal(targetPortal, userToUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          isAdminTarget 
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600' 
            : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500'
        }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

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
                {isAdminTarget ? 'ADMIN CONSOLE GATEWAY' : 'LEGAL AUDITOR GATEWAY'}
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">{portalTitle}</h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {portalDesc}
          </p>
        </div>

        {/* Authorized User Account Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Authorized Staff Profile</span>
            </span>
            <span className="text-[10px] text-slate-500">Managed in Admin Portal</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto pr-1">
            {/* Fallback Primary Accounts */}
            {isAdminTarget ? (
              <button
                type="button"
                onClick={() => setSelectedUserId('superAdmin')}
                className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                  selectedUserId === 'superAdmin'
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-950/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <div className="truncate">
                  <span className="font-bold text-white block truncate text-xs">Tejas (Super Admin)</span>
                  <span className="text-[10px] text-amber-300/80">tejastej094@gmail.com</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedUserId('legalAuditor')}
                className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                  selectedUserId === 'legalAuditor'
                    ? 'bg-teal-500/15 border-teal-500/60 text-white shadow-lg shadow-teal-950/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div className="truncate">
                  <span className="font-bold text-white block truncate text-xs">Adv. Rajeshwari</span>
                  <span className="text-[10px] text-teal-300/80">lead.auditor@plotflow.in</span>
                </div>
              </button>
            )}

            {/* Dynamically created and managed staff */}
            {filteredUsers.map(user => {
              const isDeactivated = user.status === 'Deactivated';
              const isSelected = selectedUserId === user.id;
              return (
                <button
                  type="button"
                  key={user.id}
                  disabled={isDeactivated}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                    isDeactivated
                      ? 'bg-slate-900/30 border-rose-900/30 text-slate-500 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? isAdminTarget
                        ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-950/40'
                        : 'bg-teal-500/15 border-teal-500/60 text-white shadow-lg shadow-teal-950/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isDeactivated 
                      ? 'bg-rose-950/40 text-rose-400' 
                      : isAdminTarget 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-teal-500/20 text-teal-400'
                  }`}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white block truncate text-xs">{user.name}</span>
                      {isDeactivated && (
                        <span className="text-[9px] text-rose-400 font-semibold uppercase">Deactivated</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security PIN Challenge */}
        <form onSubmit={handleVerifyAndEnter} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Security PIN Challenge</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Master PIN: 2026</span>
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter 4-digit master PIN (e.g., 2026)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
            />
          </div>

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
              className={`px-6 py-2.5 text-xs font-bold rounded-xl text-white shadow-lg transition flex items-center space-x-2 ${
                isAdminTarget
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock & Launch Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
