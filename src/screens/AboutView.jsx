import React from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Layers, 
  TrendingUp, 
  Building2, 
  Users, 
  Award, 
  CheckCircle2, 
  Compass, 
  FileText, 
  ArrowRight,
  Database,
  Lock,
  Globe
} from 'lucide-react';

export default function AboutView({ onExplore, onContact, siteSettings = {} }) {
  const missionTitle = siteSettings.aboutMissionTitle || 'Building the Trust & Visualization Layer for Land';
  const missionSub = siteSettings.aboutMissionSubtitle || 'Modernizing Plotted Land Real Estate';
  const missionText = siteSettings.aboutMissionText || 'Plotted developments offer the highest return on investment in real estate, but have historically suffered from title ambiguity and inadequate visual layouts. PlotFlow combines 3D Digital Twin simulations with a rigorous 5-layer due diligence framework to make buying land transparent, verified, and predictable.';
  const pillar1Title = siteSettings.aboutPillar1Title || '1. Interactive 3D Digital Twin';
  const pillar1Desc = siteSettings.aboutPillar1Desc || 'Every plotted enclave is modeled with precise GPS coordinates, digital boundary perimeters, elevation contours, and physics-based solar angle simulations to assess morning and afternoon sunlight.';
  const pillar2Title = siteSettings.aboutPillar2Title || '2. 5-Layer Due Diligence Framework';
  const pillar2Desc = siteSettings.aboutPillar2Desc || 'Prior to publishing, layouts undergo title searches spanning 30-year sub-registrar archives (Kaveri-2 EC Form 15), DC Conversion orders, RERA approval sanctions, and environmental utility clearances.';
  const pillar3Title = siteSettings.aboutPillar3Title || '3. Live Inventory & Escrow Ledger';
  const pillar3Desc = siteSettings.aboutPillar3Desc || 'Real-time synchronization ensures buyers only view genuinely available inventory. Refundable token advances are held under standard escrow terms until agreement execution.';
  const tamSize = siteSettings.tamMarketSize || '$60B+';
  const takeRate = siteSettings.takeRateFee || 0.75;
  const brandName = siteSettings.siteName || 'PlotFlow';

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>{missionSub}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {missionTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {missionText}
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Verified Townships</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onContact}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center space-x-2"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Contact Concierge & Team</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Technology Pillars */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Our Core Architecture</span>
          <h2 className="text-2xl font-black text-white tracking-tight">The 3 Technology Pillars of {brandName}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{pillar1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pillar1Desc}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{pillar2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pillar2Desc}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{pillar3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {pillar3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Market Opportunity & Unit Economics */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Market Dynamics</span>
          <h2 className="text-2xl font-black text-white tracking-tight">The {tamSize} Plotted Land Market</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {siteSettings.tamDescription || 'Plotted residential land accounts for over 35% of all new homebuyer transactions across Tier-1 and Tier-2 growth corridors.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">{tamSize}</span>
            <span className="text-xs font-bold text-white block mt-1">Total Addressable Market</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Annual plotted land transactions across major Indian urban hubs.</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 block">3x IRR</span>
            <span className="text-xs font-bold text-white block mt-1">Faster Capital Recycling</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Plotted layouts monetize in 12-18 months vs 5+ years for apartments.</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{takeRate}%</span>
            <span className="text-xs font-bold text-white block mt-1">Transaction Take-Rate</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Transparent fee model on successfully registered plot transactions.</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-teal-400 block">{siteSettings.trustMetric1Value || '100%'}</span>
            <span className="text-xs font-bold text-white block mt-1">{siteSettings.trustMetric1Label || 'RERA & Title Checked'}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Only approved projects with verifiable statutory records are onboarded.</span>
          </div>
        </div>
      </section>

      {/* Leadership & Vision */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Our Mission</span>
          <h3 className="text-xl font-black text-white">Empowering Confident Land Ownership</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Land is India's most cherished asset class, yet purchasing it has traditionally required navigating bureaucratic opacity and physical site uncertainties. We believe every buyer deserves the same depth of data and visual confidence that institutions rely on.
          </p>
          <div className="space-y-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Eliminating forged documentation through sub-registrar cross-checks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Providing solar orientation and Vastu insights for villa planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accelerating sales velocity for reputable plotted township developers</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Platform Governance</span>
          <h3 className="text-xl font-black text-white">Institution-Grade Security & Due Diligence</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our technology stack integrates state land registry feeds, geospatial satellite layers, and independent legal title opinions. We maintain strict separation between developer marketing content and objective statutory verification records.
          </p>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audit Logging & Multi-Tier Role Governance</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Platform changes, document approvals, and plot status updates are cryptographically logged with chronological audit tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
