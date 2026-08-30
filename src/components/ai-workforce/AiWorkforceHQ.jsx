import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Settings, 
  TrendingUp, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Activity, 
  MessageSquare, 
  Cpu, 
  Lock, 
  Eye, 
  Trash2, 
  Edit3,
  BarChart3,
  Lightbulb,
  DollarSign,
  Compass,
  Check,
  ShieldAlert,
  Calendar
} from 'lucide-react';

import { 
  getAiAgents, 
  getAiTasks, 
  getAiReports, 
  getCompanyMemory, 
  getAiAutomations, 
  getAiActivityLogs, 
  getAiModelSettings,
  generateTodayBriefing, 
  executeFounderCommand,
  updateAiTaskStatus,
  createAiTask,
  addCompanyMemory,
  deleteCompanyMemory,
  toggleAiAutomation,
  saveAiModelSettings,
  saveAiAgents
} from '../../services/aiWorkforceService';

import { 
  getStoredTownships, 
  getStoredLeads, 
  getStoredDocuments 
} from '../../services/storeService';
import { getStoredUsers } from '../../services/userService';

import AiAgentChatModal from './AiAgentChatModal';
import AiTaskApprovalModal from './AiTaskApprovalModal';
import AiReportViewerModal from './AiReportViewerModal';
import AiEmployeeProfileModal from './AiEmployeeProfileModal';
import AiMeetingRoom from './AiMeetingRoom';

export default function AiWorkforceHQ({ currentUser, onNavigateToAdminTab }) {
  // Navigation Sub-Tabs: 'command_center' | 'employees' | 'collaboration' | 'meetings' | 'tasks' | 'reports' | 'memory' | 'automations'
  const [subTab, setSubTab] = useState('command_center');

  // Core Data States
  const [agents, setAgents] = useState(() => getAiAgents());
  const [tasks, setTasks] = useState(() => getAiTasks());
  const [reports, setReports] = useState(() => getAiReports());
  const [memories, setMemories] = useState(() => getCompanyMemory());
  const [automations, setAutomations] = useState(() => getAiAutomations());
  const [activityLogs, setActivityLogs] = useState(() => getAiActivityLogs());
  const [modelSettings, setModelSettings] = useState(() => getAiModelSettings());
  const [todayBriefings, setTodayBriefings] = useState(() => generateTodayBriefing());

  // Command Bar State
  const [commandInput, setCommandInput] = useState('');
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [latestCollabResult, setLatestCollabResult] = useState(null);

  // Active Modals
  const [selectedAgentForChat, setSelectedAgentForChat] = useState(null);
  const [selectedAgentForProfile, setSelectedAgentForProfile] = useState(null);
  const [selectedTaskForApproval, setSelectedTaskForApproval] = useState(null);
  const [selectedReportForView, setSelectedReportForView] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // Task Filter
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL'); // 'ALL' | 'WAITING FOR APPROVAL' | 'IN PROGRESS' | 'COMPLETED'
  const [taskAgentFilter, setTaskAgentFilter] = useState('ALL');

  // Employee Department Filter
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // New Task Form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    assignedAgentId: 'agent_alex',
    priority: 'HIGH',
    description: '',
    deadlineDays: '3'
  });

  // New Memory Form
  const [newMemoryForm, setNewMemoryForm] = useState({
    category: 'Business Model',
    title: '',
    content: ''
  });

  // Refresh lists on updates
  const refreshAll = () => {
    setAgents(getAiAgents());
    setTasks(getAiTasks());
    setReports(getAiReports());
    setMemories(getCompanyMemory());
    setAutomations(getAiAutomations());
    setActivityLogs(getAiActivityLogs());
    setTodayBriefings(generateTodayBriefing());
  };

  useEffect(() => {
    const handleAgentsUpdated = () => setAgents(getAiAgents());
    const handleTasksUpdated = () => setTasks(getAiTasks());
    const handleReportsUpdated = () => setReports(getAiReports());
    const handleLogsUpdated = () => setActivityLogs(getAiActivityLogs());

    window.addEventListener('plotflow_ai_agents_updated', handleAgentsUpdated);
    window.addEventListener('plotflow_ai_tasks_updated', handleTasksUpdated);
    window.addEventListener('plotflow_ai_reports_updated', handleReportsUpdated);
    window.addEventListener('plotflow_ai_logs_updated', handleLogsUpdated);

    return () => {
      window.removeEventListener('plotflow_ai_agents_updated', handleAgentsUpdated);
      window.removeEventListener('plotflow_ai_tasks_updated', handleTasksUpdated);
      window.removeEventListener('plotflow_ai_reports_updated', handleReportsUpdated);
      window.removeEventListener('plotflow_ai_logs_updated', handleLogsUpdated);
    };
  }, []);

  // Compute Company Health Metrics from Real PlotFlow Data
  const townships = getStoredTownships();
  const leads = getStoredLeads();
  const documents = getStoredDocuments();
  const users = getStoredUsers();

  let totalPlotsCount = 0;
  let availablePlotsCount = 0;
  let reservedPlotsCount = 0;
  let soldPlotsCount = 0;

  townships.forEach(t => {
    (t.plots || []).forEach(p => {
      totalPlotsCount++;
      if (p.status === 'Available') availablePlotsCount++;
      else if (p.status === 'Reserved') reservedPlotsCount++;
      else soldPlotsCount++;
    });
  });

  const pendingApprovalsCount = tasks.filter(t => t.status === 'WAITING FOR APPROVAL').length;
  const activeWorkingAgentsCount = agents.filter(a => a.status === 'Working' || a.status === 'Analyzing').length;

  // Handle Command Submission
  const handleExecuteCommand = (e) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    setIsExecutingCommand(true);
    setTimeout(() => {
      const result = executeFounderCommand(commandInput);
      setLatestCollabResult(result);
      setIsExecutingCommand(false);
      setCommandInput('');
      setSubTab('collaboration');
      refreshAll();
    }, 1000);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    createAiTask({
      title: newTaskForm.title,
      assignedAgentId: newTaskForm.assignedAgentId,
      priority: newTaskForm.priority,
      description: newTaskForm.description,
      deadline: new Date(Date.now() + parseInt(newTaskForm.deadlineDays || 3) * 86400000).toISOString()
    });

    setShowCreateTaskModal(false);
    setNewTaskForm({
      title: '',
      assignedAgentId: 'agent_alex',
      priority: 'HIGH',
      description: '',
      deadlineDays: '3'
    });
    refreshAll();
  };

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newMemoryForm.title.trim() || !newMemoryForm.content.trim()) return;

    addCompanyMemory({
      category: newMemoryForm.category,
      title: newMemoryForm.title,
      content: newMemoryForm.content,
      author: currentUser?.name || 'Founder / CEO'
    });

    setShowAddMemoryModal(false);
    setNewMemoryForm({ category: 'Business Model', title: '', content: '' });
    refreshAll();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = taskStatusFilter === 'ALL' || task.status === taskStatusFilter;
    const matchesAgent = taskAgentFilter === 'ALL' || task.assignedAgentId === taskAgentFilter;
    return matchesStatus && matchesAgent;
  });

  const filteredAgents = agents.filter(agent => {
    if (departmentFilter === 'ALL') return true;
    return agent.department === departmentFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. TOP HEADER & FOUNDER CONTROL BAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Workforce HQ • Multi-Agent Control</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                10 Agents Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Founder Command Center</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Your autonomous AI company workforce. 10 specialized department heads collaborating on strategy, marketing, sales qualification, listing operations, and legal audits—strictly governed by your approval.
            </p>
          </div>

          {/* Quick Stats Pill Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSubTab('tasks');
                setTaskStatusFilter('WAITING FOR APPROVAL');
              }}
              className="px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition flex items-center space-x-2.5 text-xs font-black shadow-lg"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{pendingApprovalsCount} Approvals Pending</span>
            </button>

            <button
              onClick={() => setSelectedAgentForChat(agents[0])}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-lg shadow-indigo-950/50 flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consult Alex (Co-Founder)</span>
            </button>
          </div>
        </div>

        {/* Natural Language Founder Command Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <form onSubmit={handleExecuteCommand} className="flex items-center space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <input 
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Give high-level founder command (e.g., 'Analyze Sarjapur lead conversion bottlenecks and launch a Meta campaign')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isExecutingCommand || !commandInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-black text-xs transition shadow-lg flex items-center space-x-2 flex-shrink-0"
            >
              {isExecutingCommand ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Execute Multi-Agent Goal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick command suggestions */}
          <div className="mt-2.5 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-400 no-scrollbar">
            <span className="font-bold text-slate-500 flex-shrink-0">Try commands:</span>
            {[
              'Review Q3 unit economics and LTV/CAC',
              'Audit Devanahalli plots for missing 11E sketches',
              'Qualify weekend inbound leads and draft WhatsApp cadences',
              'Analyze North Bangalore STRR price appreciation'
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setCommandInput(suggestion);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition border border-slate-800 flex-shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Company Health KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Inventory Value</span>
            <span className="text-base font-black text-white mt-0.5 block">₹{(totalPlotsCount * 54 / 100).toFixed(1)} Cr</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{totalPlotsCount} total plots</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Gross Commission</span>
            <span className="text-base font-black text-emerald-400 mt-0.5 block">2.5% Take-Rate</span>
            <span className="text-[10px] text-slate-400">₹1.35L avg / sale</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Active CRM Leads</span>
            <span className="text-base font-black text-amber-400 mt-0.5 block">{leads.length} Inquiries</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{leads.filter(l => l.status === 'HOT' || l.score > 75).length || 6} HOT tier</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Legal Verification</span>
            <span className="text-base font-black text-indigo-400 mt-0.5 block">5-Layer Vault</span>
            <span className="text-[10px] text-slate-400">{documents.length} verified deeds</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">AI Workforce</span>
            <span className="text-base font-black text-cyan-400 mt-0.5 block">10 Agents</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{activeWorkingAgentsCount} active now</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Governance</span>
            <span className="text-base font-black text-rose-400 mt-0.5 block">Zero Rogue Acts</span>
            <span className="text-[10px] text-slate-400">100% Founder control</span>
          </div>
        </div>

      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {[
          { id: 'command_center', label: 'AI HQ Dashboard', icon: TrendingUp },
          { id: 'employees', label: `AI Employees & Org Chart (${agents.length})`, icon: Users },
          { id: 'collaboration', label: 'Multi-Agent Timeline', icon: Sparkles },
          { id: 'meetings', label: 'Executive Boardroom', icon: Building2 },
          { id: 'tasks', label: `Tasks & Approvals (${pendingApprovalsCount})`, icon: CheckCircle2, badge: pendingApprovalsCount },
          { id: 'reports', label: `Executive Reports (${reports.length})`, icon: FileText },
          { id: 'memory', label: `Company Memory (${memories.length})`, icon: Lightbulb },
          { id: 'automations', label: 'Automations & Settings', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* SUBTAB 1: AI HQ DASHBOARD (COMMAND CENTER) */}
      {/* ==================================================== */}
      {subTab === 'command_center' && (
        <div className="space-y-6">
          
          {/* Today's AI Briefings (Top 5 Dynamic Insights from Real Data) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Today's Executive AI Briefings (Synthesized from Real Data)</span>
              </h3>
              <button 
                onClick={refreshAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Intelligence</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayBriefings.map((briefing) => {
                const authorAgent = agents.find(a => a.id === briefing.agentId) || agents[0];
                return (
                  <div 
                    key={briefing.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-xl flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={authorAgent.avatar} 
                            alt={authorAgent.name}
                            className="w-6 h-6 rounded-lg object-cover border border-slate-700" 
                          />
                          <span className="text-[11px] font-bold text-slate-300">{briefing.agent}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          briefing.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                          briefing.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {briefing.priority}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{briefing.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{briefing.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedAgentForChat(authorAgent)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                      >
                        <span>Consult {authorAgent.name}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (briefing.id === 'br_01') {
                            setSubTab('tasks');
                          } else if (briefing.id === 'br_03') {
                            setSubTab('tasks');
                            setTaskStatusFilter('WAITING FOR APPROVAL');
                          } else {
                            setSubTab('reports');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition"
                      >
                        {briefing.actionLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Employee Live Status Matrix */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>AI Workforce Status & Active Telemetry</span>
              </h3>
              <span className="text-xs text-slate-400">10 Autonomous Specialists</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedAgentForProfile(agent)}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer shadow-lg space-y-3 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={agent.avatar} 
                        alt={agent.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        agent.status === 'Working' ? 'bg-emerald-500' :
                        agent.status === 'Analyzing' ? 'bg-indigo-500' :
                        agent.status === 'Attention required' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-white truncate group-hover:text-indigo-400 transition">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{agent.department}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {agent.statusMessage}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{agent.metrics.tasksCompleted} completed</span>
                    <span className="font-bold text-emerald-400">{agent.metrics.performanceScore}% Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div 
              onClick={() => setSubTab('meetings')}
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 transition cursor-pointer shadow-xl space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Convene Executive Boardroom</h4>
              <p className="text-xs text-slate-400">Simulate a structured multi-agent debate on any strategic dilemma or expansion question.</p>
            </div>

            <div 
              onClick={() => {
                setSubTab('tasks');
                setShowCreateTaskModal(true);
              }}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer shadow-xl space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Assign Task to AI Employee</h4>
              <p className="text-xs text-slate-400">Delegate ad campaigns, legal checklists, lead scoring, or unit economic models.</p>
            </div>

            <div 
              onClick={() => setSubTab('reports')}
              className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition cursor-pointer shadow-xl space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Executive Strategy Reports</h4>
              <p className="text-xs text-slate-400">Read institutional-grade synthesis with RICE prioritization, risk matrices, and export tools.</p>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 2: AI EMPLOYEES & ORG CHART */}
      {/* ==================================================== */}
      {subTab === 'employees' && (
        <div className="space-y-6">
          
          {/* Org Chart Visualization */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">PlotFlow Governance Hierarchy</span>
              <h3 className="text-lg font-black text-white">Virtual Startup Organization Chart</h3>
            </div>

            {/* Level 1: Human Founder */}
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl max-w-xs w-full text-center space-y-1 ring-4 ring-emerald-500/20">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Executive Leadership</span>
                <h4 className="text-sm font-black">{currentUser?.name || 'Human Founder / CEO'}</h4>
                <p className="text-[10px] text-emerald-100 font-medium">Final Authority & Governance</p>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

            {/* Level 2: Alex (Co-Founder) */}
            <div className="flex justify-center">
              <div 
                onClick={() => setSelectedAgentForProfile(agents[0])}
                className="p-3.5 rounded-2xl bg-indigo-950 border-2 border-indigo-500/60 text-white shadow-xl max-w-xs w-full flex items-center space-x-3 cursor-pointer hover:border-indigo-400 transition"
              >
                <img src={agents[0].avatar} alt="Alex" className="w-10 h-10 rounded-xl object-cover" />
                <div className="text-left">
                  <span className="text-[9px] font-bold text-indigo-300 uppercase">Chief Strategy Officer</span>
                  <h5 className="text-xs font-black text-white">Alex (AI Co-Founder)</h5>
                  <p className="text-[10px] text-slate-400">Orchestrator & Cross-Agent Synthesis</p>
                </div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

            {/* Level 3: Department Specialists */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {agents.slice(1).map(agent => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedAgentForProfile(agent)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer text-center space-y-1.5 shadow"
                >
                  <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-lg object-cover mx-auto" />
                  <h6 className="text-xs font-bold text-white">{agent.name}</h6>
                  <p className="text-[10px] text-slate-400 truncate">{agent.department}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-500 font-bold flex-shrink-0">Department:</span>
            {['ALL', 'Executive Strategy', 'Marketing & Brand', 'Sales & CRM', 'Operations & Fulfillment', 'Market Intelligence', 'Finance & FP&A', 'Customer Experience', 'Product & UX', 'Data Intelligence', 'Legal & Risk Compliance'].map(dept => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-xl transition font-bold flex-shrink-0 ${
                  departmentFilter === dept
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Detailed Employee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map(agent => (
              <div 
                key={agent.id}
                className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img 
                        src={agent.avatar} 
                        alt={agent.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-md" 
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-black text-white">{agent.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {agent.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{agent.role}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {agent.mission}
                  </p>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Tasks</span>
                      <strong className="text-white">{agent.metrics.tasksCompleted}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Active</span>
                      <strong className="text-amber-400">{agent.metrics.pendingTasks}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Score</span>
                      <strong className="text-emerald-400">{agent.metrics.performanceScore}%</strong>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-[10px] text-slate-400 border border-slate-800 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAgentForProfile(agent)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile & Tools</span>
                  </button>

                  <button
                    onClick={() => setSelectedAgentForChat(agent)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>1-on-1 Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 3: MULTI-AGENT TIMELINE */}
      {/* ==================================================== */}
      {subTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">Coordinated Multi-Agent Execution</span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {latestCollabResult?.title || 'Active Multi-Department Strategy Timeline'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Synthesis Complete
              </span>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {(latestCollabResult?.timeline || [
                {
                  step: 1,
                  agentName: 'Alex',
                  role: 'AI Co-Founder',
                  action: 'Analyzed CEO expansion goal and framed 5 departmental workstreams.',
                  output: 'Delegation matrix: Maya (Marketing), Ryan (Sales), Data (Analytics), Arjun (Research), Fin (Unit Economics).'
                },
                {
                  step: 2,
                  agentName: 'Data',
                  role: 'AI Data Intelligence',
                  action: 'Queried 120 inventory plots across 6 townships; identified 3.4x conversion lift on 3D Sun-Path simulator.',
                  output: 'Funnel telemetry confirmed 4.2% visitor-to-lead conversion.'
                },
                {
                  step: 3,
                  agentName: 'Arjun',
                  role: 'AI Market Research',
                  action: 'Conducted micro-market price benchmark for Sarjapur (₹4,200/sq.ft) and Devanahalli (₹4,850/sq.ft).',
                  output: 'Confirmed high NRI investor demand with +18.4% YoY capital appreciation.'
                },
                {
                  step: 4,
                  agentName: 'Maya',
                  role: 'AI Marketing Head',
                  action: 'Designed 3 Meta & Google Ad video variants showcasing 3D Solar simulation and clear Kaveri-2 titles.',
                  output: 'Target CPA: ₹480/lead with ₹45,000 monthly ad allocation.'
                },
                {
                  step: 5,
                  agentName: 'Ryan',
                  role: 'AI Sales Head',
                  action: 'Drafted automated WhatsApp concierge sequence with free weekend luxury chauffeur site visits.',
                  output: 'Projected +40% increase in site-visit completion rate.'
                },
                {
                  step: 6,
                  agentName: 'Fin',
                  role: 'AI Finance Head',
                  action: 'Validated unit economics: Gross LTV to CAC stands at 5.2x with ₹1.62 Cr projected platform margin.',
                  output: 'Financial safety verified across Base and Optimistic cases.'
                }
              ]).map((t, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-4 shadow">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                    {t.step || idx + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-xs">{t.agentName} ({t.role})</h5>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{t.action}</p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono mt-1.5">
                      {t.output}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Founder Decision synthesis */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Consolidated Proposal Ready for Founder Action</span>
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">
                {latestCollabResult?.synthesis?.whatToDoNext || '1) Authorize Maya\'s ₹45,000 Sarjapur PPC campaign. 2) Deploy Ryan\'s automated WhatsApp site-visit booking cadence. 3) Enforce 24-hr document SLA for Devanahalli plots.'}
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => alert('Proposal Approved! AI Agents have been instructed to execute action plan.')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Authorize Live Execution</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 4: SIMULATED BOARDROOM MEETINGS */}
      {/* ==================================================== */}
      {subTab === 'meetings' && (
        <AiMeetingRoom 
          onOpenTaskModal={() => {
            setSubTab('tasks');
            setShowCreateTaskModal(true);
          }}
          onOpenReportModal={(rep) => setSelectedReportForView(rep)}
        />
      )}

      {/* ==================================================== */}
      {/* SUBTAB 5: TASKS & APPROVALS */}
      {/* ==================================================== */}
      {subTab === 'tasks' && (
        <div className="space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {['ALL', 'WAITING FOR APPROVAL', 'IN PROGRESS', 'COMPLETED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setTaskStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      taskStatusFilter === status
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </button>
          </div>

          {/* Tasks Grid */}
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const assignedAgent = agents.find(a => a.id === task.assignedAgentId) || agents[0];
              const isWaitingApproval = task.status === 'WAITING FOR APPROVAL';

              return (
                <div 
                  key={task.id}
                  className={`p-5 rounded-3xl border transition shadow-xl space-y-4 ${
                    isWaitingApproval
                      ? 'bg-slate-950 border-amber-500/50 shadow-amber-950/20'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={assignedAgent.avatar} 
                        alt={assignedAgent.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{task.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            task.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                            task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Assigned to: <strong className="text-slate-300">{assignedAgent.name} ({assignedAgent.role})</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        task.status === 'WAITING FOR APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Output Deliverables if available */}
                  {task.outputData && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-400 block">Agent Deliverable:</span>
                      <p className="text-slate-200 font-medium">{task.outputData.summary}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>

                    {isWaitingApproval ? (
                      <button
                        onClick={() => setSelectedTaskForApproval(task)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center space-x-1.5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Review & Approve Draft</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedAgentForChat(assignedAgent)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                      >
                        <span>Discuss with {assignedAgent.name}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 6: EXECUTIVE REPORTS HUB */}
      {/* ==================================================== */}
      {subTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Executive Strategy & Micro-Market Reports</h3>
              <p className="text-xs text-slate-400">Institutional-grade research compiled from live PlotFlow data & market benchmarks.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(report => {
              const author = agents.find(a => a.id === report.authorAgentId) || agents[0];
              return (
                <div 
                  key={report.id}
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {report.category}
                      </span>
                      <span className="text-[11px] text-slate-500">{new Date(report.createdDate).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-base font-black text-white leading-snug">{report.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {report.executiveSummary}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <span className="font-bold text-slate-300 block">Key Impact:</span>
                      <span>{report.expectedImpact}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <img src={author.avatar} alt={author.name} className="w-5 h-5 rounded-md object-cover" />
                      <span>{author.name}</span>
                    </div>

                    <button
                      onClick={() => setSelectedReportForView(report)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 7: COMPANY & AGENT MEMORY */}
      {/* ==================================================== */}
      {subTab === 'memory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Company Memory & Institutional Knowledge</h3>
              <p className="text-xs text-slate-400">Rules, business models, brand voice, and guidelines shared across all 10 AI agents.</p>
            </div>

            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map(memory => (
              <div 
                key={memory.id}
                className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {memory.category}
                    </span>
                    <button
                      onClick={() => {
                        deleteCompanyMemory(memory.id);
                        refreshAll();
                      }}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-white">{memory.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{memory.content}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Author: {memory.author}</span>
                  <span>Updated: {new Date(memory.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUBTAB 8: AUTOMATIONS & SETTINGS */}
      {/* ==================================================== */}
      {subTab === 'automations' && (
        <div className="space-y-6">
          
          {/* Scheduled Automations */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Proactive Scheduled Automations & Workflows</span>
            </h3>

            <div className="space-y-3">
              {automations.map(auto => {
                const agent = agents.find(a => a.id === auto.agentId) || agents[0];
                return (
                  <div key={auto.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white">{auto.name}</h4>
                        <span className="text-[10px] text-slate-400">({agent.name})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{auto.action}</p>
                      <span className="text-[10px] text-indigo-400 font-mono">Trigger: {auto.trigger}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] font-bold uppercase ${auto.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {auto.status}
                      </span>
                      <button
                        onClick={() => {
                          toggleAiAutomation(auto.id);
                          refreshAll();
                        }}
                        className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                          auto.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Configuration */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Engine Architecture & Model Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400">Active Model Provider:</span>
                <p className="text-sm font-bold text-white">{modelSettings.provider}</p>
                <p className="text-[10px] text-slate-500">Supports modular model switching (Gemini 3.7 / Claude / GPT / Local).</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400">Multi-Agent Orchestrator:</span>
                <p className="text-sm font-bold text-emerald-400">ENABLED (Alex Directed)</p>
                <p className="text-[10px] text-slate-500">Allows agents to cross-delegate and synthesize consensus.</p>
              </div>
            </div>
          </div>

          {/* Immutable AI Activity Logs */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Immutable AI Activity & Decision Log</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {activityLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-indigo-400">{log.agentName}</span>
                    <span className="text-slate-300">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1-on-1 Chat Modal */}
      {selectedAgentForChat && (
        <AiAgentChatModal
          agent={selectedAgentForChat}
          onClose={() => setSelectedAgentForChat(null)}
        />
      )}

      {/* Employee Profile Modal */}
      {selectedAgentForProfile && (
        <AiEmployeeProfileModal
          agent={selectedAgentForProfile}
          onClose={() => setSelectedAgentForProfile(null)}
          onStartChat={(ag) => setSelectedAgentForChat(ag)}
        />
      )}

      {/* Task Approval Modal */}
      {selectedTaskForApproval && (
        <AiTaskApprovalModal
          task={selectedTaskForApproval}
          onClose={() => setSelectedTaskForApproval(null)}
          onTaskUpdated={refreshAll}
        />
      )}

      {/* Report Viewer Modal */}
      {selectedReportForView && (
        <AiReportViewerModal
          report={selectedReportForView}
          onClose={() => setSelectedReportForView(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Delegate New Task to AI Employee</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Task Title:</label>
                <input 
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Audit Kaveri-2 ECs for Whitefield inventory"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Assign Agent:</label>
                  <select
                    value={newTaskForm.assignedAgentId}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assignedAgentId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Priority:</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Task Context & Instructions:</label>
                <textarea
                  rows={3}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide any specific data points, objectives, or instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Delegate Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Add Company Memory Entry</h3>
            <form onSubmit={handleAddMemory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Category:</label>
                <select
                  value={newMemoryForm.category}
                  onChange={(e) => setNewMemoryForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Business Model">Business Model</option>
                  <option value="Core Moat">Core Moat</option>
                  <option value="Brand Voice">Brand Voice</option>
                  <option value="Target Demographics">Target Demographics</option>
                  <option value="Strategic Rule">Strategic Rule</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Title / Key Principle:</label>
                <input 
                  type="text"
                  required
                  value={newMemoryForm.title}
                  onChange={(e) => setNewMemoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. 5-Layer Due Diligence Standard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Guideline & Instructions:</label>
                <textarea 
                  rows={3}
                  required
                  value={newMemoryForm.content}
                  onChange={(e) => setNewMemoryForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="State the permanent principle or instruction all agents must abide by..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save to Company Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
