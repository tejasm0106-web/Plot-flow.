import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Eye, 
  Car, 
  Layers 
} from 'lucide-react';

export default function CompareView({ 
  townships, 
  shortlistedTownshipIds = [], 
  onRemoveShortlist, 
  onLaunch3D, 
  onScheduleVisit 
}) {
  const comparedTownships = townships.filter(ts => shortlistedTownshipIds.includes(ts.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl font-black text-white">Compare & Shortlisted Townships</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare shortlisted plotted communities side-by-side across rate per sq.ft, Vastu compliance, and connectivity benchmarks.
          </p>
        </div>

        <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1.5 rounded-xl border border-indigo-500/30">
          {comparedTownships.length} Saved in Comparison
        </span>
      </div>

      {comparedTownships.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Townships Shortlisted Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any plotted township card in the Marketplace to add it to this side-by-side comparison matrix.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                  <th className="p-4 w-48 font-bold">Comparison Feature</th>
                  {comparedTownships.map((ts) => (
                    <th key={ts.id} className="p-4 font-bold text-white min-w-[220px]">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{ts.name}</span>
                        <button
                          onClick={() => onRemoveShortlist(ts.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {/* Developer */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Developer / Builder</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 font-bold text-white">{ts.developer}</td>
                  ))}
                </tr>

                {/* Location */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Micro-Market Location</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 text-slate-300">{ts.location}</td>
                  ))}
                </tr>

                {/* Price Per Sqft */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Price Per Sq.Ft</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 text-amber-400 font-bold text-sm">₹{ts.pricePerSqFt}/sq.ft</td>
                  ))}
                </tr>

                {/* Price Range */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Unit Price Range</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 text-white font-semibold">{ts.priceRange}</td>
                  ))}
                </tr>

                {/* RERA Approval */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Approval Authority</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/30 flex items-center space-x-1 w-max">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{ts.approvalAuthority}</span>
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Total Land Parcel */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Total Land Parcel</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 text-slate-300">{ts.totalAcres} ({ts.totalPlots} Total Units)</td>
                  ))}
                </tr>

                {/* Available Inventory */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Available Inventory</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 text-emerald-400 font-bold">{ts.availablePlots} Units Remaining</td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Instant Actions</td>
                  {comparedTownships.map((ts) => (
                    <td key={ts.id} className="p-4 space-y-2">
                      <button
                        onClick={() => onLaunch3D(ts)}
                        className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D Twin</span>
                      </button>
                      <button
                        onClick={() => onScheduleVisit(null)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 transition"
                      >
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Book Visit</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
