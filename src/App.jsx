import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';

import { INITIAL_PROJECTS, DEMO_USERS } from './data/mockData';
import LandingView from './screens/LandingView';
import MarketplaceView from './screens/MarketplaceView';
import ProjectDetailView from './screens/ProjectDetailView';
import VerificationView from './screens/VerificationView';
import CompareView from './screens/CompareView';
import LeadCrmView from './screens/LeadCrmView';
import AdminPanelView from './screens/AdminPanelView';
import InvestorPitchView from './screens/InvestorPitchView';
import DeveloperPortal from './DeveloperPortal';
import SunPathSimulator from './components/SunPathSimulator';
import PlotDetailDrawer from './components/PlotDetailDrawer';
import BookingModal from './components/BookingModal';
import SiteVisitModal from './components/SiteVisitModal';
import AuthModal from './components/AuthModal';

export default function App() {
  // Master state
  const [townships, setTownships] = useState(INITIAL_PROJECTS);
  const [currentView, setCurrentView] = useState('landing'); 
  // 'landing' | 'marketplace' | 'project-detail' | '3d-twin' | 'verification' | 'compare' | 'developer-portal' | 'lead-crm' | 'admin-panel' | 'investor-pitch'

  const [selectedTownshipId, setSelectedTownshipId] = useState(INITIAL_PROJECTS[0].id);
  const [selectedPlot, setSelectedPlot] = useState(INITIAL_PROJECTS[0].plots[0]);
  const [shortlistedTownshipIds, setShortlistedTownshipIds] = useState(['ts_01', 'ts_02']);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.superAdmin); // Initialized with Tejas Super Admin
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPlotDrawerOpen, setIsPlotDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedTownship = townships.find(t => t.id === selectedTownshipId) || townships[0];

  const handleUpdateTownship = (updatedTownship) => {
    setTownships(prev => prev.map(t => t.id === updatedTownship.id ? updatedTownship : t));
  };

  const handleAddTownship = (newTownship) => {
    setTownships(prev => [newTownship, ...prev]);
    setSelectedTownshipId(newTownship.id);
  };

  const handleToggleShortlist = (townshipId) => {
    setShortlistedTownshipIds(prev => 
      prev.includes(townshipId) 
        ? prev.filter(id => id !== townshipId)
        : [...prev, townshipId]
    );
  };

  const handleSelectPlotAndOpen = (plot) => {
    setSelectedPlot(plot);
    setIsPlotDrawerOpen(true);
  };

  const handleBookingSuccess = (plotId) => {
    // Update plot status to Reserved
    setTownships(prev => prev.map(ts => {
      if (ts.id === selectedTownship.id) {
        return {
          ...ts,
          plots: ts.plots.map(p => p.id === plotId ? { ...p, status: 'Reserved' } : p),
          availablePlots: Math.max(0, ts.availablePlots - 1)
        };
      }
      return ts;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navigation Bar */}
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
                <span className="text-xl font-black text-white tracking-tight">PlotFlow</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  3D Twin
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block -mt-0.5 tracking-wide">
                TRUST EVERY PLOT
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-2 rounded-xl transition ${
                currentView === 'landing' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('marketplace')}
              className={`px-3 py-2 rounded-xl transition ${
                currentView === 'marketplace' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Explore Townships
            </button>
            <button
              onClick={() => setCurrentView('3d-twin')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === '3d-twin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Twin Visualizer</span>
            </button>
            <button
              onClick={() => setCurrentView('verification')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'verification' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>5-Layer Legal Vault</span>
            </button>
            <button
              onClick={() => setCurrentView('compare')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'compare' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({shortlistedTownshipIds.length})</span>
            </button>
            
            {/* Developer CRM & Builder SaaS Access */}
            <button
              onClick={() => setCurrentView('developer-portal')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'developer-portal' || currentView === 'lead-crm' ? 'bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Builder SaaS & CRM</span>
            </button>

            {/* Tejas Super Admin Link */}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setCurrentView('admin-panel')}
                className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                  currentView === 'admin-panel' ? 'bg-amber-600 text-white shadow' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
            )}
          </nav>

          {/* User Auth Profile & Fast Action */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center space-x-2.5 cursor-pointer transition shadow"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    currentUser.role === 'SUPER_ADMIN'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : currentUser.role === 'DEVELOPER'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {currentUser.role === 'SUPER_ADMIN' ? 'A' : currentUser.role === 'DEVELOPER' ? 'D' : 'B'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400">{currentUser.roleTitle || currentUser.role}</span>
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
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
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
              Builder SaaS & CRM
            </button>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => { setCurrentView('admin-panel'); setMobileMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-amber-400"
              >
                Super Admin Panel
              </button>
            )}
            <button
              onClick={() => { setCurrentView('investor-pitch'); setMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 font-bold text-slate-400"
            >
              Investor Pitch & TAM
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
          />
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
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
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
          <div className="space-y-6">
            {/* Developer Sub-Nav */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-bold">
              <button
                onClick={() => setCurrentView('developer-portal')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow"
              >
                Inventory & Analytics
              </button>
              <button
                onClick={() => setCurrentView('lead-crm')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
              >
                Buyer Lead CRM Pipeline
              </button>
            </div>
            <DeveloperPortal
              townships={townships}
              onUpdateTownship={handleUpdateTownship}
              onAddTownship={handleAddTownship}
            />
          </div>
        )}

        {currentView === 'lead-crm' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-xs font-bold">
              <button
                onClick={() => setCurrentView('developer-portal')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl"
              >
                Inventory & Analytics
              </button>
              <button
                onClick={() => setCurrentView('lead-crm')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow"
              >
                Buyer Lead CRM Pipeline
              </button>
            </div>
            <LeadCrmView />
          </div>
        )}

        {currentView === 'admin-panel' && (
          <AdminPanelView
            currentUser={currentUser}
            townships={townships}
            onApproveProject={() => {}}
            onRejectProject={() => {}}
          />
        )}

        {currentView === 'investor-pitch' && (
          <InvestorPitchView
            onExplore={() => setCurrentView('marketplace')}
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
          if (user.role === 'SUPER_ADMIN') {
            setCurrentView('admin-panel');
          } else if (user.role === 'DEVELOPER') {
            setCurrentView('developer-portal');
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">PlotFlow</span>
            <span>• Verified Plotted Townships & 3D Digital Twins</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentView('verification')} className="hover:text-emerald-400 transition">5-Layer Legal Vault</button>
            <button onClick={() => setCurrentView('investor-pitch')} className="hover:text-indigo-400 transition">Investor TAM</button>
            <button onClick={() => setCurrentView('developer-portal')} className="hover:text-amber-400 transition">Developer SaaS</button>
          </div>
          <div>
            <span>© 2026 PlotFlow Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
