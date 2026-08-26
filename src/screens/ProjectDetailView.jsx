import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Eye, 
  Compass, 
  Layers, 
  Car, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Lock,
  Share2
} from 'lucide-react';

export default function ProjectDetailView({ 
  township, 
  onBack, 
  onLaunch3D, 
  onSelectPlot, 
  onBookToken, 
  onScheduleVisit,
  onViewVerification 
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!township) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onScheduleVisit(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition"
          >
            <Car className="w-4 h-4 text-indigo-400" />
            <span>Book Cab Visit</span>
          </button>
          <button
            onClick={() => onLaunch3D(township)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center space-x-1.5 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Launch 3D Sun-Path Twin</span>
          </button>
        </div>
      </div>

      {/* Main Hero & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery Visuals */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src={township.gallery[activeImageIndex] || township.image}
              alt={township.name}
              className="w-full h-full object-cover transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-white font-bold">
                {township.totalAcres} Master-Planned Enclave
              </span>
              <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{township.approvalAuthority}</span>
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-1">
            {township.gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                  activeImageIndex === idx ? 'border-emerald-400 scale-102 shadow' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="gallery" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Project Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{township.developer}</span>
            <h1 className="text-2xl font-black text-white">{township.name}</h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{township.location}</span>
            </p>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Price Per Sq.Ft:</span>
                <span className="text-lg font-bold text-amber-400">₹{township.pricePerSqFt}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Available Plots:</span>
                <span className="text-sm font-bold text-emerald-400">{township.availablePlots} / {township.totalPlots}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">RERA Registration:</span>
                <span className="text-xs font-mono text-slate-300 truncate max-w-[140px]">{township.reraId}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onLaunch3D(township)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Launch 3D Sun-Path Visualizer</span>
            </button>

            <button
              onClick={onViewVerification}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>View 5-Layer Legal Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description & Masterplan Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">About the Plotted Enclave</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {township.description}
            </p>
          </div>

          {/* Master Amenities */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">Curated Enclave Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {township.amenities.map((amenity, i) => (
                <div key={i} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connectivity & Distance Benchmarks */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-white">Strategic Connectivity</h3>
          <div className="space-y-3">
            {township.distanceBenchmarks.map((bm, i) => (
              <div key={i} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-white block">{bm.place}</span>
                <span className="text-[11px] text-emerald-400 font-bold">{bm.distance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Plot Inventory Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">Available Plot Inventory</h3>
            <p className="text-xs text-slate-400">Preview elevation context, Vastu orientation, and reserve with token advance.</p>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            {(township.plots || []).filter(p => p.status === 'Available').length} Plots Ready to Register
          </span>
        </div>

        {(!township.plots || township.plots.length === 0) ? (
          <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No Plots Listed Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Demo plots have been cleared. Developers can register and publish inventory units via the Developer Portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {township.plots.map((plot) => (
              <div
                key={plot.id}
                onClick={() => onSelectPlot(plot)}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">{plot.number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    plot.status === 'Available'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : plot.status === 'Reserved'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {plot.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Size:</span>
                    <span className="font-semibold text-white">{plot.sizeSqFt || plot.size} sq.ft ({plot.dimension || plot.size})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Facing:</span>
                    <span className="font-bold text-emerald-400">{plot.facing} ({plot.vastuScore || 95}% Vastu)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Price:</span>
                    <span className="font-bold text-amber-400">{plot.price}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[120px]">{plot.roadWidth || '40ft Internal Road'}</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition">
                    View Spec →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
