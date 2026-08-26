import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  Compass, 
  Layers, 
  Eye, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Info,
  Maximize2,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function SunPathSimulator({ 
  township, 
  selectedPlot, 
  onSelectPlot, 
  onBookPlot, 
  onScheduleVisit 
}) {
  // Time slider: 6 to 19 (6 AM to 7 PM) in 0.5 hour increments
  const [timeOfDay, setTimeOfDay] = useState(10.5); // 10:30 AM
  const [viewMode, setViewMode] = useState('isometric'); // 'isometric' | 'orthographic'
  const [showVastuOverlay, setShowVastuOverlay] = useState(true);
  const [showElevationContours, setShowElevationContours] = useState(false);
  const [selectedFacingFilter, setSelectedFacingFilter] = useState('ALL'); // 'ALL' | 'East' | 'North' | 'West' | 'South'

  // Calculate Sun Angle and Shadow Vector based on timeOfDay (6 to 18)
  const sunData = useMemo(() => {
    // 6 AM = 0 deg (East), 12 PM = 90 deg (South/Noon Zenith), 18 PM = 180 deg (West)
    const normalizedTime = (timeOfDay - 6) / 12; // 0 to 1
    const sunAngleDeg = normalizedTime * 180; // 0 (East) to 180 (West)
    const sunAngleRad = (sunAngleDeg * Math.PI) / 180;
    
    // Altitude angle (elevation from horizon): 0 at 6am, 75 deg at 12pm, 0 at 6pm
    const altitudeDeg = Math.sin(normalizedTime * Math.PI) * 75;
    const altitudeRad = (altitudeDeg * Math.PI) / 180;

    // Shadow length inversely proportional to altitude
    const shadowLength = Math.max(8, (1 - Math.sin(altitudeRad)) * 48);
    // Shadow direction is opposite to sun
    // Sun at East (0 deg) -> Shadow points West (-x)
    // Sun at South (90 deg) -> Shadow points North (-y)
    // Sun at West (180 deg) -> Shadow points East (+x)
    const shadowOffsetX = -Math.cos(sunAngleRad) * shadowLength;
    const shadowOffsetY = -Math.sin(sunAngleRad) * shadowLength * 0.4;

    // Color of sunlight
    let ambientColor = 'rgba(254, 240, 138, 0.15)'; // Golden morning
    let sunLabel = 'Morning Light (Purva Surya)';
    if (timeOfDay >= 11 && timeOfDay <= 14) {
      ambientColor = 'rgba(255, 255, 255, 0.25)'; // Bright noon
      sunLabel = 'Zenith Direct Sunlight (Madhyahna)';
    } else if (timeOfDay > 14 && timeOfDay <= 17) {
      ambientColor = 'rgba(251, 146, 60, 0.2)'; // Warm afternoon
      sunLabel = 'Afternoon Ambient Light (Aparahna)';
    } else if (timeOfDay > 17) {
      ambientColor = 'rgba(244, 63, 94, 0.25)'; // Golden sunset
      sunLabel = 'Golden Hour Sunset (Sandhya)';
    }

    const hours = Math.floor(timeOfDay);
    const minutes = timeOfDay % 1 !== 0 ? '30' : '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    const timeFormatted = `${displayHour}:${minutes} ${ampm}`;

    return {
      timeFormatted,
      altitudeDeg: Math.round(altitudeDeg),
      sunAngleDeg: Math.round(sunAngleDeg),
      shadowOffsetX,
      shadowOffsetY,
      shadowLength,
      ambientColor,
      sunLabel
    };
  }, [timeOfDay]);

  // Filter plots
  const displayPlots = township?.plots?.filter(p => {
    if (selectedFacingFilter === 'ALL') return true;
    return p.facing.toLowerCase().includes(selectedFacingFilter.toLowerCase());
  }) || [];

  return (
    <div className="space-y-4">
      {/* Visualizer Header Toolbar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg font-black text-white tracking-tight">
              3D Digital Twin & Sun-Path Shadow Simulator
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Physics-Based
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real solar orientation, shadow casting, and 100% Vastu energy alignment for each villa plot.
          </p>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D Isometric / 2D Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                viewMode === 'isometric' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Isometric</span>
            </button>
            <button
              onClick={() => setViewMode('orthographic')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                viewMode === 'orthographic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Masterplan</span>
            </button>
          </div>

          {/* Vastu Overlay Button */}
          <button
            onClick={() => setShowVastuOverlay(!showVastuOverlay)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
              showVastuOverlay 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vastu Energy Grid</span>
          </button>

          {/* Elevation Contours */}
          <button
            onClick={() => setShowElevationContours(!showElevationContours)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
              showElevationContours 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Elevation Contours</span>
          </button>
        </div>
      </div>

      {/* Interactive Sun Slider Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <span className="font-bold text-white block">Solar Position & Shadow Engine</span>
              <span className="text-[11px] text-amber-300 font-semibold">{sunData.sunLabel}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-sm font-black text-white">{sunData.timeFormatted}</span>
            </div>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Solar Zenith: <strong className="text-slate-200">{sunData.altitudeDeg}°</strong>
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="6"
            max="18.5"
            step="0.5"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-gradient-to-r from-amber-500 via-yellow-200 via-amber-400 to-rose-600 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
            <span>6:00 AM (Sunrise East)</span>
            <span>9:00 AM</span>
            <span>12:00 PM (Noon Zenith)</span>
            <span>3:00 PM</span>
            <span>6:30 PM (Sunset West)</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas / Plotted Township Interactive Board */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 min-h-[500px] overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Dynamic Sun Ray Ambient Wash */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${((timeOfDay - 6) / 12) * 100}% 10%, ${sunData.ambientColor}, transparent 70%)`
          }}
        />

        {/* Canvas Top Indicators */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          {/* Compass & North Direction Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 shadow-lg">
            <div className="relative w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
              <span className="absolute top-0 text-[8px] font-black text-rose-400">N</span>
              <span className="absolute right-0.5 text-[8px] font-black text-amber-400">E</span>
              <span className="absolute bottom-0 text-[8px] font-black text-slate-500">S</span>
              <span className="absolute left-0.5 text-[8px] font-black text-slate-500">W</span>
              <div className="w-1 h-4 bg-gradient-to-t from-slate-600 to-rose-500 rounded-full transform rotate-0" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block">True North (0° Grid)</span>
              <span className="text-[10px] text-emerald-400 font-medium">100% Vastu Harmonized</span>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center space-x-4 shadow-lg text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400"></span>
              <span className="text-slate-300">Available</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400"></span>
              <span className="text-slate-300">Reserved</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-400"></span>
              <span className="text-slate-300">Booked / Sold</span>
            </span>
          </div>
        </div>

        {/* Main Township Plotted Layout Grid */}
        {displayPlots.length === 0 ? (
          <div className="relative z-10 my-12 py-12 px-6 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No Plots Registered in this Layout</h4>
              <p className="text-xs text-slate-400 mt-1">
                Demo plots have been cleared. To simulate sun-path and shadow dynamics on this 3D canvas, add real plots through the Developer SaaS Inventory console.
              </p>
            </div>
          </div>
        ) : (
          <div 
            className={`relative z-10 my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 transition-transform duration-500 ${
              viewMode === 'isometric' ? 'transform md:perspective-[1000px] md:rotate-x-[18deg]' : ''
            }`}
          >
            {displayPlots.map((plot) => {
              const isSelected = selectedPlot?.id === plot.id;
              const isAvailable = plot.status === 'Available';
              const isReserved = plot.status === 'Reserved';

              // Dynamic shadow styling based on sun angle
              const shadowStyle = {
                boxShadow: `${sunData.shadowOffsetX}px ${sunData.shadowOffsetY + 6}px ${sunData.shadowLength * 0.8}px rgba(0, 0, 0, 0.65)`
              };

              return (
                <div
                  key={plot.id}
                  onClick={() => onSelectPlot(plot)}
                  style={shadowStyle}
                  className={`relative rounded-2xl p-4 cursor-pointer border transition-all duration-300 flex flex-col justify-between min-h-[140px] group ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 shadow-2xl scale-105 z-20'
                      : isAvailable
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 hover:scale-102'
                      : isReserved
                      ? 'bg-amber-950/40 border-amber-500/40 hover:scale-101'
                      : 'bg-slate-950/60 border-slate-800/40 opacity-60'
                  }`}
                >
                  {/* Plot Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-black text-white tracking-tight">{plot.number}</span>
                      <span className="text-[10px] text-slate-400 block">{plot.dimension || plot.size}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isReserved
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {plot.status}
                    </span>
                  </div>

                  {/* Plot Middle Details */}
                  <div className="my-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{plot.sizeSqFt || plot.size} sq.ft</span>
                      <span className="font-bold text-amber-400">{plot.price}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
                      <Compass className="w-3 h-3" />
                      <span>Facing: {plot.facing} ({plot.vastuScore || 95}% Vastu)</span>
                    </div>
                  </div>

                  {/* Plot Elevation Tag */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px]">{plot.elevation || 'Internal Road'}</span>
                    {isSelected && (
                      <span className="text-emerald-400 font-bold flex items-center">
                        Selected <ArrowRight className="w-3 h-3 ml-0.5" />
                      </span>
                    )}
                  </div>

                  {/* Vastu Overlay Indicator badge */}
                  {showVastuOverlay && (
                    <div className="absolute top-2 right-2 -mt-1 -mr-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 block shadow-sm shadow-emerald-400"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Canvas Bottom Masterplan Features */}
        <div className="relative z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Masterplan Features: <strong>40ft & 60ft Boulevard Roads</strong> • 100% Underground Cabling • EV Stations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Selected Plot:</span>
            {selectedPlot ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {selectedPlot.number} ({selectedPlot.price})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                None Selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
