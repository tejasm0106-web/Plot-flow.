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
  LogOut
} from 'lucide-react';

export default function UserProfileView({ 
  currentUser, 
  onLogout,
  onSwitchUser,
  townships = [],
  shortlistedTownships = [],
  onToggleShortlist,
  onViewTownship,
  onLaunch3D
}) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'inquiries' | 'account' | 'roles'

  // Filter shortlisted townships
  const savedList = townships.filter(t => shortlistedTownships.includes(t.id));

  // Available test accounts for rapid switching
  const testAccounts = [
    {
      name: 'Tejas',
      email: 'tejastej094@gmail.com',
      role: 'SUPER_ADMIN',
      roleTitle: 'Master Platform Owner & Super Admin',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      name: 'Advocate Rajeshwari Iyer',
      email: 'legal.auditor@plotflow.in',
      role: 'LEGAL_AUDITOR',
      roleTitle: 'Senior Legal & Title Due Diligence Auditor',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    },
    {
      name: 'Rohit Kulkarni',
      email: 'rohit@prestigeplotted.com',
      role: 'DEVELOPER',
      roleTitle: 'VP of Plotted Land Sales (Builder SaaS)',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      name: 'Vikramaditya Sharma',
      email: 'vikram.sharma@techcorp.com',
      role: 'BUYER',
      roleTitle: 'Verified Retail Plot Buyer',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  ];

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
                  currentUser?.role === 'SUPER_ADMIN' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : currentUser?.role === 'LEGAL_AUDITOR'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : currentUser?.role === 'DEVELOPER'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {currentUser?.roleTitle || currentUser?.role || 'Verified User'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
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
          onClick={() => setActiveTab('roles')}
          className={`pb-3 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'roles' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Role Switcher (Investor Demo)</span>
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

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Switch Test Role for Platform Demonstration</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select any user persona below to experience PlotFlow from their perspective (Super Admin CMS, Builder SaaS, Legal Title Auditor, or Retail Buyer).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {testAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  onClick={() => onSwitchUser(acc)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    currentUser?.email === acc.email
                      ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{acc.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-400">{acc.roleTitle}</span>
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span>{currentUser?.email === acc.email ? 'Active' : 'Switch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
