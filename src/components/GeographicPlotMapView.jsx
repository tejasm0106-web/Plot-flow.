import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Layers, 
  Compass, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  CheckCircle2, 
  Building2, 
  Car, 
  Plane, 
  Train, 
  Navigation, 
  Crosshair, 
  Info, 
  Tag, 
  Sun, 
  X, 
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Search,
  ExternalLink,
  Award
} from 'lucide-react';

// Default Geographic Coordinates for Townships & Regional Benchmarks (Bengaluru Corridor Datum)
export const REGIONAL_COORDINATES = {
  BENGALURU_CENTER: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru CBD (MG Road)' },
  AIRPORT_KIAL: { lat: 13.1986, lng: 77.7066, label: 'Kempegowda Intl. Airport (BLR)' },
  AEROSPACE_PARK: { lat: 13.2150, lng: 77.7300, label: 'KIADB Aerospace & IT SEZ' },
  SARJAPUR_TECH_HUB: { lat: 12.8700, lng: 77.7850, label: 'Sarjapur-Outer Ring Road Corridor' },
  MYSORE_EXPRESSWAY: { lat: 12.8900, lng: 77.4350, label: 'Bengaluru-Mysuru 10-Lane Expressway' },
  ELECTRONIC_CITY: { lat: 12.8450, lng: 77.6600, label: 'Electronic City Tech Cluster' },
  WHITEFIELD: { lat: 12.9698, lng: 77.7499, label: 'Whitefield IT Export Zone' },
  STRR_RING_ROAD: { lat: 13.2500, lng: 77.6800, label: 'Satellite Town Ring Road (STRR)' }
};

// Township base geo-locations
export const TOWNSHIP_GEO_LOCATIONS = {
  ts_01: { 
    lat: 13.2385, 
    lng: 77.7120, 
    region: 'North Bengaluru (Devanahalli Airport Corridor)',
    corridor: 'Airport Aerospace Corridor',
    elevationMeters: 915,
    nearestHighway: 'NH 44 & STRR Expressway'
  },
  ts_02: { 
    lat: 12.8625, 
    lng: 77.7780, 
    region: 'East Bengaluru (Sarjapur Tech Growth Extn)',
    corridor: 'Sarjapur IT Corridor',
    elevationMeters: 890,
    nearestHighway: 'Sarjapur-Attibele State Highway'
  },
  ts_03: { 
    lat: 12.8845, 
    lng: 77.4420, 
    region: 'South-West Bengaluru (Mysore Road Growth Hub)',
    corridor: 'Expressway Tech Axis',
    elevationMeters: 840,
    nearestHighway: 'Bengaluru-Mysuru 10-Lane Expressway'
  }
};

// Compute micro-coordinates for individual residential plots inside a township
export function getPlotGeoCoordinates(townshipId, plot) {
  const base = TOWNSHIP_GEO_LOCATIONS[townshipId] || { lat: 12.9716, lng: 77.5946 };
  
  // Calculate deterministic offset based on layout row & col coordinates
  const rowOffset = ((plot.row || 1) - 2) * 0.00045;
  const colOffset = ((plot.col || 1) - 3) * 0.00055;
  
  // Micro-jitter based on plot index
  const plotNum = parseInt(String(plot.plotNumber || '101').replace(/\D/g, '')) || 101;
  const jitterX = ((plotNum % 5) - 2) * 0.00008;
  const jitterY = (((plotNum * 3) % 5) - 2) * 0.00008;

  return {
    lat: Number((base.lat + rowOffset + jitterY).toFixed(6)),
    lng: Number((base.lng + colOffset + jitterX).toFixed(6))
  };
}

export default function GeographicPlotMapView({
  townships = [],
  selectedTownshipId = null,
  onSelectTownship,
  onSelectPlot,
  onLaunch3D,
  onBookPlot,
  onScheduleVisit,
  onVerifyDocs,
  height = '650px',
  standalone = false,
  shortlistedTownshipIds = [],
  onToggleShortlist
}) {
  // Map Viewport State
  const [zoomLevel, setZoomLevel] = useState(13); // 11: City View, 13: Township Cluster, 16: Micro-Plot View
  const [mapCenter, setMapCenter] = useState({ lat: 13.1200, lng: 77.6500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Map Layer & Base Theme
  const [mapTheme, setMapTheme] = useState('satellite'); // 'satellite' | 'gis_dark' | 'terrain'
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showDistanceRings, setShowDistanceRings] = useState(true);
  const [showPlotLabels, setShowPlotLabels] = useState(true);
  const [showVastuBadges, setShowVastuBadges] = useState(true);
  const [showPriceTags, setShowPriceTags] = useState(false);

  // Filters
  const [filterTownship, setFilterTownship] = useState(selectedTownshipId || 'ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'Available' | 'Reserved' | 'Sold'
  const [filterFacing, setFilterFacing] = useState('ALL'); // 'ALL' | 'East' | 'North' | 'North-East' | 'West' | 'South'
  const [maxPrice, setMaxPrice] = useState(12000000); // 1.2 Cr
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Pin / Modal State
  const [activePlotPin, setActivePlotPin] = useState(null);
  const [hoveredPlotPin, setHoveredPlotPin] = useState(null);
  const [activeTownshipPin, setActiveTownshipPin] = useState(null);

  const containerRef = useRef(null);

  // Sync selected township prop
  useEffect(() => {
    if (selectedTownshipId && selectedTownshipId !== 'ALL') {
      setFilterTownship(selectedTownshipId);
      const geo = TOWNSHIP_GEO_LOCATIONS[selectedTownshipId];
      if (geo) {
        setMapCenter({ lat: geo.lat, lng: geo.lng });
        setZoomLevel(15);
        setPanOffset({ x: 0, y: 0 });
      }
    }
  }, [selectedTownshipId]);

  // Aggregate all residential plots with geographic coordinates
  const allPlotsWithGeo = useMemo(() => {
    const list = [];
    townships.forEach(ts => {
      const tsGeo = TOWNSHIP_GEO_LOCATIONS[ts.id] || { lat: 12.9716, lng: 77.5946, corridor: 'Bengaluru Zone' };
      (ts.plots || []).forEach(plot => {
        const coords = getPlotGeoCoordinates(ts.id, plot);
        
        // Parse numerical price
        let numPrice = 5000000;
        if (typeof plot.price === 'string') {
          if (plot.price.includes('Cr')) {
            numPrice = parseFloat(plot.price.replace(/[^0-9.]/g, '')) * 10000000;
          } else if (plot.price.includes('Lakh')) {
            numPrice = parseFloat(plot.price.replace(/[^0-9.]/g, '')) * 100000;
          }
        }

        list.push({
          ...plot,
          townshipId: ts.id,
          townshipName: ts.name,
          developer: ts.developer,
          approvalAuthority: ts.approvalAuthority,
          townshipRating: ts.rating,
          corridor: tsGeo.corridor,
          lat: coords.lat,
          lng: coords.lng,
          numPrice
        });
      });
    });
    return list;
  }, [townships]);

  // Filtered plots based on criteria
  const filteredPlots = useMemo(() => {
    return allPlotsWithGeo.filter(plot => {
      const matchTownship = filterTownship === 'ALL' || plot.townshipId === filterTownship;
      const matchStatus = filterStatus === 'ALL' || plot.status?.toLowerCase() === filterStatus.toLowerCase();
      const matchFacing = filterFacing === 'ALL' || plot.facing?.toLowerCase().includes(filterFacing.toLowerCase());
      const matchPrice = (plot.numPrice || 0) <= maxPrice;
      const matchSearch = !searchQuery || 
        plot.plotNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.townshipName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.elevation?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTownship && matchStatus && matchFacing && matchPrice && matchSearch;
    });
  }, [allPlotsWithGeo, filterTownship, filterStatus, filterFacing, maxPrice, searchQuery]);

  // Available vs Reserved vs Sold plot counts
  const plotStats = useMemo(() => {
    const available = filteredPlots.filter(p => p.status === 'Available').length;
    const reserved = filteredPlots.filter(p => p.status === 'Reserved').length;
    const sold = filteredPlots.filter(p => p.status === 'Sold').length;
    return { total: filteredPlots.length, available, reserved, sold };
  }, [filteredPlots]);

  // Convert Geographic Lat/Lng to Screen Canvas Coordinates (Web Mercator projection projection)
  const latLngToScreen = (lat, lng, containerWidth = 900, containerHeight = 600) => {
    const scale = Math.pow(2, zoomLevel) * 22; // Dynamic zoom scaling
    const centerLat = mapCenter.lat;
    const centerLng = mapCenter.lng;

    // Mercator projection relative to center
    const x = (lng - centerLng) * scale * 1.35 + (containerWidth / 2) + panOffset.x;
    const y = -(lat - centerLat) * scale + (containerHeight / 2) + panOffset.y;

    return { x, y };
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-pin') || e.target.closest('.map-control-panel')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - panOffset.x, 
        y: e.touches[0].clientY - panOffset.y 
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(prev + 0.5, 18));
    } else {
      setZoomLevel(prev => Math.max(prev - 0.5, 10));
    }
  };

  // Center on a Township
  const handleFocusTownship = (tsId) => {
    setFilterTownship(tsId);
    if (tsId === 'ALL') {
      setMapCenter({ lat: 13.1200, lng: 77.6500 });
      setZoomLevel(12);
      setPanOffset({ x: 0, y: 0 });
      return;
    }
    const geo = TOWNSHIP_GEO_LOCATIONS[tsId];
    if (geo) {
      setMapCenter({ lat: geo.lat, lng: geo.lng });
      setZoomLevel(15.5);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Center on a specific plot
  const handleFocusPlot = (plot) => {
    setActivePlotPin(plot);
    setMapCenter({ lat: plot.lat, lng: plot.lng });
    setZoomLevel(16.5);
    setPanOffset({ x: 0, y: 0 });
  };

  const resetView = () => {
    setMapCenter({ lat: 13.1200, lng: 77.6500 });
    setZoomLevel(12.5);
    setPanOffset({ x: 0, y: 0 });
    setActivePlotPin(null);
    setFilterTownship('ALL');
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0 h-screen w-screen' : 'w-full'
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Map Title & Quick Stats Pill */}
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-2 pl-3 rounded-2xl border border-slate-700/80 shadow-xl pointer-events-auto">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-white">Spatial Plot Navigator</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-bold">
                GIS Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              <strong className="text-emerald-400">{plotStats.available} Available</strong> • {plotStats.reserved} Reserved • {plotStats.sold} Sold
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls (Theme, Layers, Zoom, Fullscreen) */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl pointer-events-auto">
          
          {/* Base Map Style Selector */}
          <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2 py-1 rounded-lg transition ${
                mapTheme === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="High-Res Satellite Imagery"
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTheme('gis_dark')}
              className={`px-2 py-1 rounded-lg transition ${
                mapTheme === 'gis_dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Dark GIS Vector Corridors"
            >
              GIS Dark
            </button>
            <button
              onClick={() => setMapTheme('terrain')}
              className={`px-2 py-1 rounded-lg transition ${
                mapTheme === 'terrain' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Topographic Terrain & Elevation"
            >
              Terrain
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Infrastructure Toggle */}
          <button
            onClick={() => setShowInfrastructure(!showInfrastructure)}
            className={`p-1.5 rounded-xl border text-xs transition ${
              showInfrastructure 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Metro, Airport & Highway Corridors"
          >
            <Plane className="w-3.5 h-3.5" />
          </button>

          {/* Distance Rings Toggle */}
          <button
            onClick={() => setShowDistanceRings(!showDistanceRings)}
            className={`p-1.5 rounded-xl border text-xs transition ${
              showDistanceRings 
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle 5km / 10km / 15km Distance Rings"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Price Tags Toggle */}
          <button
            onClick={() => setShowPriceTags(!showPriceTags)}
            className={`p-1.5 rounded-xl border text-xs transition ${
              showPriceTags 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Show Direct Price Badges on Pins"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Reset Zoom & Center */}
          <button
            onClick={resetView}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition"
            title="Reset Spatial Center to Bengaluru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Left Filter Drawer / Accordion */}
      <div className="absolute top-20 left-4 z-20 w-72 max-w-[calc(100vw-32px)] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-3 pointer-events-auto text-xs hidden md:block">
        
        {/* Township Filter Dropdown */}
        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>Township Focus</span>
            <span className="text-emerald-400 font-mono">Zoom: {zoomLevel.toFixed(1)}x</span>
          </label>
          <select
            value={filterTownship}
            onChange={(e) => handleFocusTownship(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
          >
            <option value="ALL">🌐 All Bengaluru Townships ({allPlotsWithGeo.length} Plots)</option>
            {townships.map(ts => (
              <option key={ts.id} value={ts.id}>
                {ts.name} ({ts.availablePlots} Avail)
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Chips */}
        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Plot Availability
          </label>
          <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
            {['ALL', 'Available', 'Reserved', 'Sold'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`py-1 rounded-lg border transition text-center ${
                  filterStatus === st
                    ? st === 'Available' 
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : st === 'Reserved'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : st === 'Sold'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Facing Direction Filter */}
        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Vastu Facing
          </label>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
            {['ALL', 'East', 'North', 'North-East', 'West', 'South'].map(fc => (
              <button
                key={fc}
                onClick={() => setFilterFacing(fc)}
                className={`py-1 px-1 rounded-lg border transition truncate ${
                  filterFacing === fc
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {fc === 'ALL' ? 'Any Facing' : fc}
              </button>
            ))}
          </div>
        </div>

        {/* Max Budget Slider */}
        <div className="pt-1 border-t border-slate-800">
          <div className="flex justify-between items-center mb-1 text-[11px]">
            <span className="text-slate-400">Max Budget</span>
            <span className="text-amber-400 font-bold font-mono">
              ₹{(maxPrice / 100000).toFixed(1)} Lakh
            </span>
          </div>
          <input
            type="range"
            min="3000000"
            max="12000000"
            step="500000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
        </div>
      </div>

      {/* Floating Bottom Right Zoom Controller */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
          className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div 
        className={`w-full h-full relative cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* SVG GIS Layer: Base Grids, Roads, Corridors, Heatmaps & Overlays */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Satellite Terrain Grid Pattern */}
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapTheme === 'satellite' ? '#1e293b' : '#0f172a'} strokeWidth="0.75" strokeOpacity="0.4" />
              <circle cx="20" cy="20" r="0.7" fill="#334155" opacity="0.3" />
            </pattern>

            {/* Glowing Gradient for Available Plots */}
            <radialGradient id="pulseGlowAvailable" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Glowing Gradient for Reserved */}
            <radialGradient id="pulseGlowReserved" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Highway Corridor Stroke Patterns */}
            <linearGradient id="strrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="airportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Background Canvas Layer (Stylized Based on Theme) */}
          <rect 
            width="100%" 
            height="100%" 
            fill={
              mapTheme === 'satellite' 
                ? '#060c14' 
                : mapTheme === 'terrain'
                ? '#0d131a'
                : '#030712'
            } 
          />

          {/* Topographic Contours / Land Mass Representation */}
          {mapTheme === 'terrain' && (
            <g opacity="0.35">
              <path d="M-100,200 Q200,100 500,250 T1200,150 L1200,800 L-100,800 Z" fill="#0f291e" />
              <path d="M-100,350 Q300,250 700,400 T1200,300 L1200,800 L-100,800 Z" fill="#143628" />
              <path d="M100,500 Q400,350 800,550 T1400,450" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="6,6" opacity="0.3" />
            </g>
          )}

          {/* Base GIS Orthogonal Grid */}
          <rect width="100%" height="100%" fill="url(#gisGrid)" />

          {/* Infrastructure Arteries & Expressways (Bengaluru Corridors) */}
          {showInfrastructure && (
            <g>
              {/* Outer Ring Road & STRR Ring (Curved Bezier Paths between geographic coordinates) */}
              {(() => {
                const center = latLngToScreen(REGIONAL_COORDINATES.BENGALURU_CENTER.lat, REGIONAL_COORDINATES.BENGALURU_CENTER.lng);
                const airport = latLngToScreen(REGIONAL_COORDINATES.AIRPORT_KIAL.lat, REGIONAL_COORDINATES.AIRPORT_KIAL.lng);
                const strr = latLngToScreen(REGIONAL_COORDINATES.STRR_RING_ROAD.lat, REGIONAL_COORDINATES.STRR_RING_ROAD.lng);
                const sarjapur = latLngToScreen(REGIONAL_COORDINATES.SARJAPUR_TECH_HUB.lat, REGIONAL_COORDINATES.SARJAPUR_TECH_HUB.lng);
                const mysore = latLngToScreen(REGIONAL_COORDINATES.MYSORE_EXPRESSWAY.lat, REGIONAL_COORDINATES.MYSORE_EXPRESSWAY.lng);

                return (
                  <>
                    {/* NH 44 Airport Highway Expressway */}
                    <path
                      d={`M ${center.x} ${center.y} Q ${(center.x + airport.x)/2 - 30} ${(center.y + airport.y)/2} ${airport.x} ${airport.y}`}
                      fill="none"
                      stroke="url(#airportGradient)"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      opacity="0.75"
                    />

                    {/* STRR 6-Lane Expressway Hub */}
                    <path
                      d={`M ${mysore.x} ${mysore.y} Q ${center.x - 80} ${center.y + 40} ${strr.x} ${strr.y} Q ${airport.x + 60} ${airport.y - 20} ${sarjapur.x + 80} ${sarjapur.y}`}
                      fill="none"
                      stroke="url(#strrGradient)"
                      strokeWidth="2.5"
                      opacity="0.65"
                    />

                    {/* Sarjapur-Outer Ring Road Expressway */}
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={sarjapur.x}
                      y2={sarjapur.y}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="6,3"
                      opacity="0.7"
                    />

                    {/* Mysore Expressway Axis */}
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={mysore.x}
                      y2={mysore.y}
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      opacity="0.7"
                    />

                    {/* Key Infrastructure Hub Nodes */}
                    <g>
                      {/* BLR Airport Icon Pin */}
                      <circle cx={airport.x} cy={airport.y} r="14" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x={airport.x + 18} y={airport.y + 4} fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                        ✈️ Kempegowda Intl. Airport (BLR)
                      </text>

                      {/* Bengaluru CBD Hub */}
                      <circle cx={center.x} cy={center.y} r="8" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                      <text x={center.x + 12} y={center.y + 4} fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                        🏛️ Bengaluru CBD
                      </text>

                      {/* STRR Interchange */}
                      <circle cx={strr.x} cy={strr.y} r="6" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1.5" />
                      <text x={strr.x + 10} y={strr.y + 3} fill="#a5b4fc" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                        🛣️ STRR 6-Lane Expressway Exit
                      </text>
                    </g>
                  </>
                );
              })()}
            </g>
          )}

          {/* Distance / Isochrone Radius Rings around Selected Township */}
          {showDistanceRings && Object.entries(TOWNSHIP_GEO_LOCATIONS).map(([tsId, geo]) => {
            if (filterTownship !== 'ALL' && filterTownship !== tsId) return null;
            const center = latLngToScreen(geo.lat, geo.lng);
            const scale = Math.pow(2, zoomLevel) * 0.005;

            return (
              <g key={`ring_${tsId}`} opacity="0.4">
                {/* 3km Ring */}
                <circle 
                  cx={center.x} 
                  cy={center.y} 
                  r={Math.max(35, 30 * scale)} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="1" 
                  strokeDasharray="4,4" 
                />
                <text 
                  x={center.x + Math.max(35, 30 * scale) + 4} 
                  y={center.y} 
                  fill="#10b981" 
                  fontSize="8" 
                  fontWeight="bold"
                >
                  3 km Radius
                </text>

                {/* 7km Ring */}
                <circle 
                  cx={center.x} 
                  cy={center.y} 
                  r={Math.max(70, 70 * scale)} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="1" 
                  strokeDasharray="6,6" 
                />
                <text 
                  x={center.x + Math.max(70, 70 * scale) + 4} 
                  y={center.y} 
                  fill="#818cf8" 
                  fontSize="8" 
                  fontWeight="bold"
                >
                  7 km Radius
                </text>
              </g>
            );
          })}
        </svg>

        {/* Township Cluster Regional Badges (Shown when Zoom is Out / Medium) */}
        {zoomLevel < 15 && townships.map(ts => {
          const geo = TOWNSHIP_GEO_LOCATIONS[ts.id] || { lat: 12.9716, lng: 77.5946 };
          const pos = latLngToScreen(geo.lat, geo.lng);
          const isSelected = filterTownship === ts.id;

          return (
            <div
              key={`ts_marker_${ts.id}`}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -100%)'
              }}
              onClick={() => handleFocusTownship(ts.id)}
              className="interactive-pin cursor-pointer group z-10"
            >
              <div className={`p-2.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 flex items-center space-x-2.5 ${
                isSelected 
                  ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-500/50 scale-110' 
                  : 'bg-slate-900/90 border-slate-700 hover:border-emerald-400 hover:scale-105'
              }`}>
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-700">
                  <img src={ts.image} alt={ts.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-emerald-500/10" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-black text-white">{ts.name}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-md">
                      {ts.availablePlots} Plots
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {ts.developer} • <strong className="text-amber-400">₹{ts.pricePerSqFt}/sq.ft</strong>
                  </p>
                </div>
              </div>

              {/* Pin Indicator Needle */}
              <div className="w-0.5 h-3 bg-emerald-400 mx-auto shadow-md" />
              <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto -mt-1 ring-4 ring-emerald-500/30 animate-pulse" />
            </div>
          );
        })}

        {/* Individual Residential Plot Pins (Rendered at High Zoom & Filter Focus) */}
        {filteredPlots.map((plot) => {
          const pos = latLngToScreen(plot.lat, plot.lng);
          const isSelected = activePlotPin?.id === plot.id;
          const isHovered = hoveredPlotPin?.id === plot.id;
          const isAvail = plot.status === 'Available';
          const isReserved = plot.status === 'Reserved';
          const isSold = plot.status === 'Sold';

          // Skip rendering if completely off screen to maintain 60 FPS
          if (pos.x < -100 || pos.x > 2000 || pos.y < -100 || pos.y > 1500) return null;

          return (
            <div
              key={`plot_pin_${plot.townshipId}_${plot.id}`}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 30 : isHovered ? 25 : 15
              }}
              onClick={() => handleFocusPlot(plot)}
              onMouseEnter={() => setHoveredPlotPin(plot)}
              onMouseLeave={() => setHoveredPlotPin(null)}
              className="interactive-pin cursor-pointer transition-transform duration-200 hover:scale-125"
            >
              {/* Dynamic Pin Body */}
              <div className="relative flex flex-col items-center">
                
                {/* Radar Ripple Effect for Available Plots */}
                {isAvail && (
                  <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                )}

                {/* Main Pin Dot / Badge */}
                <div className={`px-2 py-1 rounded-xl font-bold text-[10px] flex items-center space-x-1 shadow-xl border transition-all ${
                  isAvail
                    ? isSelected
                      ? 'bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-400/40 scale-110'
                      : 'bg-emerald-600/90 text-white border-emerald-400/80 hover:bg-emerald-500'
                    : isReserved
                    ? 'bg-amber-600/90 text-white border-amber-400/80'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 opacity-60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isAvail ? 'bg-white' : isReserved ? 'bg-amber-200' : 'bg-slate-500'
                  }`} />
                  
                  <span>{plot.plotNumber}</span>

                  {showVastuBadges && plot.vastuScore && (
                    <span className="text-[8px] bg-slate-950/60 px-1 py-0.2 rounded text-emerald-300 font-mono">
                      ★{plot.vastuScore}
                    </span>
                  )}
                </div>

                {/* Optional Micro Price Label Tag */}
                {showPriceTags && isAvail && (
                  <span className="mt-0.5 px-1.5 py-0.2 bg-slate-950/90 border border-slate-700 text-amber-400 text-[8px] font-bold rounded-md whitespace-nowrap shadow">
                    {plot.price}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* Interactive Selected Plot Floating Card / Bottom Inspector */}
      {activePlotPin && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn pointer-events-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border shadow-inner ${
                activePlotPin.status === 'Available'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : activePlotPin.status === 'Reserved'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activePlotPin.plotNumber?.replace(/\D/g, '') || 'P'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-black text-white">{activePlotPin.plotNumber}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activePlotPin.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : activePlotPin.status === 'Reserved'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {activePlotPin.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{activePlotPin.townshipName}</p>
              </div>
            </div>

            <button
              onClick={() => setActivePlotPin(null)}
              className="p-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Plot Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Plot Dimensions</span>
              <span className="font-bold text-white block mt-0.5">{activePlotPin.dimensions}</span>
              <span className="text-[10px] text-emerald-400 font-mono">{activePlotPin.sqft} sq.ft</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Vastu Facing</span>
              <span className="font-bold text-white block mt-0.5">{activePlotPin.facing}</span>
              <span className="text-[10px] text-amber-400 font-mono">★ {activePlotPin.vastuScore}/10</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Price / Sq.Ft</span>
              <span className="font-bold text-amber-400 block mt-0.5">{activePlotPin.price}</span>
              <span className="text-[10px] text-slate-400 font-mono">₹{activePlotPin.pricePerSqFt}/sq.ft</span>
            </div>
          </div>

          {/* Micro Spatial Datum & Elevation */}
          <div className="p-2.5 bg-slate-900/50 rounded-2xl border border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location: <strong className="text-white">{activePlotPin.elevation}</strong></span>
            </span>
            <span className="font-mono text-slate-500 text-[10px]">
              {activePlotPin.lat?.toFixed(4)}° N, {activePlotPin.lng?.toFixed(4)}° E
            </span>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                const ts = townships.find(t => t.id === activePlotPin.townshipId);
                if (onLaunch3D && ts) onLaunch3D(ts);
              }}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Sun-Path</span>
            </button>

            <button
              onClick={() => {
                if (onBookPlot) onBookPlot(activePlotPin);
              }}
              disabled={activePlotPin.status !== 'Available'}
              className={`py-2.5 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 ${
                activePlotPin.status === 'Available'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activePlotPin.status === 'Available' ? 'Reserve (₹25k)' : 'Unavailable'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-[10px] text-slate-400 font-semibold pointer-events-auto">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
          <span className="text-white">Available Plot</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Token Reserved</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <span>Registered/Sold</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="flex items-center space-x-1 text-slate-300">
          <Navigation className="w-3 h-3 text-emerald-400" />
          <span>Drag to Pan • Wheel to Zoom</span>
        </span>
      </div>

    </div>
  );
}
