import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  Scale, 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  Database,
  CheckCircle2,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { 
  ROLES, 
  ROLE_LABELS, 
  getUserRole, 
  evaluateAccess, 
  isAccountActive 
} from '../services/rbacService';
import { DEMO_USERS } from '../data/mockData';

export default function RBACGuard({
  user,
  targetPortal,
  targetView,
  children,
  onSwitchUser,
  onOpenStaffGateway,
  onReturnHome
}) {
  const evaluation = evaluateAccess(user, targetPortal || targetView);

  // If authorized, render the protected children directly
  if (evaluation.allowed) {
    return <>{children}</>;
  }

  const currentRole = getUserRole(user);
  const portalName = targetPortal === 'admin' 
    ? 'Master Governance & Admin Console' 
    : targetPortal === 'legal'
    ? 'Legal & Compliance Audit Vault'
    : targetPortal === 'developer'
    ? 'Developer & Builder SaaS Portal'
    : 'Protected Resource';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon & Status */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block font-mono">
                RBAC Security Enforcement
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Access Restricted (403 Forbidden)
              </h2>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold font-mono">
            Firestore Rule Gate
          </span>
        </div>

        {/* Diagnostic Alert Box */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 space-y-2 relative z-10">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span>{evaluation.reason === 'DEACTIVATED' ? 'Account Deactivated' : 'Insufficient Role Privileges'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {evaluation.message}
          </p>
        </div>

        {/* Comparison Matrix: Current Role vs Required Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 text-xs">
          {/* Current Identity */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Identity & Role
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <span className="font-bold text-white block truncate">{user?.name || 'Unauthenticated'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'Guest'}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                user?.status === 'Deactivated' 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span>Role: {user?.role || currentRole.toUpperCase()}</span>
                {user?.status === 'Deactivated' && <span>(Deactivated)</span>}
              </span>
            </div>
          </div>

          {/* Target Portal & Required Roles */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Required Authorized Roles
            </span>
            <div className="text-white font-bold truncate">
              {portalName}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(evaluation.requiredRoles || [ROLES.ADMIN]).map((reqRole) => (
                <span 
                  key={reqRole}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{ROLE_LABELS[reqRole] || reqRole}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Testing Role Switchers (for evaluation) */}
        <div className="space-y-2 pt-1 relative z-10">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Quick Authenticate as Authorized Staff</span>
            <span className="text-[10px] text-slate-500">Firestore RBAC Testing</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onSwitchUser && onSwitchUser(DEMO_USERS.superAdmin)}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition flex items-center space-x-2 text-left"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-xs text-white">Switch to Super Admin</span>
                <span className="text-[10px] text-amber-400/80">Tejas (Master Admin)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSwitchUser && onSwitchUser(DEMO_USERS.legalAuditor)}
              className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold transition flex items-center space-x-2 text-left"
            >
              <Scale className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-xs text-white">Switch to Legal Auditor</span>
                <span className="text-[10px] text-teal-400/80">Adv. Rajeshwari</span>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={onReturnHome}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenStaffGateway && onOpenStaffGateway(targetPortal || 'admin')}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Staff Portal Gateway Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
