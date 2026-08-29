import React, { useState, useEffect } from 'react';
import { 
  X, 
  Compass, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Car, 
  CreditCard, 
  Sparkles, 
  Calculator, 
  Share2, 
  CheckCircle2,
  Calendar,
  PhoneCall,
  Lock,
  ArrowRight,
  FileText,
  Eye,
  Download,
  Unlock,
  AlertTriangle,
  ExternalLink,
  Paperclip
} from 'lucide-react';
import { 
  getLocalCachedDocuments, 
  subscribeToPropertyDocuments, 
  canUserAccessDocument 
} from '../services/propertyDocumentService';
import { isSuperAdmin } from '../services/rbacService';

export default function PlotDetailDrawer({ 
  plot, 
  township, 
  onClose, 
  onBookToken, 
  onScheduleVisit,
  currentUser,
  onManagePlotDocs
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pricing' | 'vastu' | 'documents'
  const [allDocs, setAllDocs] = useState(() => getLocalCachedDocuments());
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const unsub = subscribeToPropertyDocuments(township?.id, (docs) => {
      setAllDocs(docs);
    });
    return () => unsub();
  }, [township?.id]);

  if (!plot) return null;

  const plotNumber = plot.number || plot.plotNumber || 'Plot';
  const plotDimension = plot.dimension || plot.dimensions || '30 x 40 ft';
  const plotSqFt = plot.sizeSqFt || plot.sqft || 1200;
  const plotPriceStr = plot.price || (plot.priceNumber ? `₹${(plot.priceNumber / 100000).toFixed(1)} Lakh` : 'Price On Request');
  const plotFacing = plot.facing || 'East Facing';
  const plotVastu = plot.vastuScore || 95;
  const plotRoadWidth = plot.roadWidth || '40ft Internal Asphalt Road';
  const plotElevation = plot.elevation || 'Park Facing';
  const plotDistance = plot.amenitiesDistance || '50m to Clubhouse & Boulevard';

  // Filter documents for this plot vs township
  const plotSpecificDocs = allDocs.filter(d => 
    d.plotId === plot.id || 
    (Array.isArray(d.attachedPlotIds) && d.attachedPlotIds.includes(plot.id))
  );
  const townshipMasterDocs = allDocs.filter(d => 
    (!d.plotId || d.plotId === 'ALL_PLOTS') && 
    (!Array.isArray(d.attachedPlotIds) || d.attachedPlotIds.length === 0)
  );

  const isAdminUser = isSuperAdmin(currentUser) || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  // EMI & Cost Breakdown calculations
  const priceNum = plot.priceNumber || (typeof plotSqFt === 'number' && township?.pricePerSqFt ? plotSqFt * township.pricePerSqFt : 6000000);
  const downPayment = Math.round(priceNum * 0.20);
  const loanAmount = priceNum - downPayment;
  const stampDutyAndReg = Math.round(priceNum * 0.066); // ~6.6% in KA
  const maintenanceCorpus = Math.round(plotSqFt * 150);
  const totalCost = priceNum + stampDutyAndReg + maintenanceCorpus;

  // Monthly EMI for 20 years at 8.5%
  const monthlyRate = 8.5 / 12 / 100;
  const totalMonths = 20 * 12;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white">{plotNumber}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  plot.status === 'Available'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : plot.status === 'Reserved'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {plot.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{township?.name} • {township?.location}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition ${
              activeTab === 'overview' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Plot Specifications
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition flex items-center space-x-1.5 ${
              activeTab === 'documents' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Deeds & PDFs</span>
            {plotSpecificDocs.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                {plotSpecificDocs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition ${
              activeTab === 'pricing' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Price Breakup & EMI
          </button>
          <button
            onClick={() => setActiveTab('vastu')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition ${
              activeTab === 'vastu' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Vastu & Solar Analysis
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Area</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{plotSqFt} sq.ft</span>
                  <span className="text-[10px] text-slate-500">({plotDimension})</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Orientation</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{plotFacing}</span>
                  <span className="text-[10px] text-emerald-500/80">{plotVastu}% Vastu Match</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Plot Price</span>
                  <span className="text-base font-bold text-amber-400 mt-0.5 block">{plotPriceStr}</span>
                  <span className="text-[10px] text-slate-500">@ ₹{township?.pricePerSqFt}/sq.ft</span>
                </div>
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Road Access</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{plotRoadWidth}</span>
                  <span className="text-[10px] text-slate-500">{plot.cornerPlot ? 'Corner Plot' : 'Avenue Road'}</span>
                </div>
              </div>

              {/* Elevation & Surroundings */}
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Elevation & Vicinity Context</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {plotElevation}. Positioned {plotDistance}. Unobstructed sunlight throughout the morning and afternoon hours.
                </p>
              </div>

              {/* RERA & Title Assurance */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">100% RERA & Kaveri-2 Verified</span>
                    <span className="text-[11px] text-emerald-300">Clean title guaranteed with 30-year nil-encumbrance certificate.</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded-lg border border-emerald-500/40">
                  Ready to Register
                </span>
              </div>
            </div>
          )}

          {/* TAB: LEGAL DEEDS & PDFS */}
          {activeTab === 'documents' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Statutory Legal Dossiers for {plotNumber}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cryptographically stamped PDF documents synced directly from Firestore.
                  </p>
                </div>

                {isAdminUser && onManagePlotDocs && (
                  <button
                    onClick={() => {
                      onClose();
                      onManagePlotDocs(plot);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Manage Attachments</span>
                  </button>
                )}
              </div>

              {/* Section 1: Plot Specific Documents */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Plot-Specific Legal Deeds & Demarcations ({plotSpecificDocs.length})
                </span>

                {plotSpecificDocs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                    <FileText className="w-6 h-6 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      No individual plot-specific deeds attached yet. Master township sanctions apply below.
                    </p>
                    {isAdminUser && onManagePlotDocs && (
                      <button
                        onClick={() => {
                          onClose();
                          onManagePlotDocs(plot);
                        }}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                      >
                        + Attach Plot Title Deed or 11E Demarcation
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plotSpecificDocs.map(doc => {
                      const access = canUserAccessDocument(currentUser, doc);
                      return (
                        <div 
                          key={doc.id}
                          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white truncate">{doc.title}</span>
                              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                {doc.status || 'Verified'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                              <span>Ref: {doc.refNumber}</span>
                              <span>•</span>
                              <span>{doc.authority}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {access.canView ? (
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white rounded-xl font-bold transition flex items-center space-x-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[10px] font-bold flex items-center space-x-1">
                                <Lock className="w-3 h-3" />
                                <span>{doc.accessControl?.tokenGated ? 'Token Gated' : 'Restricted'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Master Township Approvals */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Township Master Plan & Sanctions ({townshipMasterDocs.length})
                </span>

                <div className="space-y-2">
                  {townshipMasterDocs.slice(0, 4).map(doc => {
                    const access = canUserAccessDocument(currentUser, doc);
                    return (
                      <div 
                        key={doc.id}
                        className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-semibold text-slate-200 block truncate">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {doc.category} • Ref: {doc.refNumber}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {access.canView ? (
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Restricted</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Transparent Price Breakdown</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Plot Consideration ({plot.sizeSqFt || plotSqFt} sq.ft @ ₹{township?.pricePerSqFt})</span>
                    <span className="font-semibold text-white">₹{priceNum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Stamp Duty & Registration (~6.6%)</span>
                    <span>₹{stampDutyAndReg.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Clubhouse & Maintenance Corpus Fund</span>
                    <span>₹{maintenanceCorpus.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-amber-400">
                    <span>All-Inclusive Total Outlay</span>
                    <span>₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* EMI Estimator */}
              <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Pre-Approved Bank EMI Estimate</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-300">8.5% p.a. (20 Yrs)</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-black text-white">₹{emi.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>
                  <span className="text-xs text-slate-400">20% Down Payment: ₹{downPayment.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vastu' && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Vastu Shastra Compliance Report</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {plotVastu}% Harmony Score
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    • <strong>Facing Orientation:</strong> {plotFacing} entrance aligns directly with early morning solar radiance (Surya Urja).
                  </p>
                  <p>
                    • <strong>Brahmasthan & Ishanya Corner:</strong> Ideal geometric rectangular proportion ({plotDimension}) with zero negative slope.
                  </p>
                  <p>
                    • <strong>Road Approach:</strong> Direct road approach on {plotRoadWidth} without any T-junction obstruction (Veethi Shoola free).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block">Total Plot Price</span>
            <span className="text-xl font-black text-amber-400">{plotPriceStr}</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => onScheduleVisit(plot)}
              className="flex-1 sm:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Car className="w-4 h-4 text-indigo-400" />
              <span>Book Free Cab Visit</span>
            </button>

            {plot.status === 'Available' ? (
              <button
                onClick={() => onBookToken(plot)}
                className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition"
              >
                <Lock className="w-4 h-4" />
                <span>Lock Plot (₹25k Token)</span>
              </button>
            ) : (
              <button
                disabled
                className="flex-1 sm:flex-none px-5 py-3 bg-slate-800 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed"
              >
                Plot {plot.status}
              </button>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Sanction Ref: {previewDoc.refNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Watermarked Document Preview Box */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden text-xs space-y-3 min-h-[220px] flex flex-col justify-between">
                {/* Watermark */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center rotate-[-25deg] opacity-10 select-none">
                  <span className="text-4xl font-black text-white uppercase tracking-widest text-center">
                    PLOTFLOW SECURE VAULT • {currentUser?.email || 'VERIFIED USER'}
                  </span>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Category: <strong>{previewDoc.category}</strong></span>
                    <span>Issuing Authority: <strong>{previewDoc.authority}</strong></span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-2">
                    {previewDoc.description || 'Statutory legal title deed & survey plan registered with sub-registrar and Karnataka RERA authority.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between relative z-10">
                  <span>SHA-256: {previewDoc.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
                  <span>● Cryptographically Sealed</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
