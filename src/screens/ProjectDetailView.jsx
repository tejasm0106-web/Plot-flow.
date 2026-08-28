import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Eye, 
  Compass, 
  Building2, 
  CheckCircle2, 
  Car, 
  Calendar, 
  DollarSign, 
  Download, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  Award,
  Phone,
  Map as MapIcon
} from 'lucide-react';
import { addLead } from '../services/storeService';
import GeographicPlotMapView from '../components/GeographicPlotMapView';

export default function ProjectDetailView({ 
  township, 
  onBack, 
  onLaunch3D, 
  onVerifyDocs,
  onBookVisit,
  onSelectPlot,
  onBookToken,
  onScheduleVisit,
  isShortlisted,
  onToggleShortlist
}) {
  const [selectedImage, setSelectedImage] = useState(township?.image || '');
  const [plotFilter, setPlotFilter] = useState('All'); // 'All' | 'Available' | 'Reserved' | 'Sold'
  const [selectedPlotForInquiry, setSelectedPlotForInquiry] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'spatial_map' | 'inventory'

  // Inquiry Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!township) return null;

  const plots = township.plots || [];
  const filteredPlots = plots.filter(p => {
    if (plotFilter === 'All') return true;
    return p.status?.toLowerCase() === plotFilter.toLowerCase();
  });

  const handleOpenInquiry = (plot = null) => {
    setSelectedPlotForInquiry(plot);
    setSubmitted(false);
    setInquiryModalOpen(true);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    addLead({
      buyerName: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email,
      townshipName: township.name,
      interestedPlot: selectedPlotForInquiry ? `${selectedPlotForInquiry.plotNumber} (${selectedPlotForInquiry.dimensions}, ${selectedPlotForInquiry.facing})` : 'General Project Inquiry',
      budget: selectedPlotForInquiry?.price || township.priceRange,
      visitDate: 'Site Visit Requested',
      source: 'Project Detail View',
      notes: leadForm.notes
    });

    setSubmitted(true);
    setTimeout(() => {
      setInquiryModalOpen(false);
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5 transition"
        >
          <span>← Back to Marketplace</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleShortlist(township.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
              isShortlisted
                ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{isShortlisted ? 'Saved' : 'Save Project'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header & Gallery Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{township.developer}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                {township.approvalAuthority || 'RERA Sanctioned'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">{township.name}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{township.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onLaunch3D(township)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Launch 3D Sun-Path Twin</span>
            </button>
            <button
              onClick={() => handleOpenInquiry(null)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Car className="w-4 h-4" />
              <span>Schedule Site Visit</span>
            </button>
          </div>
        </div>

        {/* Gallery Image Selector */}
        <div className="space-y-3">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-800">
            <img
              src={selectedImage || township.image}
              alt={township.name}
              className="w-full h-full object-cover transition duration-300"
            />
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-400">
              Rate: ₹{township.pricePerSqFt}/sq.ft
            </div>
          </div>

          {township.gallery && township.gallery.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {township.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedImage === img ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Layout Extent</span>
            <span className="text-base font-bold text-white mt-0.5 block">{township.totalAcres}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Available Inventory</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{township.availablePlots} of {township.totalPlots} Plots</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">K-RERA Sanction ID</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate" title={township.reraId}>{township.reraId || 'Sanctioned'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Price Bracket</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">{township.priceRange}</span>
          </div>
        </div>

        {/* Interactive View Section Selector Tabs */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white border border-slate-700 shadow'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Masterplan & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('spatial_map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'spatial_map'
                ? 'bg-emerald-600 text-white border border-emerald-500 shadow'
                : 'bg-slate-900/60 text-emerald-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Geographic Plot Map (GIS)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'inventory'
                ? 'bg-slate-800 text-white border border-slate-700 shadow'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plot Directory ({township.plots?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Conditional Spatial Geographic Map View */}
      {activeTab === 'spatial_map' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MapIcon className="w-5 h-5 text-emerald-400" />
                  <span>Geographic Coordinates & Regional Corridors</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time micro-coordinates of each plot in {township.name} plotted on Bangalore spatial satellite cartography.
                </p>
              </div>
              <button
                onClick={() => onLaunch3D(township)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Launch 3D Sun-Path</span>
              </button>
            </div>

            <GeographicPlotMapView
              townships={[township]}
              selectedTownshipId={township.id}
              onLaunch3D={onLaunch3D}
              onBookPlot={(plot) => handleOpenInquiry(plot)}
              height="600px"
            />
          </div>
        </div>
      )}

      {/* Tab 1: Overview & Amenities */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white">Masterplan Overview & Infrastructure</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {township.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sanctioned Amenities & Civic Works</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {township.amenities?.map((am, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distance Benchmarks */}
            {township.distanceBenchmarks && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exact Connectivity Benchmarks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {township.distanceBenchmarks.map((bm, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{bm.place}</span>
                      <span className="font-bold text-emerald-400">{bm.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Title Diligence & 5-Layer Vault CTA */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">5-Layer Title Diligence</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Certified clear title with 30-year sub-registrar search (Kaveri-2 EC Form 15), DC residential conversion order, and sanctioned master layout plan.
              </p>
              <button
                onClick={onVerifyDocs}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Inspect Legal Vault Dossiers</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Direct Advisory</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Have questions about bank loan approvals (SBI, HDFC, ICICI) or custom villa construction guidelines?
              </p>
              <div className="text-xs font-bold text-white pt-1">
                Call: <span className="text-emerald-400">+91 80 4712 9900</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 or Overview: Interactive Plot Directory Table */}
      {(activeTab === 'overview' || activeTab === 'inventory') && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Interactive Plot Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any plot to inspect facing, dimensions, pricing, and launch the 3D sun-path simulation.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {['All', 'Available', 'Reserved', 'Sold'].map((st) => (
              <button
                key={st}
                onClick={() => setPlotFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
                  plotFilter === st
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Plot #</th>
                <th className="pb-3">Dimensions</th>
                <th className="pb-3">Area (Sq.ft)</th>
                <th className="pb-3">Facing</th>
                <th className="pb-3">Elevation</th>
                <th className="pb-3">Vastu Score</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlots.map((plot) => (
                <tr key={plot.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 font-bold text-white">{plot.plotNumber}</td>
                  <td className="py-3 text-slate-300 font-mono">{plot.dimensions}</td>
                  <td className="py-3 text-slate-300 font-bold">{plot.sqft} sq.ft</td>
                  <td className="py-3 text-emerald-400 font-semibold">{plot.facing}</td>
                  <td className="py-3 text-slate-400">{plot.elevation}</td>
                  <td className="py-3 font-bold text-amber-400 font-mono">{plot.vastuScore || '9.5'} / 10</td>
                  <td className="py-3 font-bold text-white">{plot.price}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plot.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : plot.status === 'Reserved'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {plot.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => onLaunch3D(township)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition"
                      title="Inspect 3D Sun Path"
                    >
                      3D Twin
                    </button>
                    {plot.status === 'Available' && (
                      <button
                        onClick={() => handleOpenInquiry(plot)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition"
                      >
                        Enquire
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

      {/* Booking / Inquiry Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {selectedPlotForInquiry ? `Reserve / Enquire ${selectedPlotForInquiry.plotNumber}` : `Inquiry for ${township.name}`}
              </h3>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Inquiry Successfully Registered</h4>
                <p className="text-xs text-slate-400">Our concierge will contact you within 30 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {selectedPlotForInquiry && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selected Plot:</span>
                      <strong className="text-white">{selectedPlotForInquiry.plotNumber} ({selectedPlotForInquiry.dimensions})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Price:</span>
                      <strong className="text-emerald-400">{selectedPlotForInquiry.price}</strong>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98450 12345"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. vikram@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Notes / Preferences</label>
                  <textarea
                    rows={2}
                    placeholder="Preferred day for site visit, loan requirements..."
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Submit Plot Reservation Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
