import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Layers, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  ArrowUpDown, 
  Grid, 
  List, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function MarketplaceView({ 
  townships, 
  onSelectTownship, 
  onLaunch3D, 
  onViewDetails,
  shortlistedTownships = [],
  onToggleShortlist 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('ALL'); // 'ALL' | 'BDA' | 'BMRDA' | 'BIAPPA'
  const [maxPrice, setMaxPrice] = useState(6000); // max price per sqft slider
  const [selectedFacing, setSelectedFacing] = useState('ALL'); // 'ALL' | 'East' | 'North'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'priceAsc' | 'priceDesc' | 'plots'

  // Filtered and Sorted Townships
  const filteredTownships = useMemo(() => {
    return townships
      .filter((ts) => {
        const matchesQuery = 
          ts.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.developer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAuthority = 
          selectedAuthority === 'ALL' || 
          ts.approvalAuthority.toLowerCase().includes(selectedAuthority.toLowerCase());

        const matchesPrice = ts.pricePerSqFt <= maxPrice;

        return matchesQuery && matchesAuthority && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'priceAsc') return a.pricePerSqFt - b.pricePerSqFt;
        if (sortBy === 'priceDesc') return b.pricePerSqFt - a.pricePerSqFt;
        if (sortBy === 'plots') return b.availablePlots - a.availablePlots;
        return 0;
      });
  }, [townships, searchQuery, selectedAuthority, maxPrice, sortBy]);

  return (
    <div className="space-y-6">
      {/* Marketplace Header & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-xl font-black text-white">Verified Plotted Townships</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore RERA-sanctioned plotted communities with 100% legal title clearance and interactive 3D digital twins.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by location, builder, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
          {/* Authority Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 font-semibold flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Authority:</span>
            </span>
            {['ALL', 'BDA', 'BMRDA', 'BIAPPA'].map((auth) => (
              <button
                key={auth}
                onClick={() => setSelectedAuthority(auth)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedAuthority === auth
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {auth === 'ALL' ? 'All Approvals' : auth}
              </button>
            ))}
          </div>

          {/* Max Price Per Sqft Slider & Sort Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Max: <strong className="text-amber-400">₹{maxPrice}/sq.ft</strong></span>
              <input
                type="range"
                min="2500"
                max="6500"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="rating" className="bg-slate-900">Highest Rated</option>
                <option value="priceAsc" className="bg-slate-900">Price: Low to High</option>
                <option value="priceDesc" className="bg-slate-900">Price: High to Low</option>
                <option value="plots" className="bg-slate-900">Most Available Plots</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Townships List/Grid */}
      {filteredTownships.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Townships Found</h3>
          <p className="text-xs text-slate-400">Try loosening your search query or authority filters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTownships.map((ts) => {
            const isShortlisted = shortlistedTownships.includes(ts.id);

            return (
              <div
                key={ts.id}
                className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition shadow-xl flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={ts.image}
                    alt={ts.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{ts.approvalAuthority}</span>
                    </span>
                  </div>

                  {/* Bookmark / Shortlist button */}
                  <button
                    onClick={() => onToggleShortlist(ts.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition"
                  >
                    {isShortlisted ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="text-white font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800">
                      {ts.totalAcres}
                    </span>
                    <span className="text-amber-400 font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800">
                      ₹{ts.pricePerSqFt}/sq.ft
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">{ts.developer}</span>
                    <h3 
                      onClick={() => onViewDetails(ts)}
                      className="text-lg font-bold text-white mt-0.5 hover:text-emerald-400 cursor-pointer transition"
                    >
                      {ts.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{ts.location}</span>
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Available Plots</span>
                      <span className="font-bold text-emerald-400">{ts.availablePlots} Units Left</span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Starting From</span>
                      <span className="font-bold text-amber-400">{ts.priceRange.split('-')[0]}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => {
                        onSelectTownship(ts);
                        onLaunch3D(ts);
                      }}
                      className="flex-1 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>3D Digital Twin</span>
                    </button>
                    <button
                      onClick={() => onViewDetails(ts)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
