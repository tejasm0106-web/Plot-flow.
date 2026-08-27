import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Compass, 
  Layers, 
  ArrowRight, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Car, 
  Award,
  Users,
  Sun,
  FileText,
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function LandingView({ 
  onExplore, 
  onLaunch3D, 
  onVerify, 
  onDeveloperPortal, 
  onAbout,
  onContact,
  townships = [],
  onSelectTownship,
  siteSettings = {}
}) {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const heroHeadline = siteSettings.heroTitle || 'Verified Land. Visualized Before You Buy.';
  const heroSub = siteSettings.heroSubtitle || 'Explore RERA-sanctioned plotted townships with transparent title documentation, interactive 3D solar orientation twins, and 100% verified pricing.';
  const ctaPrimary = siteSettings.ctaPrimaryText || 'Explore Verified Townships';
  const ctaSecondary = siteSettings.ctaSecondaryText || 'Launch 3D Sun-Path Twin';

  const faqs = [
    {
      q: 'How does PlotFlow verify land titles and eliminate litigation risks?',
      a: 'Every plotted development undergoes our 5-Layer Due Diligence process. We cross-reference 30-year sub-registrar deed archives via Kaveri-2 (Form 15 Nil Encumbrance), verify DC conversion sanctions, authenticate RERA approvals, and compile an independent 42-point title search opinion.'
    },
    {
      q: 'What is the 3D Digital Twin and Sun-Path simulator?',
      a: 'Our physics-based visualizer models the exact solar trajectory and shadow angles across morning, afternoon, and evening. You can inspect plot dimensions, elevation contours, road frontage, and Vastu directional alignments before visiting the site.'
    },
    {
      q: 'Can I book a physical site visit with complimentary transportation?',
      a: 'Yes. PlotFlow provides a complimentary chauffeur-driven concierge service for verified buyers. You can schedule a site visit directly through the portal, and our property advisors will accompany you with certified layout blueprints.'
    },
    {
      q: 'How does the refundable token advance and escrow work?',
      a: 'When you select an available plot, a nominal token deposit (e.g. ₹25,000) reserves the plot. The amount remains protected under standard escrow terms until agreement signing or is 100% refunded if you choose not to proceed.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide animate-fadeIn">
            <ShieldCheck className="w-4 h-4" />
            <span>{siteSettings.heroBadge || "India's 1st 3D Digital Twin & Verified Plotted Land Marketplace"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroHeadline}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {heroSub}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>{ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLaunch3D(townships[0])}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{ctaSecondary}</span>
            </button>

            <button
              onClick={onVerify}
              className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>5-Layer Legal Vault</span>
            </button>
          </div>

          {/* Trust Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-white block">100%</span>
              <span className="text-xs text-slate-400 font-medium">K-RERA Sanctioned</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">30 Years</span>
              <span className="text-xs text-slate-400 font-medium">Kaveri-2 EC Form 15 Audit</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-indigo-400 block">Physics 3D</span>
              <span className="text-xs text-slate-400 font-medium">Real Solar Sun-Path Simulation</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <span className="text-2xl sm:text-3xl font-black text-teal-400 block">42 Points</span>
              <span className="text-xs text-slate-400 font-medium">Title Due Diligence Checklist</span>
            </div>
          </div>
        </div>
      </section>

      {/* How PlotFlow Works - 5 Step Investor & Buyer Framework */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step-by-Step Experience</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How PlotFlow Works</h2>
          <p className="text-xs text-slate-400">
            From initial masterplan exploration to registration-ready legal dossiers in five transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Discover',
              desc: 'Filter curated townships by location, approval authority (BDA/BMRDA/BIAAPA), and price per sq.ft.'
            },
            {
              step: '02',
              title: 'Verify',
              desc: 'Inspect 30-year sub-registrar deed archives, RERA sanction orders, and DC conversions in the Legal Vault.'
            },
            {
              step: '03',
              title: 'Visualize 3D',
              desc: 'Interact with our 3D Digital Twin to evaluate real sun-path shadow angles, dimensions, and road frontage.'
            },
            {
              step: '04',
              title: 'Compare',
              desc: 'Bookmark and compare multiple plots side-by-side on price, Vastu orientation, and infrastructure benchmarks.'
            },
            {
              step: '05',
              title: 'Enquire & Visit',
              desc: 'Book a complimentary chauffeur site visit or lock your reservation with protected escrow token advance.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl relative flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 block font-mono">{item.step}</span>
                <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="w-6 h-1 bg-emerald-500/40 rounded-full mt-4" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Plotted Townships */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Verified Marketplace</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Featured Plotted Townships</h2>
          </div>
          <button
            onClick={onExplore}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View All Townships</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {townships.slice(0, 3).map((ts) => (
            <div
              key={ts.id}
              className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col shadow-xl group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ts.image}
                  alt={ts.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{ts.approvalAuthority || 'RERA Sanctioned'}</span>
                </span>
                <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-800">
                  ₹{ts.pricePerSqFt}/sq.ft
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold">{ts.developer}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-emerald-400 transition">{ts.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{ts.location}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Total Area</span>
                    <span className="font-bold text-white">{ts.totalAcres}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Available Plots</span>
                    <span className="font-bold text-emerald-400">{ts.availablePlots} / {ts.totalPlots}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectTownship(ts)}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onLaunch3D(ts)}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>3D Twin</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Sun-Path Teaser */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              <Sun className="w-4 h-4" />
              <span>Physics-Based Solar Trajectory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Simulate Real Solar Angles & Shadows Before You Build
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don't guess how sunlight hits your future courtyard or balcony. Our 3D Digital Twin simulates exact shadow paths from 6:00 AM sunrise to 7:00 PM sunset, with directional Vastu alignment scores.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => onLaunch3D(townships[0])}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Launch Interactive 3D Twin</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="text-slate-400 font-semibold">Simulated Sun Altitude</span>
              <span className="text-amber-400 font-mono font-bold">72° Zenith Noon</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="text-slate-400 font-semibold">Vastu Energy Orientation</span>
              <span className="text-emerald-400 font-bold">Purva Surya (East Solar Frontage)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Road Width & Elevation</span>
              <span className="text-slate-200 font-bold">40-ft Boulevard (+1.2m Crest)</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Answers & Clarity</span>
          <h2 className="text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
            >
              <button
                onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between space-x-4 text-xs sm:text-sm font-bold text-white hover:text-emerald-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaqIndex === idx ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {activeFaqIndex === idx && (
                <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Schedule Concierge CTA */}
      <section className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-indigo-950/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Complimentary Buyer Concierge</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Experience Your Future Plot in Person</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Book a complimentary chauffeur-driven site visit with dedicated property advisors and authenticated layout blueprints.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onContact}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Car className="w-4 h-4" />
            <span>Schedule Chauffeur Site Visit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onAbout}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            Learn About PlotFlow
          </button>
        </div>
      </section>
    </div>
  );
}
