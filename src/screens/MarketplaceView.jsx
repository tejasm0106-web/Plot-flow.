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
  ArrowRight,
  Filter,
  RotateCcw,
  Map as MapIcon
} from 'lucide-react';
import GeographicPlotMapView from '../components/GeographicPlotMapView';

export default function MarketplaceView({ 
  townships = [], 
  onSelectTownship, 
  onLaunch3D, 
  onViewDetails,
  onVerifyDocs,
  onSelectPlot,
  onBookPlot,
  onScheduleVisit,
  shortlistedTownships = [],
  onToggleShortlist,
  initialViewMode = 'grid'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(6500);
  const [selectedFacing, setSelectedFacing] = useState('ALL');
  const [viewMode, setViewMode] = useState(initialViewMode); // 'grid' | 'list' | 'map'
  const [sortBy, setSortBy] = useState('rating');

  // Filtered and Sorted Townships
  const filteredTownships = useMemo(() => {
    return townships
      .filter((ts) => {
        const matchesQuery = 
          ts.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ts.city?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAuthority = 
          selectedAuthority === 'ALL' || 
          ts.approvalAuthority?.toLowerCase().includes(selectedAuthority.toLowerCase());

        const matchesPrice = (ts.pricePerSqFt || 0) <= maxPrice;

        return matchesQuery && matchesAuthority && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'priceAsc') return (a.pricePerSqFt || 0) - (b.pricePerSqFt || 0);
        if (sortBy === 'priceDesc') return (b.pricePerSqFt || 0) - (a.pricePerSqFt || 0);
        if (sortBy === 'plots') return (b.availablePlots || 0) - (a.availablePlots || 0);
        return 0;
      });
  }, [townships, searchQuery, selectedAuthority, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAuthority('ALL');
    setMaxPrice(6500);
    setSelectedFacing('ALL');
    setSortBy('rating');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Marketplace Header & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h1 className="text-xl sm:text-2xl font-black text-white">Verified Plotted Townships</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore RERA-sanctioned plotted communities with 30-year sub-registrar title clearance and interactive 3D digital twins.
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
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs">
          {/* Authority Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 font-semibold flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Authority:</span>
            </span>
            {['ALL', 'BDA', 'BMRDA', 'BIAAPA', 'DTCP'].map((auth) => (
              <button
                key={auth}
                onClick={() => setSelectedAuthority(auth)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
                  selectedAuthority === auth
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {auth === 'ALL' ? 'All Authorities' : auth}
              </button>
            ))}
          </div>

          {/* Max Price Per Sqft Slider & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-4">
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

            {/* View Mode Toggle: Grid | List | Map */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 font-bold ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 font-bold ${
                  viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 font-bold ${
                  viewMode === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
                }`}
                title="Spatial Geographic Map View"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>GIS Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Townships Count & Reset */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Showing <strong>{filteredTownships.length}</strong> verified plotted developments</span>
        {(searchQuery || selectedAuthority !== 'ALL' || maxPrice < 6500) && (
          <button
            onClick={handleResetFilters}
            className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Townships Content */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <GeographicPlotMapView
            townships={filteredTownships}
            onSelectTownship={onSelectTownship}
            onLaunch3D={onLaunch3D}
            onSelectPlot={onSelectPlot}
            onBookPlot={onBookPlot}
            onScheduleVisit={onScheduleVisit}
            onVerifyDocs={onVerifyDocs}
            shortlistedTownshipIds={shortlistedTownships}
            onToggleShortlist={onToggleShortlist}
            height="720px"
          />
        </div>
      ) : filteredTownships.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Townships Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or increasing the maximum price per sq.ft slider.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTownships.map((ts) => {
            const isShortlisted = shortlistedTownships.includes(ts.id);

            return (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Approval Badge */}
                  <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{ts.approvalAuthority || 'RERA Sanctioned'}</span>
                  </span>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleShortlist(ts.id)}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition ${
                      isShortlisted
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title={isShortlisted ? 'Saved' : 'Save for comparison'}
                  >
                    {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-800">
                    ₹{ts.pricePerSqFt}/sq.ft
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold">{ts.developer}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-emerald-400 transition">{ts.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{ts.location}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Total Area</span>
                      <span className="font-bold text-white">{ts.totalAcres}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Available Plots</span>
                      <span className="font-bold text-emerald-400">{ts.availablePlots} / {ts.totalPlots}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onViewDetails(ts)}
                      className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onLaunch3D(ts)}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>3D Twin</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredTownships.map((ts) => {
            const isShortlisted = shortlistedTownships.includes(ts.id);

            return (
              <div
                key={ts.id}
                className="bg-slate-950 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img src={ts.image} alt={ts.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{ts.developer}</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        {ts.approvalAuthority || 'RERA'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">{ts.name}</h3>
                    <p className="text-xs text-slate-400">{ts.location}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-300 mt-2">
                      <span>Total: <strong>{ts.totalAcres}</strong></span>
                      <span>•</span>
                      <span>Plots: <strong className="text-emerald-400">{ts.availablePlots} Available</strong></span>
                      <span>•</span>
                      <span>Rate: <strong className="text-amber-400">₹{ts.pricePerSqFt}/sq.ft</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onToggleShortlist(ts.id)}
                    className={`p-2.5 rounded-xl border transition ${
                      isShortlisted ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewDetails(ts)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onLaunch3D(ts)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>3D Twin</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
