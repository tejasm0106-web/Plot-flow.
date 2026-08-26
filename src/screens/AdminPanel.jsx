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
  ChevronRight
} from 'lucide-react';

import { 
  INITIAL_PLATFORM_USERS, 
  INITIAL_SITE_SETTINGS, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { auth, firebaseConfig } from '../services/firebase';

export default function AdminPanel({ 
  currentUser, 
  townships = [], 
  onApproveProject, 
  onRejectProject 
}) {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'settings' | 'approvals' | 'audit'

  // User Management State
  const [usersList, setUsersList] = useState(INITIAL_PLATFORM_USERS);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
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
    setUsersList(prev => prev.map(u => {
      if (u.uid === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog('USER_STATUS_TOGGLED', `Changed status of ${u.email} to ${nextStatus}`, 'WARNING');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleSaveUserRole = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.uid === userId) {
        addAuditLog('USER_ROLE_UPDATED', `Elevated / modified role of ${u.email} to ${editUserRole}`, 'INFO');
        return { ...u, role: editUserRole };
      }
      return u;
    }));
    setEditingUserId(null);
  };

  const handleDeleteUser = (userId, userEmail) => {
    if (confirm(`Are you sure you want to remove user ${userEmail}? This will revoke their platform access.`)) {
      setUsersList(prev => prev.filter(u => u.uid !== userId));
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
      authProvider: 'firebase.google',
      status: 'Active',
      verified: true,
      lastSignIn: 'Invitation Dispatched',
      createdAt: new Date().toISOString().split('T')[0],
      assignedProjectsCount: newUserForm.role === 'DEVELOPER' ? 1 : 0
    };

    setUsersList(prev => [newCreatedUser, ...prev]);
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
    }, 1200);
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
                  Tejas (Owner)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Firebase Auth Connected</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authenticated User: <strong className="text-amber-300">{currentUser?.email || 'tejastej094@gmail.com'}</strong> • Project ID: <span className="font-mono text-slate-300">{firebaseConfig.projectId}</span> • Full Platform Privileges
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Sync */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncFirebaseAuth}
              disabled={firebaseSyncing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${firebaseSyncing ? 'animate-spin' : ''}`} />
              <span>{firebaseSyncing ? 'Syncing Firebase...' : 'Sync Auth State'}</span>
            </button>

            {/* Platform Maintenance Mode Switch */}
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl">
              <Power className={`w-4 h-4 ${siteSettings.maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <div className="text-xs">
                <span className="text-white font-bold block text-[11px]">Maintenance Mode</span>
                <span className="text-[10px] text-slate-400">{siteSettings.maintenanceMode ? 'Active (Restricted)' : 'Inactive (Normal)'}</span>
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
            <span>Firebase Auth directory, active session tokens, and security claims synchronized successfully.</span>
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

          {/* System Health & Fast Overview Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Firebase & Service Health Matrix</h3>
                  <p className="text-xs text-slate-400">Real-time status of authentication, 3D physics rendering, and government registry sync.</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                  99.98% Uptime
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>Firebase Auth & Tokens</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px]">Operational</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Google Identity Provider, custom role claims & session tokens active.</p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Kaveri-2 Sub-Registrar Sync</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px]">Synced (30m Interval)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">State land registry 30-year Form 15 EC verification active.</p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>3D Sun-Path Solar Engine</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px]">60 FPS Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Isometric perspective, shadow casting & Vastu Ishanya calculation engine.</p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      <span>Escrow Token Vault</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[10px]">Locked & Insured</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Refundable ₹25,000 reservation tokens backed by ICICI/HDFC escrow.</p>
                </div>
              </div>
            </div>

            {/* Quick Super Admin Profile Spec */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Owner Security Credentials</h3>
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account:</span>
                    <span className="font-bold text-white">Tejas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Email:</span>
                    <span className="font-mono text-amber-300 text-[11px] truncate max-w-[150px]">tejastej094@gmail.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role Privilege:</span>
                    <span className="font-bold text-emerald-400">SUPER_ADMIN (L1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master PIN:</span>
                    <span className="font-mono text-slate-300">•••• (2026)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">2FA Status:</span>
                    <span className="text-emerald-400 font-bold">Enforced</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('users')}
                className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <Users className="w-4 h-4" />
                <span>Manage User Accounts →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Toolbar */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">User Directory & Role Access Control</h3>
                <p className="text-xs text-slate-400">
                  Manage Firebase authenticated users, assign developer/buyer permissions, and grant legal auditor credentials.
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
                  placeholder="Search user by name, email, phone..."
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
                    filteredUsers.map((user) => {
                      const isCurrentUser = user.email === currentUser?.email;
                      const isEditingThisUser = editingUserId === user.uid;

                      return (
                        <tr key={user.uid} className="hover:bg-slate-900/40 transition">
                          {/* User Identity */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : user.role === 'DEVELOPER'
                                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                                  : user.role === 'LEGAL_AUDITOR'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-white">{user.name}</span>
                                  {isCurrentUser && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-slate-400 text-[11px] block">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-4">
                            {isEditingThisUser ? (
                              <div className="flex items-center space-x-1.5">
                                <select
                                  value={editUserRole}
                                  onChange={(e) => setEditUserRole(e.target.value)}
                                  className="bg-slate-900 border border-amber-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                                >
                                  <option value="BUYER">BUYER</option>
                                  <option value="DEVELOPER">DEVELOPER</option>
                                  <option value="LEGAL_AUDITOR">LEGAL_AUDITOR</option>
                                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                </select>
                                <button
                                  onClick={() => handleSaveUserRole(user.uid)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : user.role === 'DEVELOPER'
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                  : user.role === 'LEGAL_AUDITOR'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                <span>{user.role}</span>
                              </span>
                            )}
                          </td>

                          {/* Company / Entity */}
                          <td className="p-4 text-slate-300">
                            <span className="block font-medium truncate max-w-[180px]">{user.company}</span>
                            <span className="text-[10px] text-slate-500">Joined: {user.createdAt}</span>
                          </td>

                          {/* Auth Provider */}
                          <td className="p-4">
                            <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {user.authProvider}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              user.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : user.status === 'Pending Verification'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {user.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingUserId(user.uid);
                                setEditUserRole(user.role);
                              }}
                              title="Edit Role & Permissions"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-800 transition inline-block"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            
                            {!isCurrentUser && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(user.uid)}
                                  title={user.status === 'Active' ? 'Suspend Access' : 'Activate Access'}
                                  className={`p-1.5 rounded-lg border transition inline-block ${
                                    user.status === 'Active'
                                      ? 'bg-slate-900 hover:bg-amber-950/40 text-slate-400 hover:text-amber-400 border-slate-800'
                                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                                  }`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.uid, user.email)}
                                  title="Delete User"
                                  className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition inline-block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SITE-WIDE SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Header & Save Action */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Global Platform & Escrow Configuration</h3>
              <p className="text-xs text-slate-400">
                Configure real-time parameters for token escrow fees, state land registry sync, and security enforcement.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 transition flex-shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </button>
          </div>

          {settingsSavedAlert && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Platform settings updated successfully and broadcast to all active sessions.</span>
            </div>
          )}

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Group 1: Financial & Escrow Commission */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Financial & Escrow Economics</h4>
              </div>

              {/* Commission Take-Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">PlotFlow Escrow Take-Rate:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{siteSettings.takeRateFee}% of Closed GMV</span>
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
                <p className="text-[11px] text-slate-500">Transaction commission escrowed upon digital token lock and sale deed registration.</p>
              </div>

              {/* Mandatory Token Deposit Amount */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Mandatory Token Advance Lock:</span>
                  <span className="font-mono text-amber-400 font-bold text-sm">₹{siteSettings.tokenDepositAmount.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={siteSettings.tokenDepositAmount}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, tokenDepositAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500">100% refundable token required to reserve a plot on the 3D twin for 72 hours.</p>
              </div>

              {/* Auto Escrow Release Rule */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold block">Escrow Release Trigger</label>
                <select
                  value={siteSettings.escrowAutoReleaseTrigger}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, escrowAutoReleaseTrigger: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="SALE_DEED_REGISTERED">On Sub-Registrar Sale Deed Registration (Recommended)</option>
                  <option value="AGREEMENT_SIGNED">On Agreement of Sale Execution</option>
                </select>
              </div>
            </div>

            {/* Group 2: Legal Verification & Title Gate */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Title Verification & Compliance Gates</h4>
              </div>

              {/* Strict 5-Layer Gate */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Strict 5-Layer Due Diligence Gate</span>
                  <span className="text-[11px] text-slate-400">Prevent townships from appearing in 3D Marketplace until all 5 certificates are verified.</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.strictReraGate}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, strictReraGate: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Kaveri-2 Registry Sync */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Kaveri-2 Sub-Registrar Sync (Form 15)</span>
                  <span className="text-[11px] text-slate-400">Automated 30-year nil-encumbrance checking against government title ledger.</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.kaveri2SyncEnabled}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, kaveri2SyncEnabled: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* High-Def Sun-Path Shaders */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">High-Definition Solar Shadow Shaders</span>
                  <span className="text-[11px] text-slate-400">Render dynamic shadow projections for time-of-day solar calculations.</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.enableSunPathHighDef}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, enableSunPathHighDef: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Group 3: Lead Notifications & Concierge */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <Phone className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Chauffeur Cab & WhatsApp Webhooks</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp Business Webhook Integration</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappBusinessNumber}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, whatsappBusinessNumber: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Dispatches instant PDF brochures and RERA audit seals to buyer leads.</p>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Chauffeur Cab Partner API Key</label>
                  <input
                    type="password"
                    value={siteSettings.cabServiceApiKey}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, cabServiceApiKey: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Automates door-to-door site visit pickups for high-intent plot buyers.</p>
                </div>
              </div>
            </div>

            {/* Group 4: Security & Authentication Settings */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <Lock className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Access Control & Security Policies</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Super Admin Master PIN</label>
                  <input
                    type="text"
                    value={siteSettings.adminSecurityPin}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, adminSecurityPin: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Security PIN required for sensitive role promotions and payouts.</p>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Allowed Super Admin Domains</label>
                  <input
                    type="text"
                    value={siteSettings.allowedAdminDomains}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, allowedAdminDomains: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DEVELOPER APPROVAL QUEUE ================= */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Developer Project Approval Queue</h3>
              <p className="text-xs text-slate-400">
                Validate 30-year EC records, BDA layout sanctions, and K-RERA certificates before publishing live.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              {pendingApprovals.length} Layouts Pending Review
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Approval Queue Clean</h4>
              <p className="text-xs text-slate-400">All submitted townships are fully audited and published live to the 3D marketplace.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-white">{sub.townshipName}</h4>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Developer: <strong className="text-slate-200">{sub.developerName}</strong> • {sub.location}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Parcel: <strong className="text-white">{sub.totalAcres}</strong></span>
                      <span>Est. GMV: <strong className="text-emerald-400">{sub.estimatedGmv}</strong></span>
                      <span>RERA: <span className="font-mono text-slate-300">{sub.reraNumber}</span></span>
                      <span>{sub.documentsCount} Legal Docs Attached</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprovalAction(sub.id, 'approve')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish Live</span>
                    </button>
                    <button
                      onClick={() => handleApprovalAction(sub.id, 'reject')}
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
      )}

      {/* ================= TAB 5: SECURITY AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Immutable Platform Security Audit Ledger</h3>
              <p className="text-xs text-slate-400">
                Chronological record of all authentication handshakes, role modifications, escrow locks, and setting updates.
              </p>
            </div>

            <button
              onClick={() => alert('Downloading cryptographic audit ledger in JSON format...')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit Trail (JSON)</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      log.severity === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : log.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[11px]">• Actor: <strong className="text-slate-200">{log.actor}</strong></span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.details}</p>
                </div>

                <div className="text-right flex-shrink-0 text-[11px] text-slate-500 font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: INVITE NEW USER ================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6">
            {/* Header */}
            <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Invite & Provision Platform User</h3>
                  <p className="text-xs text-slate-400">Dispatches a Firebase Auth invite link with assigned role claims</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Gowda"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address (Auth Identity) *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@domain.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 00000"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Assign Platform Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="BUYER">BUYER (Verified Land Buyer)</option>
                    <option value="DEVELOPER">DEVELOPER (Builder SaaS Inventory & CRM)</option>
                    <option value="LEGAL_AUDITOR">LEGAL_AUDITOR (5-Layer Title Advocate)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Privileges)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Organization / Builder Company</label>
                <input
                  type="text"
                  placeholder="e.g. Prestige Plotted Estates or Individual"
                  value={newUserForm.company}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>An automated Firebase onboarding email will be triggered with custom security role tokens.</span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Send Onboarding Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
