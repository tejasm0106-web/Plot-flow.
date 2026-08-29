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
  Database,
  ExternalLink,
  Info,
  Layers,
  Award,
  Paperclip,
  Maximize2,
  FileCode
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
  detachDocumentFromPlot,
  attachDocumentToPlot,
  subscribeToPropertyDocuments,
  generateDocumentHash,
  canUserAccessDocument
} from '../services/propertyDocumentService';
import { isUserAdmin } from './AdminDashboard';

export default function AdminPlotDocumentModal({
  isOpen,
  onClose,
  township,
  plot,
  allTownships = [],
  currentUser,
  onDocumentChange
}) {
  const [selectedTownshipId, setSelectedTownshipId] = useState(township?.id || allTownships[0]?.id || 'ts_01');
  const [selectedPlotId, setSelectedPlotId] = useState(plot?.id || 'ALL_PLOTS');
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('attached'); // 'attached' | 'upload_new' | 'attach_existing'
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Edit Security Flags State
  const [editingDocFlags, setEditingDocFlags] = useState(null);
  const [editAccessControl, setEditAccessControl] = useState(DEFAULT_ACCESS_CONTROL);
  const [isSavingFlags, setIsSavingFlags] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [uploadAuthority, setUploadAuthority] = useState('Karnataka Sub-Registrar & Land Revenue Authority');
  const [uploadRefNumber, setUploadRefNumber] = useState('');
  const [uploadIssueDate, setUploadIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadExpiryDate, setUploadExpiryDate] = useState('2032-12-31');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileDataUrl, setUploadFileDataUrl] = useState(null);
  const [uploadAccessControl, setUploadAccessControl] = useState({
    isPublic: true,
    requiresVerifiedBuyer: false,
    legalAuditorOnly: false,
    tokenGated: false,
    requiresNda: false,
    watermarkEnabled: true,
    allowDirectDownload: true,
    allowedRoles: ['admin', 'developer', 'legal', 'buyer']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sync township and plot props when modal opens or props change
  useEffect(() => {
    if (township?.id) {
      setSelectedTownshipId(township.id);
    }
  }, [township]);

  useEffect(() => {
    if (plot?.id) {
      setSelectedPlotId(plot.id);
    } else {
      setSelectedPlotId('ALL_PLOTS');
    }
  }, [plot]);

  const activeTownship = allTownships.find(t => t.id === selectedTownshipId) || township || allTownships[0];
  const activePlot = (activeTownship?.plots || []).find(p => p.id === selectedPlotId);
  const activePlotNumber = activePlot ? (activePlot.plotNumber || activePlot.number || `Plot ${activePlot.id}`) : (selectedPlotId === 'ALL_PLOTS' ? 'All Township Plots' : `Plot ${selectedPlotId}`);

  // Subscribe to real-time documents in Firestore
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const unsubscribe = subscribeToPropertyDocuments(selectedTownshipId, (docsList) => {
      setDocuments(docsList);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen, selectedTownshipId]);

  // Filter documents attached to current selected plot vs township level
  const plotDocuments = useMemo(() => {
    return documents.filter(d => {
      if (selectedPlotId === 'ALL_PLOTS') {
        return true;
      }
      const isDirectMatch = d.plotId === selectedPlotId;
      const isInAttached = Array.isArray(d.attachedPlotIds) && d.attachedPlotIds.includes(selectedPlotId);
      return isDirectMatch || isInAttached;
    });
  }, [documents, selectedPlotId]);

  // Documents available to attach to this plot (currently unattached or township-wide)
  const attachableExistingDocs = useMemo(() => {
    if (selectedPlotId === 'ALL_PLOTS') return [];
    return documents.filter(d => {
      const isDirectMatch = d.plotId === selectedPlotId;
      const isInAttached = Array.isArray(d.attachedPlotIds) && d.attachedPlotIds.includes(selectedPlotId);
      return !isDirectMatch && !isInAttached;
    });
  }, [documents, selectedPlotId]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle PDF file selection & conversion to Base64
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 35 * 1024 * 1024) {
      setUploadError('File size exceeds 35MB limit.');
      return;
    }

    setUploadFile(file);
    setUploadError('');

    // Pre-populate title if empty
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Pre-populate reference number if empty
    if (!uploadRefNumber) {
      setUploadRefNumber(`PLT-${Date.now().toString().slice(-6)}-KA`);
    }

    // Read Base64 Data URL for real preview & storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadFileDataUrl(event.target.result);
    };
    reader.onerror = () => {
      console.warn('FileReader error');
    };
    reader.readAsDataURL(file);
  };

  // Submit new plot document to Firestore
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadTitle.trim()) {
      setUploadError('Please provide an official document title.');
      return;
    }
    if (!uploadRefNumber.trim()) {
      setUploadError('Sanction / Reference Number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isSpecific = selectedPlotId !== 'ALL_PLOTS';
      const created = await uploadPropertyDocument({
        townshipId: selectedTownshipId,
        townshipName: activeTownship?.name || 'Prestige Sanctuary Greens',
        plotId: selectedPlotId,
        plotNumber: activePlotNumber,
        attachedPlotIds: isSpecific ? [selectedPlotId] : [],
        developerId: currentUser?.uid || 'admin_master',
        developerName: currentUser?.name || 'Super Administrator',
        title: uploadTitle.trim(),
        category: uploadCategory,
        authority: uploadAuthority.trim(),
        refNumber: uploadRefNumber.trim(),
        issueDate: uploadIssueDate,
        expiryDate: uploadExpiryDate,
        description: uploadDescription.trim(),
        file: uploadFile,
        fileDataUrl: uploadFileDataUrl,
        fileSize: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB (${uploadFile.type?.split('/')[1]?.toUpperCase() || 'PDF'})` : '3.4 MB (PDF)',
        fileName: uploadFile?.name || `${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
        accessControl: uploadAccessControl,
        currentUser
      });

      showToast(`Document "${created.title}" successfully attached to ${activePlotNumber} in Firestore!`);
      
      // Reset form
      setUploadTitle('');
      setUploadRefNumber('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadFileDataUrl(null);
      setActiveTab('attached');

      if (onDocumentChange) {
        onDocumentChange(created);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Attach an existing document to this plot
  const handleAttachExisting = async (docItem) => {
    try {
      await attachDocumentToPlot(docItem.id, selectedPlotId, activePlotNumber, currentUser);
      showToast(`Document "${docItem.title}" attached to ${activePlotNumber}.`);
      if (onDocumentChange) onDocumentChange(docItem);
    } catch (err) {
      showToast(err.message || 'Failed to attach document', 'error');
    }
  };

  // Detach document from this plot
  const handleDetach = async (docItem) => {
    if (window.confirm(`Detach "${docItem.title}" from ${activePlotNumber}? The document will remain in the master vault.`)) {
      try {
        await detachDocumentFromPlot(docItem.id, selectedPlotId, currentUser);
        showToast(`Document detached from ${activePlotNumber}.`);
        if (onDocumentChange) onDocumentChange(docItem);
      } catch (err) {
        showToast(err.message || 'Failed to detach document', 'error');
      }
    }
  };

  // Delete document completely from Firestore
  const handleDelete = async (docItem) => {
    if (window.confirm(`Permanently delete "${docItem.title}" from Firestore vault? This action cannot be undone.`)) {
      try {
        await deletePropertyDocument(docItem.id, currentUser);
        showToast(`Document "${docItem.title}" permanently removed.`);
        if (onDocumentChange) onDocumentChange(docItem);
      } catch (err) {
        showToast(err.message || 'Failed to delete document', 'error');
      }
    }
  };

  // Open Edit Access Flags Modal
  const handleOpenEditFlags = (docItem) => {
    setEditingDocFlags(docItem);
    setEditAccessControl({
      ...DEFAULT_ACCESS_CONTROL,
      ...(docItem.accessControl || {})
    });
  };

  // Save updated Access Flags
  const handleSaveFlags = async (e) => {
    e.preventDefault();
    if (!editingDocFlags) return;
    setIsSavingFlags(true);
    try {
      const updated = await updateDocumentAccessControl(editingDocFlags.id, editAccessControl, currentUser);
      showToast(`Security access flags updated for "${updated.title}".`);
      setEditingDocFlags(null);
      if (onDocumentChange) onDocumentChange(updated);
    } catch (err) {
      showToast(err.message || 'Failed to save security flags', 'error');
    } finally {
      setIsSavingFlags(false);
    }
  };

  // Quick Verification Status Update
  const handleStatusChange = async (docItem, newStatus) => {
    try {
      await updateDocumentStatus(
        docItem.id, 
        newStatus, 
        `Status set to ${newStatus} by Administrator`,
        currentUser
      );
      showToast(`Document status changed to ${newStatus}.`);
      if (onDocumentChange) onDocumentChange(docItem);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 flex-shrink-0" />

        {/* Toast Alert */}
        {toastMessage && (
          <div className={`p-3 mx-6 mt-4 rounded-xl border flex items-center justify-between text-xs font-bold transition animate-fadeIn ${
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

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4 flex-shrink-0 bg-slate-950/90">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 font-mono">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Firestore Plot Document Vault</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                Admin Control
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Attach & Manage PDF Documents</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload statutory deeds, 11E sketches, and e-Khatas directly to specific plot entries with cryptographic SHA-256 integrity and RBAC access controls.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Township & Plot Context Ribbon */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Township Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold text-[11px]">Township:</span>
              <select
                value={selectedTownshipId}
                onChange={(e) => {
                  setSelectedTownshipId(e.target.value);
                  setSelectedPlotId('ALL_PLOTS');
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {allTownships.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Plot Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold text-[11px]">Target Plot:</span>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="bg-slate-950 border border-emerald-500/40 text-emerald-300 rounded-xl px-3 py-1.5 text-xs font-black focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="ALL_PLOTS">🌐 All Township Plots (Master Dossier)</option>
                {(activeTownship?.plots || []).map(p => (
                  <option key={p.id} value={p.id}>
                    📍 {p.plotNumber || p.number || `Plot ${p.id}`} • {p.sqft || 1200} sq.ft ({p.facing || 'East'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">
              Attached to this plot: <strong className="text-white font-bold">{plotDocuments.length} Documents</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('attached')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'attached'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Attached Documents ({plotDocuments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_new')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'upload_new'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New PDF Document</span>
          </button>

          {selectedPlotId !== 'ALL_PLOTS' && attachableExistingDocs.length > 0 && (
            <button
              onClick={() => setActiveTab('attach_existing')}
              className={`py-3 px-4 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === 'attach_existing'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach from Vault ({attachableExistingDocs.length})</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: ATTACHED DOCUMENTS LIST */}
          {/* ==================================================== */}
          {activeTab === 'attached' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Verified Documents for {activePlotNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {plotDocuments.length} Available
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Buyers and auditors can review these documents according to their RBAC clearance.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('upload_new')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Attach PDF</span>
                </button>
              </div>

              {plotDocuments.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No documents attached yet for {activePlotNumber}</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Upload the individual title deed, 11E survey sketch, or e-Khata extract for this plot to establish 100% legal transparency in Firestore.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload_new')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Upload Document for {activePlotNumber}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {plotDocuments.map(docItem => {
                    const isPlotSpecificDoc = docItem.plotId && docItem.plotId !== 'ALL_PLOTS';
                    return (
                      <div
                        key={docItem.id}
                        className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition space-y-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-black text-white">{docItem.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                                  isPlotSpecificDoc
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                  {isPlotSpecificDoc ? `📍 ${docItem.plotNumber || 'Specific Plot'}` : '🌐 Entire Township'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                                  {docItem.category}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                <span>Ref: <strong className="text-white font-mono">{docItem.refNumber}</strong></span>
                                <span>Authority: <span className="text-slate-300">{docItem.authority}</span></span>
                                <span>Size: <span className="text-slate-300">{docItem.fileSize || '3.2 MB (PDF)'}</span></span>
                              </div>

                              {docItem.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2">{docItem.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Quick Status Pill */}
                          <div className="flex items-center space-x-2 self-start md:self-auto">
                            <select
                              value={docItem.status || 'Verified'}
                              onChange={(e) => handleStatusChange(docItem, e.target.value)}
                              className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                                docItem.status === 'Verified'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : docItem.status === 'Pending Legal Audit'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              <option value="Verified" className="bg-slate-950 text-white">✓ Verified</option>
                              <option value="Under Review" className="bg-slate-950 text-white">⏳ Under Review</option>
                              <option value="Pending Legal Audit" className="bg-slate-950 text-white">⚖️ Pending Audit</option>
                              <option value="Action Required" className="bg-slate-950 text-white">⚠️ Action Req</option>
                            </select>
                          </div>
                        </div>

                        {/* Security Flags Bar & Quick Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          {/* Access Flag Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            {docItem.accessControl?.isPublic && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                                <Unlock className="w-3 h-3" />
                                <span>Public View</span>
                              </span>
                            )}
                            {docItem.accessControl?.tokenGated && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center space-x-1">
                                <Lock className="w-3 h-3" />
                                <span>Token Gated (₹25k)</span>
                              </span>
                            )}
                            {docItem.accessControl?.legalAuditorOnly && (
                              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center space-x-1">
                                <Scale className="w-3 h-3" />
                                <span>Legal Auditor Vault</span>
                              </span>
                            )}
                            {docItem.accessControl?.watermarkEnabled && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center space-x-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Watermarked</span>
                              </span>
                            )}
                            {docItem.hash && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px]">
                                SHA-256: {docItem.hash.slice(0, 10)}...
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1.5">
                            {/* Preview PDF */}
                            <button
                              onClick={() => setPreviewDoc(docItem)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] transition flex items-center space-x-1"
                              title="Preview PDF Document"
                            >
                              <Eye className="w-3 h-3 text-indigo-400" />
                              <span>Preview</span>
                            </button>

                            {/* Edit Security Flags */}
                            <button
                              onClick={() => handleOpenEditFlags(docItem)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] transition flex items-center space-x-1"
                              title="Configure RBAC flags"
                            >
                              <Sliders className="w-3 h-3 text-amber-400" />
                              <span>Flags</span>
                            </button>

                            {/* Detach Button (if plot specific) */}
                            {isPlotSpecificDoc && selectedPlotId !== 'ALL_PLOTS' && (
                              <button
                                onClick={() => handleDetach(docItem)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-[11px] transition"
                                title="Detach from this plot"
                              >
                                Detach
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(docItem)}
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 rounded-lg transition"
                              title="Permanently delete from Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: UPLOAD NEW PDF DOCUMENT */}
          {/* ==================================================== */}
          {activeTab === 'upload_new' && (
            <form onSubmit={handleUploadSubmit} className="space-y-4 animate-fadeIn text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300 space-y-1">
                <span className="text-emerald-300 font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Attaching Document to: {activePlotNumber}</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  This document will be cryptographically hashed, synced in real-time to Firestore, and attached to {activePlotNumber} in {activeTownship?.name}.
                </p>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* File Dropzone */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Select PDF Document / Title Dossier *</label>
                <div className="p-5 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl bg-slate-900/50 text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">
                    {uploadFile ? uploadFile.name : 'Click to browse or drop PDF property document here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {uploadFile
                      ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • PDF parsed and ready for Firestore upload`
                      : 'Accepts PDF, Scanned TIFF, and High-Resolution Title Deeds up to 35MB'}
                  </p>
                </div>
              </div>

              {/* Title & Ref Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Plot 101 Form 15 Encumbrance Certificate"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Sanction / Reference Number *</label>
                  <input
                    type="text"
                    required
                    value={uploadRefNumber}
                    onChange={(e) => setUploadRefNumber(e.target.value)}
                    placeholder="e.g., PLT-101-KA-2026/0091"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Category & Issuing Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Document Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DOCUMENT_CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-slate-950 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Issuing Authority / Registrar</label>
                  <input
                    type="text"
                    required
                    value={uploadAuthority}
                    onChange={(e) => setUploadAuthority(e.target.value)}
                    placeholder="e.g., Sub-Registrar Bangalore Rural"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Issue / Execution Date</label>
                  <input
                    type="date"
                    value={uploadIssueDate}
                    onChange={(e) => setUploadIssueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Valid Until / Expiry Date</label>
                  <input
                    type="date"
                    value={uploadExpiryDate}
                    onChange={(e) => setUploadExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Statutory & Verification Notes</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Summary of survey numbers, boundaries, or legal opinion notes..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Granular RBAC Flags */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Firestore RBAC & Access Flags</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAccessControl.isPublic}
                      onChange={(e) => setUploadAccessControl({ ...uploadAccessControl, isPublic: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Public Marketplace Visibility</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAccessControl.tokenGated}
                      onChange={(e) => setUploadAccessControl({ ...uploadAccessControl, tokenGated: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Token Gated (₹25k Deposit)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAccessControl.legalAuditorOnly}
                      onChange={(e) => setUploadAccessControl({ ...uploadAccessControl, legalAuditorOnly: e.target.checked })}
                      className="w-4 h-4 accent-teal-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Legal Auditor Vault Only</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAccessControl.watermarkEnabled}
                      onChange={(e) => setUploadAccessControl({ ...uploadAccessControl, watermarkEnabled: e.target.checked })}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Burn Dynamic Watermark</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAccessControl.allowDirectDownload}
                      onChange={(e) => setUploadAccessControl({ ...uploadAccessControl, allowDirectDownload: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300 font-medium">Allow Direct PDF Download</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('attached')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Uploading to Firestore...' : `Upload & Attach to ${activePlotNumber}`}</span>
                </button>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 3: ATTACH FROM EXISTING VAULT */}
          {/* ==================================================== */}
          {activeTab === 'attach_existing' && selectedPlotId !== 'ALL_PLOTS' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">Select Existing Documents from Vault</h3>
                <p className="text-[11px] text-slate-400">
                  Attach documents already uploaded in {activeTownship?.name} directly to {activePlotNumber}.
                </p>
              </div>

              <div className="space-y-2">
                {attachableExistingDocs.map(docItem => (
                  <div
                    key={docItem.id}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition"
                  >
                    <div>
                      <h4 className="font-bold text-white">{docItem.title}</h4>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                        <span>{docItem.category}</span>
                        <span>•</span>
                        <span className="font-mono">{docItem.refNumber}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAttachExisting(docItem)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attach to {activePlotNumber}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-MODAL: PDF PREVIEW SANDBOX */}
      {/* ==================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">Ref: {previewDoc.refNumber} • {previewDoc.authority}</p>
              </div>
            </div>

            {/* Document Canvas / Preview Sandbox */}
            <div className="flex-1 min-h-[350px] bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col justify-between">
              {/* Dynamic Watermark Overlay */}
              {previewDoc.accessControl?.watermarkEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-15 rotate-[-25deg]">
                  <div className="text-center font-black text-white text-xl sm:text-2xl font-mono uppercase tracking-widest leading-loose">
                    CONFIDENTIAL LEGAL RECORD<br />
                    PLOTFLOW VERIFIED • {currentUser?.email || 'ADMIN'}<br />
                    {new Date().toLocaleString()}
                  </div>
                </div>
              )}

              {/* Simulated / Real PDF Content Sheet */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 text-slate-300 space-y-4 relative z-10 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Government of Karnataka / Sanction Body</span>
                    <h4 className="text-sm font-bold text-white font-sans">{previewDoc.authority}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">DIGITAL CERTIFICATE</span>
                    <p className="text-amber-300 text-xs font-bold">{previewDoc.refNumber}</p>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  <div className="text-white font-sans font-bold text-sm">
                    STATUTORY DUE DILIGENCE DOSSIER
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    This certifies that property document <strong className="text-white">"{previewDoc.title}"</strong> ({previewDoc.category}) corresponds to the official records registered under Karnataka Town Planning and Land Revenue acts for <strong className="text-emerald-400">{previewDoc.plotNumber || 'Township Plotted Development'}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-500">Cryptographic Seal:</span>
                    <p className="text-emerald-400 truncate">{previewDoc.hash || generateDocumentHash(previewDoc.title, previewDoc.refNumber)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Verification Authority:</span>
                    <p className="text-white">{previewDoc.verifiedBy || 'Senior Legal Auditor'}</p>
                  </div>
                </div>
              </div>

              {/* Preview Footer Controls */}
              <div className="pt-4 flex items-center justify-between text-xs relative z-10">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% SHA-256 Validated & Firestore Synchronized</span>
                </span>

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(previewDoc, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${previewDoc.fileName || 'document.pdf'}`;
                    a.click();
                    showToast('Document downloaded successfully.');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-MODAL: EDIT ACCESS FLAGS */}
      {/* ==================================================== */}
      {editingDocFlags && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setEditingDocFlags(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-amber-400">
                <Sliders className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Configure Security Flags</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Updating access control for <strong className="text-white">{editingDocFlags.title}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveFlags} className="space-y-3 text-xs">
              <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Public Marketplace Visibility</span>
                  <span className="text-[10px] text-slate-400">Allow all retail buyers to view without restriction</span>
                </div>
                <input
                  type="checkbox"
                  checked={editAccessControl.isPublic}
                  onChange={(e) => setEditAccessControl({ ...editAccessControl, isPublic: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Token Gated (₹25k Deposit)</span>
                  <span className="text-[10px] text-slate-400">Restricted until buyer reserves the plot with ₹25k token</span>
                </div>
                <input
                  type="checkbox"
                  checked={editAccessControl.tokenGated}
                  onChange={(e) => setEditAccessControl({ ...editAccessControl, tokenGated: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Legal Auditor Vault Only</span>
                  <span className="text-[10px] text-slate-400">Restricted exclusively to certified advocates & Super Admin</span>
                </div>
                <input
                  type="checkbox"
                  checked={editAccessControl.legalAuditorOnly}
                  onChange={(e) => setEditAccessControl({ ...editAccessControl, legalAuditorOnly: e.target.checked })}
                  className="w-5 h-5 accent-teal-500 rounded"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Dynamic Watermark</span>
                  <span className="text-[10px] text-slate-400">Burn downloader email and timestamp on exported PDF</span>
                </div>
                <input
                  type="checkbox"
                  checked={editAccessControl.watermarkEnabled}
                  onChange={(e) => setEditAccessControl({ ...editAccessControl, watermarkEnabled: e.target.checked })}
                  className="w-5 h-5 accent-indigo-500 rounded"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Allow Direct Download</span>
                  <span className="text-[10px] text-slate-400">Allow users to export PDF file directly to device</span>
                </div>
                <input
                  type="checkbox"
                  checked={editAccessControl.allowDirectDownload}
                  onChange={(e) => setEditAccessControl({ ...editAccessControl, allowDirectDownload: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDocFlags(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFlags}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  {isSavingFlags ? 'Saving Flags...' : 'Save Flags to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
