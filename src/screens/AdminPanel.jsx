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
  Copy,
  Scale,
  UserX,
  Plus,
  Zap
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
  createLegalTeamUser,
  toggleUserStatusByAdmin,
  updateUserPasswordByAdmin,
  removeUserAccountByAdmin,
  getEmailDispatchLogs,
  isStaffUser,
  generateStaffTempPassword,
  resetStaffTemporaryPassword
} from '../services/userService';
import { auth, firebaseConfig } from '../services/firebase';

export default function AdminPanel({ 
  currentUser, 
  townships = [], 
  onUpdateTownship,
  onRemoveTownship,
  onApproveProject, 
  onRejectProject 
}) {
  // Navigation Sub-Tabs: 'overview' | 'users' | 'plots_devs' | 'admin_creds' | 'settings' | 'approvals' | 'audit'
  const [activeTab, setActiveTab] = useState('overview');

  // User Management State
  const [usersList, setUsersList] = useState(() => getStoredUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateLegalModalOpen, setIsCreateLegalModalOpen] = useState(false);
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [tempPasswordModalData, setTempPasswordModalData] = useState(null); // { user, tempPassword, copied: false }
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserRole, setEditUserRole] = useState('BUYER');

  // New Legal User Form
  const [legalForm, setLegalForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    barCouncilId: '',
    specialization: 'Land Revenue & RERA Title Verification'
  });

  // New Generic User Invite Form State
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

  // Developer & Plot Governance State
  const [selectedTownshipFilter, setSelectedTownshipFilter] = useState('ALL');
  const [plotSearchQuery, setPlotSearchQuery] = useState('');

  // Site-Wide Settings State
  const [siteSettings, setSiteSettings] = useState(INITIAL_SITE_SETTINGS);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [firebaseSyncSuccess, setFirebaseSyncSuccess] = useState(false);

  // Approval Queue State
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

    const handleEmailDispatched = () => {
      setEmailLogs(getEmailDispatchLogs());
    };
    window.addEventListener('plotflow_email_dispatched', handleEmailDispatched);
    return () => {
      window.removeEventListener('plotflow_email_dispatched', handleEmailDispatched);
    };
  }, [activeTab]);

  // Filtered Users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(userSearchQuery)) ||
      (user.barCouncilId && user.barCouncilId.toLowerCase().includes(userSearchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'ALL' || user.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || user.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // User Action Handlers
  const handleToggleUserStatus = (userId) => {
    const result = toggleUserStatusByAdmin(userId);
    if (result.success) {
      setUsersList(getStoredUsers());
      addAuditLog('USER_STATUS_TOGGLED', `Admin changed user status for ${result.user?.email} to ${result.user?.status}`, 'WARNING');
    } else {
      alert(result.error || 'Failed to update user status.');
    }
  };

  const handleSaveUserRole = (userId) => {
    const updated = usersList.map(u => {
      if (u.uid === userId) {
        addAuditLog('USER_ROLE_UPDATED', `Admin modified role of ${u.email} to ${editUserRole}`, 'INFO');
        return { ...u, role: editUserRole };
      }
      return u;
    });
    setUsersList(updated);
    saveStoredUsers(updated);
    setEditingUserId(null);
  };

  const handleDeleteUser = (userId, userEmail) => {
    if (userEmail === 'tejastej094@gmail.com') {
      alert('Cannot delete the Master Super Admin account.');
      return;
    }
    if (confirm(`Are you sure you want to permanently remove ${userEmail}? This will revoke their platform access.`)) {
      const result = removeUserAccountByAdmin(userId);
      if (result.success) {
        setUsersList(getStoredUsers());
        addAuditLog('USER_DELETED', `Admin permanently removed account ${userEmail}`, 'CRITICAL');
        alert(`Account ${userEmail} has been deleted.`);
      } else {
        alert(result.error || 'Failed to delete user.');
      }
    }
  };

  // One-Click Temporary Password Generator for Staff Accounts
  const handleGenerateStaffTempPassword = (targetUser) => {
    if (targetUser.email === 'tejastej094@gmail.com') {
      alert('To reset Super Admin master credentials, please use the Admin Credentials Reset tab.');
      return;
    }
    const result = resetStaffTemporaryPassword(targetUser.uid);
    if (result.success) {
      setUsersList(getStoredUsers());
      setEmailLogs(getEmailDispatchLogs());
      addAuditLog('STAFF_TEMP_PASSWORD_GENERATED', `Generated temporary password for ${targetUser.name} (${targetUser.role})`, 'WARNING');
      setTempPasswordModalData({
        user: result.user || targetUser,
        tempPassword: result.temporaryPassword,
        copied: false
      });
    } else {
      alert(result.error || 'Failed to generate temporary password.');
    }
  };

  // Reset User Password
  const handleResetUserPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPasswordModalUser || !newPasswordForUser) return;
    if (newPasswordForUser.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    const isStaff = isStaffUser(resetPasswordModalUser);
    const result = updateUserPasswordByAdmin(resetPasswordModalUser.uid, newPasswordForUser, isStaff);
    if (result.success) {
      setUsersList(getStoredUsers());
      addAuditLog('USER_PASSWORD_RESET', `Super Admin reset password for user ${resetPasswordModalUser.email}`, 'CRITICAL');
      alert(`Password for ${resetPasswordModalUser.name} (${resetPasswordModalUser.email}) successfully updated to "${newPasswordForUser}".`);
      setResetPasswordModalUser(null);
      setNewPasswordForUser('');
    } else {
      alert(result.error || 'Failed to reset password.');
    }
  };

  // Create Legal Team User Submit
  const handleCreateLegalUserSubmit = (e) => {
    e.preventDefault();
    if (!legalForm.name || !legalForm.email || !legalForm.password) {
      alert('Please fill all required fields.');
      return;
    }
    const result = createLegalTeamUser(legalForm);
    if (result.success) {
      setUsersList(getStoredUsers());
      addAuditLog('LEGAL_USER_CREATED', `Super Admin created Legal Auditor account for ${legalForm.name} (${legalForm.email})`, 'INFO');
      alert(`Legal Team account for Advocate ${legalForm.name} created successfully.`);
      setIsCreateLegalModalOpen(false);
      setLegalForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        barCouncilId: '',
        specialization: 'Land Revenue & RERA Title Verification'
      });
    } else {
      alert(result.error || 'Failed to create legal account.');
    }
  };

  // Generic Invite Form
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
      authProvider: 'email.password',
      status: 'Active',
      verified: true,
      lastSignIn: 'Invitation Dispatched',
      createdAt: new Date().toISOString().split('T')[0],
      assignedProjectsCount: newUserForm.role === 'DEVELOPER' ? 1 : 0
    };

    const updated = [newCreatedUser, ...usersList];
    setUsersList(updated);
    saveStoredUsers(updated);
    addAuditLog('USER_INVITED', `Super Admin provisioned user ${newUserForm.email} with role ${newUserForm.role}`, 'INFO');
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
    alert('Master Super Admin credentials updated! Confirmation mail sent to tejastej094@gmail.com.');
  };

  // Developer Removal Handler
  const handleRemoveDeveloper = (developerUser) => {
    if (confirm(`Remove developer ${developerUser.name} (${developerUser.company || developerUser.email}) and revoke all platform credentials?`)) {
      removeUserAccountByAdmin(developerUser.uid);
      setUsersList(getStoredUsers());
      addAuditLog('DEVELOPER_REMOVED', `Super Admin removed developer ${developerUser.email}`, 'CRITICAL');
      alert(`Developer ${developerUser.name} removed successfully.`);
    }
  };

  // Plot Removal Handler (Admin can remove any plot)
  const handleAdminRemovePlot = (townshipId, plotId, plotNumber) => {
    if (confirm(`Are you sure you want to permanently delete Plot ${plotNumber} from inventory?`)) {
      const targetTs = townships.find(t => t.id === townshipId);
      if (targetTs && onUpdateTownship) {
        const updatedPlots = (targetTs.plots || []).filter(p => p.id !== plotId);
        const updatedTownship = {
          ...targetTs,
          plots: updatedPlots,
          totalPlots: updatedPlots.length,
          availablePlots: updatedPlots.filter(p => p.status === 'Available' && (p.legalStatus || 'Approved') === 'Approved').length
        };
        onUpdateTownship(updatedTownship);
        addAuditLog('PLOT_REMOVED_BY_ADMIN', `Super Admin deleted plot ${plotNumber} from township ${targetTs.name}`, 'WARNING');
        alert(`Plot ${plotNumber} removed from ${targetTs.name}.`);
      }
    }
  };

  // Township Removal Handler
  const handleAdminRemoveTownship = (townshipId, townshipName) => {
    if (confirm(`Are you sure you want to delete entire township "${townshipName}" and all its plots? This cannot be undone.`)) {
      if (onRemoveTownship) {
        onRemoveTownship(townshipId);
      }
      addAuditLog('TOWNSHIP_DELETED_BY_ADMIN', `Super Admin deleted township ${townshipName}`, 'CRITICAL');
      alert(`Township "${townshipName}" removed.`);
    }
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

  // All plots across all townships for Governance view
  const allPlotsAcrossTownships = townships.flatMap(ts => 
    (ts.plots || []).map(p => ({
      ...p,
      townshipId: ts.id,
      townshipName: ts.name,
      developerName: ts.developer
    }))
  ).filter(p => {
    const matchesTs = selectedTownshipFilter === 'ALL' || p.townshipId === selectedTownshipFilter;
    const matchesQuery = !plotSearchQuery || 
      p.number.toLowerCase().includes(plotSearchQuery.toLowerCase()) ||
      p.townshipName.toLowerCase().includes(plotSearchQuery.toLowerCase()) ||
      p.facing.toLowerCase().includes(plotSearchQuery.toLowerCase());
    return matchesTs && matchesQuery;
  });

  const developerUsers = usersList.filter(u => u.role === 'DEVELOPER');
  const legalUsers = usersList.filter(u => u.role === 'LEGAL_AUDITOR');

  return (
    <div className="space-y-8 pb-16">
      {/* Super Admin Top Header */}
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
                  Tejas (Master Super Admin)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Session</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Root System Controller • Master Key: <span className="text-amber-400 font-mono">tejastej094@gmail.com</span> • Full CRUD & Role Governance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateLegalModalOpen(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-950/50 flex items-center space-x-2 transition"
            >
              <Scale className="w-4 h-4" />
              <span>+ Create Legal Team Account</span>
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center space-x-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-semibold">Total Accounts</span>
            <span className="text-xl font-black text-white">{usersList.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-teal-400 block font-semibold">Legal Team Auditors</span>
            <span className="text-xl font-black text-teal-300">{legalUsers.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-indigo-400 block font-semibold">Active Developers</span>
            <span className="text-xl font-black text-indigo-300">{developerUsers.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-emerald-400 block font-semibold">Live Townships</span>
            <span className="text-xl font-black text-emerald-300">{townships.length}</span>
          </div>
        </div>
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
          <span>User & Legal Team Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plots_devs')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'plots_devs' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Developer & Plot Governance</span>
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
          <span>Admin Password & Credentials Reset</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Platform Escrow GMV</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-white">₹148.5 Cr</span>
                <span className="text-xs text-emerald-400 font-bold">+18.4% MoM</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Plotted Townships Active</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-indigo-400">{townships.length}</span>
                <span className="text-xs text-slate-400">100% 3D Mapped</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Legal Compliance Officers</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-teal-400">{legalUsers.length}</span>
                <span className="text-xs text-teal-300">Bar Certified</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Token Advances Locked</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-black text-amber-400">₹42.5 Lakh</span>
                <span className="text-xs text-emerald-400 font-bold">100% Refundable</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab('users')}
              className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-teal-300">Manage Legal Team Accounts</h4>
              <p className="text-xs text-slate-400">Create new advocate accounts, toggle active/deactivated status, or reset credentials.</p>
            </div>

            <div 
              onClick={() => setActiveTab('plots_devs')}
              className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">Remove Developers & Plots</h4>
              <p className="text-xs text-slate-400">Remove non-compliant developers or purge invalid plots across all townships.</p>
            </div>

            <div 
              onClick={() => setActiveTab('admin_creds')}
              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Reset Super Admin Credentials</h4>
              <p className="text-xs text-slate-400">Update master password or PIN anytime with transactional mailer to tejastej094@gmail.com.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Registered User Directory & Roles</h3>
                <p className="text-xs text-slate-400">
                  Manage Legal Team accounts, Developers, and Buyers. You can create accounts, toggle active/deactivated status, reset passwords, or remove accounts.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCreateLegalModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-950/40 flex items-center space-x-1.5 transition flex-shrink-0"
                >
                  <Scale className="w-4 h-4" />
                  <span>+ Create Legal Account</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search name, email, Bar Council ID..."
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
                  <option value="ALL" className="bg-slate-900">All Roles ({usersList.length})</option>
                  <option value="LEGAL_AUDITOR" className="bg-slate-900">Legal Auditors ({legalUsers.length})</option>
                  <option value="DEVELOPER" className="bg-slate-900">Developers ({developerUsers.length})</option>
                  <option value="BUYER" className="bg-slate-900">Buyers</option>
                  <option value="SUPER_ADMIN" className="bg-slate-900">Super Admin</option>
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
                  <option value="ALL" className="bg-slate-900">All Account Statuses</option>
                  <option value="Active" className="bg-slate-900">Active</option>
                  <option value="Deactivated" className="bg-slate-900">Deactivated</option>
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
                    <th className="p-4 font-bold">User Identity & Details</th>
                    <th className="p-4 font-bold">Assigned Role</th>
                    <th className="p-4 font-bold">Bar Council Reg / Entity</th>
                    <th className="p-4 font-bold">Account Status</th>
                    <th className="p-4 font-bold text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No user accounts match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuperAdmin = user.email === 'tejastej094@gmail.com';
                      const isActive = user.status === 'Active';

                      return (
                        <tr key={user.uid} className="hover:bg-slate-900/40 transition">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : user.role === 'LEGAL_AUDITOR'
                                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                  : user.role === 'DEVELOPER'
                                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {user.role === 'SUPER_ADMIN' ? 'A' : user.role === 'LEGAL_AUDITOR' ? 'L' : user.role === 'DEVELOPER' ? 'D' : 'B'}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{user.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
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
                                  : user.role === 'LEGAL_AUDITOR'
                                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                                  : user.role === 'DEVELOPER'
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {user.role}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-slate-300">
                            {user.barCouncilId ? (
                              <span className="text-teal-300 font-mono text-[11px] font-semibold">{user.barCouncilId}</span>
                            ) : (
                              <span>{user.company || 'Individual Account'}</span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center w-fit ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}>
                                {isActive ? '● Active' : '● Deactivated'}
                              </span>
                              {user.isTemporaryPassword && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center space-x-1 w-fit">
                                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Temp Pwd Active</span>
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Staff Temporary Password One-Click Generator Trigger */}
                              {isStaffUser(user) && !isSuperAdmin && (
                                <button
                                  onClick={() => handleGenerateStaffTempPassword(user)}
                                  title="Generate Temporary Password for Staff Account"
                                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-white rounded-lg transition text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Temp Password</span>
                                </button>
                              )}

                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  setResetPasswordModalUser(user);
                                  setNewPasswordForUser(isStaffUser(user) ? generateStaffTempPassword(user.role) : '');
                                }}
                                title="Reset User Password"
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 rounded-lg transition text-[11px] font-bold flex items-center space-x-1"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reset Password</span>
                              </button>

                              {/* Toggle Active / Deactivate */}
                              {!isSuperAdmin && (
                                <button
                                  onClick={() => handleToggleUserStatus(user.uid)}
                                  title={isActive ? 'Deactivate User Account' : 'Activate User Account'}
                                  className={`px-2.5 py-1.5 border rounded-lg transition text-[11px] font-bold flex items-center space-x-1 ${
                                    isActive 
                                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400' 
                                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                                  }`}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                                </button>
                              )}

                              {/* Delete Account */}
                              {!isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(user.uid, user.email)}
                                  title="Permanently Delete User"
                                  className="p-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
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

      {/* ================= TAB 3: DEVELOPER & PLOT GOVERNANCE ================= */}
      {activeTab === 'plots_devs' && (
        <div className="space-y-6">
          {/* Section 1: Developer Management & Removal */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>Registered Developers ({developerUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Super Admin authority to monitor registered builders, revoke licenses, or completely remove developers from PlotFlow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {developerUsers.map((dev) => (
                <div key={dev.uid} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white block text-sm">{dev.name}</span>
                      <span className="text-xs text-indigo-400 font-medium">{dev.company || 'Builder Partner'}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{dev.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      dev.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {dev.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleUserStatus(dev.uid)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                    >
                      {dev.status === 'Active' ? 'Suspend Access' : 'Reactivate'}
                    </button>

                    <button
                      onClick={() => handleRemoveDeveloper(dev)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold rounded-lg transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Developer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Master Plot Inventory & Removal */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Master Plot Directory & Removal Authority</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Search and remove specific plots across any township or delete entire project enclaves.
                </p>
              </div>

              {/* Township & Search Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search plot number, facing..."
                    value={plotSearchQuery}
                    onChange={(e) => setPlotSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedTownshipFilter}
                  onChange={(e) => setSelectedTownshipFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Townships</option>
                  {townships.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plots Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="p-3.5 font-bold">Plot Identifier</th>
                    <th className="p-3.5 font-bold">Township & Developer</th>
                    <th className="p-3.5 font-bold">Dimensions & Area</th>
                    <th className="p-3.5 font-bold">Vastu / Facing</th>
                    <th className="p-3.5 font-bold">Price Guide</th>
                    <th className="p-3.5 font-bold">Legal Clearance</th>
                    <th className="p-3.5 font-bold text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {allPlotsAcrossTownships.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No plots listed or matching search filter.
                      </td>
                    </tr>
                  ) : (
                    allPlotsAcrossTownships.map((plot) => (
                      <tr key={`${plot.townshipId}_${plot.id}`} className="hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-bold text-white">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-2"></span>
                          <span>{plot.number}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white font-semibold block">{plot.townshipName}</span>
                          <span className="text-[10px] text-slate-400">{plot.developerName}</span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {plot.dimensions} ({plot.areaSqFt} sq.ft)
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-semibold">
                            {plot.facing}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-400">
                          ₹{(plot.price / 100000).toFixed(1)} L
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            (plot.legalStatus || 'Approved') === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {plot.legalStatus || 'Approved'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleAdminRemovePlot(plot.townshipId, plot.id, plot.number)}
                            className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ml-auto"
                            title="Remove Plot from Inventory"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Plot</span>
                          </button>
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

      {/* ================= TAB 4: ADMIN PASSWORD & MAILER ================= */}
      {activeTab === 'admin_creds' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Super Admin Password & Credentials Reset</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reset your master login password and PIN anytime. An encrypted access package is automatically dispatched to <strong>tejastej094@gmail.com</strong>.
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
                    <label className="text-slate-400 font-semibold block mb-1">Super Admin Email (Master)</label>
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

      {/* ================= TAB 5: SITE-WIDE SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Platform Settings & Global Parameters</h3>
              <p className="text-xs text-slate-400">Configure escrow fees, RERA gate strictness, and legal audit rules.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition"
            >
              Save Configuration
            </button>
          </div>

          {settingsSavedAlert && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Platform configurations saved and deployed site-wide.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="font-bold text-white text-sm">Escrow & Financial Controls</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Standard Token Advance (INR)</label>
                  <input
                    type="number"
                    value={siteSettings.tokenAmount}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tokenAmount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Platform Convenience Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={siteSettings.platformFeePercentage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, platformFeePercentage: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="font-bold text-white text-sm">Statutory Legal Strictness Policy</h4>
              <div className="space-y-3 text-slate-300">
                <label className="flex items-center space-x-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Enforce Strict Legal Gate: Hide plots from retail buyers until approved by Legal Team.</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Mandate 30-Year Encumbrance Certificate (Form 15) verification.</span>
                </label>
              </div>
            </div>
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

      {/* MODAL 1: Create Legal Team User Account */}
      {isCreateLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-teal-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-teal-400">
                <Scale className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Create Legal Team Account</h3>
              </div>
              <button onClick={() => setIsCreateLegalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLegalUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Advocate / Auditor Full Name *</label>
                <input
                  type="text"
                  required
                  value={legalForm.name}
                  onChange={(e) => setLegalForm({ ...legalForm, name: e.target.value })}
                  placeholder="e.g. Advocate Rajeshwari Iyer"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Legal Team Email ID (Login) *</label>
                <input
                  type="email"
                  required
                  value={legalForm.email}
                  onChange={(e) => setLegalForm({ ...legalForm, email: e.target.value })}
                  placeholder="advocate.iyer@plotflow.in"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Initial Login Password *</label>
                <input
                  type="text"
                  required
                  value={legalForm.password}
                  onChange={(e) => setLegalForm({ ...legalForm, password: e.target.value })}
                  placeholder="Legal@2026"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bar Council Registration Number *</label>
                <input
                  type="text"
                  required
                  value={legalForm.barCouncilId}
                  onChange={(e) => setLegalForm({ ...legalForm, barCouncilId: e.target.value })}
                  placeholder="KAR/1482/2012"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={legalForm.phone}
                  onChange={(e) => setLegalForm({ ...legalForm, phone: e.target.value })}
                  placeholder="+91 98450 99881"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Audit Specialization</label>
                <input
                  type="text"
                  value={legalForm.specialization}
                  onChange={(e) => setLegalForm({ ...legalForm, specialization: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-950/40 transition mt-3"
              >
                Create Legal Auditor Account & Activate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reset User Password Modal */}
      {resetPasswordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Key className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reset User Password</h3>
              </div>
              <button onClick={() => setResetPasswordModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetUserPasswordSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[11px]">Target Account:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    resetPasswordModalUser.role === 'SUPER_ADMIN'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : resetPasswordModalUser.role === 'LEGAL_AUDITOR'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : resetPasswordModalUser.role === 'DEVELOPER'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {resetPasswordModalUser.role} {isStaffUser(resetPasswordModalUser) ? '• Staff' : ''}
                  </span>
                </div>
                <span className="text-white font-bold block">{resetPasswordModalUser.name}</span>
                <span className="text-amber-400 font-mono text-[11px] block">{resetPasswordModalUser.email}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold block">New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const temp = generateStaffTempPassword(resetPasswordModalUser.role);
                      setNewPasswordForUser(temp);
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 underline"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto-Generate Temp Password</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPasswordForUser}
                  onChange={(e) => setNewPasswordForUser(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {isStaffUser(resetPasswordModalUser) && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Staff accounts will receive this temporary credential. They can log in immediately with this access key.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalUser(null)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow"
                >
                  Save & Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Temporary Password Display Modal */}
      {tempPasswordModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-amber-500/60 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Temporary Password Generated</h3>
                  <p className="text-xs text-slate-400">Staff access credential issued & stored securely</p>
                </div>
              </div>
              <button onClick={() => setTempPasswordModalData(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Holder</span>
                  <span className="font-bold text-white">{tempPasswordModalData.user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email Address</span>
                  <span className="font-mono text-amber-400 font-bold">{tempPasswordModalData.user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Role</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                    {tempPasswordModalData.user.role} (Staff)
                  </span>
                </div>
              </div>

              {/* Temporary Password Box */}
              <div className="bg-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-4 text-center space-y-2">
                <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                  Generated Temporary Access Password
                </span>
                <div className="bg-slate-950 border border-amber-500/40 rounded-xl py-3 px-4 flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-amber-400 select-all">
                    {tempPasswordModalData.tempPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPasswordModalData.tempPassword);
                      setTempPasswordModalData(prev => ({ ...prev, copied: true }));
                      setTimeout(() => {
                        setTempPasswordModalData(prev => prev ? ({ ...prev, copied: false }) : null);
                      }, 2500);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      tempPasswordModalData.copied
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {tempPasswordModalData.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <p className="font-semibold text-slate-300">📌 Staff Sign-In Guidance:</p>
                <p>• The staff member can use their registered email and this temporary password to log in directly.</p>
                <p>• A security audit dispatch log has been automatically recorded in the platform security registry.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setTempPasswordModalData(null)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Generic Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Provision User Account</h3>
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
                  placeholder="e.g. Vikramaditya Sharma"
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
                Create User Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
