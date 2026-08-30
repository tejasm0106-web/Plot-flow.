import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Activity, 
  Award, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Sliders, 
  Layers, 
  Lock, 
  Eye, 
  Zap,
  BookOpen
} from 'lucide-react';
import { updateAgent, getAiTasks } from '../../services/aiWorkforceService';

export default function AiEmployeeProfileModal({ agent, onClose, onStartChat }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'system_prompt' | 'permissions' | 'tasks'
  const allTasks = getAiTasks();
  const agentTasks = allTasks.filter(t => t.assignedAgentId === agent?.id);

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Profile Hero Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl" 
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 border border-slate-950 shadow">
                {agent.status}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white">{agent.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {agent.department}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{agent.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                if (onStartChat) onStartChat(agent);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg flex items-center space-x-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 space-x-4 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Mission' },
            { id: 'system_prompt', label: 'System Instructions & Persona' },
            { id: 'permissions', label: 'Permissions & Tool Access' },
            { id: 'tasks', label: `Assigned Tasks (${agentTasks.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 border-b-2 transition flex items-center space-x-1.5 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 bg-slate-900/60">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Mission Statement */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">Department Mission</span>
                <p className="text-sm font-bold text-white leading-relaxed">{agent.mission}</p>
              </div>

              {/* KPI Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tasks Done</span>
                  <span className="text-lg font-black text-emerald-400 mt-0.5 block">{agent.metrics.tasksCompleted}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Queue</span>
                  <span className="text-lg font-black text-amber-400 mt-0.5 block">{agent.metrics.pendingTasks}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Performance</span>
                  <span className="text-lg font-black text-indigo-400 mt-0.5 block">{agent.metrics.performanceScore}%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Status</span>
                  <span className="text-xs font-bold text-emerald-300 mt-1 block uppercase">{agent.status}</span>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Core Responsibilities</h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  {agent.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Specialized Skills & Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SYSTEM INSTRUCTIONS */}
          {activeTab === 'system_prompt' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">Agent Persona & Communication Style</span>
                <p className="text-slate-300 leading-relaxed font-medium">{agent.personality}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">System Instruction Prompt (Zero-Shot Context)</h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {agent.systemPrompt}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Data Access & Capabilities</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                    <span>Read PlotFlow Database (Plots, Leads, Docs)</span>
                    <span className="text-emerald-400 font-bold">GRANTED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                    <span>Synthesize Reports & Projections</span>
                    <span className="text-emerald-400 font-bold">GRANTED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                    <span>Autonomous Live Execution (Without Founder Sign-Off)</span>
                    <span className="text-rose-400 font-bold">RESTRICTED</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-amber-300">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Actions Requiring Explicit Founder Approval:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {agent.permissions.requiresApprovalFor.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {agentTasks.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No tasks currently assigned.</div>
              ) : (
                agentTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-xs">{task.title}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                        task.status === 'WAITING FOR APPROVAL' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{task.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
