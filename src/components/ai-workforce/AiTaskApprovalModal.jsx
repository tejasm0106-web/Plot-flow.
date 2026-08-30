import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  FileText,
  DollarSign,
  Send,
  Lock
} from 'lucide-react';
import { updateAiTaskStatus, getAiAgents } from '../../services/aiWorkforceService';

export default function AiTaskApprovalModal({ task, onClose, onTaskUpdated }) {
  const agents = getAiAgents();
  const assignedAgent = agents.find(a => a.id === task?.assignedAgentId) || agents[0];

  const [notes, setNotes] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedTitle, setModifiedTitle] = useState(task?.title || '');
  const [modifiedSummary, setModifiedSummary] = useState(task?.outputData?.summary || '');

  if (!task) return null;

  const handleApprove = () => {
    updateAiTaskStatus(task.id, 'COMPLETED', notes || 'Approved and executed by Founder');
    if (onTaskUpdated) onTaskUpdated();
    onClose();
  };

  const handleReject = () => {
    updateAiTaskStatus(task.id, 'CANCELLED', notes || 'Rejected by Founder');
    if (onTaskUpdated) onTaskUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Founder Approval Required
              </span>
              <h3 className="text-base font-black text-white mt-1">Review AI Action Draft</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* Agent info banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={assignedAgent.avatar} 
                alt={assignedAgent.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
              />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Submitted By</span>
                <h4 className="text-sm font-bold text-white">{assignedAgent.name} ({assignedAgent.role})</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Priority</span>
              <span className="font-extrabold text-amber-400 uppercase">{task.priority}</span>
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Task Objective</h4>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              {isModifying ? (
                <input 
                  type="text" 
                  value={modifiedTitle} 
                  onChange={(e) => setModifiedTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                />
              ) : (
                <p className="text-sm font-bold text-white">{task.title}</p>
              )}
              <p className="mt-2 text-slate-400 leading-relaxed">{task.description}</p>
            </div>
          </div>

          {/* AI Proposed Output & Deliverables */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Proposed Action / Deliverables</span>
              <button 
                onClick={() => setIsModifying(!isModifying)}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 lowercase text-[11px]"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isModifying ? 'Done Editing' : 'Edit Draft'}</span>
              </button>
            </h4>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              {isModifying ? (
                <textarea
                  rows={3}
                  value={modifiedSummary}
                  onChange={(e) => setModifiedSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200"
                />
              ) : (
                <p className="font-medium text-slate-200 leading-relaxed">
                  {task.outputData?.summary || 'Deliverable synthesized by AI Agent.'}
                </p>
              )}

              {task.outputData?.deliverables && task.outputData.deliverables.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">Specific Actions:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {task.outputData.deliverables.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Founder Execution Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Founder Execution Instructions / Feedback (Optional):</label>
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Approved. Allocate budget via ICICI account and monitor CPL daily."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Actions approved here will immediately trigger the next stage in the AI execution pipeline.</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            onClick={handleReject}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold transition flex items-center space-x-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject / Cancel</span>
          </button>

          <button
            onClick={handleApprove}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950/50 flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Execute Action</span>
          </button>
        </div>

      </div>
    </div>
  );
}
