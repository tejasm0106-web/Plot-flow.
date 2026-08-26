import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Download, 
  Building2, 
  Layers, 
  Sparkles, 
  Search, 
  Filter, 
  Award, 
  Clock, 
  Send,
  MessageSquare,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Mail,
  Zap,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { 
  triggerDocumentApprovalCloudFunction, 
  getEmailLogs 
} from '../services/cloudFunctions';

export default function LegalAuditPortal({ 
  currentUser, 
  townships = [], 
  onUpdateTownship,
  onNavigateTo3D
}) {
  const [selectedTownshipId, setSelectedTownshipId] = useState(townships[0]?.id || 'ts_01');
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'plots' | 'cloud_functions'
  const [plotFilter, setPlotFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rejection Modals State
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');
  
  const [rejectingPlotId, setRejectingPlotId] = useState(null);
  const [plotRejectReason, setPlotRejectReason] = useState('');

  // Cloud Function Dispatch & Email Modal State
  const [cfDispatchToast, setCfDispatchToast] = useState(null);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState(null);
  const [emailLogsList, setEmailLogsList] = useState(() => getEmailLogs());
  const [copiedHash, setCopiedHash] = useState(false);
  const [previewTab, setPreviewTab] = useState('html'); // 'html' | 'json'

  useEffect(() => {
    const handleEmailDispatched = () => {
      setEmailLogsList(getEmailLogs());
    };
    window.addEventListener('plotflow_email_dispatched', handleEmailDispatched);
    return () => {
      window.removeEventListener('plotflow_email_dispatched', handleEmailDispatched);
    };
  }, []);

  // Selected Township
  const township = townships.find(t => t.id === selectedTownshipId) || townships[0];

  // Default Statutory Documents if township doesn't have custom ones yet
  const defaultDocs = [
    {
      id: 'doc_title_01',
      name: 'Parent Title Deed & 30-Year Chain of Title',
      category: 'Land Revenue & Title Deed',
      regNo: 'BLR/SK/4902/1996-2026',
      authority: 'Sub-Registrar Office, Bangalore Urban',
      issuedDate: '15 Jan 2026',
      status: township?.legalDocsStatus?.['doc_title_01']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_title_01']?.remarks || 'Clear marketable title with zero encumbrance.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_ec_02',
      name: '30-Year Nil Encumbrance Certificate (Form 15)',
      category: 'Land Revenue & Title Deed',
      regNo: 'EC-2026-994812',
      authority: 'Department of Stamps & Registration (Kaveri 2.0)',
      issuedDate: '02 Feb 2026',
      status: township?.legalDocsStatus?.['doc_ec_02']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_ec_02']?.remarks || 'Form 15 shows zero bank liens, charges, or court stays.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_rtc_03',
      name: 'RTC / Pahani Extracts (Forms 4 & 16) & Mutation Register',
      category: 'Land Revenue & Title Deed',
      regNo: 'MR-BHOOMI-7712/2025-26',
      authority: 'Bhoomi Karnataka Land Records Portal',
      issuedDate: '10 Jan 2026',
      status: township?.legalDocsStatus?.['doc_rtc_03']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_rtc_03']?.remarks || 'Katha updated cleanly in favor of developer.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_dc_04',
      name: 'Deputy Commissioner (DC) Land Conversion Order (Agri to Non-Agri Res)',
      category: 'Zonal Sanction & Land Use',
      regNo: 'ALN(EV)SR/391/2023-24',
      authority: 'Office of the Deputy Commissioner, Bengaluru Urban',
      issuedDate: '18 Nov 2024',
      status: township?.legalDocsStatus?.['doc_dc_04']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_dc_04']?.remarks || 'Conversion fee fully paid. Residential plotting permitted.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_layout_05',
      name: 'Planning Authority Sanctioned Layout Plan (BDA / BMRDA / BIAPPA)',
      category: 'Zonal Sanction & Land Use',
      regNo: 'BMRDA/LAO/192/2024-25',
      authority: 'BMRDA Master Town Planning Directorate',
      issuedDate: '04 Aug 2025',
      status: township?.legalDocsStatus?.['doc_layout_05']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_layout_05']?.remarks || 'Setbacks, road widths (12m), and green verges sanctioned.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_rera_06',
      name: 'State RERA Project Registration & Sanction Certificate',
      category: 'RERA Sanction',
      regNo: township?.reraNumber || 'PRM/KA/RERA/1250/303/PR/210324/004055',
      authority: 'Karnataka Real Estate Regulatory Authority (K-RERA)',
      issuedDate: '14 Oct 2025',
      status: township?.legalDocsStatus?.['doc_rera_06']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_rera_06']?.remarks || 'Active RERA registration. Escrow bank account mapped.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    },
    {
      id: 'doc_noc_07',
      name: 'State Pollution Control Board (KSPCB) & Fire NOC',
      category: 'Environmental & Pollution NOC',
      regNo: 'KSPCB/WPC/BNG-R/2025/1109',
      authority: 'Karnataka State Pollution Control Board',
      issuedDate: '22 Dec 2025',
      status: township?.legalDocsStatus?.['doc_noc_07']?.status || 'Approved',
      remarks: township?.legalDocsStatus?.['doc_noc_07']?.remarks || 'STP & Rainwater harvesting designs compliant.',
      auditor: 'Advocate Rajeshwari Iyer (KAR/1482/2012)'
    }
  ];

  const currentDocs = township?.legalDocuments || defaultDocs;

  // Handlers for Document Approval / Rejection
  const handleApproveDocument = (docId) => {
    if (!township) return;
    const auditorSignature = currentUser?.name 
      ? `${currentUser.name} (${currentUser.barCouncilId || 'Advocate / Bar Council Reg'})`
      : 'Advocate Rajeshwari Iyer (KAR/1482/2012)';

    const targetDoc = currentDocs.find(d => d.id === docId);

    const updatedDocs = currentDocs.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'Approved',
          remarks: 'Approved & Signed off after statutory verification.',
          auditor: auditorSignature,
          verifiedAt: new Date().toLocaleString()
        };
      }
      return doc;
    });

    const docStatusMap = { ...(township.legalDocsStatus || {}) };
    docStatusMap[docId] = {
      status: 'Approved',
      remarks: 'Statutory verification completed and title confirmed clear.',
      auditor: auditorSignature,
      timestamp: new Date().toISOString()
    };

    // Check if all docs are approved
    const allApproved = updatedDocs.every(d => d.status === 'Approved');

    const updatedTownship = {
      ...township,
      legalDocuments: updatedDocs,
      legalDocsStatus: docStatusMap,
      legalClearance: allApproved ? 'Approved' : (township.legalClearance === 'Rejected' ? 'Rejected' : 'Pending Review')
    };

    onUpdateTownship(updatedTownship);

    // ⚡ Execute Firebase Cloud Function to send confirmation email to Developer/User
    const recipientEmail = township.developerEmail || 'rohit@prestigeplotted.com';
    const recipientName = township.developer || 'Prestige Plotted Townships';

    triggerDocumentApprovalCloudFunction({
      recipientEmail,
      recipientName,
      documentId: docId,
      documentName: targetDoc?.name || 'Statutory Land Title Deed',
      category: targetDoc?.category || 'Land Revenue & Title Deed',
      regNo: targetDoc?.regNo || 'BLR/SK/4902/1996-2026',
      authority: targetDoc?.authority || 'Competent Authority',
      townshipId: township.id,
      townshipName: township.name,
      developerName: township.developer,
      auditorName: currentUser?.name || 'Advocate Rajeshwari Iyer',
      auditorBarCouncilId: currentUser?.barCouncilId || 'KAR/1482/2012'
    }).then(res => {
      setCfDispatchToast({
        show: true,
        packet: res.emailPacket,
        title: '⚡ Firebase Cloud Function Triggered',
        description: `Confirmation email dispatched to ${recipientEmail} for "${targetDoc?.name || 'Document'}" with tamper-proof SHA-256 seal.`
      });
      setEmailLogsList(getEmailLogs());
    }).catch(err => {
      console.warn('Cloud function trigger note:', err);
    });
  };

  const handleConfirmRejectDocument = () => {
    if (!rejectingDocId || !township) return;
    const auditorSignature = currentUser?.name 
      ? `${currentUser.name} (${currentUser.barCouncilId || 'Advocate / Bar Council Reg'})`
      : 'Advocate Rajeshwari Iyer (KAR/1482/2012)';

    const reason = docRejectReason.trim() || 'Defect detected in statutory document submission. Re-upload required.';

    const updatedDocs = currentDocs.map(doc => {
      if (doc.id === rejectingDocId) {
        return {
          ...doc,
          status: 'Rejected',
          remarks: reason,
          auditor: auditorSignature,
          rejectedAt: new Date().toLocaleString()
        };
      }
      return doc;
    });

    const docStatusMap = { ...(township.legalDocsStatus || {}) };
    docStatusMap[rejectingDocId] = {
      status: 'Rejected',
      remarks: reason,
      auditor: auditorSignature,
      timestamp: new Date().toISOString()
    };

    const updatedTownship = {
      ...township,
      legalDocuments: updatedDocs,
      legalDocsStatus: docStatusMap,
      legalClearance: 'Rejected',
      legalRejectionNotice: `Statutory defect flagged on document: ${reason}. Developer must re-upload.`
    };

    onUpdateTownship(updatedTownship);
    setRejectingDocId(null);
    setDocRejectReason('');
  };

  // Handlers for Plot Approval / Rejection
  const handleApprovePlot = (plotId) => {
    if (!township) return;
    const auditorSignature = currentUser?.name || 'Legal Compliance Team';

    const updatedPlots = (township.plots || []).map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          legalStatus: 'Approved',
          legalVerifiedBy: auditorSignature,
          legalVerifiedAt: new Date().toLocaleString(),
          legalRemarks: 'Sanctioned layout boundaries and setbacks confirmed compliant.'
        };
      }
      return p;
    });

    const updatedTownship = {
      ...township,
      plots: updatedPlots,
      availablePlots: updatedPlots.filter(p => p.status === 'AVAILABLE' && p.legalStatus === 'Approved').length
    };

    onUpdateTownship(updatedTownship);
  };

  const handleConfirmRejectPlot = () => {
    if (!rejectingPlotId || !township) return;
    const auditorSignature = currentUser?.name || 'Legal Compliance Team';
    const reason = plotRejectReason.trim() || 'Plot rejected due to dimensional variance or setback buffer overlap.';

    const updatedPlots = (township.plots || []).map(p => {
      if (p.id === rejectingPlotId) {
        return {
          ...p,
          legalStatus: 'Rejected',
          legalVerifiedBy: auditorSignature,
          legalVerifiedAt: new Date().toLocaleString(),
          legalRemarks: reason
        };
      }
      return p;
    });

    const updatedTownship = {
      ...township,
      plots: updatedPlots,
      availablePlots: updatedPlots.filter(p => p.status === 'AVAILABLE' && p.legalStatus === 'Approved').length
    };

    onUpdateTownship(updatedTownship);
    setRejectingPlotId(null);
    setPlotRejectReason('');
  };

  // Bulk Approve All Pending Plots
  const handleBulkApprovePlots = () => {
    if (!township) return;
    const auditorSignature = currentUser?.name || 'Legal Compliance Team';
    const updatedPlots = (township.plots || []).map(p => ({
      ...p,
      legalStatus: 'Approved',
      legalVerifiedBy: auditorSignature,
      legalVerifiedAt: new Date().toLocaleString(),
      legalRemarks: 'Sanctioned layout boundaries verified compliant.'
    }));

    const updatedTownship = {
      ...township,
      plots: updatedPlots,
      availablePlots: updatedPlots.filter(p => p.status === 'AVAILABLE').length
    };

    onUpdateTownship(updatedTownship);
  };

  // Plots Filtered
  const townshipPlots = township?.plots || [];
  const filteredPlots = townshipPlots.filter(p => {
    const matchesSearch = !searchQuery || 
      p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.facing.toLowerCase().includes(searchQuery.toLowerCase());

    const plotStatus = p.legalStatus || 'Approved'; // default for pre-existing or fallback
    const matchesFilter = 
      plotFilter === 'ALL' ||
      (plotFilter === 'PENDING' && (plotStatus === 'Pending' || plotStatus === 'Pending Audit')) ||
      (plotFilter === 'APPROVED' && plotStatus === 'Approved') ||
      (plotFilter === 'REJECTED' && plotStatus === 'Rejected');

    return matchesSearch && matchesFilter;
  });

  const approvedDocsCount = currentDocs.filter(d => d.status === 'Approved').length;
  const rejectedDocsCount = currentDocs.filter(d => d.status === 'Rejected').length;
  const pendingDocsCount = currentDocs.length - approvedDocsCount - rejectedDocsCount;

  const approvedPlotsCount = townshipPlots.filter(p => (p.legalStatus || 'Approved') === 'Approved').length;
  const rejectedPlotsCount = townshipPlots.filter(p => p.legalStatus === 'Rejected').length;
  const pendingPlotsCount = townshipPlots.filter(p => p.legalStatus === 'Pending' || p.legalStatus === 'Pending Audit').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Legal Authority Header */}
      <div className="bg-slate-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/40 flex-shrink-0">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Legal Compliance & Title Audit Portal
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Statutory Gatekeeper</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Auditor: <strong className="text-teal-300">{currentUser?.name || 'Advocate Rajeshwari Iyer'}</strong> • Bar Council ID: <span className="text-slate-300">{currentUser?.barCouncilId || 'KAR/1482/2012'}</span>
              </p>
            </div>
          </div>

          {/* Township Selection Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
            <span className="text-xs text-slate-400 font-bold px-2">Auditing Project:</span>
            <select
              value={selectedTownshipId}
              onChange={(e) => setSelectedTownshipId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              {townships.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.developer})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legal Authority Notice & Rules Rule */}
        <div className="p-4 bg-teal-950/40 border border-teal-500/30 rounded-2xl text-xs space-y-2">
          <div className="flex items-center space-x-2 text-teal-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Marketplace Visibility Enforcement Policy:</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            By statutory governance rule, <strong>no plot is displayed to retail buyers</strong> unless its developer-uploaded documents and physical layout boundaries are formally approved by the Legal Team. Rejecting a document or plot withholds it immediately and mandates developer re-upload.
          </p>
        </div>

        {/* Counters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-semibold">Approved Documents</span>
            <span className="text-xl font-black text-emerald-400">{approvedDocsCount} / {currentDocs.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-semibold">Rejected Documents</span>
            <span className="text-xl font-black text-rose-400">{rejectedDocsCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-semibold">Approved Plots (Live for Buyers)</span>
            <span className="text-xl font-black text-teal-300">{approvedPlotsCount}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-semibold">Rejected / Withheld Plots</span>
            <span className="text-xl font-black text-amber-400">{rejectedPlotsCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'documents'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Statutory Document Audit ({currentDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plots')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'plots'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plot Due Diligence & Approval ({townshipPlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud_functions')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'cloud_functions'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/50'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>⚡ Firebase Cloud Function Email Logs ({emailLogsList.length})</span>
        </button>
      </div>

      {/* Floating Cloud Function Trigger Toast Banner */}
      {cfDispatchToast && (
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-500/50 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-teal-300 uppercase tracking-wide">
                  {cfDispatchToast.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                  asia-southeast1
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {cfDispatchToast.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => {
                setSelectedEmailPreview(cfDispatchToast.packet);
                setCfDispatchToast(null);
              }}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Inspect Email Dispatched</span>
            </button>
            <button
              onClick={() => setCfDispatchToast(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 1: STATUTORY DOCUMENT AUDIT ================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Mandatory 42-Point Title Search & Approvals</span>
              <span className="text-xs font-normal text-slate-400">({township?.name})</span>
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              township?.legalClearance === 'Approved'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : township?.legalClearance === 'Rejected'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              Project Status: {township?.legalClearance || 'Approved'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentDocs.map((doc, idx) => (
              <div 
                key={doc.id || idx}
                className={`bg-slate-950 border rounded-2xl p-5 shadow-lg space-y-4 transition ${
                  doc.status === 'Approved'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : doc.status === 'Rejected'
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : 'border-amber-500/30 bg-amber-950/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : doc.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Reg/Ref: <span className="text-slate-200 font-mono font-bold">{doc.regNo}</span> • Authority: <span className="text-slate-300">{doc.authority}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 border ${
                      doc.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : doc.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {doc.status === 'Approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : doc.status === 'Rejected' ? (
                        <XCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{doc.status}</span>
                    </span>
                  </div>
                </div>

                {/* Remarks & Auditor Signature */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[11px] block">Legal Audit Notes / Remarks:</span>
                    <span className="text-slate-200 font-medium">{doc.remarks}</span>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 block">Signed Endorsement:</span>
                    <span className="text-[11px] text-teal-300 font-bold">{doc.auditor}</span>
                  </div>
                </div>

                {/* Legal Action Buttons & Cloud Function Triggers */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span>Issuance Date: <strong className="text-slate-200">{doc.issuedDate}</strong></span>
                    <span className="text-slate-700">•</span>
                    <span className="text-teal-400/90 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Cloud Function: sendLegalApprovalConfirmationEmail</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {doc.status === 'Approved' && (
                      <button
                        onClick={() => {
                          const foundLog = emailLogsList.find(l => l.documentId === doc.id) || {
                            type: 'FIREBASE_CLOUD_FUNCTION_DOCUMENT_APPROVED',
                            cloudFunctionName: 'sendLegalApprovalConfirmationEmail',
                            cloudFunctionRegion: 'asia-southeast1',
                            recipientEmail: township.developerEmail || 'rohit@prestigeplotted.com',
                            recipientName: township.developer || 'Prestige Plotted Townships',
                            documentName: doc.name,
                            category: doc.category,
                            regNo: doc.regNo,
                            authority: doc.authority,
                            townshipName: township.name,
                            developerName: township.developer,
                            auditorName: doc.auditor,
                            auditorBarCouncilId: 'KAR/1482/2012',
                            verificationHash: '0x7f4a9b8e14c5d3f90246a8be14c5',
                            dispatchedAt: doc.verifiedAt || new Date().toLocaleString(),
                            previewHtml: `<div>Statutory Document Approved: ${doc.name}</div>`
                          };
                          setSelectedEmailPreview(foundLog);
                        }}
                        className="px-3.5 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Mail className="w-3.5 h-3.5 text-teal-400" />
                        <span>View Cloud Function Email Receipt</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleApproveDocument(doc.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{doc.status === 'Approved' ? 'Re-Approve & Re-dispatch (⚡)' : 'Approve & Trigger Email (⚡)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingDocId(doc.id);
                        setDocRejectReason(doc.remarks || '');
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Request Re-upload</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PLOTS DUE DILIGENCE & APPROVAL ================= */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Plot Boundary & Sanctioned Layout Verification</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify dimensional compliance, setback buffers, and road width access before approving plots for retail buyer visibility.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkApprovePlots}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bulk Approve All Plots</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search plot number, facing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Filter Status:</span>
              {['ALL', 'APPROVED', 'REJECTED'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setPlotFilter(filterKey)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    plotFilter === filterKey
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Plots Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlots.map((plot) => {
              const status = plot.legalStatus || 'Approved';
              return (
                <div
                  key={plot.id}
                  className={`bg-slate-950 border rounded-2xl p-4 shadow space-y-3 transition ${
                    status === 'Approved'
                      ? 'border-emerald-500/30'
                      : status === 'Rejected'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-white">{plot.number}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {plot.facing} Facing
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {status === 'Approved' ? 'Live to Buyers' : status === 'Rejected' ? 'Withheld (Rejected)' : 'Pending Audit'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Dimensions</span>
                      <span className="text-white font-bold">{plot.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Area</span>
                      <span className="text-emerald-400 font-bold">{plot.areaSqFt} sq.ft</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Listed Price</span>
                      <span className="text-amber-400 font-bold">₹{(plot.price / 100000).toFixed(1)} L</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Type</span>
                      <span className="text-slate-200 font-medium">{plot.corner ? 'Corner Plot' : 'Standard'}</span>
                    </div>
                  </div>

                  {plot.legalRemarks && (
                    <p className="text-[11px] text-slate-300 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                      Note: {plot.legalRemarks}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleApprovePlot(plot.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center space-x-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingPlotId(plot.id);
                        setPlotRejectReason(plot.legalRemarks || '');
                      }}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center space-x-1 shadow"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: FIREBASE CLOUD FUNCTION DISPATCH LOGS ================= */}
      {activeTab === 'cloud_functions' && (
        <div className="space-y-6">
          {/* Cloud Function Architecture Overview Box */}
          <div className="bg-slate-950 border border-teal-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-white">Firebase Cloud Functions Email Engine</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      ● Active (v2.asia-southeast1)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Triggered on-demand whenever a legal auditor marks any statutory document (30-Yr EC, DC Conversion, RERA Sanction) as <strong>Approved</strong>. Dispatches a cryptographically signed confirmation email to the project promoter/developer with digital SHA-256 seal.
                  </p>
                </div>
              </div>

              {/* Quick Action: Test Cloud Function Dispatch */}
              <button
                onClick={() => {
                  triggerDocumentApprovalCloudFunction({
                    recipientEmail: township.developerEmail || 'rohit@prestigeplotted.com',
                    recipientName: township.developer || 'Prestige Plotted Townships',
                    documentId: 'doc_ec_02',
                    documentName: '30-Year Nil Encumbrance Certificate (Form 15)',
                    category: 'Land Revenue & Title Deed',
                    regNo: 'EC-2026-994812',
                    authority: 'Department of Stamps & Registration (Kaveri 2.0)',
                    townshipId: township.id,
                    townshipName: township.name,
                    developerName: township.developer,
                    auditorName: currentUser?.name || 'Advocate Rajeshwari Iyer',
                    auditorBarCouncilId: currentUser?.barCouncilId || 'KAR/1482/2012'
                  }).then(res => {
                    setCfDispatchToast({
                      show: true,
                      packet: res.emailPacket,
                      title: '⚡ Test Cloud Function Dispatched',
                      description: `Confirmation email dispatched to ${res.emailPacket.recipientEmail} (${res.emailPacket.documentName})`
                    });
                    setEmailLogsList(getEmailLogs());
                  });
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span>Test Cloud Function Email Dispatch</span>
              </button>
            </div>

            {/* Cloud Function Architecture Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800 mt-6 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Function Name</span>
                <span className="text-slate-200 font-mono font-bold text-xs">sendLegalApprovalConfirmationEmail</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Cloud Region</span>
                <span className="text-teal-400 font-mono font-bold text-xs">asia-southeast1 (Singapore/GCP)</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Developer Mail</span>
                <span className="text-white font-semibold text-xs truncate block">{township?.developerEmail || 'rohit@prestigeplotted.com'}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Digital Seal</span>
                <span className="text-emerald-400 font-mono font-bold text-xs">SHA-256 Tamper-Proof</span>
              </div>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>Dispatched Approval Confirmation Emails Log</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full transactional records dispatched to developers and promoters via Firebase Cloud Functions
                </p>
              </div>

              <button
                onClick={() => setEmailLogsList(getEmailLogs())}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Refresh Logs</span>
              </button>
            </div>

            {emailLogsList.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No confirmation emails have been dispatched yet. Click "Approve Document" on any statutory title document to trigger the Cloud Function.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden">
                {emailLogsList.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 bg-slate-900/40 hover:bg-slate-900 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {log.subject || `Document Approval Notice: ${log.documentName}`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            SENT 200 OK
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Recipient: <strong className="text-slate-200">{log.recipientEmail}</strong> ({log.recipientName}) • Project: <span className="text-teal-300 font-semibold">{log.townshipName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Dispatched: {log.dispatchedAt}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400 text-[10px]">Hash: {log.verificationHash ? log.verificationHash.substring(0, 16) + '...' : '0x7f4a...'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto flex-shrink-0">
                      <button
                        onClick={() => setSelectedEmailPreview(log)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Email</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal for Document */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-950 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reject Statutory Document</h3>
            </div>
            <p className="text-xs text-slate-300">
              Please enter the specific legal defect or missing endorsement. This notice will be immediately sent to the developer for mandatory re-upload:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Encumbrance Certificate only covers 15 years instead of mandatory 30 years. Page 4 is missing the sub-registrar seal."
              value={docRejectReason}
              onChange={(e) => setDocRejectReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingDocId(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectDocument}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Confirm Rejection & Notify Developer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal for Plot */}
      {rejectingPlotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-950 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reject Developer Plot</h3>
            </div>
            <p className="text-xs text-slate-300">
              State the reason why this plot violates sanctioned layout plans or zoning buffer norms (e.g. dimensional variance, drainage setback):
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Plot dimensions overlap with the 12m peripheral buffer green verge. Needs re-survey."
              value={plotRejectReason}
              onChange={(e) => setPlotRejectReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingPlotId(null)}
                className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectPlot}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Confirm Plot Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FIREBASE CLOUD FUNCTION EMAIL INSPECTOR ================= */}
      {selectedEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-teal-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Firebase Cloud Function Email Receipt</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      200 OK • asia-southeast1
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Function: <span className="text-teal-300 font-mono">sendLegalApprovalConfirmationEmail</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Sub-header Metadata Bar */}
            <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[11px] block">Recipient Email:</span>
                  <span className="text-white font-bold">{selectedEmailPreview.recipientEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Developer / User:</span>
                  <span className="text-white font-medium">{selectedEmailPreview.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Township Project:</span>
                  <span className="text-teal-300 font-medium">{selectedEmailPreview.townshipName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Dispatched Timestamp:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{selectedEmailPreview.dispatchedAt}</span>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewTab('html')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    previewTab === 'html' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rendered Email
                </button>
                <button
                  onClick={() => setPreviewTab('json')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center space-x-1 ${
                    previewTab === 'json' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Payload JSON</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {previewTab === 'html' ? (
                <div className="space-y-4">
                  {/* Email Simulator Card */}
                  <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
                    {/* Simulated Email Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-950 text-xs">
                          PF
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">PlotFlow Legal Verification Office</span>
                          <span className="text-[11px] text-slate-400 font-mono">noreply@plotflow.app via Cloud Functions</span>
                        </div>
                      </div>

                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Statutory Document</span>
                      </span>
                    </div>

                    {/* Email Content */}
                    <div className="space-y-4 text-xs leading-relaxed text-slate-200">
                      <p className="text-sm font-semibold text-white">
                        Dear {selectedEmailPreview.recipientName || 'Project Promoter'},
                      </p>

                      <p>
                        We are pleased to formally notify you that your submitted statutory document for <strong>{selectedEmailPreview.townshipName}</strong> has been audited and approved by our Legal Counsel in compliance with Real Estate (Regulation and Development) Act and Department of Town Planning standards.
                      </p>

                      {/* Document Details Box */}
                      <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Approved Document:</span>
                            <span className="text-white font-bold">{selectedEmailPreview.documentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Category:</span>
                            <span className="text-slate-300 font-medium">{selectedEmailPreview.category || 'Land Revenue & Title Deed'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Registration / Sanction ID:</span>
                            <span className="text-teal-300 font-mono font-bold">{selectedEmailPreview.regNo || 'BLR/SK/4902/1996-2026'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Issuing Authority:</span>
                            <span className="text-slate-300 font-medium">{selectedEmailPreview.authority || 'Sub-Registrar Office'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="text-slate-400">Auditing Advocate:</span>
                          <span className="text-emerald-400 font-bold">{selectedEmailPreview.auditorName || 'Advocate Rajeshwari Iyer'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-teal-200 text-[11px]">
                        <strong>Marketplace Visibility Status:</strong> This approval is now active. Buyers browsing the interactive 3D layout viewer can inspect this verified title clearance.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedEmailPreview, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer with Cryptographic Seal */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 text-[11px] block">Tamper-Proof Audit Hash:</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate block">
                    {selectedEmailPreview.verificationHash || '0x7f4a9b8e14c5d3f90246a8be14c5d3f90246a8be'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedEmailPreview.verificationHash || '0x7f4a9b8e14c5d3f90246a8be14c5d3f90246a8be');
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1 transition"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
                </button>

                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
