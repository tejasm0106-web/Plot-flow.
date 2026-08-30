import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Monitor, 
  ArrowRight,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

import AdminApp from './AdminApp';
import BuyerDeveloperApp from './BuyerDeveloperApp';
import { getStoredTownships, getSiteSettings } from './services/storeService';

export default function App() {
  // Determine active web application based on URL / query params / session
  const getInitialApp = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const appParam = urlParams.get('app') || urlParams.get('portal');
      if (appParam === 'admin') return 'admin';
      if (appParam === 'developer') return 'developer';
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') return 'admin';
      
      const savedApp = sessionStorage.getItem('plotflow_active_web_app');
      if (savedApp === 'admin') return 'admin';
    } catch (e) {
      // fallback
    }
    return 'buyer_developer';
  };

  const [activeWebApp, setActiveWebApp] = useState(getInitialApp);
  const [initialView, setInitialView] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('app') === 'developer') return 'developer-portal';
    return 'landing';
  });
  const [showAppSwitcherDock, setShowAppSwitcherDock] = useState(true);

  // Sync state to URL & sessionStorage when active app changes
  const handleSwitchApp = (targetApp, view = 'landing') => {
    setActiveWebApp(targetApp);
    setInitialView(view);
    sessionStorage.setItem('plotflow_active_web_app', targetApp);

    try {
      const url = new URL(window.location.href);
      if (targetApp === 'admin') {
        url.searchParams.set('app', 'admin');
      } else {
        url.searchParams.delete('app');
        url.searchParams.delete('portal');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // Listen to popstate / url changes
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const appParam = urlParams.get('app');
      if (appParam === 'admin') setActiveWebApp('admin');
      else if (appParam === 'buyer' || !appParam) setActiveWebApp('buyer_developer');
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Helper to open the alternate web in a new window/tab
  const handleOpenInNewWindow = (appType) => {
    const url = new URL(window.location.href);
    if (appType === 'admin') {
      url.searchParams.set('app', 'admin');
    } else if (appType === 'developer') {
      url.searchParams.set('app', 'developer');
    } else {
      url.searchParams.set('app', 'buyer');
    }
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="relative min-h-screen">
      {/* ==================================================== */}
      {/* 1. SEPARATE DEDICATED ADMIN WEB APPLICATION */}
      {/* ==================================================== */}
      {activeWebApp === 'admin' ? (
        <AdminApp onSwitchToBuyerWeb={() => handleSwitchApp('buyer_developer', 'landing')} />
      ) : (
        /* ==================================================== */
        /* 2. SEPARATE BUYER & DEVELOPER WEB APPLICATION */
        /* ==================================================== */
        <BuyerDeveloperApp 
          onSwitchToAdminWeb={() => handleSwitchApp('admin')} 
          initialView={initialView}
        />
      )}

      {/* ==================================================== */}
      {/* FLOATING MULTI-WEB APP SWITCHER & LIVE SYNC DOCK */}
      {/* ==================================================== */}
      {showAppSwitcherDock ? (
        <aside 
          aria-label="Web App Switcher Dock"
          className="fixed bottom-4 right-4 z-50 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 text-xs text-slate-300 max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 gap-3">
            <div className="flex items-center space-x-1.5 font-bold text-white text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>PlotFlow Dual Web Architecture</span>
            </div>
            <button 
              onClick={() => setShowAppSwitcherDock(false)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title="Minimize dock"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Active Web:</span>
              <span className={`font-black ${activeWebApp === 'admin' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activeWebApp === 'admin' ? 'Master Admin Web' : 'Buyer & Developer Web'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => handleSwitchApp('buyer_developer', 'landing')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 text-[11px] ${
                  activeWebApp === 'buyer_developer'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>Buyer Web</span>
              </button>

              <button
                onClick={() => handleSwitchApp('admin')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 text-[11px] ${
                  activeWebApp === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Admin Web</span>
              </button>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">Cross-Tab Realtime Sync Active</span>
              <button
                onClick={() => handleOpenInNewWindow(activeWebApp === 'admin' ? 'buyer' : 'admin')}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-0.5 ml-2 shrink-0"
                title="Launch the other web in a separate browser tab to test side-by-side instant sync"
              >
                <span>Launch Other Web</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </aside>
      ) : (
        <button
          onClick={() => setShowAppSwitcherDock(true)}
          className="fixed bottom-4 right-4 z-50 bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center space-x-1.5 transition"
          title="Open Web Switcher"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Web Switcher</span>
        </button>
      )}
    </div>
  );
}
