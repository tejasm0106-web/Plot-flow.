import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Download, 
  Eye, 
  ArrowUpRight, 
  Sparkles,
  BarChart3,
  PieChart,
  FileCheck,
  RefreshCw,
  X
} from 'lucide-react';

export default function DeveloperPortal({ townships, onUpdateTownship, onAddTownship }) {
  const [selectedTownshipId, setSelectedTownshipId] = useState(townships[0]?.id || 'ts_01');
  const [activeSubTab, setActiveSubTab] = useState('inventory'); // 'overview', 'inventory', 'documents', 'leads'
  const [plotFilter, setPlotFilter] = useState('All'); // 'All', 'Available', 'Reserved', 'Booked'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showAddTownshipModal, setShowAddTownshipModal] = useState(false);
  const [selectedPlotForEdit, setSelectedPlotForEdit] = useState(null);

  // New Township Form State
  const [newTsForm, setNewTsForm] = useState({
    name: '',
    developer: 'Prestige Plotted Townships',
    location: 'Sarjapur Road, Bengaluru',
    city: 'Bengaluru',
    totalAcres: '35 Acres',
    priceRange: '₹60 Lakh - ₹1.4 Cr',
    pricePerSqFt: 4500,
    reraId: 'PRM/KA/RERA/1250/303/PR/260826/009123',
    approvalAuthority: 'BMRDA & RERA Approved',
    totalPlots: 48
  });

  // New Plot Form State
  const [newPlotNumber, setNewPlotNumber] = useState('');
  const [newPlotSize, setNewPlotSize] = useState('1,500 sq.ft');
  const [newPlotFacing, setNewPlotFacing] = useState('East');
  const [newPlotPrice, setNewPlotPrice] = useState('₹65.0 Lakh');
  const [newPlotElevation, setNewPlotElevation] = useState('Clubhouse View');
  const [newPlotStatus, setNewPlotStatus] = useState('Available');

  // New Document Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('RERA Approval');
  const [docAuthority, setDocAuthority] = useState('Karnataka RERA Authority');
  const [docFile, setDocFile] = useState(null);

  // Current active township
  const currentTownship = townships.find(t => t.id === selectedTownshipId) || townships[0];

  // Document Vault Mock Data for Developer
  const [documents, setDocuments] = useState([
    {
      id: 'doc_1',
      townshipId: 'ts_01',
      title: 'RERA Sanctioned Master Layout Plan',
      category: 'RERA Sanction',
      authority: 'Karnataka RERA (K-RERA)',
      refNumber: 'K-RERA/PRM/KA/2024/004055',
      uploadDate: '2025-11-12',
      fileSize: '4.8 MB (PDF)',
      status: 'Verified',
      verifiedBy: 'Legal Dept, PlotFlow India'
    },
    {
      id: 'doc_2',
      townshipId: 'ts_01',
      title: '30-Year Encumbrance Certificate (EC Form 15)',
      category: 'Land Revenue & Title',
      authority: 'Sub-Registrar Office, Devanahalli',
      refNumber: 'EC-BLR-DEV-2025-99812',
      uploadDate: '2026-01-08',
      fileSize: '2.4 MB (PDF)',
      status: 'Verified',
      verifiedBy: 'State Land Registry Sync'
    },
    {
      id: 'doc_3',
      townshipId: 'ts_01',
      title: 'BDA / BMRDA Land Conversion & Layout Approval',
      category: 'Zonal Conversion',
      authority: 'Bangalore Metropolitan Region Dev Authority',
      refNumber: 'BMRDA/LAO/12/2023-24',
      uploadDate: '2025-09-20',
      fileSize: '8.1 MB (PDF)',
      status: 'Verified',
      verifiedBy: 'Town Planning Authority'
    },
    {
      id: 'doc_4',
      townshipId: 'ts_01',
      title: 'KSPCB Environmental Clearance & Water Board NOC',
      category: 'NOC & Clearance',
      authority: 'Pollution Control Board & BWSSB',
      refNumber: 'KSPCB/NOC/ENV/2025/334',
      uploadDate: '2026-02-14',
      fileSize: '3.1 MB (PDF)',
      status: 'Under Review',
      verifiedBy: 'Environmental Compliance Cell'
    }
  ]);

  // Mock CRM Leads
  const [leads, setLeads] = useState([
    {
      id: 'lead_01',
      buyerName: 'Vikramaditya Sharma',
      email: 'vikram.sharma@techcorp.com',
      phone: '+91 98450 12345',
      interestedPlot: 'P-101 (1,500 sq.ft, East)',
      budget: '₹70 Lakh',
      status: 'Site Visit Scheduled',
      visitDate: '2026-08-29 (Saturday, 11:00 AM)',
      source: 'PlotFlow 3D Visualizer'
    },
    {
      id: 'lead_02',
      buyerName: 'Ananya Deshmukh',
      email: 'ananya.d@fintech.io',
      phone: '+91 99801 88721',
      interestedPlot: 'P-104 (1,800 sq.ft, Lake View)',
      budget: '₹90 Lakh',
      status: 'Document Audit Requested',
      visitDate: 'Completed (2026-08-22)',
      source: 'RERA Verification Vault'
    },
    {
      id: 'lead_03',
      buyerName: 'Karthik Ramanathan',
      email: 'karthik.ram@global.in',
      phone: '+91 97412 55432',
      interestedPlot: 'P-102 (1,200 sq.ft, Corner)',
      budget: '₹55 Lakh',
      status: 'Token Advance Pending',
      visitDate: 'Token Stage',
      source: 'Direct Portal Inquiry'
    }
  ]);

  // Plots belonging to current township
  const townshipPlots = currentTownship?.plots || [];

  // Filtered plots
  const filteredPlots = townshipPlots.filter(plot => {
    const matchesFilter = plotFilter === 'All' || plot.status === plotFilter;
    const matchesSearch = 
      plot.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.facing.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.elevation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate Metrics
  const totalPlots = townshipPlots.length;
  const availableCount = townshipPlots.filter(p => p.status === 'Available').length;
  const reservedCount = townshipPlots.filter(p => p.status === 'Reserved').length;
  const bookedCount = townshipPlots.filter(p => p.status === 'Booked').length;
  const occupancyRate = totalPlots > 0 ? Math.round(((reservedCount + bookedCount) / totalPlots) * 100) : 0;

  // Handle Plot Status Change
  const handleStatusChange = (plotId, newStatus) => {
    if (!onUpdateTownship) return;
    const updatedPlots = currentTownship.plots.map(p => {
      if (p.id === plotId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    
    const updatedTownship = {
      ...currentTownship,
      plots: updatedPlots,
      availablePlots: updatedPlots.filter(p => p.status === 'Available').length
    };
    
    onUpdateTownship(updatedTownship);
  };

  // Handle Add Plot
  const handleAddPlotSubmit = (e) => {
    e.preventDefault();
    if (!newPlotNumber.trim()) return;

    const newPlotObj = {
      id: `plot_${Date.now()}`,
      number: newPlotNumber.trim().toUpperCase(),
      size: newPlotSize,
      facing: newPlotFacing,
      price: newPlotPrice,
      status: newPlotStatus,
      elevation: newPlotElevation
    };

    const updatedPlots = [...currentTownship.plots, newPlotObj];
    const updatedTownship = {
      ...currentTownship,
      totalPlots: updatedPlots.length,
      availablePlots: updatedPlots.filter(p => p.status === 'Available').length,
      plots: updatedPlots
    };

    if (onUpdateTownship) {
      onUpdateTownship(updatedTownship);
    }

    // Reset Form
    setNewPlotNumber('');
    setShowAddPlotModal(false);
  };

  // Handle Document Upload Submit
  const handleDocUploadSubmit = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      townshipId: selectedTownshipId,
      title: docTitle.trim(),
      category: docCategory,
      authority: docAuthority,
      refNumber: `PLT-${Math.floor(100000 + Math.random() * 900000)}/2026`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: docFile ? `${(docFile.size / (1024 * 1024)).toFixed(1)} MB (PDF)` : '3.2 MB (PDF)',
      status: 'Under Review',
      verifiedBy: 'Pending Compliance Verification'
    };

    setDocuments([newDoc, ...documents]);
    setDocTitle('');
    setDocFile(null);
    setShowUploadDocModal(false);
  };

  // Handle Launch New Plotted Township Submit
  const handleCreateTownshipSubmit = (e) => {
    e.preventDefault();
    if (!newTsForm.name.trim()) return;

    const newId = `ts_${Date.now()}`;
    const generatedPlots = Array.from({ length: 8 }).map((_, i) => ({
      id: `plot_${newId}_${i + 1}`,
      number: `P-${100 + i + 1}`,
      size: i % 2 === 0 ? '1,500 sq.ft (30x50)' : '2,400 sq.ft (40x60)',
      facing: i % 3 === 0 ? 'North-East' : i % 2 === 0 ? 'East' : 'North',
      price: i % 2 === 0 ? '₹67.5 Lakh' : '₹1.08 Cr',
      status: 'Available',
      elevation: i === 0 ? 'Park Facing Corner' : 'Boulevard View',
      legalStatus: 'RERA Cleared'
    }));

    const createdTownship = {
      id: newId,
      name: newTsForm.name.trim(),
      developer: newTsForm.developer.trim() || 'Verified Builder Entity',
      location: newTsForm.location.trim() || 'Bengaluru Suburbs',
      city: newTsForm.city.trim() || 'Bengaluru',
      totalAcres: newTsForm.totalAcres.trim() || '25 Acres',
      totalPlots: generatedPlots.length,
      availablePlots: generatedPlots.length,
      priceRange: newTsForm.priceRange.trim() || '₹65 Lakh - ₹1.2 Cr',
      pricePerSqFt: Number(newTsForm.pricePerSqFt) || 4500,
      reraId: newTsForm.reraId.trim() || `PRM/KA/RERA/1250/303/PR/${Date.now().toString().slice(-6)}`,
      approvalAuthority: newTsForm.approvalAuthority.trim() || 'BMRDA & RERA Approved',
      distanceFromHub: '18 mins to Tech Park',
      waterSource: 'BWSSB & Rainwater Harvesting',
      powerInfra: 'Underground Cabling (BESCOM)',
      completionDate: 'Q4 2026',
      heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      isHot: true,
      legalSummary: {
        reraApproved: true,
        dcConverted: true,
        bdaBmrdaSanctioned: true,
        ecThirtyYears: 'Nil Encumbrance (Form 15)',
        mutationRegistered: true
      },
      plots: generatedPlots
    };

    if (onAddTownship) {
      onAddTownship(createdTownship);
    }
    setSelectedTownshipId(newId);
    setShowAddTownshipModal(false);
    setNewTsForm({
      name: '',
      developer: 'Prestige Plotted Townships',
      location: 'Sarjapur Road, Bengaluru',
      city: 'Bengaluru',
      totalAcres: '35 Acres',
      priceRange: '₹60 Lakh - ₹1.4 Cr',
      pricePerSqFt: 4500,
      reraId: 'PRM/KA/RERA/1250/303/PR/260826/009123',
      approvalAuthority: 'BMRDA & RERA Approved',
      totalPlots: 48
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Developer Identity */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-indigo-500/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Developer SaaS & Inventory Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Verified Builder
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Developer Account:</span>
              <strong className="text-white">{currentTownship.developer}</strong>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">RERA Id: {currentTownship.reraId}</span>
            </p>
          </div>
        </div>

        {/* Project Selector & Add Township Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium hidden sm:inline">Active Enclave:</label>
            <select
              value={selectedTownshipId}
              onChange={(e) => setSelectedTownshipId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {townships.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddTownshipModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch New Township</span>
            <span className="sm:hidden">New Project</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'inventory'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Plot Inventory Management ({totalPlots})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real-time Analytics & Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('documents')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'documents'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Legal Document Vault & RERA Upload</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leads')}
          className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeSubTab === 'leads'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CRM Buyer Inquiries ({leads.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: PLOT INVENTORY MANAGEMENT ================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Total Plotted Units</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-white">{totalPlots}</span>
                <span className="text-xs text-slate-500">100% mapped</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-emerald-400 font-medium block">Available for Sale</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-emerald-400">{availableCount}</span>
                <span className="text-xs text-emerald-500/80">Ready to Book</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-amber-400 font-medium block">Reserved (Tokens Paid)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-amber-400">{reservedCount}</span>
                <span className="text-xs text-amber-500/80">Site Visit Audit</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-rose-400 font-medium block">Booked & Sold</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-rose-400">{bookedCount}</span>
                <span className="text-xs text-rose-500/80">{occupancyRate}% Absorption</span>
              </div>
            </div>
          </div>

          {/* Action Bar (Search, Status Filter, Add Plot Button) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter plots by number, size, facing, or view..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                {['All', 'Available', 'Reserved', 'Booked'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setPlotFilter(status)}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      plotFilter === status
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAddPlotModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Plot to Inventory</span>
            </button>
          </div>

          {/* Plots Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Plot Identifier</th>
                    <th className="px-5 py-3.5">Area & Dimensions</th>
                    <th className="px-5 py-3.5">Vastu / Facing</th>
                    <th className="px-5 py-3.5">Elevation & Location</th>
                    <th className="px-5 py-3.5">Price Guide</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5 text-right">Inventory Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPlots.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                        No plots found matching your current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPlots.map((plot) => (
                      <tr key={plot.id} className="hover:bg-slate-900/50 transition">
                        <td className="px-5 py-4 font-bold text-white flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>{plot.number}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-300 font-medium">{plot.size}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-semibold">
                            {plot.facing}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{plot.elevation}</td>
                        <td className="px-5 py-4 font-bold text-amber-400">{plot.price}</td>
                        <td className="px-5 py-4">
                          <select
                            value={plot.status}
                            onChange={(e) => handleStatusChange(plot.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition focus:outline-none cursor-pointer ${
                              plot.status === 'Available'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : plot.status === 'Reserved'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <option value="Available" className="bg-slate-900 text-emerald-400">● Available</option>
                            <option value="Reserved" className="bg-slate-900 text-amber-400">● Reserved</option>
                            <option value="Booked" className="bg-slate-900 text-rose-400">● Booked</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                const newPrice = prompt(`Update price for ${plot.number}:`, plot.price);
                                if (newPrice && onUpdateTownship) {
                                  const updatedPlots = currentTownship.plots.map(p => p.id === plot.id ? { ...p, price: newPrice } : p);
                                  onUpdateTownship({ ...currentTownship, plots: updatedPlots });
                                }
                              }}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                              title="Edit Price / Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove plot ${plot.number} from inventory?`)) {
                                  const updatedPlots = currentTownship.plots.filter(p => p.id !== plot.id);
                                  onUpdateTownship({
                                    ...currentTownship,
                                    totalPlots: updatedPlots.length,
                                    availablePlots: updatedPlots.filter(p => p.status === 'Available').length,
                                    plots: updatedPlots
                                  });
                                }
                              }}
                              className="p-1.5 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                              title="Delete Plot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: OVERVIEW & ANALYTICS ================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue & Realization Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Project Realization</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">₹78.4 Cr</span>
                <span className="text-xs text-emerald-400 block mt-1 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +14.2% YoY appreciation in North BLR corridor
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Realized Revenue to Date</span>
                <FileCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-indigo-400">₹32.8 Cr</span>
                <span className="text-xs text-slate-400 block mt-1">
                  From {bookedCount + 28} registered plot sales & advances
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Avg Realization / Sq.Ft</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-amber-400">₹5,450</span>
                <span className="text-xs text-slate-400 block mt-1">
                  Base rate ₹4,500 + corner/park facing premium
                </span>
              </div>
            </div>
          </div>

          {/* Facing Demand Breakdown & Lead Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>Buyer Vastu & Facing Preference Breakdown</span>
              </h3>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-400">East Facing (Highest Demand)</span>
                    <span className="text-white">48% of total inquiries</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-indigo-400">North & North-East Facing</span>
                    <span className="text-white">34% of total inquiries</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-400">West Facing (Lake / Park View)</span>
                    <span className="text-white">18% of total inquiries</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Upcoming Physical Site Visits (Next 7 Days)</span>
              </h3>
              <div className="space-y-3 pt-1">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">{lead.buyerName}</span>
                      <span className="text-[11px] text-slate-400 block">{lead.interestedPlot}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400 block">{lead.visitDate}</span>
                      <span className="text-[10px] text-slate-500">{lead.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LEGAL DOCUMENT VAULT & UPLOAD ================= */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>RERA Compliance & Title Deed Vault</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload layout sanctions, encumbrance certificates, conversion deeds, and NOCs for buyer title audits.
              </p>
            </div>

            <button
              onClick={() => setShowUploadDocModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/30 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Legal Document</span>
            </button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">{doc.category}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{doc.title}</h4>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      doc.status === 'Verified' 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Issuing Authority:</span>
                      <span className="text-slate-200 font-medium">{doc.authority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference / Sanction ID:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{doc.refNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded Date:</span>
                      <span className="text-slate-300">{doc.uploadDate} • {doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {doc.verifiedBy}
                  </span>
                  <button 
                    onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center space-x-1.5 transition text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: CRM BUYER LEADS ================= */}
      {activeSubTab === 'leads' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Buyer Inquiries & Site Visit CRM</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time inquiries from buyers browsing the 3D plotted marketplace and requesting legal title audits.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
              {leads.length} Qualified Leads
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Buyer Name & Contact</th>
                    <th className="px-5 py-3.5">Plot Preference</th>
                    <th className="px-5 py-3.5">Investment Budget</th>
                    <th className="px-5 py-3.5">Lead Status</th>
                    <th className="px-5 py-3.5">Site Visit Schedule</th>
                    <th className="px-5 py-3.5 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-5 py-4">
                        <span className="font-bold text-white block">{lead.buyerName}</span>
                        <span className="text-[11px] text-slate-400 block">{lead.email}</span>
                        <span className="text-[11px] text-indigo-400 font-mono">{lead.phone}</span>
                      </td>
                      <td className="px-5 py-4 text-emerald-400 font-semibold">{lead.interestedPlot}</td>
                      <td className="px-5 py-4 font-bold text-amber-400">{lead.budget}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/40 text-indigo-300">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{lead.visitDate}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => alert(`Calling buyer ${lead.buyerName} at ${lead.phone}`)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition"
                        >
                          Initiate Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PLOT ================= */}
      {showAddPlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add New Plot to {currentTownship.name}</span>
              </h3>
              <button 
                onClick={() => setShowAddPlotModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlotSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P-105"
                    value={newPlotNumber}
                    onChange={(e) => setNewPlotNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Dimensions & Area</label>
                  <select
                    value={newPlotSize}
                    onChange={(e) => setNewPlotSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1,200 sq.ft (30x40)">1,200 sq.ft (30x40)</option>
                    <option value="1,500 sq.ft (30x50)">1,500 sq.ft (30x50)</option>
                    <option value="1,800 sq.ft (30x60)">1,800 sq.ft (30x60)</option>
                    <option value="2,400 sq.ft (40x60)">2,400 sq.ft (40x60)</option>
                    <option value="4,000 sq.ft (Villa Plot)">4,000 sq.ft (Villa Plot)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vastu Facing Direction</label>
                  <select
                    value={newPlotFacing}
                    onChange={(e) => setNewPlotFacing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="East">East (Sunrise Facing)</option>
                    <option value="North">North (Kuber Vastu)</option>
                    <option value="North-East">North-East (Ishanya)</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Price (INR)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹72.5 Lakh"
                    value={newPlotPrice}
                    onChange={(e) => setNewPlotPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Elevation View / Special Features</label>
                <input
                  type="text"
                  placeholder="e.g. Park Facing • Corner 40ft Road"
                  value={newPlotElevation}
                  onChange={(e) => setNewPlotElevation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Initial Status</label>
                <select
                  value={newPlotStatus}
                  onChange={(e) => setNewPlotStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Available">Available for Booking</option>
                  <option value="Reserved">Reserved (Advance Token)</option>
                  <option value="Booked">Sold / Booked</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPlotModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/40"
                >
                  Add Plot to 3D Canvas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD LEGAL DOCUMENT ================= */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Upload Title Deed / RERA Document</span>
              </h3>
              <button 
                onClick={() => setShowUploadDocModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDocUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Layout Sanction Order Phase 2"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RERA Sanction">RERA Sanction & Masterplan</option>
                    <option value="Land Revenue & Title">Land Revenue & EC Form 15</option>
                    <option value="Zonal Conversion">BDA / BMRDA Zonal Conversion</option>
                    <option value="NOC & Clearance">Environmental & BWSSB NOC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sanctioning Authority</label>
                  <input
                    type="text"
                    value={docAuthority}
                    onChange={(e) => setDocAuthority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Upload Drag & Drop Area */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select PDF / Certified Scan</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-950/60 cursor-pointer transition">
                  <FileText className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
                  <span className="text-slate-300 font-semibold block text-xs">
                    {docFile ? docFile.name : 'Click to select or drag and drop certified deed PDF'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Maximum file size: 25 MB (Encrypted PDF, Signed TIFF)</span>
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    onChange={(e) => e.target.files?.[0] && setDocFile(e.target.files[0])}
                    className="hidden" 
                    id="doc-file-input" 
                  />
                  <label htmlFor="doc-file-input" className="mt-3 inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs cursor-pointer">
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-900/40"
                >
                  Publish to Compliance Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAUNCH NEW PLOTTED TOWNSHIP ================= */}
      {showAddTownshipModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Launch New Plotted Enclave / Township</span>
              </h3>
              <button 
                onClick={() => setShowAddTownshipModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTownshipSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Township Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Sanctuary Plotted Greens"
                  value={newTsForm.name}
                  onChange={(e) => setNewTsForm({ ...newTsForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Developer / Builder Entity</label>
                  <input
                    type="text"
                    value={newTsForm.developer}
                    onChange={(e) => setNewTsForm({ ...newTsForm, developer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location / Micro-Market</label>
                  <input
                    type="text"
                    value={newTsForm.location}
                    onChange={(e) => setNewTsForm({ ...newTsForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Total Acres</label>
                  <input
                    type="text"
                    value={newTsForm.totalAcres}
                    onChange={(e) => setNewTsForm({ ...newTsForm, totalAcres: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Base Price / Sq.Ft (₹)</label>
                  <input
                    type="number"
                    value={newTsForm.pricePerSqFt}
                    onChange={(e) => setNewTsForm({ ...newTsForm, pricePerSqFt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">RERA Sanction Registration Number</label>
                <input
                  type="text"
                  value={newTsForm.reraId}
                  onChange={(e) => setNewTsForm({ ...newTsForm, reraId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTownshipModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-900/40"
                >
                  Publish Township Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
