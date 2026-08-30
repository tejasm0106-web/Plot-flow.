import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  Building2, 
  Scale, 
  LogOut, 
  RefreshCw, 
  Radio, 
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Compass
} from 'lucide-react';

import AdminPanel from './screens/AdminPanel';
import LegalAuditPortal from './screens/LegalAuditPortal';
import StaffGatewayModal from './components/StaffGatewayModal';
import RBACGuard from './components/RBACGuard';
import SmsNotificationToast from './components/SmsNotificationToast';

import { 
  getStoredTownships, 
  saveStoredTownships, 
  getSiteSettings,
  getStoredAuditLogs,
  broadcastSyncEvent,
  subscribeToTownshipsRealtime,
  subscribeToSettingsRealtime
} from './services/storeService';
import { 
  isSuperAdmin, 
  canAccessPortal, 
  syncUserRoleToFirestore, 
  subscribeToUserRbac,
  SUPER_ADMIN_EMAIL
} from './services/rbacService';

export default function AdminApp({ onSwitchToBuyerWeb }) {
  const [townships, setTownships] = useState(() => getStoredTownships());
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());
  const [activeAdminSubView, setActiveAdminSubView] = useState('governance'); // 'governance' | 'legal_vault'
  const [isStaffGatewayOpen, setIsStaffGatewayOpen] = useState(false);
  const [staffGatewayTarget, setStaffGatewayTarget] = useState('admin');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isSyncPulsing, setIsSyncPulsing] = useState(false);

  // Authenticated admin user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('plotflow_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    // Default fallback to Master Super Admin for Admin Web
    return {
      uid: 'super_admin_tejas',
      email: SUPER_ADMIN_EMAIL,
      name: 'Tejas (CEO & Super Admin)',
      role: 'SUPER_ADMIN',
      roleTitle: 'Master Platform Super Administrator',
      status: 'ACTIVE',
      badge: 'Super Admin',
      department: 'Executive Governance'
    };
  });

  // Save session on user change
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('plotflow_active_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Real-time listener for Firestore & multi-tab updates
  useEffect(() => {
    const unsubTownships = subscribeToTownshipsRealtime((updatedList) => {
      setTownships(updatedList);
      triggerSyncPulse();
    });

    const unsubSettings = subscribeToSettingsRealtime((updatedSettings) => {
      setSiteSettings(updatedSettings);
      triggerSyncPulse();
    });

    return () => {
      if (typeof unsubTownships === 'function') unsubTownships();
      if (typeof unsubSettings === 'function') unsubSettings();
    };
  }, []);

  const triggerSyncPulse = () => {
    setLastSyncTime(new Date());
    setIsSyncPulsing(true);
    setTimeout(() => setIsSyncPulsing(false), 2000);
  };

  const handleUpdateTownship = (updatedTownship) => {
    const updatedList = townships.map(t => t.id === updatedTownship.id ? updatedTownship : t);
    setTownships(updatedList);
    saveStoredTownships(updatedList);
    triggerSyncPulse();
  };

  const handleRemoveTownship = (townshipId) => {
    const updatedList = townships.filter(t => t.id !== townshipId);
    setTownships(updatedList);
    saveStoredTownships(updatedList);
    triggerSyncPulse();
  };

  const handleAddTownship = (newTownship) => {
    const updatedList = [newTownship, ...townships];
    setTownships(updatedList);
    saveStoredTownships(updatedList);
    triggerSyncPulse();
  };

  // Quick action: Open Buyer Web in new tab
  const handleOpenBuyerWebNewWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'buyer');
    window.open(url.toString(), '_blank');
  };

  // Quick action: Open Developer SaaS in new tab
  const handleOpenDeveloperWebNewWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'developer');
    window.open(url.toString(), '_blank');
  };

  return (
    <RBACGuard
      user={currentUser}
      targetPortal="admin"
      onSwitchUser={(u) => {
        setCurrentUser(u);
        syncUserRoleToFirestore(u);
      }}
      onOpenStaffGateway={(target) => {
        setStaffGatewayTarget(target);
        setIsStaffGatewayOpen(true);
      }}
      onReturnHome={() => onSwitchToBuyerWeb?.()}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        {/* ==================================================== */}
        {/* DEDICATED ADMIN WEB APPLICATION HEADER */}
        {/* ==================================================== */}
        <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-8 py-3.5 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Admin App Brand & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/60 ring-2 ring-amber-500/40">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg font-black text-white tracking-tight">PlotFlow Admin Web</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 tracking-wider">
                    ENTERPRISE CONTROL CENTER
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${isSyncPulsing ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`}></span>
                    <span className="text-emerald-400 font-semibold">Live Cross-Web Sync Active</span>
                  </span>
                  <span>•</span>
                  <span>Synced to Buyer & Developer Web</span>
                </div>
              </div>
            </div>

            {/* Cross-Web Launchers & Actions */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* AI Workforce Badge */}
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>10 AI Heads Online (Video Ready)</span>
              </div>

              {/* View Switcher: Governance vs Legal Vault */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center space-x-1">
                <button
                  onClick={() => setActiveAdminSubView('governance')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeAdminSubView === 'governance'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HQ Control</span>
                </button>
                <button
                  onClick={() => setActiveAdminSubView('legal_vault')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeAdminSubView === 'legal_vault'
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Legal Audit Vault</span>
                </button>
              </div>

              {/* Open Buyer Web in New Window */}
              <button
                onClick={handleOpenBuyerWebNewWindow}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                title="Launch Buyer Marketplace in a separate window to test live reflections"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Buyer Web</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              {/* Open Developer SaaS in New Window */}
              <button
                onClick={handleOpenDeveloperWebNewWindow}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-indigo-200 font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                title="Launch Builder SaaS in a separate window"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Developer Web</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xs">
                  {currentUser?.name ? currentUser.name[0] : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-[11px] font-bold text-white block leading-tight">{currentUser?.name}</span>
                  <span className="text-[9px] text-amber-400 font-semibold block">{currentUser?.roleTitle || 'Super Admin'}</span>
                </div>
              </div>

              {/* Exit / Switch to Buyer Web */}
              <button
                onClick={() => onSwitchToBuyerWeb?.()}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center space-x-1"
                title="Switch view to Buyer & Developer Web"
              >
                <span>Switch to Buyer Web</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================== */}
        {/* LIVE SYNC STATUS STRIP */}
        {/* ==================================================== */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 px-4 sm:px-8 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              <strong className="text-amber-300">Bi-Directional Real-Time Reflection:</strong> Any plot status, price changes, townships, CMS banners, and legal audits modified in this Admin Web update the Buyer and Developer Web instantly.
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <span>Last Sync: {lastSyncTime.toLocaleTimeString()}</span>
            <button 
              onClick={() => {
                broadcastSyncEvent('plotflow_townships_updated', townships);
                triggerSyncPulse();
              }}
              className="p-1 hover:text-amber-300 transition" 
              title="Force trigger broadcast sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncPulsing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MAIN ADMIN WORKSPACE */}
        {/* ==================================================== */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
          {activeAdminSubView === 'governance' && (
            <AdminPanel
              currentUser={currentUser}
              townships={townships}
              onUpdateTownship={handleUpdateTownship}
              onAddTownship={handleAddTownship}
              onRemoveTownship={handleRemoveTownship}
              onExploreMarketplace={handleOpenBuyerWebNewWindow}
            />
          )}

          {activeAdminSubView === 'legal_vault' && (
            <LegalAuditPortal
              currentUser={currentUser}
              townships={townships}
              onUpdateTownship={handleUpdateTownship}
              onNavigateTo3D={() => {
                handleOpenBuyerWebNewWindow();
              }}
            />
          )}
        </main>

        {/* Staff Gateway Modal if needed */}
        <StaffGatewayModal
          isOpen={isStaffGatewayOpen}
          onClose={() => setIsStaffGatewayOpen(false)}
          targetPortal={staffGatewayTarget}
          currentUser={currentUser}
          onAuthenticateAndOpenPortal={(target, user) => {
            setCurrentUser(user);
            syncUserRoleToFirestore(user);
          }}
        />

        {/* Global Real-Time SMS Notification Banner */}
        <SmsNotificationToast />

        {/* Dedicated Admin Web Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                PF
              </div>
              <span className="font-bold text-slate-300">PlotFlow Admin Web App</span>
              <span>•</span>
              <span className="text-slate-400">Master Governance, AI Workforce HQ & Inventory Orchestration</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-400">
              <button onClick={handleOpenBuyerWebNewWindow} className="hover:text-emerald-400 transition flex items-center space-x-1">
                <span>Buyer Marketplace</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button onClick={handleOpenDeveloperWebNewWindow} className="hover:text-indigo-400 transition flex items-center space-x-1">
                <span>Developer SaaS</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button onClick={() => onSwitchToBuyerWeb?.()} className="hover:text-amber-400 font-bold transition">
                Return to Buyer Web
              </button>
            </div>
          </div>
        </footer>
      </div>
    </RBACGuard>
  );
}
