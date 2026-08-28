import React, { useState, useEffect } from 'react';
import AdminDashboard from '../components/AdminDashboard';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Building2, 
  FileText, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Key, 
  Lock, 
  Mail, 
  DollarSign, 
  Sliders, 
  Eye, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getAdminCredentials, 
  updateAdminCredentials,
  resetStaffTemporaryPassword,
  updateUserPasswordByAdmin,
  toggleUserStatusByAdmin,
  removeUserAccountByAdmin,
  createLegalTeamUser,
  registerNewUser,
  getEmailDispatchLogs
} from '../services/userService';
import { 
  getSiteSettings, 
  saveSiteSettings, 
  getHomepageSections, 
  saveHomepageSections,
  getStoredAuditLogs,
  addAuditLog,
  getStoredLeads,
  saveStoredLeads,
  deleteLead,
  resetPlatformToDefaults
} from '../services/storeService';

export default function AdminPanel({ 
  currentUser,
  townships = [], 
  onUpdateTownship, 
  onAddTownship, 
  onRemoveTownship,
  onExploreMarketplace
}) {
  const [activeTab, setActiveTab] = useState('overview'); 
  // 'overview' | 'townships' | 'plots' | 'users' | 'documents' | 'leads' | 'cms' | 'sections' | 'economics' | 'audit_logs'

  // Platform Data
  const [usersList, setUsersList] = useState(() => getStoredUsers());
  const [siteSettings, setSiteSettingsState] = useState(() => getSiteSettings());
  const [homepageSections, setHomepageSectionsState] = useState(() => getHomepageSections());
  const [auditLogs, setAuditLogs] = useState(() => getStoredAuditLogs());
  const [leadsList, setLeadsList] = useState(() => getStoredLeads());
  const [emailLogs, setEmailLogs] = useState(() => getEmailDispatchLogs());

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [townshipSearch, setTownshipSearch] = useState('');
  const [selectedTsForPlotMgmt, setSelectedTsForPlotMgmt] = useState(townships[0]?.id || 'ts_01');

  // Modals & Triggers
  const [showAddTownshipModal, setShowAddTownshipModal] = useState(false);
  const [editingTownship, setEditingTownship] = useState(null);
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [tempPasswordResult, setTempPasswordResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  // Form State: Add / Edit Township
  const [townshipForm, setTownshipForm] = useState({
    id: '',
    name: '',
    developer: 'Prestige Plotted Townships',
    location: 'Sarjapur Corridor, Bengaluru',
    city: 'Bengaluru',
    totalAcres: '35 Acres',
    pricePerSqFt: 4200,
    priceRange: '₹50 Lakh - ₹1.2 Cr',
    approvalAuthority: 'BMRDA & K-RERA Sanctioned',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1250/303/PR/260826/009123',
    possessionDate: 'Ready for Registration',
    rating: 4.9,
    reviewsCount: 45,
    isFeatured: true,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    description: 'Master-planned luxury plotted development with 100% underground utilities, 40-ft asphalt roads, and 30-year verified title clearances.',
    amenities: [
      'Clubhouse & Gym',
      'Underground Electrical Piping',
      '40-ft Wide Asphalt Roads',
      '24/7 Gated Security & RFID'
    ]
  });

  // Form State: Add Plot
  const [plotForm, setPlotForm] = useState({
    plotNumber: 'Plot 115',
    dimensions: '30 x 40 ft',
    sqft: 1200,
    facing: 'East Facing',
    pricePerSqFt: 4500,
    price: '₹54.0 Lakh',
    status: 'Available',
    elevation: 'Clubhouse View',
    vastuScore: 9.8,
    legalStatus: 'Approved'
  });

  // Form State: Add User
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: 'User@2026',
    phone: '+91 98000 12345',
    role: 'BUYER',
    company: '',
    specialization: '30-Yr Land Title Search'
  });

  // Refresh data on custom events
  useEffect(() => {
    const handleUsersUpdate = (e) => setUsersList(e.detail || getStoredUsers());
    const handleSettingsUpdate = (e) => setSiteSettingsState(e.detail || getSiteSettings());
    const handleSectionsUpdate = (e) => setHomepageSectionsState(e.detail || getHomepageSections());
    const handleLeadsUpdate = (e) => setLeadsList(e.detail || getStoredLeads());
    const handleAuditUpdate = () => setAuditLogs(getStoredAuditLogs());

    window.addEventListener('plotflow_users_updated', handleUsersUpdate);
    window.addEventListener('plotflow_settings_updated', handleSettingsUpdate);
    window.addEventListener('plotflow_sections_updated', handleSectionsUpdate);
    window.addEventListener('plotflow_leads_updated', handleLeadsUpdate);
    window.addEventListener('plotflow_townships_updated', handleAuditUpdate);

    return () => {
      window.removeEventListener('plotflow_users_updated', handleUsersUpdate);
      window.removeEventListener('plotflow_settings_updated', handleSettingsUpdate);
      window.removeEventListener('plotflow_sections_updated', handleSectionsUpdate);
      window.removeEventListener('plotflow_leads_updated', handleLeadsUpdate);
      window.removeEventListener('plotflow_townships_updated', handleAuditUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // TOWNSHIP CRUD HANDLERS
  // ----------------------------------------------------
  const handleOpenAddTownship = () => {
    setTownshipForm({
      id: `ts_${Date.now()}`,
      name: '',
      developer: 'Prestige Plotted Townships',
      location: 'Sarjapur Corridor, Bengaluru',
      city: 'Bengaluru',
      totalAcres: '35 Acres',
      pricePerSqFt: 4200,
      priceRange: '₹50 Lakh - ₹1.2 Cr',
      approvalAuthority: 'BMRDA & K-RERA Sanctioned',
      reraApproved: true,
      reraId: 'PRM/KA/RERA/1250/303/PR/260826/009123',
      possessionDate: 'Ready for Registration',
      rating: 4.9,
      reviewsCount: 1,
      isFeatured: true,
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      description: 'Master-planned luxury plotted development with 100% underground utilities, 40-ft asphalt boulevards, and 30-year verified title clearances.',
      amenities: [
        'Clubhouse & Gym',
        'Underground Electrical Piping',
        '40-ft Wide Asphalt Roads',
        '24/7 Gated Security & RFID'
      ],
      plots: [
        {
          id: `p_${Date.now()}_1`,
          plotNumber: 'Plot 101',
          sqft: 1200,
          dimensions: '30 x 40 ft',
          facing: 'East Facing',
          pricePerSqFt: 4200,
          price: '₹50.4 Lakh',
          status: 'Available',
          elevation: 'Clubhouse Front',
          vastuScore: 9.8,
          legalStatus: 'Approved'
        },
        {
          id: `p_${Date.now()}_2`,
          plotNumber: 'Plot 102',
          sqft: 1500,
          dimensions: '30 x 50 ft',
          facing: 'North Facing',
          pricePerSqFt: 4200,
          price: '₹63.0 Lakh',
          status: 'Available',
          elevation: 'Park Facing',
          vastuScore: 9.9,
          legalStatus: 'Approved'
        }
      ]
    });
    setEditingTownship(null);
    setShowAddTownshipModal(true);
  };

  const handleOpenEditTownship = (ts) => {
    setTownshipForm({ ...ts });
    setEditingTownship(ts);
    setShowAddTownshipModal(true);
  };

  const handleSaveTownship = (e) => {
    e.preventDefault();
    if (!townshipForm.name.trim()) {
      alert('Please provide a township name.');
      return;
    }

    if (editingTownship) {
      onUpdateTownship(townshipForm);
      addAuditLog('TOWNSHIP_UPDATED', currentUser?.email || 'Super Admin', townshipForm.name, 'Updated layout metadata, pricing, or RERA credentials.', 'SUCCESS');
      showToast(`Township "${townshipForm.name}" updated successfully.`);
    } else {
      const newTs = {
        ...townshipForm,
        id: townshipForm.id || `ts_${Date.now()}`,
        totalPlots: townshipForm.plots?.length || 2,
        availablePlots: townshipForm.plots?.filter(p => p.status === 'Available').length || 2
      };
      onAddTownship(newTs);
      addAuditLog('TOWNSHIP_CREATED', currentUser?.email || 'Super Admin', newTs.name, 'Created new verified plotted township with initial inventory.', 'SUCCESS');
      showToast(`New township "${newTs.name}" created.`);
    }
    setShowAddTownshipModal(false);
  };

  const handleDeleteTownship = (tsId, tsName) => {
    if (window.confirm(`Are you sure you want to permanently delete township "${tsName}"? All associated plots and records will be removed.`)) {
      onRemoveTownship(tsId);
      addAuditLog('TOWNSHIP_DELETED', currentUser?.email || 'Super Admin', tsName, `Permanently deleted township ID: ${tsId}.`, 'DANGER');
      showToast(`Township "${tsName}" deleted.`);
    }
  };

  // ----------------------------------------------------
  // PLOT CRUD HANDLERS
  // ----------------------------------------------------
  const currentTsForPlots = townships.find(t => t.id === selectedTsForPlotMgmt) || townships[0];

  const handleAddPlot = (e) => {
    e.preventDefault();
    if (!currentTsForPlots) return;

    const newPlot = {
      id: `p_${Date.now()}`,
      plotNumber: plotForm.plotNumber.trim(),
      dimensions: plotForm.dimensions.trim(),
      sqft: parseInt(plotForm.sqft) || 1200,
      facing: plotForm.facing,
      pricePerSqFt: parseInt(plotForm.pricePerSqFt) || currentTsForPlots.pricePerSqFt || 4500,
      price: plotForm.price || `₹${((parseInt(plotForm.sqft) * 4500) / 100000).toFixed(1)} Lakh`,
      status: plotForm.status,
      elevation: plotForm.elevation,
      vastuScore: parseFloat(plotForm.vastuScore) || 9.5,
      legalStatus: plotForm.legalStatus
    };

    const updatedPlots = [...(currentTsForPlots.plots || []), newPlot];
    const availableCount = updatedPlots.filter(p => p.status === 'Available').length;

    const updatedTs = {
      ...currentTsForPlots,
      plots: updatedPlots,
      totalPlots: updatedPlots.length,
      availablePlots: availableCount
    };

    onUpdateTownship(updatedTs);
    addAuditLog('PLOT_ADDED', currentUser?.email || 'Super Admin', `${currentTsForPlots.name} - ${newPlot.plotNumber}`, `Added ${newPlot.sqft} sq.ft plot (${newPlot.facing}) at ${newPlot.price}.`, 'SUCCESS');
    showToast(`Added ${newPlot.plotNumber} to ${currentTsForPlots.name}.`);
    setShowAddPlotModal(false);
  };

  const handleDeletePlot = (plotId, plotNum) => {
    if (!currentTsForPlots) return;
    if (window.confirm(`Delete ${plotNum} from ${currentTsForPlots.name}?`)) {
      const updatedPlots = (currentTsForPlots.plots || []).filter(p => p.id !== plotId);
      const availableCount = updatedPlots.filter(p => p.status === 'Available').length;

      const updatedTs = {
        ...currentTsForPlots,
        plots: updatedPlots,
        totalPlots: updatedPlots.length,
        availablePlots: availableCount
      };

      onUpdateTownship(updatedTs);
      addAuditLog('PLOT_DELETED', currentUser?.email || 'Super Admin', `${currentTsForPlots.name} - ${plotNum}`, `Deleted plot ID: ${plotId}.`, 'WARNING');
      showToast(`Deleted ${plotNum}.`);
    }
  };

  // ----------------------------------------------------
  // USER GOVERNANCE HANDLERS
  // ----------------------------------------------------
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      alert('Please fill in user name and email.');
      return;
    }

    try {
      if (newUserForm.role === 'LEGAL_AUDITOR') {
        createLegalTeamUser({
          name: newUserForm.name,
          email: newUserForm.email,
          password: newUserForm.password,
          phone: newUserForm.phone,
          specialization: newUserForm.specialization
        });
      } else {
        await registerNewUser({
          name: newUserForm.name,
          email: newUserForm.email,
          password: newUserForm.password,
          phone: newUserForm.phone,
          role: newUserForm.role,
          company: newUserForm.company
        });
      }
      setUsersList(getStoredUsers());
      showToast(`User ${newUserForm.name} (${newUserForm.role}) created successfully.`);
      setShowAddUserModal(false);
    } catch (err) {
      alert(`Error creating user: ${err.message}`);
    }
  };

  const handleResetStaffPassword = (user) => {
    const res = resetStaffTemporaryPassword(user.uid || user.email);
    if (res.success) {
      setTempPasswordResult(res);
      setShowResetPasswordModal(true);
      setUsersList(getStoredUsers());
      showToast(`Temporary password generated for ${user.name}`);
    } else {
      alert(res.error || 'Failed to generate temporary password.');
    }
  };

  const handleToggleUserStatus = (userId) => {
    const res = toggleUserStatusByAdmin(userId);
    setUsersList(res.users);
    showToast(`User status updated to ${res.status}`);
  };

  const handleDeleteUser = (user) => {
    if (user.email === 'tejastej094@gmail.com') {
      alert('Master Super Admin account cannot be deleted.');
      return;
    }
    if (window.confirm(`Permanently delete user account "${user.name}" (${user.email})?`)) {
      const res = removeUserAccountByAdmin(user.uid);
      setUsersList(res.users);
      showToast(`User ${user.name} removed from platform.`);
    }
  };

  const handleDeleteLead = (lead) => {
    if (window.confirm(`Permanently delete lead inquiry for "${lead.buyerName}"?`)) {
      const updated = deleteLead(lead.id);
      setLeadsList(updated);
      showToast(`Lead for "${lead.buyerName}" deleted.`);
    }
  };

  // ----------------------------------------------------
  // CMS & BRANDING HANDLERS
  // ----------------------------------------------------
  const handleSaveSiteSettings = (e) => {
    e.preventDefault();
    saveSiteSettings(siteSettings);
    addAuditLog('CMS_SETTINGS_SAVED', currentUser?.email || 'Super Admin', 'Branding & Platform CMS', 'Updated homepage hero text, announcement banner, or contact details.', 'SUCCESS');
    showToast('Platform branding and CMS settings saved.');
  };

  const handleToggleSection = (sectionId) => {
    const updated = homepageSections.map(s => {
      if (s.id === sectionId) return { ...s, enabled: !s.enabled };
      return s;
    });
    setHomepageSectionsState(updated);
    saveHomepageSections(updated);
    showToast('Homepage section visibility updated.');
  };

  const handleSystemReset = () => {
    if (window.confirm('CRITICAL WARNING: This will reset all platform settings, townships, plots, documents, and leads to verified starter data. Continue?')) {
      resetPlatformToDefaults();
      setUsersList(getStoredUsers());
      setSiteSettingsState(getSiteSettings());
      setHomepageSectionsState(getHomepageSections());
      setAuditLogs(getStoredAuditLogs());
      setLeadsList(getStoredLeads());
      showToast('Platform successfully reset to clean starter data.');
    }
  };

  return (
    <AdminDashboard
      user={currentUser}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onExploreMarketplace={onExploreMarketplace}
      badgeCounts={{
        townships: townships.length,
        users: usersList.length,
        leads: leadsList.length,
        plots: townships.reduce((acc, t) => acc + (t.plots?.length || t.totalPlots || 0), 0),
        audit_logs: auditLogs.length
      }}
    >
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

      {/* Admin Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Master Control Center & CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">PlotFlow Platform Governance</h1>
            <p className="text-xs text-slate-400">
              Manage townships, live plot inventory, user accounts, temporary passwords, CMS branding, and audit logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenAddTownship}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Township</span>
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
            <button
              onClick={onExploreMarketplace}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live Site</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Active Townships</span>
            <span className="text-lg font-black text-white mt-0.5 block">{townships.length} Communities</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Total Master Plots</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">
              {townships.reduce((acc, t) => acc + (t.plots?.length || t.totalPlots || 0), 0)} Plots
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Registered Users</span>
            <span className="text-lg font-black text-indigo-400 mt-0.5 block">{usersList.length} Accounts</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Captured Leads</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">{leadsList.length} Inquiries</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', name: 'Overview', icon: TrendingUp },
          { id: 'townships', name: `Townships (${townships.length})`, icon: Building2 },
          { id: 'plots', name: 'Plot Inventory', icon: Layers },
          { id: 'developers', name: 'Builder Governance', icon: Building2 },
          { id: 'leads', name: `Buyer CRM (${leadsList.length})`, icon: Mail },
          { id: 'legal_vault', name: 'Legal Vault Control', icon: ShieldCheck },
          { id: 'users', name: `Users & Staff (${usersList.length})`, icon: Users },
          { id: 'cms', name: 'Site CMS & Branding', icon: Settings },
          { id: 'sections', name: 'Homepage Sections', icon: Sliders },
          { id: 'audit_logs', name: 'Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 flex-shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Actions & Super Admin Credentials */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Master Administrator Account</span>
                </h3>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master Super Admin:</span>
                    <strong className="text-white">Tejas (tejastej094@gmail.com)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role Authority:</span>
                    <span className="text-amber-400 font-bold">SUPER_ADMIN (Level 1 Master)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security PIN:</span>
                    <span className="font-mono text-emerald-400 font-bold">2026</span>
                  </div>
                </div>
              </div>

              {/* Recent Leads */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Recent Buyer & Investor Leads</h3>
                  <button onClick={() => setActiveTab('leads')} className="text-xs text-emerald-400 font-bold hover:underline">
                    View All Leads ({leadsList.length}) →
                  </button>
                </div>
                <div className="space-y-2">
                  {leadsList.slice(0, 3).map(lead => (
                    <div key={lead.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{lead.buyerName}</span>
                        <span className="text-[11px] text-slate-400">{lead.phone} • {lead.townshipName}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Emergency Reset & System Utilities */}
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Database className="w-4 h-4 text-rose-400" />
                  <span>Platform Data Reset</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reset the platform anytime to default verified starter townships, plots, documents, and user accounts.
                </p>
                <button
                  onClick={handleSystemReset}
                  className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Platform to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: TOWNSHIPS MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'townships' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white">Plotted Townships Directory ({townships.length})</h3>
            <button
              onClick={handleOpenAddTownship}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Township</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {townships.map(ts => (
              <div key={ts.id} className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div className="relative h-44">
                  <img src={ts.image} alt={ts.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {ts.approvalAuthority || 'RERA Sanctioned'}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl">
                    ₹{ts.pricePerSqFt}/sq.ft
                  </span>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{ts.developer}</span>
                    <h4 className="text-base font-bold text-white">{ts.name}</h4>
                    <p className="text-xs text-slate-400">{ts.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
                    <div className="bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Total Extent</span>
                      <span className="font-bold text-white">{ts.totalAcres}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Plots</span>
                      <span className="font-bold text-emerald-400">{ts.availablePlots || 0} / {ts.totalPlots || 0}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEditTownship(ts)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTownship(ts.id, ts.name)}
                      className="py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: PLOT INVENTORY */}
      {/* ==================================================== */}
      {activeTab === 'plots' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Master Plot Directory & Status Manager</h3>
              <p className="text-xs text-slate-400">Add, edit pricing, update status, and manage individual plots.</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedTsForPlotMgmt}
                onChange={(e) => setSelectedTsForPlotMgmt(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {townships.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowAddPlotModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plot</span>
              </button>
            </div>
          </div>

          {/* Plots Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Plot #</th>
                  <th className="pb-3">Dimensions</th>
                  <th className="pb-3">Area (Sq.ft)</th>
                  <th className="pb-3">Facing</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Vastu</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(currentTsForPlots?.plots || []).map((plot) => (
                  <tr key={plot.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 font-bold text-white">{plot.plotNumber || plot.number}</td>
                    <td className="py-3 text-slate-300 font-mono">{plot.dimensions || plot.dimension}</td>
                    <td className="py-3 text-slate-300 font-bold">{plot.sqft || 1200} sq.ft</td>
                    <td className="py-3 text-emerald-400 font-semibold">{plot.facing}</td>
                    <td className="py-3 font-bold text-white">{plot.price}</td>
                    <td className="py-3 font-bold text-amber-400">{plot.vastuScore || '9.5'}/10</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plot.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {plot.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeletePlot(plot.id, plot.plotNumber || plot.number)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: USERS & STAFF GOVERNANCE */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Platform Users & Staff Governance</h3>
              <p className="text-xs text-slate-400">View users, reset passwords, generate temporary staff keys, and manage roles.</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Name & Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Sign-in</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((user) => (
                  <tr key={user.uid || user.email} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        user.role === 'SUPER_ADMIN' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        user.role === 'LEGAL_AUDITOR' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                        user.role === 'DEVELOPER' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">{user.lastSignIn || 'Recent'}</td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleResetStaffPassword(user)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-[11px] font-bold rounded-lg transition"
                        title="Generate Temporary Password"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.uid)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition"
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.email !== 'tejastej094@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB: BUILDER & DEVELOPER GOVERNANCE */}
      {/* ==================================================== */}
      {activeTab === 'developers' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Developer SaaS & Builder Governance</h3>
              </div>
              <p className="text-xs text-slate-400">
                Approve builder township submissions, manage developer commission rates, verify developer licenses, and inspect the developer portal.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('plotflow_switch_portal', { detail: { portal: 'developer' } }));
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Developer Portal View</span>
              </button>
            </div>
          </div>

          {/* Builder Management Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] block">Verified Builder Partners</span>
              <span className="text-xl font-black text-white block">
                {usersList.filter(u => u.role === 'DEVELOPER').length || 1} Builders
              </span>
              <span className="text-[10px] text-emerald-400">100% RERA & BMRDA Sanctioned</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] block">Builder Listings Published</span>
              <span className="text-xl font-black text-indigo-400 block">{townships.length} Townships</span>
              <span className="text-[10px] text-indigo-300">Live on Buyer Marketplace</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px] block">Platform Marketplace Commission</span>
              <span className="text-xl font-black text-amber-400 block">1.5% Standard Fee</span>
              <span className="text-[10px] text-amber-300">Automatic Escrow Payouts</span>
            </div>
          </div>

          {/* Townships Project Approvals Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Developer Township Submissions & Publication Status
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Township Name</th>
                    <th className="pb-3">Developer Brand</th>
                    <th className="pb-3">Total Area / Plots</th>
                    <th className="pb-3">RERA Status</th>
                    <th className="pb-3">Marketplace Visibility</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {townships.map(ts => (
                    <tr key={ts.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 font-bold text-white flex items-center space-x-2">
                        <span>{ts.name}</span>
                        {ts.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                            FEATURED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">{ts.developer || 'Prestige Plotted Townships'}</td>
                      <td className="py-3.5 text-slate-400">
                        {ts.totalAcres || '35 Acres'} • {ts.plots?.length || ts.totalPlots || 0} Plots
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          ts.reraApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {ts.reraApproved ? 'RERA Approved' : 'In Review'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => {
                            const updated = {
                              ...ts,
                              status: ts.status === 'Published' ? 'Draft' : 'Published'
                            };
                            onUpdateTownship(updated);
                            addAuditLog(
                              'MARKETPLACE_STATUS_TOGGLED',
                              currentUser?.email || 'Super Admin',
                              ts.name,
                              `Changed marketplace status to ${updated.status}.`,
                              'INFO'
                            );
                            showToast(`Visibility for "${ts.name}" set to ${updated.status}.`);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                            ts.status === 'Published'
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                          }`}
                        >
                          {ts.status === 'Published' ? '● Published on Buyer Web' : '○ Hidden (Draft)'}
                        </button>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditTownship(ts)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition"
                        >
                          Edit Details
                        </button>
                        <button
                          onClick={() => {
                            const updated = {
                              ...ts,
                              isFeatured: !ts.isFeatured
                            };
                            onUpdateTownship(updated);
                            showToast(`Featured status for "${ts.name}" updated.`);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-bold rounded-lg transition"
                        >
                          {ts.isFeatured ? 'Unfeature' : 'Feature on Hero'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB: LEGAL VAULT & COMPLIANCE GOVERNANCE */}
      {/* ==================================================== */}
      {activeTab === 'legal_vault' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">5-Layer Legal Vault & Compliance Control</h3>
              </div>
              <p className="text-xs text-slate-400">
                Master administrative review of statutory title documents, Kaveri 2.0 Encumbrance Certificates, DC Conversions, and RERA certifications.
              </p>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('plotflow_switch_portal', { detail: { portal: 'legal' } }));
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Launch Legal Team Portal Workspace</span>
            </button>
          </div>

          {/* Township Selector for Legal Audit */}
          <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Township to Audit:</span>
            <select
              value={selectedTsForPlotMgmt}
              onChange={(e) => setSelectedTsForPlotMgmt(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
            >
              {townships.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
              ))}
            </select>
          </div>

          {/* 5-Layer Statutory Verification Layers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { layer: 'Layer 1', name: '30-Year Title Search & Chain of Title', authority: 'Sub-Registrar Bangalore', status: 'Verified Clear Title', verified: true },
              { layer: 'Layer 2', name: 'Kaveri 2.0 Nil Encumbrance Certificate (Form 15)', authority: 'Stamps & Registration Dept', status: 'Zero Liens or Mortgages', verified: true },
              { layer: 'Layer 3', name: 'Revenue RTC / Pahani Mutation (Forms 4 & 16)', authority: 'Revenue Department (Bhoomi)', status: 'Clear Khata & Ownership', verified: true },
              { layer: 'Layer 4', name: 'DC Conversion (Section 95 KLR Act 1964)', authority: 'Deputy Commissioner Bangalore', status: 'Non-Agri Residential Order', verified: true },
              { layer: 'Layer 5', name: 'RERA & BDA/BMRDA Sanctioned Layout', authority: 'Karnataka Real Estate Authority', status: 'Sanctioned Masterplan', verified: true }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">{item.layer}</span>
                  <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  <span className="text-[11px] text-slate-400 block">{item.authority}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    ✓ {item.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    showToast(`${item.name} verified with cryptographic seal.`);
                    addAuditLog('LEGAL_LAYER_SEALED', currentUser?.email || 'Super Admin', currentTsForPlots?.name || 'Township', `Verified ${item.layer} compliance.`, 'SUCCESS');
                  }}
                  className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition"
                >
                  Verify Seal
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Buyer & Investor CRM Pipeline ({leadsList.length})</h3>
              <p className="text-xs text-slate-400">Track inquiries, chauffeur visit bookings, and token reservations.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Buyer Name</th>
                  <th className="pb-3">Phone & Email</th>
                  <th className="pb-3">Interested Township</th>
                  <th className="pb-3">Plot Preference</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leadsList.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 font-bold text-white">{lead.buyerName}</td>
                    <td className="py-3">
                      <div className="text-slate-300">{lead.phone}</div>
                      <div className="text-[11px] text-slate-500">{lead.email}</div>
                    </td>
                    <td className="py-3 text-emerald-400 font-semibold">{lead.townshipName}</td>
                    <td className="py-3 text-slate-300">{lead.interestedPlot || 'General'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">{lead.source}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteLead(lead)}
                        title="Delete Lead"
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: SITE CMS & BRANDING */}
      {/* ==================================================== */}
      {activeTab === 'cms' && (
        <form onSubmit={handleSaveSiteSettings} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Platform Branding & Homepage CMS</h3>
              <p className="text-xs text-slate-400">Edit titles, value propositions, CTA buttons, and announcement bar in real time.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Save CMS Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Hero Headline Title</label>
              <input
                type="text"
                value={siteSettings.heroTitle}
                onChange={(e) => setSiteSettingsState({ ...siteSettings, heroTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Hero Badge Text</label>
              <input
                type="text"
                value={siteSettings.heroBadge}
                onChange={(e) => setSiteSettingsState({ ...siteSettings, heroBadge: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Hero Subtitle & Value Proposition</label>
            <textarea
              rows={2}
              value={siteSettings.heroSubtitle}
              onChange={(e) => setSiteSettingsState({ ...siteSettings, heroSubtitle: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Primary Button CTA</label>
              <input
                type="text"
                value={siteSettings.ctaPrimaryText}
                onChange={(e) => setSiteSettingsState({ ...siteSettings, ctaPrimaryText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Secondary Button CTA</label>
              <input
                type="text"
                value={siteSettings.ctaSecondaryText}
                onChange={(e) => setSiteSettingsState({ ...siteSettings, ctaSecondaryText: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white">Top Announcement Banner</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Banner Text</label>
                <input
                  type="text"
                  value={siteSettings.announcementText}
                  onChange={(e) => setSiteSettingsState({ ...siteSettings, announcementText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="enableBanner"
                  checked={siteSettings.announcementEnabled}
                  onChange={(e) => setSiteSettingsState({ ...siteSettings, announcementEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="enableBanner" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Display Announcement Bar on Web App
                </label>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* TAB 7: HOMEPAGE SECTIONS CMS */}
      {/* ==================================================== */}
      {activeTab === 'sections' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Homepage Sections Visibility Manager</h3>
              <p className="text-xs text-slate-400">Toggle individual modules on or off on the landing page.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {homepageSections.map(sec => (
              <div key={sec.id} className="py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{sec.name}</h4>
                  <span className="text-[10px] text-slate-500">Section Key: {sec.id}</span>
                </div>

                <button
                  onClick={() => handleToggleSection(sec.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    sec.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-500'
                  }`}
                >
                  <span>{sec.enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: AUDIT LOGS */}
      {/* ==================================================== */}
      {activeTab === 'audit_logs' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white">Platform System & Security Audit Trail</h3>
            <p className="text-xs text-slate-400">Chronological cryptographic records of all administrative updates.</p>
          </div>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.severity === 'DANGER' ? 'bg-rose-500' : log.severity === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></span>
                    <span>{log.action}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <div className="text-[10px] text-slate-500">Actor: {log.actor} • Target: {log.target}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT TOWNSHIP */}
      {/* ==================================================== */}
      {showAddTownshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTownship ? `Edit Township: ${editingTownship.name}` : 'Create New Plotted Township'}
              </h3>
              <button onClick={() => setShowAddTownshipModal(false)} className="text-slate-400 hover:text-white font-bold text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTownship} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Township Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prestige Sanctuary Greens"
                    value={townshipForm.name}
                    onChange={(e) => setTownshipForm({ ...townshipForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Developer / Builder</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prestige Plotted Townships"
                    value={townshipForm.developer}
                    onChange={(e) => setTownshipForm({ ...townshipForm, developer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Location Corridor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Devanahalli Airport Corridor"
                    value={townshipForm.location}
                    onChange={(e) => setTownshipForm({ ...townshipForm, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Total Acres</label>
                  <input
                    type="text"
                    placeholder="e.g. 45 Acres"
                    value={townshipForm.totalAcres}
                    onChange={(e) => setTownshipForm({ ...townshipForm, totalAcres: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Rate (₹/sq.ft)</label>
                  <input
                    type="number"
                    value={townshipForm.pricePerSqFt}
                    onChange={(e) => setTownshipForm({ ...townshipForm, pricePerSqFt: parseInt(e.target.value) || 4500 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Sanction Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. BIAAPA & K-RERA Sanctioned"
                    value={townshipForm.approvalAuthority}
                    onChange={(e) => setTownshipForm({ ...townshipForm, approvalAuthority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">RERA Registration ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PRM/KA/RERA/1250/303/PR/210324/004055"
                    value={townshipForm.reraId}
                    onChange={(e) => setTownshipForm({ ...townshipForm, reraId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={townshipForm.image}
                  onChange={(e) => setTownshipForm({ ...townshipForm, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Layout Description</label>
                <textarea
                  rows={3}
                  value={townshipForm.description}
                  onChange={(e) => setTownshipForm({ ...townshipForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTownshipModal(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  {editingTownship ? 'Save Changes' : 'Create Township'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD PLOT */}
      {/* ==================================================== */}
      {showAddPlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Plot to {currentTsForPlots?.name}</h3>
              <button onClick={() => setShowAddPlotModal(false)} className="text-slate-400 hover:text-white font-bold text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Plot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Plot 115"
                    value={plotForm.plotNumber}
                    onChange={(e) => setPlotForm({ ...plotForm, plotNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    value={plotForm.sqft}
                    onChange={(e) => setPlotForm({ ...plotForm, sqft: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Facing</label>
                  <select
                    value={plotForm.facing}
                    onChange={(e) => setPlotForm({ ...plotForm, facing: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="East Facing">East Facing</option>
                    <option value="North Facing">North Facing</option>
                    <option value="North-East Facing">North-East Facing</option>
                    <option value="West Facing">West Facing</option>
                    <option value="South Facing">South Facing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
                  <select
                    value={plotForm.status}
                    onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Display Price</label>
                  <input
                    type="text"
                    value={plotForm.price}
                    onChange={(e) => setPlotForm({ ...plotForm, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Elevation / View</label>
                  <input
                    type="text"
                    value={plotForm.elevation}
                    onChange={(e) => setPlotForm({ ...plotForm, elevation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl mt-3"
              >
                Add Plot to Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE USER */}
      {/* ==================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Platform User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white font-bold text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="BUYER">Retail Plot Buyer</option>
                    <option value="DEVELOPER">Developer (Builder)</option>
                    <option value="LEGAL_AUDITOR">Legal Due Diligence Auditor</option>
                    <option value="ADMIN">Platform Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl mt-3"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: TEMPORARY PASSWORD GENERATED */}
      {/* ==================================================== */}
      {showResetPasswordModal && tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <Key className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Temporary Password Issued</h3>
            </div>

            <p className="text-xs text-slate-300">
              A single-use temporary password was generated for <strong>{tempPasswordResult.user?.name}</strong> ({tempPasswordResult.user?.email}):
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-between">
              <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                {tempPasswordResult.temporaryPassword}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordResult.temporaryPassword);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowResetPasswordModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}
      </div>
    </AdminDashboard>
  );
}
