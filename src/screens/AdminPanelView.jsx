import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Layers, 
  Building2, 
  DollarSign, 
  Power,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';

export default function AdminPanelView({ 
  currentUser, 
  townships, 
  onApproveProject, 
  onRejectProject 
}) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [takeRateFee, setTakeRateFee] = useState(0.75); // 0.75%
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'sub_09',
      townshipName: 'Godrej Palm Meadows Plotted',
      developerName: 'Godrej Properties Land Division',
      location: 'Sarjapur-Attibele Road, Bengaluru',
      totalAcres: '38 Acres (110 Plots)',
      reraNumber: 'PRM/KA/RERA/1251/308/PR/260824/007812',
      status: 'Pending Legal Audit',
      submittedDate: '2026-08-25',
      documentsCount: 5
    },
    {
      id: 'sub_10',
      townshipName: 'Total Environment Windchimes Plots',
      developerName: 'Total Environment Living Pvt Ltd',
      location: 'Kanakapura Road Corridor',
      totalAcres: '25 Acres (65 Luxury Plots)',
      reraNumber: 'PRM/KA/RERA/1251/310/PR/260820/007840',
      status: 'Pending Legal Audit',
      submittedDate: '2026-08-24',
      documentsCount: 6
    }
  ]);

  const handleAction = (subId, action) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== subId));
    alert(`Project ${subId} ${action === 'approve' ? 'Approved & Published Live to 3D Marketplace' : 'Rejected for incomplete RERA compliance'}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Super Admin Top Header */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Super Admin Master Command</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  Tejas (Owner)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authenticated: <strong className="text-amber-300">{currentUser?.email || 'tejastej094@gmail.com'}</strong> • Full Platform Privileges
              </p>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
            <Power className={`w-4 h-4 ${maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <div className="text-xs">
              <span className="text-white font-bold block">Platform Maintenance</span>
              <span className="text-[10px] text-slate-400">{maintenanceMode ? 'Enabled (Restricted)' : 'Active (Normal)'}</span>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ml-2 ${
                maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {maintenanceMode ? 'Turn OFF' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* Platform Financial Ledger Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow">
          <span className="text-xs text-slate-400 block">Total GMV Pipeline</span>
          <span className="text-2xl font-black text-white mt-1 block">₹348.5 Cr</span>
          <span className="text-[10px] text-emerald-400 font-bold">+18.4% this month</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow">
          <span className="text-xs text-slate-400 block">Platform Commission (0.75%)</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">₹2.61 Cr</span>
          <span className="text-[10px] text-slate-500">Realized transaction revenue</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow">
          <span className="text-xs text-slate-400 block">Active Verified Townships</span>
          <span className="text-2xl font-black text-indigo-400 mt-1 block">{townships.length} Enclaves</span>
          <span className="text-[10px] text-slate-500">100% RERA verified</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow">
          <span className="text-xs text-slate-400 block">Pending Developer Audits</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">{pendingApprovals.length} Queue</span>
          <span className="text-[10px] text-slate-400">Awaiting 5-layer sign-off</span>
        </div>
      </div>

      {/* Pending Layout Verification Queue */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Developer Project Approval Queue</h3>
            <p className="text-xs text-slate-400">Validate 30-year EC records, BDA layout sanctions, and K-RERA certificates before publishing live.</p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
            {pendingApprovals.length} Pending Actions
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl text-xs text-slate-400">
            All submitted townships are fully audited and live on the marketplace.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-white">{sub.townshipName}</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Developer: <strong className="text-slate-300">{sub.developerName}</strong> • {sub.location}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Land Size: {sub.totalAcres} • RERA: <span className="font-mono text-slate-400">{sub.reraNumber}</span> • {sub.documentsCount} Legal Docs Attached
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(sub.id, 'approve')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish Live</span>
                  </button>
                  <button
                    onClick={() => handleAction(sub.id, 'reject')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Platform Commission Settings */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white">Platform Transaction Fee Configuration</h3>
        <p className="text-xs text-slate-400">PlotFlow escrow fee charged upon token lock and sale deed registration.</p>
        
        <div className="flex items-center space-x-4 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-300 font-semibold">Base Commission Rate:</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{takeRateFee}%</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="2.5"
            step="0.05"
            value={takeRateFee}
            onChange={(e) => setTakeRateFee(parseFloat(e.target.value))}
            className="w-48 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
