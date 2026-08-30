import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  User,
  Users
} from 'lucide-react';
import { getAiAgents } from '../../services/aiWorkforceService';

export default function AiReportViewerModal({ report, onClose }) {
  const [copied, setCopied] = useState(false);
  const agents = getAiAgents();

  if (!report) return null;

  const author = agents.find(a => a.id === report.authorAgentId) || agents[0];
  const contributorAgents = (report.contributors || [])
    .map(cId => agents.find(a => a.id === cId))
    .filter(Boolean);

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:h-auto print:border-none">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {report.category || 'Executive Report'}
              </span>
              <h3 className="text-base font-black text-white mt-1">PlotFlow Executive Strategy Report</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              title="Download JSON Report"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Report"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-slate-300 bg-slate-900/60 print:bg-white print:text-black">
          
          {/* Title & Metadata Banner */}
          <div className="space-y-3 pb-6 border-b border-slate-800 print:border-slate-300">
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-black leading-tight">
              {report.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 print:text-slate-600">
              <div className="flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Author: <strong className="text-white print:text-black">{author.name} ({author.role})</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(report.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {contributorAgents.length > 0 && (
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contributors: {contributorAgents.map(c => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-800">
              1. Executive Summary
            </h2>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300 text-slate-200 print:text-slate-800 font-medium leading-relaxed">
              {report.executiveSummary}
            </div>
          </div>

          {/* 2. Key Findings */}
          {report.keyFindings && report.keyFindings.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-800">
                2. Key Findings & Empirical Data
              </h2>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                <ul className="space-y-2">
                  {report.keyFindings.map((kf, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{kf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. Data Used */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-800">
              3. Data Sources & Methodology
            </h2>
            <p className="text-slate-400 print:text-slate-600 italic">
              {report.dataUsed || 'PlotFlow live database records + sub-registrar Kaveri-2 registry benchmarks.'}
            </p>
          </div>

          {/* 4. Problems & Bottlenecks Identified */}
          {report.problemsIdentified && report.problemsIdentified.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-amber-700">
                4. Operational & Market Bottlenecks Identified
              </h2>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 print:bg-amber-50 print:border-amber-300 space-y-1.5 text-amber-200 print:text-amber-900">
                {report.problemsIdentified.map((prob, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Strategic Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                5. Strategic Recommendations & Workstreams
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 print:bg-emerald-50 print:border-emerald-300 space-y-2 text-emerald-200 print:text-emerald-900">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Impact & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-1.5">
              <h3 className="font-bold text-white print:text-black">Expected Impact</h3>
              <p className="text-slate-400 print:text-slate-700">{report.expectedImpact || 'Measurable growth in conversion velocity and token reservations.'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-1.5">
              <h3 className="font-bold text-white print:text-black">Risks & Mitigation</h3>
              <p className="text-slate-400 print:text-slate-700">{report.risks || 'Developer inventory bottleneck managed through strict onboarding SLAs.'}</p>
            </div>
          </div>

          {/* 7. Founder Decision Required */}
          {report.founderDecisionRequired && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/40 print:bg-indigo-50 print:border-indigo-300 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 print:text-indigo-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Founder / CEO Action Required</span>
              </h3>
              <p className="text-sm font-bold text-white print:text-black">
                {report.founderDecisionRequired}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 print:hidden">
          <span>Generated by PlotFlow AI Workforce Multi-Agent Synthesis Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}
