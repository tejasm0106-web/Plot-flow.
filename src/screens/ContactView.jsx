import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Car, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { addLead } from '../services/storeService';

export default function ContactView({ townships = [], onExplore, siteSettings = {} }) {
  const [formData, setFormData] = useState({
    buyerName: '',
    email: '',
    phone: '',
    inquiryType: 'Site Visit Booking', // 'Site Visit Booking' | 'Developer Project Listing' | 'Investor Inquiry' | 'Legal Title Inquiry'
    townshipName: townships[0]?.name || 'Prestige Sanctuary Greens',
    budget: '₹50 Lakh - ₹1 Cr',
    preferredDate: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const conciergeHeading = siteSettings.conciergeHeading || 'PlotFlow Concierge & Advisory';
  const conciergeSubheading = siteSettings.conciergeSubheading || 'Schedule a Verified Site Visit or Speak with an Advisor';
  const conciergeDesc = siteSettings.conciergeDescription || 'Whether you are booking a complimentary chauffeur-driven site visit, listing a plotted development, or requesting title diligence records, our team is at your service.';
  const conciergePhone = siteSettings.conciergePhone || '+91 80 4712 9900';
  const conciergeWhatsapp = siteSettings.conciergeWhatsapp || '+91 98450 88990';
  const tollFreeNumber = siteSettings.tollFreeNumber || '1800 425 7890';
  const conciergeEmail = siteSettings.conciergeEmail || 'concierge@plotflow.in';
  const developerEmail = siteSettings.developerEmail || siteSettings.partnersEmail || 'developers@plotflow.in';
  const legalEmail = siteSettings.legalEmail || 'legal@plotflow.in';
  const supportEmail = siteSettings.supportEmail || 'support@plotflow.in';
  const officeAddress = siteSettings.officeAddress || 'PlotFlow Technologies Pvt Ltd, Tower 3, Embassy TechVillage, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103';
  const officeLandmark = siteSettings.officeLandmark || 'Opposite Trinity Metro Station, Central Business District';
  const supportHours = siteSettings.supportHours || '9:00 AM – 8:00 PM IST (Mon-Sun)';
  const conciergeSla = siteSettings.conciergeSla || '< 15 minutes callback guarantee during business hours';
  const chauffeurPolicy = siteSettings.conciergeChauffeurPolicy || siteSettings.chauffeurPolicy || 'Complimentary doorstep chauffeur pick-up & drop within a 45-km radius across major metropolitan hubs.';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.buyerName.trim() || !formData.phone.trim()) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      addLead({
        buyerName: formData.buyerName,
        email: formData.email,
        phone: formData.phone,
        townshipName: formData.townshipName,
        interestedPlot: `General Inquiry (${formData.inquiryType})`,
        budget: formData.budget,
        visitDate: formData.preferredDate || 'To be scheduled with Concierge',
        source: `Contact Page (${formData.inquiryType})`,
        notes: formData.notes
      });
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Car className="w-4 h-4" />
            <span>{conciergeHeading}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {conciergeSubheading}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {conciergeDesc}
          </p>

          {/* Concierge Perks Strip */}
          <div className="pt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{conciergeSla}</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-xl font-medium">
              <Car className="w-3.5 h-3.5" />
              <span>Chauffeur Service Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Direct Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Contact Form */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Inquiry Received Successfully</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you, <strong>{formData.buyerName}</strong>. Our plotted land concierge team will reach out to you shortly on <strong>{formData.phone}</strong>.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                >
                  Submit Another Inquiry
                </button>
                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition flex items-center space-x-1.5"
                >
                  <span>Explore Townships</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-bold text-white">Direct Advisory & Site Visit Booking</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98450 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. vikram@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Inquiry Type</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="Site Visit Booking">Complimentary Chauffeur Site Visit</option>
                    <option value="Investor Inquiry">Investor / Bulk Land Portfolio</option>
                    <option value="Developer Project Listing">Developer / Plotted Layout Listing</option>
                    <option value="Legal Title Inquiry">Legal Audit & 42-Point Title Search</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Interested Township</label>
                  <select
                    value={formData.townshipName}
                    onChange={(e) => setFormData({ ...formData, townshipName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    {townships.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.city || 'Bengaluru'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Preferred Visit Date / Time</label>
                  <input
                    type="text"
                    placeholder="e.g. This Saturday 11:00 AM"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Additional Notes or Inquiries</label>
                <textarea
                  rows={3}
                  placeholder="Specify plot size preferences (e.g. 1200 or 1500 sqft), facing, or loan assistance requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
                <Car className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Chauffeur Pickup Policy:</strong> {chauffeurPolicy}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Concierge Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Direct Information Cards */}
        <div className="space-y-4">
          {/* Helpline Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct Concierge Helplines</span>
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Advisory Helpline:</span>
                <span className="text-base font-bold text-emerald-400 block">{conciergePhone}</span>
              </div>
              {conciergeWhatsapp && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">WhatsApp Desk:</span>
                  <span className="text-xs font-bold text-emerald-300 block">{conciergeWhatsapp}</span>
                </div>
              )}
              {tollFreeNumber && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Toll-Free Number:</span>
                  <span className="text-xs font-bold text-indigo-300 block">{tollFreeNumber}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{supportHours}</span>
              </div>
            </div>
          </div>

          {/* Departmental Emails Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Departmental Inboxes</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Buyer Advisory & Visits:</span>
                <span className="text-slate-200 font-semibold">{conciergeEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Developer & Builder Onboarding:</span>
                <span className="text-slate-200 font-semibold">{developerEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Title Diligence & Legal Wing:</span>
                <span className="text-slate-200 font-semibold">{legalEmail}</span>
              </div>
              {supportEmail && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">General Support:</span>
                  <span className="text-slate-200 font-semibold">{supportEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Corporate Office Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Corporate Headquarters</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {officeAddress}
            </p>
            {officeLandmark && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
                Landmark: {officeLandmark}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
