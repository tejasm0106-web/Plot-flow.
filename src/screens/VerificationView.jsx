import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  QrCode, 
  Building2, 
  Search, 
  ExternalLink,
  Award,
  Lock,
  ArrowRight,
  Eye,
  Key,
  Scale
} from 'lucide-react';
import { 
  subscribeToPropertyDocuments, 
  canUserAccessDocument, 
  DEFAULT_ACCESS_CONTROL 
} from '../services/propertyDocumentService';

export default function VerificationView({ townships, selectedTownship, currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [dossierDownloaded, setDossierDownloaded] = useState(false);
  const [activeTownshipId, setActiveTownshipId] = useState(selectedTownship?.id || townships?.[0]?.id || 'ts_01');

  useEffect(() => {
    if (selectedTownship?.id) {
      setActiveTownshipId(selectedTownship.id);
    }
  }, [selectedTownship]);

  // Subscribe to live property documents in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPropertyDocuments(activeTownshipId, (docsList) => {
      setDocuments(docsList);
    });
    return () => unsubscribe();
  }, [activeTownshipId]);

  const categories = ['ALL', 'RERA Sanction & Master Plan', 'Land Revenue & Title Deed', 'Encumbrance Certificate (EC Form 15)', 'Zonal Sanction & Land Conversion', 'Legal Due Diligence & Opinion', 'Environmental & Pollution NOC'];

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory === 'ALL') return true;
    return doc.category === selectedCategory || doc.category?.includes(selectedCategory);
  });

  const handleGenerateDossier = () => {
    setIsGeneratingDossier(true);
    setTimeout(() => {
      setIsGeneratingDossier(false);
      setDossierDownloaded(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional 5-Layer Due Diligence Framework</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Legal Title & RERA Compliance Vault
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminate double-mortgages, forged khatas, and unapproved layouts. Every plotted enclave undergoes an exhaustive 42-point title search across 30 years of sub-registrar deed archives.
          </p>

          {/* Instant Title Audit PDF Generator Button */}
          <div className="pt-2">
            <button
              disabled={isGeneratingDossier}
              onClick={handleGenerateDossier}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center space-x-2"
            >
              {isGeneratingDossier ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Compiling Verified Legal Dossier PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Comprehensive Title Audit Certificate (PDF)</span>
                </>
              )}
            </button>
            {dossierDownloaded && (
              <p className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center space-x-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Legal Title Dossier (42-Point Audit) simulated download complete with QR seal.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5-Layer Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { step: '1', title: 'RERA Master Sanction', desc: 'Officially validated via K-RERA registry' },
          { step: '2', title: '30-Yr Nil Encumbrance', desc: 'Form 15 clear of bank liens & charges' },
          { step: '3', title: 'DC Zonal Conversion', desc: 'Lawful agricultural to residential conversion' },
          { step: '4', title: 'Advocate Search Opinion', desc: 'No civil suits, DRT disputes, or family claims' },
          { step: '5', title: 'Pollution & Water NOC', desc: 'KSPCB and municipal utility clearance' }
        ].map((layer, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 shadow">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                {layer.step}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white">{layer.title}</h4>
            <p className="text-[11px] text-slate-400">{layer.desc}</p>
          </div>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold">Filter Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Verified Document List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{doc.title}</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Issuing Authority: <strong className="text-slate-200">{doc.authority}</strong> • Reference: <span className="font-mono text-slate-300">{doc.refNumber}</span>
                  </p>
                </div>
              </div>

              {/* Actions & Access Control Indicators */}
              <div className="flex items-center space-x-2">
                {doc.accessControl?.legalAuditorOnly ? (
                  <span className="px-3 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                    <Scale className="w-4 h-4" />
                    <span>Legal Auditor Vault</span>
                  </span>
                ) : doc.accessControl?.tokenGated ? (
                  <span className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Token Deposit Gated</span>
                  </span>
                ) : (
                  <button
                    onClick={() => alert(`Downloading verified statutory document:\n${doc.title}\nRef: ${doc.refNumber}\nSHA-256 Hash: ${doc.hash || 'SHA256-VERIFIED'}`)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition flex-shrink-0"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{doc.fileSize || 'PDF 4.2 MB'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Access Control Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {doc.accessControl?.isPublic && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  🌐 Public Access
                </span>
              )}
              {doc.accessControl?.watermarkEnabled && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                  💧 Watermarked
                </span>
              )}
              {doc.hash && (
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
                  SHA-256: {doc.hash.substring(0, 10)}...
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 leading-relaxed">
              {doc.description}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by: {doc.verifiedBy}</span>
              </span>
              <span>Sanction Date: {doc.issueDate || doc.uploadDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
