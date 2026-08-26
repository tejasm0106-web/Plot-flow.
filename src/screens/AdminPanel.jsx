import React, { useState, useEffect } from 'react';
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
  Lock, 
  Search, 
  Filter, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Key, 
  Mail, 
  Phone, 
  FileText, 
  Check, 
  X, 
  RefreshCw, 
  Database, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Download, 
  ExternalLink, 
  KeyRound, 
  SlidersHorizontal,
  ChevronRight,
  Send,
  UserCheck,
  Shield,
  Copy
} from 'lucide-react';

import { 
  INITIAL_SITE_SETTINGS, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getAdminCredentials, 
  updateAdminCredentials, 
  dispatchAdminCredentialEmail,
  getEmailDispatchLogs
} from '../services/userService';
import { auth, firebaseConfig } from '../services/firebase';

export default function AdminPanel({ 
  currentUser, 
  townships = [], 
  onApproveProject, 
  onRejectProject 
}) {
  // Navigation Sub-Tabs: 'overview' | 'users' | 'admin_creds' | 'settings' | 'approvals' | 'audit'
  const [activeTab, setActiveTab] = useState('overview');

  // User Management State (Synchronized with localStorage & Auth)
  const [usersList, setUsersList] = useState(() => getStoredUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserRole, setEditUserRole] = useState('BUYER');

  // New User Invite Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'BUYER',
    company: '',
    sendFirebaseInvite: true
  });

  // Admin Credentials & Mailer State
  const [adminCreds, setAdminCreds] = useState(() => getAdminCredentials());
  const [adminPasswordInput, setAdminPasswordInput] = useState(adminCreds.password || 'Admin@2026');
  const [adminPinInput, setAdminPinInput] = useState(adminCreds.securityPin || '2026');
  const [emailLogs, setEmailLogs] = useState(() => getEmailDispatchLogs());
  const [latestEmailPacket, setLatestEmailPacket] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Site-Wide Settings State
  const [siteSettings, setSiteSettings] = useState(INITIAL_SITE_SETTINGS);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [firebaseSyncSuccess, setFirebaseSyncSuccess] = useState(false);

  // Developer Layout Approval Queue State
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
      documentsCount: 5,
      estimatedGmv: '₹84.5 Cr'
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
      documentsCount: 6,
      estimatedGmv: '₹72.0 Cr'
    }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Refresh user list on mount or tab focus
  useEffect(() => {
    setUsersList(getStoredUsers());
    setEmailLogs(getEmailDispatchLogs());
  }, [activeTab]);

  // Filtered Users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(userSearchQuery));

    const matchesRole = selectedRoleFilter === 'ALL' || user.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || user.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // User Actions
  const handleToggleUserStatus = (userId) => {
    const updated = usersList.map(u => {
      if (u.uid === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog('USER_STATUS_TOGGLED', `Changed status of ${u.email} to ${nextStatus}`, 'WARNING');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsersList(updated);
    saveStoredUsers(updated);
  };

  const handleSaveUserRole = (userId) => {
    const updated = usersList.map(u => {
      if (u.uid === userId) {
        addAuditLog('USER_ROLE_UPDATED', `Elevated / modified role of ${u.email} to ${editUserRole}`, 'INFO');
        return { ...u, role: editUserRole };
      }
      return u;
    });
    setUsersList(updated);
    saveStoredUsers(updated);
    setEditingUserId(null);
  };

  const handleDeleteUser = (userId, userEmail) => {
    if (confirm(`Are you sure you want to remove user ${userEmail}? This will revoke their platform access.`)) {
      const updated = usersList.filter(u => u.uid !== userId);
      setUsersList(updated);
      saveStoredUsers(updated);
      addAuditLog('USER_DELETED', `Deleted user account ${userEmail}`, 'CRITICAL');
    }
  };

  const handleInviteUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const newCreatedUser = {
      uid: `usr_${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone || '+91 98000 00000',
      role: newUserForm.role,
      company: newUserForm.company || (newUserForm.role === 'DEVELOPER' ? 'Plotted Developer Partner' : 'Individual User'),
      authProvider: 'firebase.auth',
      status: 'Active',
      verified: true,
      lastSignIn: 'Invitation Dispatched',
      createdAt: new Date().toISOString().split('T')[0],
      assignedProjectsCount: newUserForm.role === 'DEVELOPER' ? 1 : 0
    };

    const updated = [newCreatedUser, ...usersList];
    setUsersList(updated);
    saveStoredUsers(updated);
    addAuditLog('USER_INVITED', `Dispatched Firebase Auth onboarding invitation to ${newUserForm.email} as ${newUserForm.role}`, 'INFO');
    setIsInviteModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'BUYER',
      company: '',
      sendFirebaseInvite: true
    });
  };

  // Admin Credentials Update and Email Dispatch Handler
  const handleUpdatePasswordAndSendMail = () => {
    if (!adminPasswordInput || adminPasswordInput.length < 6) {
      alert('Admin password must be at least 6 characters.');
      return;
    }
    const { updated, emailDispatchResult } = updateAdminCredentials(adminPasswordInput, adminPinInput);
    setAdminCreds(updated);
    setLatestEmailPacket(emailDispatchResult);
    setEmailLogs(getEmailDispatchLogs());
    addAuditLog('ADMIN_PASSWORD_UPDATED', `Master credentials updated & email dispatched to tejastej094@gmail.com`, 'SUCCESS');
  };

  // Approval Actions
  const handleApprovalAction = (subId, action) => {
    const sub = pendingApprovals.find(p => p.id === subId);
    setPendingApprovals(prev => prev.filter(p => p.id !== subId));
    if (action === 'approve') {
      addAuditLog('PROJECT_APPROVED_LIVE', `Super Admin signed off 5-layer audit for ${sub?.townshipName}. Published live.`, 'SUCCESS');
      alert(`Project ${sub?.townshipName} Approved & Published Live to 3D Marketplace.`);
    } else {
      addAuditLog('PROJECT_REJECTED', `Project ${sub?.townshipName} rejected due to incomplete RERA documentation.`, 'WARNING');
      alert(`Project ${sub?.townshipName} Rejected.`);
    }
  };

  // Settings Actions
  const handleSaveSettings = () => {
    setSettingsSavedAlert(true);
    addAuditLog('SITE_SETTINGS_UPDATED', 'Updated global site-wide settings & financial parameters.', 'WARNING');
    setTimeout(() => setSettingsSavedAlert(false), 3000);
  };

  const handleSyncFirebaseAuth = () => {
    setFirebaseSyncing(true);
    setTimeout(() => {
      setFirebaseSyncing(false);
      setFirebaseSyncSuccess(true);
      addAuditLog('FIREBASE_AUTH_SYNCED', 'Synchronized Firebase project token claims and auth directory.', 'INFO');
      setTimeout(() => setFirebaseSyncSuccess(false), 3000);
    }, 1000);
  };

  // Helper to add audit logs
  const addAuditLog = (action, details, severity = 'INFO') => {
    const newLog = {
      id: `log_${Date.now()}`,
      action,
      actor: currentUser?.email || 'tejastej094@gmail.com (Super Admin)',
      target: 'Platform Engine',
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Super Admin Top Header with Firebase Auth Indicator */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40 flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Super Admin Master Console
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                  Tejas (Master Owner)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Session</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Admin ID: <strong className="text-amber-300">tejastej094@gmail.com</strong> • Full Platform Privileges & Escrow Release Authority
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Sync */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('admin_creds')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow shadow-amber-950/50"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Admin Password & Mailer</span>
            </button>

            <button
              onClick={handleSyncFirebaseAuth}
              disabled={firebaseSyncing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${firebaseSyncing ? 'animate-spin' : ''}`} />
              <span>{firebaseSyncing ? 'Syncing...' : 'Sync Auth State'}</span>
            </button>

            {/* Platform Maintenance Mode Switch */}
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl">
              <Power className={`w-4 h-4 ${siteSettings.maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <div className="text-xs">
                <span className="text-white font-bold block text-[11px]">Maintenance Mode</span>
                <span className="text-[10px] text-slate-400">{siteSettings.maintenanceMode ? 'Active (Restricted)' : 'Normal'}</span>
              </div>
              <button
                onClick={() => {
                  const nextState = !siteSettings.maintenanceMode;
                  setSiteSettings(prev => ({ ...prev, maintenanceMode: nextState }));
                  addAuditLog('MAINTENANCE_TOGGLED', `Turned maintenance mode ${nextState ? 'ON' : 'OFF'}`, 'WARNING');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ml-1 ${
                  siteSettings.maintenanceMode 
                    ? 'bg-rose-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {siteSettings.maintenanceMode ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {firebaseSyncSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Platform auth directory, active session tokens, and security claims synchronized successfully.</span>
          </div>
        )}
      </div>

      {/* Admin Panel Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'overview' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'users' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admin_creds')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'admin_creds' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Admin Password & Mailer</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'settings' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Site-Wide Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'approvals' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Approval Queue ({pendingApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'audit' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Logs</span>
        </button>
      </div>

      {/* ================= TAB 1: PLATFORM OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total GMV Pipeline</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-white block">₹348.5 Cr</span>
              <span className="text-[10px] text-emerald-400 font-bold">+18.4% this month</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Platform Commission ({siteSettings.takeRateFee}%)</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-400 block">₹2.61 Cr</span>
              <span className="text-[10px] text-slate-400">Realized transaction escrow</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Registered Platform Users</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-2xl font-black text-indigo-400 block">{usersList.length} Accounts</span>
              <span className="text-[10px] text-slate-400">
                {usersList.filter(u => u.role === 'DEVELOPER').length} Builders • {usersList.filter(u => u.role === 'BUYER').length} Buyers
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Verified Plotted Enclaves</span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-400 block">{townships.length} Live</span>
              <span className="text-[10px] text-slate-400">100% 5-Layer RERA verified</span>
            </div>
          </div>

          {/* Quick Super Admin Credentials Banner */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Super Administrator Master Account</span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                The master administrator account is linked to <strong className="text-white">tejastej094@gmail.com</strong>. You can change your password anytime or dispatch an instant copy of login credentials and session keys directly to your email.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('admin_creds')}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center space-x-2 flex-shrink-0 transition"
            >
              <Mail className="w-4 h-4" />
              <span>Configure Password & Dispatch Email →</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADMIN PASSWORD & MAILER GATEWAY ================= */}
      {activeTab === 'admin_creds' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Super Admin Password & Transactional Mailer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your master login credentials and dispatch encrypted access packages directly to <strong>tejastej094@gmail.com</strong>.
                </p>
              </div>

              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-mono font-bold flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Super Admin (Level 1)</span>
              </div>
            </div>

            {/* Password Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Credentials Editor</h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Super Admin Email (Immutable)</label>
                    <input
                      type="text"
                      disabled
                      value="tejastej094@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono text-xs cursor-not-allowed opacity-90"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">New Master Password *</label>
                    <input
                      type="text"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="e.g. Admin@2026"
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Security PIN (4 Digits)</label>
                    <input
                      type="text"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdatePasswordAndSendMail}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 transition mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Save Password & Drop Mail to tejastej094@gmail.com</span>
                  </button>
                </div>
              </div>

              {/* Live Dispatch Preview */}
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Automated Transactional Mail Preview</h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2 text-slate-300">
                    <div className="text-slate-500 border-b border-slate-800/80 pb-1 flex justify-between">
                      <span>TO:</span>
                      <span className="text-amber-300">tejastej094@gmail.com</span>
                    </div>
                    <div className="text-slate-500 border-b border-slate-800/80 pb-1 flex justify-between">
                      <span>SUBJECT:</span>
                      <span className="text-white text-[11px]">🔐 PlotFlow 3D Master Admin Credentials & Access Key</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-400 space-y-1">
                      <p className="text-white font-semibold">Hello Tejas,</p>
                      <p>Your PlotFlow 3D master administrator credentials are active:</p>
                      <p className="text-emerald-400 font-bold">• Email: tejastej094@gmail.com</p>
                      <p className="text-amber-300 font-bold">• Password: {adminPasswordInput || '••••••••'}</p>
                      <p className="text-indigo-300">• PIN: {adminPinInput || '2026'}</p>
                      <p className="text-slate-500 text-[10px] pt-1">Dispatched via PlotFlow Cloud SMTP with 256-bit AES encryption.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Instant delivery confirmation to tejastej094@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Dispatch History Logs */}
            {emailLogs.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Dispatch Audit Logs ({emailLogs.length})</h4>
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-white font-bold block">{log.subject}</span>
                          <span className="text-[10px] text-slate-400">Sent to: {log.recipient} • {log.timestamp}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Toolbar */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Registered User Directory & Roles</h3>
                <p className="text-xs text-slate-400">
                  Real registered buyers and developers. Manage permissions, activate/suspend accounts, or inspect onboarding details.
                </p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 transition flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite New User</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none w-full cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Roles</option>
                  <option value="SUPER_ADMIN" className="bg-slate-900">Super Admins</option>
                  <option value="DEVELOPER" className="bg-slate-900">Developers / Builders</option>
                  <option value="BUYER" className="bg-slate-900">Verified Buyers</option>
                  <option value="LEGAL_AUDITOR" className="bg-slate-900">Legal Auditors</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none w-full cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Statuses</option>
                  <option value="Active" className="bg-slate-900">Active</option>
                  <option value="Pending Verification" className="bg-slate-900">Pending Verification</option>
                  <option value="Suspended" className="bg-slate-900">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="p-4 font-bold">User Identity</th>
                    <th className="p-4 font-bold">Role & Permissions</th>
                    <th className="p-4 font-bold">Organization / Entity</th>
                    <th className="p-4 font-bold">Auth Provider</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        No user accounts match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-900/40 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              user.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : user.role === 'DEVELOPER'
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{user.name}</span>
                              <span className="text-[11px] text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {editingUserId === user.uid ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className="bg-slate-900 border border-amber-500 text-white rounded-lg px-2 py-1 text-xs"
                              >
                                <option value="BUYER">BUYER</option>
                                <option value="DEVELOPER">DEVELOPER</option>
                                <option value="LEGAL_AUDITOR">LEGAL_AUDITOR</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              </select>
                              <button
                                onClick={() => handleSaveUserRole(user.uid)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1 bg-slate-800 text-slate-400 rounded hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              user.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : user.role === 'DEVELOPER'
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-slate-300">
                          {user.company || 'Individual Buyer'}
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-[11px] text-slate-400">
                            {user.authProvider || 'email.password'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {user.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingUserId(user.uid);
                                setEditUserRole(user.role);
                              }}
                              title="Edit Role"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleUserStatus(user.uid)}
                              title={user.status === 'Active' ? 'Suspend Access' : 'Activate User'}
                              className={`p-1.5 border rounded-lg transition ${
                                user.status === 'Active' 
                                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400' 
                                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {user.email !== 'tejastej094@gmail.com' && (
                              <button
                                onClick={() => handleDeleteUser(user.uid, user.email)}
                                title="Remove User"
                                className="p-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SITE-WIDE SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Platform Settings & Global Parameters</h3>
              <p className="text-xs text-slate-400">Configure escrow fees, RERA gate strictness, and third-party webhooks.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition"
            >
              Save Configuration
            </button>
          </div>

          {settingsSavedAlert && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Platform settings updated and synchronized across all nodes.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Financial & Escrow Economics</span>
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Platform Take-Rate:</span>
                  <span className="font-mono text-emerald-400 font-bold">{siteSettings.takeRateFee}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.05"
                  value={siteSettings.takeRateFee}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, takeRateFee: parseFloat(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Mandatory Token Advance Lock:</span>
                  <span className="font-mono text-amber-400 font-bold">₹{siteSettings.tokenDepositAmount.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={siteSettings.tokenDepositAmount}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, tokenDepositAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Title Verification & Compliance Gates</span>
              </h4>

              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div>
                  <span className="text-xs font-bold text-white block">Strict 5-Layer Due Diligence Gate</span>
                  <span className="text-[11px] text-slate-400">Require all 5 RERA certificates before public listing.</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.strictReraGate}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, strictReraGate: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: APPROVAL QUEUE ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">Developer Project Submissions</h3>
            <p className="text-xs text-slate-400">Review new plotted developments submitted by builders before making them live.</p>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((sub) => (
              <div key={sub.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-base font-bold text-white block">{sub.townshipName}</span>
                  <span className="text-xs text-indigo-400 block">{sub.developerName} • {sub.location}</span>
                  <span className="text-[11px] text-slate-400 font-mono">RERA: {sub.reraNumber}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleApprovalAction(sub.id, 'approve')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Approve & Publish Live
                  </button>
                  <button
                    onClick={() => handleApprovalAction(sub.id, 'reject')}
                    className="px-4 py-2 bg-slate-900 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-bold text-xs rounded-xl border border-slate-800 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white">Platform Security Ledger & Audit Logs</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{log.action}</span>
                  <span className="text-[11px] text-slate-400">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Invite / Provision User Account</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="user@domain.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Role Assignment</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="BUYER">BUYER (Retail Plot Buyer)</option>
                  <option value="DEVELOPER">DEVELOPER (Builder SaaS Access)</option>
                  <option value="LEGAL_AUDITOR">LEGAL_AUDITOR (Title Verifier)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Owner Level)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organization / Entity Name</label>
                <input
                  type="text"
                  value={newUserForm.company}
                  onChange={(e) => setNewUserForm({ ...newUserForm, company: e.target.value })}
                  placeholder="e.g. Prestige Plotted Lands"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition mt-3"
              >
                Dispatch Onboarding Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
