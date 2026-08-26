import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Users, 
  Globe, 
  Sparkles, 
  Building2, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function InvestorPitchView({ onExplore }) {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>PlotFlow Investor Deck & Product Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Capturing India's $30B Plotted Land Revolution
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Plotted developments offer 3x higher IRR for developers and 40% faster liquidity for retail buyers. PlotFlow solves the 2 biggest bottlenecks: title fraud and lack of immersive visual layouts.
          </p>
        </div>
      </div>

      {/* 3 Core Market Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">The Market Problem</span>
          <h3 className="text-base font-bold text-white">Title Ambiguity & 2D Blueprints</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Over 65% of Indian land disputes stem from forged khatas, double mortgages, and unapproved layouts. Buyers cannot visualize sunlight or road elevation on paper maps.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The PlotFlow Solution</span>
          <h3 className="text-base font-bold text-white">3D Digital Twin + Kaveri-2 Audit</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive solar angle simulations, elevation contours, and 100% automated 30-year sub-registrar encumbrance certification with verified token escrow.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Unit Economics</span>
          <h3 className="text-base font-bold text-white">Dual Revenue Streams</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            0.75% transaction escrow take-rate on closed plot deeds + ₹1.5L/month SaaS subscription for enterprise developers (inventory management & CRM).
          </p>
        </div>
      </div>

      {/* 3-Year Growth Roadmap */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Scale & Expansion Roadmap</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-indigo-400">Phase 1 (Q1-Q4 2026)</span>
            <h4 className="text-sm font-bold text-white">Bengaluru & Hyderabad Corridors</h4>
            <p className="text-xs text-slate-400">
              50 verified plotted townships, ₹800 Cr GMV pipeline, integration with Kaveri-2 and Dharani land registries.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400">Phase 2 (2027)</span>
            <h4 className="text-sm font-bold text-white">Pune, Chennai & NCR Expressway</h4>
            <p className="text-xs text-slate-400">
              200+ townships, AI automated RERA title scanning, instant builder home loan disbursements with SBI/HDFC.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400">Phase 3 (2028)</span>
            <h4 className="text-sm font-bold text-white">Pan-India Plotted Standard</h4>
            <p className="text-xs text-slate-400">
              National land tokenization standard, ₹10,000 Cr annualized GMV, institutional REIT land parcels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
