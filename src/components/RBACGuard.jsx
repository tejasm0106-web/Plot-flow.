import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  Scale, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertOctagon,
  LogIn
} from 'lucide-react';
import { 
  ROLES, 
  ROLE_LABELS, 
  getUserRole, 
  evaluateAccess, 
  isAccountActive,
  SUPER_ADMIN_EMAIL
} from '../services/rbacService';

export default function RBACGuard({
  user,
  targetPortal,
  targetView,
  children,
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

  const isAdminPortal = targetPortal === 'admin';

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
                Security Policy Enforcement
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Access Denied (403 Forbidden)
              </h2>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold font-mono">
            RBAC Protected
          </span>
        </div>

        {/* Diagnostic Alert Box */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 space-y-2 relative z-10">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            <span>
              {isAdminPortal
                ? 'Super Admin Privileges Required'
                : evaluation.reason === 'DEACTIVATED'
                ? 'Account Deactivated'
                : 'Insufficient Role Authorization'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAdminPortal
              ? `The Master Admin portal is strictly restricted to the verified platform administrator (${SUPER_ADMIN_EMAIL}). Anonymous visitors and non-admin users cannot access this panel.`
              : evaluation.message}
          </p>
        </div>

        {/* Identity vs Required Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 text-xs">
          {/* Current Identity */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Session
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'G'}
              </div>
              <div className="truncate">
                <span className="font-bold text-white block truncate">{user?.name || 'Guest / Public Visitor'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'Unauthenticated'}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                user?.status === 'Deactivated' 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span>Role: {user?.role || (user ? currentRole.toUpperCase() : 'PUBLIC_GUEST')}</span>
                {user?.status === 'Deactivated' && <span>(Deactivated)</span>}
              </span>
            </div>
          </div>

          {/* Target Portal & Required Role */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Authorized Requirement
            </span>
            <div className="text-white font-bold truncate">
              {portalName}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{isAdminPortal ? `Owner: ${SUPER_ADMIN_EMAIL}` : ROLE_LABELS[targetPortal] || 'Authorized Role'}</span>
              </span>
            </div>
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
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Authenticate as Authorized User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
