import React from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  Compass, 
  Layers, 
  ArrowRight, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Car, 
  Award,
  Users
} from 'lucide-react';

export default function LandingView({ 
  onExplore, 
  onLaunch3D, 
  onVerify, 
  onDeveloperPortal, 
  onInvestorPitch,
  townships,
  onSelectTownship 
}) {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Background glow accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide animate-fadeIn">
            <ShieldCheck className="w-4 h-4" />
            <span>India's 1st 3D Digital Twin & Title-Verified Plotted Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Trust Every Plot. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Verified Land Titles. Interactive 3D Twins.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate land fraud and layout ambiguity. Explore RERA-approved plotted townships with real-time sun-path simulations, 30-year sub-registrar encumbrance audits, and 100% transparent pricing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Verified Townships</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLaunch3D(townships[0])}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Launch 3D Sun-Path Twin</span>
            </button>

            <button
              onClick={onVerify}
              className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-sm rounded-xl transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>5-Layer Legal Vault</span>
            </button>
          </div>

          {/* Trust Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
              <span className="text-xs text-slate-400 font-medium">K-RERA & BDA Sanctioned</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">30 Years</span>
              <span className="text-xs text-slate-400 font-medium">Kaveri-2 EC Form 15 Guarantee</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400 block">₹4,500+ Cr</span>
              <span className="text-xs text-slate-400 font-medium">Plotted Land Inventory Value</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block">0%</span>
              <span className="text-xs text-slate-400 font-medium">Zero Title Litigation Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plotted Townships */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Curated Communities</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Featured Plotted Townships</h2>
          </div>
          <button
            onClick={onExplore}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View All Townships</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {townships.slice(0, 3).map((ts) => (
            <div
              key={ts.id}
              className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col shadow-xl group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ts.image}
                  alt={ts.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>RERA Sanctioned</span>
                </span>
                <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-800">
                  ₹{ts.pricePerSqFt}/sq.ft
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold">{ts.developer}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-emerald-400 transition">{ts.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{ts.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Total Area</span>
                    <span className="font-bold text-white">{ts.totalAcres}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Plots Available</span>
                    <span className="font-bold text-emerald-400">{ts.availablePlots} / {ts.totalPlots}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectTownship(ts);
                      onLaunch3D(ts);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>3D Twin View</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectTownship(ts);
                      onExplore();
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Why PlotFlow</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">The Plotted Land Verification Standard</h2>
          <p className="text-xs text-slate-400">Reinventing India's $30B plotted township ecosystem with high-fidelity digital twins and institutional legal diligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3D Digital Twin & Sun Physics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience the layout virtually before stepping on the ground. Check sun angle, shadow casting, elevation slope, and Vastu compliance scores down to individual plot dimensions.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">5-Layer Legal Due Diligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every project is vetted across RERA sanctions, 30-year Kaveri-2 sub-registrar encumbrance certificates, BDA/BMRDA conversion approvals, and pollution NOCs.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Developer SaaS & CRM Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time plot inventory release controls, milestone disbursement tracking, lead CRM with instant WhatsApp collateral triggers, and automated title vault publishing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
