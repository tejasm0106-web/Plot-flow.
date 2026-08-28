import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Layers, 
  Car, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Key, 
  Building2, 
  Trash2,
  Eye,
  LogOut,
  Mail,
  Phone,
  ShieldAlert
} from 'lucide-react';
import { SUPER_ADMIN_EMAIL, isSuperAdmin } from '../services/rbacService';

export default function UserProfileView({ 
  currentUser, 
  onLogout,
  townships = [],
  shortlistedTownships = [],
  onToggleShortlist,
  onViewTownship,
  onLaunch3D,
  onOpenAdminPortal,
  onOpenLegalPortal
}) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'inquiries' | 'account'

  // Filter shortlisted townships
  const savedList = townships.filter(t => shortlistedTownships.includes(t.id));

  const isUserSuperAdmin = isSuperAdmin(currentUser);
  const isUserLegalAuditor = currentUser?.role === 'LEGAL_AUDITOR' || isUserSuperAdmin;

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {currentUser?.name ? currentUser.name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">{currentUser?.name || 'User Profile'}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isUserSuperAdmin 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : currentUser?.role === 'LEGAL_AUDITOR'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : currentUser?.role === 'DEVELOPER'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isUserSuperAdmin ? 'Master Super Admin' : currentUser?.roleTitle || currentUser?.role || 'Verified User'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isUserSuperAdmin && onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Launch Master Admin Portal</span>
              </button>
            )}

            {currentUser?.role === 'LEGAL_AUDITOR' && onOpenLegalPortal && (
              <button
                onClick={onOpenLegalPortal}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <Scale className="w-4 h-4" />
                <span>Launch Legal Audit Portal</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'saved' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Townships ({savedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'inquiries' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Inquiries & Tokens</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'account' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedList.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Saved Townships Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the marketplace and click the bookmark icon on any plotted township to save it for side-by-side comparison.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedList.map(ts => (
                <div key={ts.id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="relative h-44">
                    <img src={ts.image} alt={ts.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onToggleShortlist(ts.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-rose-400 hover:bg-slate-900 transition"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      ₹{ts.pricePerSqFt}/sq.ft
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{ts.developer}</span>
                      <h3 className="text-base font-bold text-white">{ts.name}</h3>
                      <p className="text-xs text-slate-400">{ts.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">Available Plots</span>
                        <span className="font-bold text-emerald-400">{ts.availablePlots} / {ts.totalPlots}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">RERA Status</span>
                        <span className="font-bold text-slate-200">Sanctioned</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => onViewTownship(ts)}
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => onLaunch3D(ts)}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D Twin</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Your Scheduled Site Visits & Inquiries</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Prestige Sanctuary Greens — Plot 101</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Site Visit Scheduled
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Complimentary Cab Visit: Saturday, 11:00 AM • Chauffeur will arrive at registered address</p>
                </div>
                <span className="text-xs font-semibold text-slate-300">Concierge Assigned: Suresh K.</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">5-Layer Title Due Diligence Request</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                      Dossier Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">42-Point Title Search verified against Kaveri-2 sub-registrar records.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">Verified Clear Title</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Account Security & RBAC Profile</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your role credentials and access clearances are stored securely and synchronized with Firestore.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Full Name</span>
                <p className="font-bold text-white">{currentUser?.name || 'Platform User'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Email</span>
                <p className="font-mono text-slate-300">{currentUser?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Platform Role</span>
                <p className="font-bold text-emerald-400">{currentUser?.roleTitle || currentUser?.role}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Account Clearance</span>
                <p className="font-bold text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUserSuperAdmin ? 'Full Master Privileges' : isUserLegalAuditor ? 'Legal Audit Level' : 'Standard Marketplace'}</span>
                </p>
              </div>
            </div>

            {isUserSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Platform Super Administrator</span>
                </div>
                <p className="text-slate-300">
                  This account has exclusive, authoritative Super Admin access to the Master Governance Center, Builder SaaS, and Legal Audit Vault.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
