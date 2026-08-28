import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Building2, 
  Layers, 
  Users, 
  Mail, 
  Settings, 
  Sliders, 
  FileText, 
  TrendingUp, 
  Lock, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Home, 
  Eye, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  Compass,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

/**
 * Checks if the given user has authorized administrative privileges.
 * Permitted roles: 'ADMIN', 'SUPER_ADMIN' (case-insensitive).
 */
export function isUserAdmin(user) {
  if (!user || !user.role) return false;
  const normalizedRole = String(user.role).trim().toUpperCase();
  return normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
}

/**
 * AdminDashboard
 * 
 * Reusable layout component featuring:
 * - Desktop: NavigationRail (collapsible rail with icons, labels, badges, and quick actions)
 * - Mobile: Bottom Navigation Bar with fast tab switching and touch-optimized touch targets
 * - Security Guard: Authentication & Role check enforcing 'ADMIN' or 'SUPER_ADMIN' authorization
 */
export default function AdminDashboard({
  user,
  currentUser, // fallback prop
  activeTab = 'overview',
  onTabChange,
  children,
  onNavigateHome,
  onExploreMarketplace,
  onLoginClick,
  onSwitchToAdmin,
  onLogout,
  badgeCounts = {},
  customNavItems
}) {
  const activeUser = user || currentUser;
  const isAuthorized = isUserAdmin(activeUser);

  // Desktop navigation rail collapsed state (true = slim icon rail, false = expanded rail)
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  // Mobile drawer for extra tabs
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Default admin navigation items
  const defaultNavItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, badge: badgeCounts.overview },
    { id: 'townships', label: 'Townships', icon: Building2, badge: badgeCounts.townships },
    { id: 'plots', label: 'Plot Inventory', icon: Layers, badge: badgeCounts.plots },
    { id: 'developers', label: 'Builder Governance', icon: Building2, badge: badgeCounts.developers },
    { id: 'leads', label: 'Buyer CRM & Leads', icon: Mail, badge: badgeCounts.leads },
    { id: 'legal_vault', label: 'Legal Vault Control', icon: ShieldCheck, badge: badgeCounts.legal_vault },
    { id: 'users', label: 'Users & Staff', icon: Users, badge: badgeCounts.users },
    { id: 'cms', label: 'Site CMS', icon: Settings, badge: badgeCounts.cms },
    { id: 'sections', label: 'Homepage Sections', icon: Sliders, badge: badgeCounts.sections },
    { id: 'audit_logs', label: 'Audit & System', icon: FileText, badge: badgeCounts.audit_logs }
  ];

  const navItems = customNavItems || defaultNavItems;

  // Primary mobile tabs (first 4) and secondary items in 'More'
  const primaryMobileTabs = navItems.slice(0, 4);
  const secondaryMobileTabs = navItems.slice(4);

  const handleSelectTab = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileMoreOpen(false);
  };

  // ----------------------------------------------------
  // UNAUTHORIZED / AUTHENTICATION GUARD SCREEN
  // ----------------------------------------------------
  if (!isAuthorized) {
    const isLoggedOut = !activeUser;
    const currentRole = activeUser?.role || 'Guest / Unauthenticated';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Restricted Access</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Administrator Privileges Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Admin Dashboard is protected and only accessible to verified accounts with{' '}
              <strong className="text-amber-300">ADMIN</strong> or{' '}
              <strong className="text-emerald-300">SUPER_ADMIN</strong> roles.
            </p>
          </div>

          {/* Current Auth Diagnostic Pill */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current User:</span>
              <span className="font-bold text-white truncate max-w-[180px]">
                {activeUser?.name || 'Not signed in'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Role:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                isLoggedOut ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {currentRole}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Required Role:</span>
              <span className="text-emerald-400 font-mono font-bold text-[10px]">
                ADMIN / SUPER_ADMIN
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Switch to Super Admin Account (Tejas)</span>
              </button>
            )}

            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in with Admin Credentials</span>
              </button>
            )}

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHORIZED ADMIN DASHBOARD LAYOUT
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-6">
      {/* ==================================================== */}
      {/* DESKTOP: NAVIGATION RAIL (md & up) */}
      {/* ==================================================== */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 bg-slate-950 border-r border-slate-800/90 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] z-30 ${
          isRailExpanded ? 'w-64' : 'w-20'
        }`}
        aria-label="Admin Navigation Rail"
      >
        {/* Rail Top Header & Collapse Toggle */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className={`flex items-center space-x-3 overflow-hidden ${!isRailExpanded ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-950/40">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {isRailExpanded && (
              <div className="truncate">
                <span className="text-xs font-black text-white block tracking-tight">Admin Console</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Governance</span>
              </div>
            )}
          </div>

          {isRailExpanded && (
            <button
              onClick={() => setIsRailExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Collapse Navigation Rail"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isRailExpanded && (
          <div className="py-2 text-center border-b border-slate-800/60">
            <button
              onClick={() => setIsRailExpanded(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Expand Navigation Rail"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Rail Navigation Item List */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full group relative flex items-center rounded-2xl transition-all duration-200 ${
                  isRailExpanded ? 'px-3.5 py-3 space-x-3' : 'p-3 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
                title={!isRailExpanded ? item.label : undefined}
              >
                {/* Active Pill Indicator for compact rail */}
                {!isRailExpanded && isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full" />
                )}

                <div className="relative flex-shrink-0">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {item.badge !== undefined && item.badge > 0 && !isRailExpanded && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950" />
                  )}
                </div>

                {isRailExpanded && (
                  <div className="flex-1 flex items-center justify-between truncate text-xs">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rail Bottom User & Role Section */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className={`flex items-center ${isRailExpanded ? 'space-x-3' : 'justify-center'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-xs">
                {activeUser?.name?.charAt(0) || 'A'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
            </div>

            {isRailExpanded && (
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{activeUser?.name || 'Administrator'}</span>
                <span className="text-[10px] font-mono text-amber-400 block truncate font-semibold">
                  {activeUser?.role || 'SUPER_ADMIN'}
                </span>
              </div>
            )}

            {isRailExpanded && onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition flex-shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb & Action Strip */}
        <div className="bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Admin</span>
            <span className="text-slate-600">/</span>
            <span className="font-bold text-emerald-400 capitalize">
              {navItems.find(i => i.id === activeTab)?.label || activeTab}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              <UserCheck className="w-3 h-3" />
              <span>Role: {activeUser?.role}</span>
            </span>

            {onExploreMarketplace && (
              <button
                onClick={onExploreMarketplace}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>Live Site</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ==================================================== */}
      {/* MOBILE: BOTTOM NAVIGATION BAR (md:hidden) */}
      {/* ==================================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl"
        aria-label="Mobile Admin Bottom Navigation"
      >
        <div className="grid grid-cols-5 gap-1 items-center">
          {primaryMobileTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 px-1 min-w-[14px] h-[14px] bg-amber-400 text-slate-950 font-mono text-[8px] font-black rounded-full flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More Tabs Button for remaining sections */}
          <button
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              secondaryMobileTabs.some(t => t.id === activeTab) || isMobileMoreOpen
                ? 'text-amber-400 font-bold bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile 'More' Tabs Popover Menu */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Additional Admin Sections</span>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {secondaryMobileTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick user role info */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Logged in as</span>
                <strong className="text-white">{activeUser?.name}</strong>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                {activeUser?.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
