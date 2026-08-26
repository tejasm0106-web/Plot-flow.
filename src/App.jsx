import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  User, 
  Briefcase, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const mockTownships = [
  {
    id: 'ts_01',
    name: 'Prestige Sanctuary Greens',
    developer: 'Prestige Plotted Townships',
    location: 'Devanahalli, North Bengaluru',
    totalPlots: 120,
    availablePlots: 34,
    priceRange: '₹4,500 - ₹6,200 / sq.ft',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1250/303/PR/210324/004055',
    tag: 'RERA Approved • Luxury Gated Community',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    plots: [
      { id: 'p1', number: 'P-101', size: '1,500 sq.ft', facing: 'East', price: '₹67.5 Lakh', status: 'Available', elevation: '12m elevation view' },
      { id: 'p2', number: 'P-102', size: '1,200 sq.ft', facing: 'North', price: '₹54.0 Lakh', status: 'Available', elevation: 'Corner Plot' },
      { id: 'p3', number: 'P-103', size: '2,400 sq.ft', facing: 'East', price: '₹1.15 Cr', status: 'Reserved', elevation: 'Park Facing' },
      { id: 'p4', number: 'P-104', size: '1,800 sq.ft', facing: 'West', price: '₹85.0 Lakh', status: 'Available', elevation: 'Lake View' },
    ]
  },
  {
    id: 'ts_02',
    name: 'Green Valley Eco Enclave',
    developer: 'Green Valley Developers Pvt Ltd',
    location: 'Sarjapur Extn, East Bengaluru',
    totalPlots: 85,
    availablePlots: 18,
    priceRange: '₹3,200 - ₹4,100 / sq.ft',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1251/308/PR/220815/005120',
    tag: 'Verified Title • 100% Vastu Compliant',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    plots: [
      { id: 'p21', number: 'A-01', size: '1,200 sq.ft', facing: 'East', price: '₹38.4 Lakh', status: 'Available', elevation: 'Clubhouse View' },
      { id: 'p22', number: 'A-02', size: '1,500 sq.ft', facing: 'North-East', price: '₹48.0 Lakh', status: 'Booked', elevation: 'Corner Plot' },
      { id: 'p23', number: 'A-03', size: '2,000 sq.ft', facing: 'North', price: '₹64.0 Lakh', status: 'Available', elevation: 'Wide 40ft Road' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedTownship, setSelectedTownship] = useState(mockTownships[0]);
  const [selectedPlot, setSelectedPlot] = useState(mockTownships[0].plots[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('buyer'); // 'buyer' | 'developer' | 'admin'
  const [view3DMode, setView3DMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                PlotFlow
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Web v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'marketplace' 
                  ? 'bg-slate-800 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Township Marketplace
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'visualizer' 
                  ? 'bg-slate-800 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3D Visualizer</span>
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'verification' 
                  ? 'bg-slate-800 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>RERA & Document Verification</span>
            </button>
            <button
              onClick={() => setActiveTab('developer-crm')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'developer-crm' 
                  ? 'bg-slate-800 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Developer SaaS & CRM
            </button>
          </nav>

          {/* User Role Quick Switcher */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex text-xs">
              <button 
                onClick={() => setUserRole('buyer')}
                className={`px-2.5 py-1 rounded-md transition ${userRole === 'buyer' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                Buyer
              </button>
              <button 
                onClick={() => setUserRole('developer')}
                className={`px-2.5 py-1 rounded-md transition ${userRole === 'developer' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                Builder
              </button>
              <button 
                onClick={() => setUserRole('admin')}
                className={`px-2.5 py-1 rounded-md transition ${userRole === 'admin' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {/* Hero Search Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% RERA & Title Deed Verified Plotted Developments</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Find & Visualize Your Dream Villa Plot in 3D
                </h1>
                <p className="text-slate-400 text-sm sm:text-base">
                  Direct developer inventory, transparent pricing, 3D sun-path simulation, and instant legal deed verification.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by locality, township name, or developer..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <button 
                  onClick={() => setActiveTab('visualizer')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Explore in 3D</span>
                </button>
              </div>
            </div>

            {/* Township Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockTownships.map((ts) => (
                <div 
                  key={ts.id} 
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition shadow-xl flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden group">
                    <img 
                      src={ts.image} 
                      alt={ts.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold">
                      {ts.tag}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-lg text-amber-300 text-xs font-bold flex items-center space-x-1">
                      <span>★ {ts.rating}</span>
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{ts.name}</h2>
                      <p className="text-xs text-slate-400 flex items-center mt-1">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>By {ts.developer}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>{ts.location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center">
                      <div>
                        <span className="text-xs text-slate-500 block">Total Plots</span>
                        <span className="text-sm font-bold text-white">{ts.totalPlots}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Available</span>
                        <span className="text-sm font-bold text-emerald-400">{ts.availablePlots} Plots</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Price Guide</span>
                        <span className="text-xs font-bold text-amber-400">{ts.priceRange}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setSelectedTownship(ts);
                          setSelectedPlot(ts.plots[0]);
                          setActiveTab('visualizer');
                        }}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
                      >
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <span>Interactive 3D Layout</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTownship(ts);
                          setActiveTab('verification');
                        }}
                        className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>View RERA Documents</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3D Visualizer Tab */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>3D Layout Visualizer:</span>
                  <span className="text-emerald-400">{selectedTownship.name}</span>
                </h2>
                <p className="text-xs text-slate-400">Interactive plotted township canvas with directional Vastu alignment and sun-path simulation.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setView3DMode(!view3DMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 ${
                    view3DMode 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{view3DMode ? 'Isometric 3D' : 'Orthographic 2D'}</span>
                </button>
              </div>
            </div>

            {/* Visualizer Canvas & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visualizer Interactive Layout */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[420px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Direct Developer Grid Layout (Phase 1)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span>
                      <span>Available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span>
                      <span>Reserved</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500"></span>
                      <span>Booked</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Plotted Grid */}
                <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedTownship.plots.map((plot) => {
                    const isSelected = selectedPlot?.id === plot.id;
                    const isAvailable = plot.status === 'Available';
                    return (
                      <div
                        key={plot.id}
                        onClick={() => setSelectedPlot(plot)}
                        className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 flex flex-col justify-between h-32 ${
                          isSelected
                            ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg scale-102'
                            : isAvailable
                            ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                            : 'bg-slate-900/40 border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-white">{plot.number}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            plot.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {plot.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">{plot.size}</span>
                          <span className="text-xs font-semibold text-emerald-400 block">{plot.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Orientation: North 0° (True Geographic)</span>
                  </div>
                  <span>40ft Internal Asphalt Roads • Underground Cabling</span>
                </div>
              </div>

              {/* Selected Plot Details Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-lg text-white">Plot Details</h3>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
                      {selectedPlot?.number}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dimensions & Area</span>
                      <span className="font-semibold text-white">{selectedPlot?.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facing Direction</span>
                      <span className="font-semibold text-emerald-400">{selectedPlot?.facing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Elevation View</span>
                      <span className="font-semibold text-slate-300">{selectedPlot?.elevation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Price</span>
                      <span className="font-bold text-amber-400 text-base">{selectedPlot?.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RERA Registration</span>
                      <span className="font-semibold text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button 
                    onClick={() => setActiveTab('verification')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Download Legal Title Audit</span>
                  </button>
                  <button 
                    onClick={() => alert(`Booking site visit for ${selectedPlot?.number} at ${selectedTownship.name}`)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Schedule Physical Visit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification & Legal Documents Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">RERA & Document Verification Vault</h2>
                  <p className="text-xs text-slate-400">All plotted lands on PlotFlow undergo strict 5-layer legal and land-use verification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold block mb-1">01. RERA Approval</span>
                  <p className="text-xs text-slate-300">Karnataka Real Estate Regulatory Authority sanctioned masterplan & timeline.</p>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold block mb-1">02. 30-Year Encumbrance</span>
                  <p className="text-xs text-slate-300">Nil encumbrance certificate (Form 15) verified through state revenue records.</p>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-emerald-400 font-bold block mb-1">03. BDA / BMRDA Sanction</span>
                  <p className="text-xs text-slate-300">Zonal conversion orders and approved layout release letters verified.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Developer SaaS & CRM Tab */}
        {activeTab === 'developer-crm' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Developer SaaS & Inventory Console</h2>
                  <p className="text-xs text-slate-400">Manage real-time plot releases, CRM buyer leads, and milestone disbursements.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-semibold">
                  Prestige Plotted Townships
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Total Township Units</span>
                  <span className="text-2xl font-bold text-white block mt-1">120 Plots</span>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Live CRM Buyer Enquiries</span>
                  <span className="text-2xl font-bold text-emerald-400 block mt-1">48 Active</span>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Pipeline Sales Value</span>
                  <span className="text-2xl font-bold text-amber-400 block mt-1">₹14.8 Cr</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 PlotFlow Technologies India Pvt Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
