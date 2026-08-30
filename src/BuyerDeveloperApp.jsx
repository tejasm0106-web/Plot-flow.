import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Compass, 
  Eye, 
  ShieldCheck, 
  Building2, 
  Bookmark, 
  TrendingUp, 
  Lock, 
  User, 
  Menu, 
  X, 
  Car, 
  Sparkles,
  PhoneCall,
  LogOut,
  Scale,
  Settings,
  Mail,
  Info,
  ArrowRight,
  ChevronRight,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Map as MapIcon,
  ExternalLink,
  Radio
} from 'lucide-react';

import { 
  getStoredTownships, 
  saveStoredTownships, 
  getSiteSettings, 
  getShortlist, 
  toggleShortlistInStore,
  getHomepageSections,
  subscribeToTownshipsRealtime,
  subscribeToSettingsRealtime
} from './services/storeService';
import { getStoredUsers } from './services/userService';
import { 
  ROLES, 
  ROLE_LABELS, 
  canAccessPortal, 
  canAccessView, 
  evaluateAccess, 
  subscribeToUserRbac, 
  syncUserRoleToFirestore, 
  getUserRole,
  isSuperAdmin,
  SUPER_ADMIN_EMAIL
} from './services/rbacService';

import LandingView from './screens/LandingView';
import MarketplaceView from './screens/MarketplaceView';
import ProjectDetailView from './screens/ProjectDetailView';
import VerificationView from './screens/VerificationView';
import CompareView from './screens/CompareView';
import LeadCrmView from './screens/LeadCrmView';
import InvestorPitchView from './screens/InvestorPitchView';
import LegalAuditPortal from './screens/LegalAuditPortal';
import DeveloperPortal from './DeveloperPortal';
import AboutView from './screens/AboutView';
import ContactView from './screens/ContactView';
import UserProfileView from './screens/UserProfileView';

import GeographicPlotMapView from './components/GeographicPlotMapView';
import SunPathSimulator from './components/SunPathSimulator';
import PlotDetailDrawer from './components/PlotDetailDrawer';
import BookingModal from './components/BookingModal';
import SiteVisitModal from './components/SiteVisitModal';
import AuthModal from './components/AuthModal';
import StaffGatewayModal from './components/StaffGatewayModal';
import SmsNotificationToast from './components/SmsNotificationToast';
import RBACGuard from './components/RBACGuard';

export default function BuyerDeveloperApp({ onSwitchToAdminWeb, initialView = 'landing' }) {
  // Master persistent state for townships (synced live with Admin Web)
  const [townships, setTownships] = useState(() => getStoredTownships());
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());
  const [homepageSections, setHomepageSections] = useState(() => getHomepageSections());
  const [shortlistedTownshipIds, setShortlistedTownshipIds] = useState(() => getShortlist());

  // Portal Architecture: 'main' (Buyer & Developer web) | 'legal' (Legal Audit Portal)
  const [portalMode, setPortalMode] = useState('main'); 

  // Main Web views: 'landing' | 'marketplace' | 'map' | 'project-detail' | '3d-twin' | 'verification' | 'compare' | 'developer-portal' | 'lead-crm' | 'about' | 'contact' | 'profile' | 'investor-pitch'
  const [currentView, setCurrentView] = useState(initialView); 

  const [selectedTownshipId, setSelectedTownshipId] = useState(() => {
    const list = getStoredTownships();
    return list[0]?.id || 'ts_01';
  });
  const [selectedPlot, setSelectedPlot] = useState(null);
  
  // User Authentication State: Default to null (public visitor) unless active session is saved
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
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStaffGatewayOpen, setIsStaffGatewayOpen] = useState(false);
  const [staffGatewayTarget, setStaffGatewayTarget] = useState('developer'); // 'developer' | 'legal'

  const [isPlotDrawerOpen, setIsPlotDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveSyncPulse, setLiveSyncPulse] = useState(false);

  // Save session on user change
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('plotflow_active_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('plotflow_active_user');
    }
  }, [currentUser]);

  // Firestore Real-Time RBAC Listener
  useEffect(() => {
    if (currentUser?.uid || currentUser?.id || currentUser?.email) {
      const uid = currentUser.uid || currentUser.id || currentUser.email.replace(/[^a-zA-Z0-9]/g, '_');
      syncUserRoleToFirestore(currentUser);

      const unsubscribe = subscribeToUserRbac(uid, (firestoreData) => {
        if (firestoreData && firestoreData.role) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            if (prev.role !== firestoreData.role || prev.status !== firestoreData.status) {
              return {
                ...prev,
                role: firestoreData.role,
                status: firestoreData.status || prev.status,
                roleTitle: firestoreData.roleTitle || prev.roleTitle
              };
            }
            return prev;
          });
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [currentUser?.uid, currentUser?.id, currentUser?.email]);

  // REAL-TIME SYNC: Listen for changes made in the Admin Web (Firestore + Cross-tab and cross-window)
  useEffect(() => {
    const unsubTownships = subscribeToTownshipsRealtime((updatedTownships) => {
      setTownships(updatedTownships);
      flashSyncIndicator();
    });

    const unsubSettings = subscribeToSettingsRealtime((updatedSettings) => {
      setSiteSettings(updatedSettings);
      flashSyncIndicator();
    });

    const handleSectionsUpdate = (e) => {
      setHomepageSections(e.detail || getHomepageSections());
      flashSyncIndicator();
    };
    const handleShortlistUpdate = (e) => {
      setShortlistedTownshipIds(e.detail || getShortlist());
    };

    window.addEventListener('plotflow_sections_updated', handleSectionsUpdate);
    window.addEventListener('plotflow_shortlist_updated', handleShortlistUpdate);

    return () => {
      if (typeof unsubTownships === 'function') unsubTownships();
      if (typeof unsubSettings === 'function') unsubSettings();
      window.removeEventListener('plotflow_sections_updated', handleSectionsUpdate);
      window.removeEventListener('plotflow_shortlist_updated', handleShortlistUpdate);
    };
  }, []);

  const flashSyncIndicator = () => {
    setLiveSyncPulse(true);
    setTimeout(() => setLiveSyncPulse(false), 2000);
  };

  const selectedTownship = townships.find(t => t.id === selectedTownshipId) || townships[0];

  const handleUpdateTownship = (updatedTownship) => {
    const updatedList = townships.map(t => t.id === updatedTownship.id ? updatedTownship : t);
    setTownships(updatedList);
    saveStoredTownships(updatedList);
  };

  const handleRemoveTownship = (townshipId) => {
    const updatedList = townships.filter(t => t.id !== townshipId);
    setTownships(updatedList);
    saveStoredTownships(updatedList);
    if (selectedTownshipId === townshipId) {
      if (updatedList.length > 0) setSelectedTownshipId(updatedList[0].id);
    }
  };

  const handleAddTownship = (newTownship) => {
    const updatedList = [newTownship, ...townships];
    setTownships(updatedList);
    saveStoredTownships(updatedList);
    setSelectedTownshipId(newTownship.id);
  };

  const handleToggleShortlist = (townshipId) => {
    const nextShortlist = toggleShortlistInStore(townshipId);
    setShortlistedTownshipIds(nextShortlist);
  };

  const handleSelectPlotAndOpen = (plot) => {
    setSelectedPlot(plot);
    setIsPlotDrawerOpen(true);
  };

  const handleBookingSuccess = (plotId) => {
    const updatedList = townships.map(ts => {
      if (ts.id === selectedTownship?.id) {
        return {
          ...ts,
          plots: (ts.plots || []).map(p => p.id === plotId ? { ...p, status: 'Reserved' } : p),
          availablePlots: Math.max(0, (ts.availablePlots || 1) - 1)
        };
      }
      return ts;
    });
    setTownships(updatedList);
    saveStoredTownships(updatedList);
  };

  // Launch Admin Web in new window or route
  const handleLaunchAdminWeb = () => {
    if (onSwitchToAdminWeb) {
      onSwitchToAdminWeb();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('app', 'admin');
      window.open(url.toString(), '_blank');
    }
  };

  // =========================================================================
  // DEDICATED LEGAL TEAM PORTAL VIEW (RBAC GUARDED)
  // =========================================================================
  if (portalMode === 'legal') {
    return (
      <RBACGuard
        user={currentUser}
        targetPortal="legal"
        onSwitchUser={(u) => {
          setCurrentUser(u);
          syncUserRoleToFirestore(u);
        }}
        onOpenStaffGateway={(target) => {
          setStaffGatewayTarget(target);
          setIsStaffGatewayOpen(true);
        }}
        onReturnHome={() => setPortalMode('main')}
      >
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-black">
          <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-teal-500/30 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-950/50">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-white tracking-tight">PlotFlow Legal & Compliance Portal</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                      TITLE AUDIT
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Statutory 5-Layer Verification & Digital Legal Stamping • {currentUser?.email}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => {
                    setPortalMode('main');
                    setCurrentView('verification');
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>Buyer Vault Preview</span>
                </button>

                <button
                  onClick={() => setPortalMode('main')}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg transition flex items-center space-x-1"
                >
                  <span>Return to Public Web</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
            <LegalAuditPortal
              currentUser={currentUser}
              townships={townships}
              onUpdateTownship={handleUpdateTownship}
              onNavigateTo3D={(ts) => {
                if (ts) setSelectedTownshipId(ts.id);
                setPortalMode('main');
                setCurrentView('3d-twin');
              }}
            />
          </main>
        </div>
      </RBACGuard>
    );
  }

  // =========================================================================
  // MAIN BUYER & DEVELOPER WEB APPLICATION
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Optional Top Announcement Bar from CMS (Synced with Admin Web) */}
      {siteSettings.announcementEnabled && siteSettings.announcementText && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{siteSettings.announcementText}</span>
        </div>
      )}

      {/* Top Main Navigation Bar: STRICTLY FOR BUYER & DEVELOPER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Slogan */}
          <div 
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black text-white tracking-tight">{siteSettings.siteName || 'PlotFlow'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  3D Twin
                </span>
                {liveSyncPulse && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 animate-pulse">
                    Live Updated
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block -mt-0.5 tracking-wide">
                TRUST EVERY PLOT
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links: BUYER & DEVELOPER ONLY */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-2 rounded-xl transition ${
                currentView === 'landing' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-3.5 py-2 rounded-xl transition ${
                currentView === 'marketplace' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Explore Townships
            </button>
            <button
              onClick={() => setCurrentView('map')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spatial Map</span>
            </button>
            <button
              onClick={() => setCurrentView('3d-twin')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === '3d-twin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Twin Visualizer</span>
            </button>
            <button
              onClick={() => setCurrentView('verification')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'verification' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>5-Layer Legal Vault</span>
            </button>
            <button
              onClick={() => setCurrentView('compare')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'compare' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({shortlistedTownshipIds.length})</span>
            </button>

            {/* Developer CRM & Builder SaaS Access */}
            <button
              onClick={() => setCurrentView('developer-portal')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'developer-portal' || currentView === 'lead-crm' 
                  ? 'bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 shadow' 
                  : 'text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Builder SaaS</span>
            </button>
          </nav>

          {/* User Auth Profile & Fast Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {/* Discrete Admin Web Opener if Super Admin */}
                {isSuperAdmin(currentUser) && (
                  <button
                    onClick={handleLaunchAdminWeb}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                    title="Launch dedicated Admin Web application"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin Web App</span>
                    <ExternalLink className="w-3 h-3 text-amber-400/70" />
                  </button>
                )}

                {/* Legal Portal Direct Launch for Legal Auditors */}
                {currentUser?.role === 'LEGAL_AUDITOR' && (
                  <button
                    onClick={() => setPortalMode('legal')}
                    className="px-3 py-1.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                    title="Open Legal Audit Vault"
                  >
                    <Scale className="w-3.5 h-3.5 text-teal-400" />
                    <span className="hidden sm:inline">Legal Vault</span>
                  </button>
                )}

                <div 
                  onClick={() => setCurrentView('profile')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center space-x-2.5 cursor-pointer transition shadow"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isSuperAdmin(currentUser)
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : currentUser.role === 'DEVELOPER'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : currentUser.role === 'LEGAL_AUDITOR'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isSuperAdmin(currentUser) ? 'A' : currentUser.role === 'DEVELOPER' ? 'D' : currentUser.role === 'LEGAL_AUDITOR' ? 'L' : 'B'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400">{isSuperAdmin(currentUser) ? 'Master Admin' : currentUser.roleTitle || currentUser.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentUser(null)}
                  title="Sign Out"
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-slate-800 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-slate-800 mt-3 space-y-1 text-xs">
            <button
              onClick={() => { setCurrentView('landing'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold"
            >
              Home
            </button>
            <button
              onClick={() => { setCurrentView('marketplace'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold"
            >
              Explore Townships
            </button>
            <button
              onClick={() => { setCurrentView('map'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-emerald-400 flex items-center space-x-2"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Spatial Geographic Map</span>
            </button>
            <button
              onClick={() => { setCurrentView('3d-twin'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-indigo-400"
            >
              3D Sun-Path Visualizer
            </button>
            <button
              onClick={() => { setCurrentView('verification'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-emerald-400"
            >
              5-Layer Legal Vault
            </button>
            <button
              onClick={() => { setCurrentView('developer-portal'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-indigo-300"
            >
              Builder SaaS & Inventory
            </button>
            <button
              onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-slate-300"
            >
              About PlotFlow
            </button>
            <button
              onClick={() => { setCurrentView('contact'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-slate-300"
            >
              Contact & Concierge
            </button>
          </div>
        )}
      </header>

      {/* Main Screen Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {currentView === 'landing' && (
          <LandingView
            townships={townships}
            onExplore={() => setCurrentView('marketplace')}
            onOpenMap={() => setCurrentView('map')}
            onLaunch3D={(ts) => {
              if (ts) setSelectedTownshipId(ts.id);
              setCurrentView('3d-twin');
            }}
            onVerify={() => setCurrentView('verification')}
            onDeveloperPortal={() => setCurrentView('developer-portal')}
            onInvestorPitch={() => setCurrentView('investor-pitch')}
            onSelectTownship={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('project-detail');
            }}
          />
        )}

        {currentView === 'marketplace' && (
          <MarketplaceView
            townships={townships}
            shortlistedTownships={shortlistedTownshipIds}
            onToggleShortlist={handleToggleShortlist}
            onSelectTownship={(ts) => setSelectedTownshipId(ts.id)}
            onViewDetails={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('project-detail');
            }}
            onLaunch3D={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('3d-twin');
            }}
            onSelectPlot={handleSelectPlotAndOpen}
            onBookPlot={(plot) => {
              setSelectedPlot(plot);
              setIsBookingModalOpen(true);
            }}
            onScheduleVisit={(plot) => {
              setSelectedPlot(plot);
              setIsSiteVisitModalOpen(true);
            }}
          />
        )}

        {currentView === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Geographic Plot & Infrastructure Map</h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Explore available residential plots pinned across North, East, and South-West Bengaluru growth corridors with live distance isochrones.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
                >
                  Card Directory
                </button>
                <button
                  onClick={() => setCurrentView('3d-twin')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>3D Sun Path</span>
                </button>
              </div>
            </div>

            <GeographicPlotMapView
              townships={townships}
              selectedTownshipId={selectedTownshipId}
              onSelectTownship={(tsId) => setSelectedTownshipId(tsId)}
              onLaunch3D={(ts) => {
                if (ts) setSelectedTownshipId(ts.id);
                setCurrentView('3d-twin');
              }}
              onSelectPlot={handleSelectPlotAndOpen}
              onBookPlot={(plot) => {
                setSelectedPlot(plot);
                setIsBookingModalOpen(true);
              }}
              onScheduleVisit={(plot) => {
                setSelectedPlot(plot);
                setIsSiteVisitModalOpen(true);
              }}
              onVerifyDocs={() => setCurrentView('verification')}
              shortlistedTownshipIds={shortlistedTownshipIds}
              onToggleShortlist={handleToggleShortlist}
              height="750px"
              standalone={true}
            />
          </div>
        )}

        {currentView === 'project-detail' && (
          <ProjectDetailView
            township={selectedTownship}
            onBack={() => setCurrentView('marketplace')}
            onLaunch3D={() => setCurrentView('3d-twin')}
            onSelectPlot={handleSelectPlotAndOpen}
            onBookToken={(plot) => {
              setSelectedPlot(plot);
              setIsBookingModalOpen(true);
            }}
            onScheduleVisit={(plot) => {
              setSelectedPlot(plot);
              setIsSiteVisitModalOpen(true);
            }}
            onViewVerification={() => setCurrentView('verification')}
          />
        )}

        {currentView === '3d-twin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 font-semibold">Active Township:</span>
                <select
                  value={selectedTownshipId}
                  onChange={(e) => setSelectedTownshipId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {townships.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.location})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setCurrentView('project-detail')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                View Project Details →
              </button>
            </div>

            <SunPathSimulator
              township={selectedTownship}
              selectedPlot={selectedPlot}
              onSelectPlot={handleSelectPlotAndOpen}
              onBookPlot={(plot) => {
                setSelectedPlot(plot);
                setIsBookingModalOpen(true);
              }}
              onScheduleVisit={(plot) => {
                setSelectedPlot(plot);
                setIsSiteVisitModalOpen(true);
              }}
            />
          </div>
        )}

        {currentView === 'verification' && (
          <VerificationView
            townships={townships}
            selectedTownship={selectedTownship}
            currentUser={currentUser}
          />
        )}

        {currentView === 'compare' && (
          <CompareView
            townships={townships}
            shortlistedTownshipIds={shortlistedTownshipIds}
            onRemoveShortlist={handleToggleShortlist}
            onLaunch3D={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('3d-twin');
            }}
            onScheduleVisit={() => setIsSiteVisitModalOpen(true)}
          />
        )}

        {currentView === 'developer-portal' && (
          <RBACGuard
            user={currentUser}
            targetPortal="developer"
            onSwitchUser={(u) => {
              setCurrentUser(u);
              syncUserRoleToFirestore(u);
            }}
            onOpenStaffGateway={(target) => {
              setStaffGatewayTarget(target);
              setIsStaffGatewayOpen(true);
            }}
            onReturnHome={() => setCurrentView('marketplace')}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-bold">
                <button
                  onClick={() => setCurrentView('developer-portal')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow"
                >
                  Inventory & Masterplan
                </button>
                <button
                  onClick={() => setCurrentView('lead-crm')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                >
                  Buyer Lead CRM
                </button>
              </div>
              <DeveloperPortal
                townships={townships}
                onUpdateTownship={handleUpdateTownship}
                onAddTownship={handleAddTownship}
                currentUser={currentUser}
                onNavigateToLegalPortal={() => setPortalMode('legal')}
              />
            </div>
          </RBACGuard>
        )}

        {currentView === 'lead-crm' && (
          <RBACGuard
            user={currentUser}
            targetPortal="developer"
            onSwitchUser={(u) => {
              setCurrentUser(u);
              syncUserRoleToFirestore(u);
            }}
            onOpenStaffGateway={(target) => {
              setStaffGatewayTarget(target);
              setIsStaffGatewayOpen(true);
            }}
            onReturnHome={() => setCurrentView('marketplace')}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-bold">
                <button
                  onClick={() => setCurrentView('developer-portal')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
                >
                  Inventory & Masterplan
                </button>
                <button
                  onClick={() => setCurrentView('lead-crm')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow"
                >
                  Buyer Lead CRM
                </button>
              </div>
              <LeadCrmView />
            </div>
          </RBACGuard>
        )}

        {currentView === 'investor-pitch' && (
          <InvestorPitchView
            onExplore={() => setCurrentView('marketplace')}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            onExplore={() => setCurrentView('marketplace')}
            onContact={() => setCurrentView('contact')}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'contact' && (
          <ContactView
            townships={townships}
            onExplore={() => setCurrentView('marketplace')}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              setCurrentView('landing');
            }}
            onOpenAdminPortal={handleLaunchAdminWeb}
            onOpenLegalPortal={() => setPortalMode('legal')}
            townships={townships}
            shortlistedTownships={shortlistedTownshipIds}
            onToggleShortlist={handleToggleShortlist}
            onViewTownship={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('project-detail');
            }}
            onLaunch3D={(ts) => {
              setSelectedTownshipId(ts.id);
              setCurrentView('3d-twin');
            }}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      {isPlotDrawerOpen && selectedPlot && (
        <PlotDetailDrawer
          plot={selectedPlot}
          township={selectedTownship}
          onClose={() => setIsPlotDrawerOpen(false)}
          onBookToken={(plot) => {
            setIsPlotDrawerOpen(false);
            setIsBookingModalOpen(true);
          }}
          onScheduleVisit={(plot) => {
            setIsPlotDrawerOpen(false);
            setIsSiteVisitModalOpen(true);
          }}
        />
      )}

      {isBookingModalOpen && selectedPlot && (
        <BookingModal
          plot={selectedPlot}
          township={selectedTownship}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {isSiteVisitModalOpen && (
        <SiteVisitModal
          plot={selectedPlot}
          township={selectedTownship}
          onClose={() => setIsSiteVisitModalOpen(false)}
          onSuccess={(leadData) => {
            setIsSiteVisitModalOpen(false);
            alert(`Site visit booked successfully for ${leadData.buyerName}! Assigned concierge will reach out.`);
          }}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          syncUserRoleToFirestore(user);
          if (user.role === 'DEVELOPER') {
            setCurrentView('developer-portal');
          } else if (user.role === 'LEGAL_AUDITOR') {
            setPortalMode('legal');
          } else {
            setCurrentView('marketplace');
          }
        }}
      />

      {/* Staff & Governance Gateway Modal */}
      <StaffGatewayModal
        isOpen={isStaffGatewayOpen}
        onClose={() => setIsStaffGatewayOpen(false)}
        targetPortal={staffGatewayTarget}
        currentUser={currentUser}
        onAuthenticateAndOpenPortal={(target, user) => {
          setCurrentUser(user);
          syncUserRoleToFirestore(user);
          if (target === 'legal') {
            setPortalMode('legal');
          } else if (target === 'admin') {
            handleLaunchAdminWeb();
          }
        }}
      />

      {/* Global Real-Time SMS Notification Banner */}
      <SmsNotificationToast />

      {/* Footer: Buyer & Developer Focused with Discrete Staff Gateway */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-[11px]">
                PF
              </div>
              <span className="font-bold text-slate-200">{siteSettings.siteName || 'PlotFlow'}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>Verified Plotted Townships & 3D Digital Twin Platform</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <button onClick={() => setCurrentView('about')} className="hover:text-emerald-400 transition">About</button>
            <button onClick={() => setCurrentView('verification')} className="hover:text-emerald-400 transition">5-Layer Legal Vault</button>
            <button onClick={() => setCurrentView('contact')} className="hover:text-emerald-400 transition">Concierge & Contact</button>
            <button onClick={() => setCurrentView('investor-pitch')} className="hover:text-indigo-400 transition">Investor TAM</button>
            <button onClick={() => setCurrentView('developer-portal')} className="text-indigo-400 hover:text-indigo-300 font-bold transition">Developer SaaS</button>
            
            {/* Discrete Link to Dedicated Admin Web */}
            <span className="text-slate-800">|</span>
            <button 
              onClick={handleLaunchAdminWeb} 
              className="text-slate-500 hover:text-amber-400 font-medium transition flex items-center space-x-1"
              title="Open the dedicated PlotFlow Admin Web Application"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Web App</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </button>
          </div>

          <div>
            <span>© 2026 {siteSettings.siteName || 'PlotFlow'} Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
