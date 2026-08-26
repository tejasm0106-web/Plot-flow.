import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  Mail, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { INITIAL_LEADS } from '../data/mockData';

export default function LeadCrmView() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesQuery = 
      lead.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.townshipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    return matchesStatus && matchesQuery;
  });

  const handleUpdateStatus = (leadId, newStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <h2 className="text-xl font-black text-white">Developer CRM & Buyer Leads</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time inquiries, automated cab site visits, and token reservations directly from the 3D visualizer.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
            {leads.filter(l => l.status === 'Site Visit Scheduled').length} Scheduled Visits
          </span>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30">
            {leads.filter(l => l.status === 'Token Advance Paid').length} Token Advances
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'New Lead', 'Site Visit Scheduled', 'Token Advance Paid', 'Sale Deed Registered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lead by name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{lead.buyerName}</h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    lead.status === 'Token Advance Paid'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : lead.status === 'Site Visit Scheduled'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interested Unit: <strong className="text-slate-200">{lead.interestedPlot}</strong> in {lead.townshipName}
                </p>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500">Stage:</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                  <option value="Token Advance Paid">Token Advance Paid</option>
                  <option value="Sale Deed Registered">Sale Deed Registered</option>
                </select>
              </div>
            </div>

            {/* Lead Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 block">Contact Info</span>
                <span className="text-slate-300">{lead.phone} • {lead.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Budget & Source</span>
                <span className="text-amber-400 font-semibold">{lead.budget}</span> • <span className="text-slate-400">{lead.source}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Site Visit Slot</span>
                <span className="text-emerald-400 font-semibold">{lead.visitDate}</span>
              </div>
            </div>

            {/* Notes & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <p className="text-slate-400 italic text-[11px]">
                Notes: "{lead.notes}"
              </p>

              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold flex items-center space-x-1 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Buyer</span>
                </a>
                <button
                  onClick={() => alert(`Masterplan PDF & RERA Sanction brochure dispatched via WhatsApp to ${lead.phone}`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center space-x-1 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send WhatsApp Brochure</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
