import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  Download, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Search, 
  Building2, 
  Key, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Scale, 
  FileCheck, 
  Sliders, 
  ChevronRight, 
  X, 
  Check, 
  Copy, 
  FileCode, 
  Share2, 
  Database,
  ExternalLink,
  Info,
  Layers,
  Award
} from 'lucide-react';
import { 
  DOCUMENT_CATEGORIES, 
  ACCESS_LEVELS, 
  VERIFICATION_STATUSES, 
  DEFAULT_ACCESS_CONTROL,
  uploadPropertyDocument,
  updateDocumentAccessControl,
  updateDocumentStatus,
  deletePropertyDocument,
  subscribeToPropertyDocuments,
  generateDocumentHash,
  canUserAccessDocument
} from '../services/propertyDocumentService';
import { isSuperAdmin } from '../services/rbacService';

export default function PropertyDocumentManager({
  townships = [],
  selectedTownshipId,
  onSelectTownship,
  currentUser,
  onNavigateToLegalPortal,
  className = ''
}) {
  const [activeTownshipId, setActiveTownshipId] = useState(selectedTownshipId || townships[0]?.id || 'ts_01');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAccessFilter, setSelectedAccessFilter] = useState('All');
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditAccessModalOpen, setIsEditAccessModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Success / Action notification toast
  const [toastMessage, setToastMessage] = useState(null);

  // Sync selectedTownshipId prop
  useEffect(() => {
    if (selectedTownshipId) {
      setActiveTownshipId(selectedTownshipId);
    }
  }, [selectedTownshipId]);

  // Subscribe to real-time property documents in Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToPropertyDocuments(activeTownshipId, (docsList) => {
      setDocuments(docsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeTownshipId]);

  const activeTownship = townships.find(t => t.id === activeTownshipId) || townships[0];

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Statutory Checklist Progress
  const mandatoryCategories = [
    'RERA Sanction & Master Plan',
    'Land Revenue & Title Deed',
    'Encumbrance Certificate (EC Form 15)',
    'Zonal Sanction & Land Conversion',
    'Layout Approval & Sanction Map',
    'Legal Due Diligence & Opinion',
    'Environmental & Pollution NOC',
    'Panchayat / BDA Khata & Mutation'
  ];

  const uploadedCategories = new Set(documents.map(d => d.category));
  const completedMandatoryCount = mandatoryCategories.filter(cat => uploadedCategories.has(cat)).length;
  const compliancePercentage = Math.round((completedMandatoryCount / mandatoryCategories.length) * 100);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;

      let matchesAccess = true;
      if (selectedAccessFilter === 'Public') matchesAccess = doc.accessControl?.isPublic;
      else if (selectedAccessFilter === 'TokenGated') matchesAccess = doc.accessControl?.tokenGated;
      else if (selectedAccessFilter === 'LegalOnly') matchesAccess = doc.accessControl?.legalAuditorOnly;
      else if (selectedAccessFilter === 'VerifiedBuyer') matchesAccess = doc.accessControl?.requiresVerifiedBuyer;

      return matchesSearch && matchesCategory && matchesStatus && matchesAccess;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus, selectedAccessFilter]);

  // Handle Quick Delete
  const handleDelete = async (docItem) => {
    if (window.confirm(`Are you sure you want to remove "${docItem.title}" from Firestore vault?`)) {
      try {
        await deletePropertyDocument(docItem.id, currentUser);
        showToast(`Document "${docItem.title}" removed successfully.`);
      } catch (err) {
        showToast(err.message || 'Error deleting document', 'error');
      }
    }
  };

  // Handle Quick Status Push to Legal Vault
  const handlePushToLegal = async (docItem) => {
    try {
      await updateDocumentStatus(
        docItem.id, 
        VERIFICATION_STATUSES.PENDING_AUDIT, 
        'Submitted for formal 42-point title diligence & Kaveri-2 cross-verification.',
        currentUser
      );
      showToast(`Document "${docItem.title}" queued for Legal Audit review!`);
    } catch (err) {
      showToast(err.message || 'Failed to submit to legal', 'error');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast notification banner */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xl transition animate-fadeIn ${
          toastMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header & Project Context Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 font-mono">
                <Database className="w-3 h-3 text-indigo-400" />
                <span>Firestore Document Vault & RBAC</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Live Cloud Sync
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 tracking-tight flex items-center space-x-2.5">
              <span>Developer Document & Access Control Manager</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Upload statutory land titles, RERA sanctions, and layout approvals. Define granular access flags (Token Gated, Verified Buyer, Watermark, Legal Only) synchronized securely with Firestore.
            </p>
          </div>

          {/* Township Selector & Primary Upload Action */}
          <div className="flex flex-wrap items-center gap-3">
            {townships.length > 1 && (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={activeTownshipId}
                  onChange={(e) => {
                    setActiveTownshipId(e.target.value);
                    if (onSelectTownship) onSelectTownship(e.target.value);
                  }}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
                >
                  {townships.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 transition"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>Upload Verified Document</span>
            </button>
          </div>
        </div>

        {/* Compliance Meter & Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 relative z-10 text-xs">
          {/* Statutory Health Meter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Statutory Health</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">{compliancePercentage}%</span>
              <span className="text-[10px] text-slate-400">{completedMandatoryCount} of 8 uploaded</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-500" 
                style={{ width: `${compliancePercentage}%` }} 
              />
            </div>
          </div>

          {/* Total Verified Dossiers */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Uploads</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-black text-white block">{documents.length}</span>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{documents.filter(d => d.status === 'Verified').length} Verified by Legal</span>
            </span>
          </div>

          {/* Access Control Flags Distribution */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Access Protection</span>
              <Lock className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-teal-400">
                {documents.filter(d => d.accessControl?.tokenGated || d.accessControl?.requiresVerifiedBuyer || d.accessControl?.legalAuditorOnly).length}
              </span>
              <span className="text-[10px] text-slate-400">Gated / Protected</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {documents.filter(d => d.accessControl?.isPublic).length} Public Marketplace
            </span>
          </div>

          {/* Watermark & Cryptographic Integrity */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Integrity & Seals</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[10px] text-slate-400 block">
              SHA-256 Checksummed & Firestore Indexed
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, sanction ref, authority..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories ({documents.length})</option>
            {DOCUMENT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Access Filter */}
          <select
            value={selectedAccessFilter}
            onChange={(e) => setSelectedAccessFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Access Levels</option>
            <option value="Public">🌐 Public Only</option>
            <option value="TokenGated">🔒 Token Gated (₹25k)</option>
            <option value="VerifiedBuyer">👤 Verified Buyers</option>
            <option value="LegalOnly">⚖️ Legal Auditor Vault</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">● Verified</option>
            <option value="Under Review">● Under Review</option>
            <option value="Pending Legal Audit">● Pending Legal Audit</option>
            <option value="Action Required">● Action Required</option>
          </select>

          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition ${viewLayout === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg transition ${viewLayout === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document List / Grid */}
      {isLoading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-300">Synchronizing documents with Firestore...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Matching Documents Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search terms or clearing the active filters.'
                : `No property documents uploaded yet for ${activeTownship?.name || 'this township'}. Upload your RERA sanctions and title deeds to begin.`}
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First Document</span>
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((docItem) => {
            const access = docItem.accessControl || DEFAULT_ACCESS_CONTROL;
            return (
              <div 
                key={docItem.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  {/* Top Badges & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-mono truncate max-w-[150px]">
                          {docItem.category}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {docItem.refNumber}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      docItem.status === 'Verified'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : docItem.status === 'Pending Legal Audit'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                      {docItem.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3.5 space-y-1">
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition">
                      {docItem.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {docItem.description}
                    </p>
                  </div>

                  {/* Authority & Dates */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Issuing Authority:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[160px]">{docItem.authority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Validity Period:</span>
                      <span className="text-slate-300">{docItem.issueDate} → {docItem.expiryDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">File & Hash:</span>
                      <span className="text-slate-300 font-mono text-[10px]">{docItem.fileSize} • {docItem.hash?.substring(0, 10)}...</span>
                    </div>
                  </div>

                  {/* Access Control Flags Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {access.isPublic && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                        <Unlock className="w-2.5 h-2.5" />
                        <span>Public</span>
                      </span>
                    )}

                    {access.tokenGated && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Token Gated (₹25k)</span>
                      </span>
                    )}

                    {access.requiresVerifiedBuyer && (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center space-x-1">
                        <Key className="w-2.5 h-2.5" />
                        <span>Verified Buyer</span>
                      </span>
                    )}

                    {access.legalAuditorOnly && (
                      <span className="px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center space-x-1">
                        <Scale className="w-2.5 h-2.5" />
                        <span>Legal Vault Only</span>
                      </span>
                    )}

                    {access.watermarkEnabled && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center space-x-1" title="Dynamic Watermarking Active">
                        <span>💧 Watermarked</span>
                      </span>
                    )}

                    {access.requiresNda && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center space-x-1">
                        <span>📜 NDA Required</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedDoc(docItem);
                        setIsPreviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-bold transition flex items-center space-x-1 text-[11px]"
                      title="Secure Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDoc(docItem);
                        setIsEditAccessModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold transition flex items-center space-x-1 text-[11px]"
                      title="Configure Access Flags & Permissions"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Access Flags</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    {docItem.status !== 'Verified' && (
                      <button
                        onClick={() => handlePushToLegal(docItem)}
                        className="p-2 hover:bg-teal-500/20 text-teal-400 rounded-xl transition"
                        title="Submit to Legal Auditor Vault"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(docItem)}
                      className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition"
                      title="Delete from Firestore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-5 py-4">Document Title & Category</th>
                  <th className="px-5 py-4">Sanction / Ref ID</th>
                  <th className="px-5 py-4">Issuing Authority</th>
                  <th className="px-5 py-4">Access Control Flags</th>
                  <th className="px-5 py-4">Verification Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDocs.map((docItem) => {
                  const access = docItem.accessControl || DEFAULT_ACCESS_CONTROL;
                  return (
                    <tr key={docItem.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{docItem.title}</span>
                            <span className="text-[10px] text-amber-400 font-mono">{docItem.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300 text-[11px]">{docItem.refNumber}</td>
                      <td className="px-5 py-4 text-slate-300">{docItem.authority}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {access.isPublic && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[9px] font-bold">Public</span>}
                          {access.tokenGated && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[9px] font-bold">Token-Gated</span>}
                          {access.legalAuditorOnly && <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 text-[9px] font-bold">Legal-Only</span>}
                          {access.watermarkEnabled && <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[9px] font-bold">Watermarked</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          docItem.status === 'Verified'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                          {docItem.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedDoc(docItem);
                              setIsPreviewModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-800 text-indigo-400 rounded-lg transition"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDoc(docItem);
                              setIsEditAccessModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-800 text-amber-400 rounded-lg transition"
                            title="Edit Permissions"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(docItem)}
                            className="p-1.5 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: UPLOAD PROPERTY DOCUMENT ================= */}
      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          activeTownship={activeTownship}
          townships={townships}
          currentUser={currentUser}
          onDocumentUploaded={(newDoc) => {
            showToast(`Document "${newDoc.title}" stored to Firestore vault with access flags!`);
            setIsUploadModalOpen(false);
          }}
        />
      )}

      {/* ================= MODAL 2: EDIT ACCESS CONTROL FLAGS ================= */}
      {isEditAccessModalOpen && selectedDoc && (
        <EditAccessControlModal
          isOpen={isEditAccessModalOpen}
          onClose={() => {
            setIsEditAccessModalOpen(false);
            setSelectedDoc(null);
          }}
          documentItem={selectedDoc}
          currentUser={currentUser}
          onUpdated={(updatedDoc) => {
            showToast(`Access flags for "${updatedDoc.title}" synced to Firestore!`);
            setIsEditAccessModalOpen(false);
            setSelectedDoc(null);
          }}
        />
      )}

      {/* ================= MODAL 3: SECURE DOCUMENT VIEWER & PREVIEW ================= */}
      {isPreviewModalOpen && selectedDoc && (
        <SecureDocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedDoc(null);
          }}
          documentItem={selectedDoc}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: UPLOAD DOCUMENT MODAL WITH ACCESS CONTROL CONFIG
// =========================================================================
function UploadDocumentModal({
  isOpen,
  onClose,
  activeTownship,
  townships,
  currentUser,
  onDocumentUploaded
}) {
  const [townshipId, setTownshipId] = useState(activeTownship?.id || 'ts_01');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [authority, setAuthority] = useState('Karnataka Real Estate Regulatory Authority (K-RERA)');
  const [refNumber, setRefNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2030-12-31');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [attestationAccepted, setAttestationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Access Control Flags State
  const [accessControl, setAccessControl] = useState({
    isPublic: true,
    requiresVerifiedBuyer: false,
    legalAuditorOnly: false,
    tokenGated: false,
    requiresNda: false,
    watermarkEnabled: true,
    allowDirectDownload: true,
    allowedRoles: ['admin', 'developer', 'legal', 'buyer']
  });

  // Active sub-tab inside upload modal
  const [modalTab, setModalTab] = useState('details'); // 'details' | 'access' | 'attestation'

  // Update authority default when category changes
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat.includes('RERA')) {
      setAuthority('Karnataka Real Estate Regulatory Authority (K-RERA)');
    } else if (newCat.includes('Encumbrance')) {
      setAuthority('Department of Stamps & Registration (Kaveri 2.0)');
    } else if (newCat.includes('Zonal') || newCat.includes('Conversion')) {
      setAuthority('Office of the Deputy Commissioner / BDA');
    } else if (newCat.includes('Environmental')) {
      setAuthority('Karnataka State Pollution Control Board (KSPCB)');
    } else if (newCat.includes('Layout')) {
      setAuthority('Bangalore Metropolitan Region Development Authority (BMRDA)');
    } else if (newCat.includes('Legal Due Diligence')) {
      setAuthority('High Court Title Diligence Cell');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!title) {
        // Auto-fill title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive document title.');
      setModalTab('details');
      return;
    }
    if (!refNumber.trim()) {
      setErrorMsg('Please enter the statutory sanction/reference number.');
      setModalTab('details');
      return;
    }
    if (!attestationAccepted) {
      setErrorMsg('Please check the digital attestation certification before uploading.');
      setModalTab('attestation');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedTs = townships.find(t => t.id === townshipId) || activeTownship;
      const createdDoc = await uploadPropertyDocument({
        townshipId,
        townshipName: selectedTs?.name || 'Prestige Sanctuary Greens',
        developerId: currentUser?.uid || 'dev_master',
        developerName: currentUser?.name || 'Developer Admin',
        title,
        category,
        authority,
        refNumber,
        issueDate,
        expiryDate,
        description,
        file: uploadedFile,
        accessControl,
        currentUser
      });

      onDocumentUploaded(createdDoc);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving document to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                SECURE FIRESTORE VAULT UPLOAD
              </span>
              <h2 className="text-xl font-black text-white">Upload Verified Property Document</h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Provide statutory metadata and configure granular RBAC access control flags.
          </p>
        </div>

        {/* Tab Switcher inside Modal */}
        <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setModalTab('details')}
            className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
              modalTab === 'details' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Document Details</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('access')}
            className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
              modalTab === 'access' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Access Control Flags</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('attestation')}
            className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
              modalTab === 'attestation' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Developer Attestation</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* TAB 1: DOCUMENT METADATA */}
          {modalTab === 'details' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Township & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Target Plotted Township</label>
                  <select
                    value={townshipId}
                    onChange={(e) => setTownshipId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {townships.map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Document Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {DOCUMENT_CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-slate-950 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Ref Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Official Document Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., RERA Sanctioned Master Layout Plan"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Sanction / Reference Number *</label>
                  <input
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="e.g., K-RERA/PRM/KA/2026/009123"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Issuing Authority */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Issuing Government Authority / Registrar</label>
                <input
                  type="text"
                  required
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="e.g., Karnataka RERA / Sub-Registrar Devanahalli"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Issue / Sanction Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Valid Until / Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Description & Statutory Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of statutory approvals, survey numbers covered, or conditions..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* File Dropzone */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Attach Scanned Dossier (PDF / TIFF / PNG)</label>
                <div className="p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-900/40 text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">
                    {uploadedFile ? uploadedFile.name : 'Click to browse or drag file here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {uploadedFile 
                      ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Automatic SHA-256 Checksum will be generated` 
                      : 'Supports PDF, TIFF, PNG up to 25MB (Encrypted & Watermarked)'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalTab('access')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <span>Configure Access Flags</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ACCESS CONTROL FLAGS (FIRESTORE RBAC) */}
          {modalTab === 'access' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-300 space-y-1">
                <span className="text-indigo-300 font-bold flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Firestore Access Flags Configuration</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  These security flags are written directly to the document object in Firestore and checked in real-time before granting preview or download capabilities.
                </p>
              </div>

              {/* Toggles List */}
              <div className="space-y-3">
                {/* Public Marketplace Access */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Public Marketplace Visibility</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Allow all public visitors on the project page to view this statutory document.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.isPublic}
                    onChange={(e) => setAccessControl({ ...accessControl, isPublic: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Token Gated */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Token Deposit Gated (₹25,000 Reservation)</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Restricted to buyers who have paid the token reservation advance for this township.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.tokenGated}
                    onChange={(e) => setAccessControl({ ...accessControl, tokenGated: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Verified Buyer Clearance */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-400" />
                      <span>Require Verified Buyer Account</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Requires user to be signed in with a phone-verified buyer profile.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.requiresVerifiedBuyer}
                    onChange={(e) => setAccessControl({ ...accessControl, requiresVerifiedBuyer: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </div>

                {/* Legal Auditor Vault Only */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-400" />
                      <span>Legal Auditor Vault Only</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Confidential title opinion: Visible only to certified Legal Auditors & Super Admin.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.legalAuditorOnly}
                    onChange={(e) => setAccessControl({ ...accessControl, legalAuditorOnly: e.target.checked })}
                    className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                  />
                </div>

                {/* Dynamic Watermark */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Burn Dynamic Watermark on Preview & Export</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Overlays downloader email, timestamp, and "CONFIDENTIAL PROPERTY OF DEVELOPER".
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.watermarkEnabled}
                    onChange={(e) => setAccessControl({ ...accessControl, watermarkEnabled: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {/* Direct Download Allowed */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Allow Direct PDF Download</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      If unchecked, document is restricted to view-only in secure browser sandbox.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.allowDirectDownload}
                    onChange={(e) => setAccessControl({ ...accessControl, allowDirectDownload: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Digital NDA */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center space-x-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Require Digital NDA Acceptance</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      User must accept a 1-click digital confidentiality waiver before unlocking.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessControl.requiresNda}
                    onChange={(e) => setAccessControl({ ...accessControl, requiresNda: e.target.checked })}
                    className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setModalTab('details')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('attestation')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <span>Proceed to Attestation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPER ATTESTATION & COMMIT */}
          {modalTab === 'attestation' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Statutory Land Attestation & Declaration</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Under the Real Estate (Regulation and Development) Act (RERA) and Karnataka Land Revenue Code:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
                  <li>I certify that this attached document is genuine, legally valid, and corresponds to the official sanctioned layout.</li>
                  <li>No encumbrances, pending mortgages, or litigation orders have been suppressed or omitted.</li>
                  <li>Access control flags specified will govern buyer document transparency and legal due diligence audits.</li>
                </ul>

                <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attestationAccepted}
                    onChange={(e) => setAttestationAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="font-bold text-white text-xs">
                    I attest that this document is authentic and authorize registration into Firestore vault.
                  </span>
                </label>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-[11px]">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Summary of Document to be Stored:</span>
                <p className="font-bold text-white">{title || 'Untitled'} ({category})</p>
                <p className="text-slate-400">Ref: <span className="text-indigo-300 font-mono">{refNumber || 'N/A'}</span> • Township: <span className="text-slate-200">{activeTownship?.name}</span></p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalTab('access')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Back to Access Flags
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !attestationAccepted}
                  className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition flex items-center space-x-2 ${
                    isSubmitting || !attestationAccepted
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>{isSubmitting ? 'Storing to Firestore...' : 'Store & Publish to Vault'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: EDIT ACCESS CONTROL FLAGS MODAL
// =========================================================================
function EditAccessControlModal({
  isOpen,
  onClose,
  documentItem,
  currentUser,
  onUpdated
}) {
  const [access, setAccess] = useState(() => ({
    ...DEFAULT_ACCESS_CONTROL,
    ...(documentItem?.accessControl || {})
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !documentItem) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const updated = await updateDocumentAccessControl(documentItem.id, access, currentUser);
      onUpdated(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update access flags');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                RBAC & CLEARANCE POLICY
              </span>
              <h2 className="text-lg font-black text-white">Edit Document Access Flags</h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Modifying permissions for: <span className="text-white font-bold">{documentItem.title}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          {/* Public Marketplace */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Public Marketplace Visibility</span>
              </span>
              <p className="text-[10px] text-slate-400">Viewable by all retail buyers without gate</p>
            </div>
            <input
              type="checkbox"
              checked={access.isPublic}
              onChange={(e) => setAccess({ ...access, isPublic: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Token Gated */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Token Deposit Gated (₹25k)</span>
              </span>
              <p className="text-[10px] text-slate-400">Restricted until buyer places reservation deposit</p>
            </div>
            <input
              type="checkbox"
              checked={access.tokenGated}
              onChange={(e) => setAccess({ ...access, tokenGated: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Legal Auditor Vault Only */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                <span>Legal Auditor Vault Only</span>
              </span>
              <p className="text-[10px] text-slate-400">Restricted to certified title auditors & super admin</p>
            </div>
            <input
              type="checkbox"
              checked={access.legalAuditorOnly}
              onChange={(e) => setAccess({ ...access, legalAuditorOnly: e.target.checked })}
              className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
            />
          </div>

          {/* Verified Buyer */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Require Verified Buyer Profile</span>
              </span>
              <p className="text-[10px] text-slate-400">Requires verified mobile identity</p>
            </div>
            <input
              type="checkbox"
              checked={access.requiresVerifiedBuyer}
              onChange={(e) => setAccess({ ...access, requiresVerifiedBuyer: e.target.checked })}
              className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
            />
          </div>

          {/* Watermark */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dynamic Watermark Overlay</span>
              </span>
              <p className="text-[10px] text-slate-400">Protects intellectual property on preview</p>
            </div>
            <input
              type="checkbox"
              checked={access.watermarkEnabled}
              onChange={(e) => setAccess({ ...access, watermarkEnabled: e.target.checked })}
              className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          {/* Allow Direct Download */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Allow Direct PDF Download</span>
              </span>
              <p className="text-[10px] text-slate-400">If disabled, document is restricted to in-app viewer</p>
            </div>
            <input
              type="checkbox"
              checked={access.allowDirectDownload}
              onChange={(e) => setAccess({ ...access, allowDirectDownload: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Database className="w-4 h-4" />
              <span>{isSaving ? 'Syncing to Firestore...' : 'Update Flags in Firestore'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: SECURE DOCUMENT PREVIEW & AUDIT VIEWER MODAL
// =========================================================================
function SecureDocumentPreviewModal({
  isOpen,
  onClose,
  documentItem,
  currentUser
}) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('viewer'); // 'viewer' | 'audit_trail' | 'metadata'

  if (!isOpen || !documentItem) return null;

  const access = documentItem.accessControl || DEFAULT_ACCESS_CONTROL;
  const accessCheck = canUserAccessDocument(currentUser, documentItem, true);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(documentItem.hash || 'N/A');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[94vh] flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {documentItem.category}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  {documentItem.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{documentItem.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold">
              <button
                onClick={() => setActiveViewTab('viewer')}
                className={`px-3 py-1.5 rounded-lg transition ${activeViewTab === 'viewer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Document Canvas
              </button>
              <button
                onClick={() => setActiveViewTab('audit_trail')}
                className={`px-3 py-1.5 rounded-lg transition ${activeViewTab === 'audit_trail' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Firestore Audit Trail
              </button>
              <button
                onClick={() => setActiveViewTab('metadata')}
                className={`px-3 py-1.5 rounded-lg transition ${activeViewTab === 'metadata' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                RBAC Metadata
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Canvas */}
        <div className="flex-1 overflow-y-auto">
          {activeViewTab === 'viewer' && (
            <div className="space-y-4">
              {/* Simulated High-Security Document Viewer Container */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 relative overflow-hidden min-h-[380px] flex flex-col justify-between shadow-inner">
                {/* Dynamic Watermark Overlay */}
                {access.watermarkEnabled && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10 select-none rotate-[-25deg] space-y-8">
                    <span className="text-4xl font-black tracking-widest text-slate-100 uppercase">
                      PLOTFLOW SECURE VAULT
                    </span>
                    <span className="text-2xl font-mono text-slate-100 font-bold">
                      {currentUser?.email || 'AUTHORIZED REVIEW'} • {new Date().toISOString().split('T')[0]}
                    </span>
                    <span className="text-xl font-bold tracking-wider text-slate-100">
                      STRICTLY CONFIDENTIAL • REF: {documentItem.refNumber}
                    </span>
                  </div>
                )}

                {/* Document Header Representation */}
                <div className="flex items-start justify-between border-b-2 border-slate-800/80 pb-4 relative z-10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block font-mono">
                      GOVERNMENT OF KARNATAKA • STATUTORY LAND RECORD
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">{documentItem.authority}</h3>
                    <p className="text-xs text-slate-400">Department of Town Planning & Land Revenue Administration</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-mono text-[10px] font-bold">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-0.5" />
                      <span>DIGITALLY SEALED</span>
                    </div>
                  </div>
                </div>

                {/* Document Body Details */}
                <div className="py-6 space-y-4 relative z-10 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Sanction / Certificate ID</span>
                      <p className="font-mono font-bold text-amber-400 text-sm">{documentItem.refNumber}</p>
                    </div>
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Project / Township Allocation</span>
                      <p className="font-bold text-white text-sm">{documentItem.townshipName}</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Certified Scope & Findings</span>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      {documentItem.description || 'This document certifies statutory sanction in accordance with the Karnataka Town and Country Planning Act, 1961 and RERA Act, 2016.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[11px]">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Issue Date</span>
                      <span className="font-bold text-slate-200">{documentItem.issueDate}</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Valid Until</span>
                      <span className="font-bold text-slate-200">{documentItem.expiryDate}</span>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Audited By</span>
                      <span className="font-bold text-emerald-400">{documentItem.verifiedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Fingerprint */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                  <div className="flex items-center space-x-2 font-mono">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>SHA-256: {documentItem.hash}</span>
                  </div>
                  <span>PlotFlow Document ID: {documentItem.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL */}
          {activeViewTab === 'audit_trail' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Immutable Firestore Activity & Access Log</span>
              </h4>
              <div className="space-y-2">
                {(documentItem.auditTrail || []).map((audit, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">{audit.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{audit.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{audit.details}</p>
                    <span className="text-[10px] text-slate-500 block">Actor: {audit.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RBAC METADATA */}
          {activeViewTab === 'metadata' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white">Firestore Document Payload & Flags</h4>
                <pre className="bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify({
                    id: documentItem.id,
                    townshipId: documentItem.townshipId,
                    title: documentItem.title,
                    category: documentItem.category,
                    refNumber: documentItem.refNumber,
                    authority: documentItem.authority,
                    hash: documentItem.hash,
                    status: documentItem.status,
                    accessControl: documentItem.accessControl,
                    uploadedByEmail: documentItem.uploadedByEmail,
                    createdAt: documentItem.createdAt
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={handleCopyHash}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl flex items-center space-x-1.5 transition font-mono text-[11px]"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHash ? 'Hash Copied!' : 'Copy SHA-256 Hash'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
            >
              Close
            </button>

            {access.allowDirectDownload && (
              <button
                onClick={() => alert(`Downloading verified legal dossier: ${documentItem.title}\nRef: ${documentItem.refNumber}\nSHA-256 Hash: ${documentItem.hash}`)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Dossier</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
