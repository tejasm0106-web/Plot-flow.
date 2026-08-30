import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Play, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Video,
  Mic,
  Calendar,
  UserPlus,
  Compass,
  FileText,
  Clock,
  Radio,
  Plus
} from 'lucide-react';
import { conductAiTeamMeeting, getAiAgents } from '../../services/aiWorkforceService';
import { getStoredUsers } from '../../services/userService';
import VideoConferenceRoom from './VideoConferenceRoom';

export default function AiMeetingRoom({ currentUser, onOpenTaskModal, onOpenReportModal }) {
  const defaultTopic = 'Should PlotFlow Expand Outside Bangalore into Hyderabad & Mysore in Q1 2027?';
  const [topicInput, setTopicInput] = useState(defaultTopic);
  const [activeMeeting, setActiveMeeting] = useState(() => conductAiTeamMeeting(defaultTopic));
  const [isRunning, setIsRunning] = useState(false);

  // Live Video Conference State
  const [isLiveConferenceOpen, setIsLiveConferenceOpen] = useState(false);
  const [conferenceTopic, setConferenceTopic] = useState(defaultTopic);

  // New Meeting Creation Form Modal
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    title: 'Executive Sync: Accelerating Sarjapur & Devanahalli Plot Sales',
    host: currentUser?.name || 'Tejas (Super Admin)',
    selectedAiAgents: ['agent_alex', 'agent_maya', 'agent_ryan', 'agent_fin', 'agent_lex'],
    selectedStaff: ['usr_legal_01']
  });

  const predefinedAgendas = [
    'How do we double our monthly token bookings without increasing ad budget?',
    'Should PlotFlow Expand Outside Bangalore into Hyderabad & Mysore in Q1 2027?',
    'Should we launch an automated WhatsApp Concierge bot for weekend site visits?',
    'How do we optimize platform take-rates: 2.5% vs 3% developer success fee?',
    'Statutory Audit & 30-Year Kaveri-2 Title Due Diligence Review with Legal Team'
  ];

  const allAgents = getAiAgents();
  const allUsers = getStoredUsers();

  const handleStartSimulatedMeeting = (selectedTopic) => {
    const t = selectedTopic || topicInput;
    if (!t.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const newMeeting = conductAiTeamMeeting(t);
      setActiveMeeting(newMeeting);
      setIsRunning(false);
    }, 600);
  };

  const handleLaunchLiveVideoCall = (topic) => {
    setConferenceTopic(topic || topicInput);
    setIsLiveConferenceOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO BANNER & INSTANT LIVE VIDEO CONFERENCING LAUNCHER */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Web-Based Video Boardroom</span>
              </span>
              <span className="text-xs text-slate-400">Teams & Meet Experience</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Video Conferencing & AI Collaboration
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Convene live interactive video meetings connecting <strong className="text-amber-300">All Admins</strong>, the <strong className="text-indigo-300">10 AI Workforce Heads</strong> (Alex, Maya, Ryan, Olivia, Fin, Lex, etc.), and <strong className="text-emerald-300">Added Staff Members</strong> at the same time. AI agents understand your voice and chat just like real humans and ChatGPT, debate trade-offs, and speak their responses live!
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleLaunchLiveVideoCall(topicInput)}
              className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2.5 group"
            >
              <Video className="w-5 h-5 group-hover:scale-110 transition" />
              <span>Launch Live Video Meeting (Teams)</span>
            </button>

            <button
              onClick={() => setShowCreateMeetingModal(true)}
              className="px-5 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Meeting Setup</span>
            </button>
          </div>

        </div>

        {/* Meeting Topic Input Bar */}
        <div className="space-y-3 pt-2 relative z-10">
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter a strategic agenda, dilemma, or question for the executive team..."
              className="flex-1 bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            <button
              onClick={() => handleStartSimulatedMeeting(topicInput)}
              disabled={isRunning || !topicInput.trim()}
              className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs transition border border-slate-700 flex items-center space-x-2 flex-shrink-0"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Simulate Debate</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Agenda Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pb-1 no-scrollbar">
            <span className="text-slate-500 font-bold flex-shrink-0">Suggested Agendas:</span>
            {predefinedAgendas.map((agenda, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopicInput(agenda);
                  handleStartSimulatedMeeting(agenda);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition flex-shrink-0"
              >
                {agenda}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. BOARDROOM DEBATE TRANSCRIPT & CONSENSUS SUMMARY */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Debate Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Boardroom Meeting Debate Transcript</span>
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Moderator: Alex (CSO)</span>
              <span>•</span>
              <button
                onClick={() => handleLaunchLiveVideoCall(activeMeeting.topic)}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center space-x-1"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join in Live Video</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {activeMeeting.transcript.map((turn, idx) => {
              const isAlex = turn.speaker.includes('Alex');

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition shadow-lg ${
                    isAlex 
                      ? 'bg-indigo-950/20 border-indigo-500/40' 
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isAlex ? 'bg-indigo-400' : 'bg-slate-400'}`} />
                      <h4 className="text-xs font-black text-white">{turn.speaker}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500">Boardroom Contribution</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Consensus & Founder Decision Required */}
        <div className="space-y-6">
          
          {/* Executive Consensus Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Award className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Unified Team Consensus
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
                <span className="font-bold text-indigo-300 block mb-1">Final Recommendation:</span>
                {activeMeeting.synthesis.recommendation}
              </div>

              <div>
                <span className="font-bold text-slate-400 block mb-1">Key Disagreements / Trade-offs:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {activeMeeting.synthesis.disagreements}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 block mb-1">Associated Risks:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {activeMeeting.synthesis.risks}
                </p>
              </div>
            </div>

            {/* Founder Decision Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Founder Decision Required</span>
              </div>
              <p className="text-[11px] text-amber-200 leading-relaxed">
                {activeMeeting.synthesis.founderDecisionRequired}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleLaunchLiveVideoCall(activeMeeting.topic)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Open Live Video Boardroom</span>
              </button>
            </div>
          </div>

          {/* Quick Participants Summary */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Connected Boardroom Members
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-white font-bold">Tejas (Super Admin)</span>
                <span className="text-[10px] text-amber-400 font-bold">Host</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-white font-bold">Advocate Rajeshwari Iyer</span>
                <span className="text-[10px] text-emerald-400 font-bold">Legal Staff</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-white font-bold">Alex & 9 AI Workforce Heads</span>
                <span className="text-[10px] text-indigo-400 font-bold">AI Employees</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. FULL TEAMS-STYLE VIDEO CONFERENCE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isLiveConferenceOpen && (
        <VideoConferenceRoom
          currentUser={currentUser}
          initialTopic={conferenceTopic}
          onClose={() => setIsLiveConferenceOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CUSTOM MEETING SETUP MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCreateMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Create Video Conference</h3>
                  <p className="text-xs text-slate-400">Invite Admins, AI Workforce, and Staff to a live Teams-style meeting</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateMeetingModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Meeting Topic / Agenda Title</label>
                <input 
                  type="text"
                  value={newMeetingForm.title}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                  placeholder="e.g. Q3 Sales Velocity, Kaveri-2 Audits & Marketing Budget"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Select AI Workforce Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">Select AI Workforce Heads to Attend</label>
                  <button
                    onClick={() => {
                      if (newMeetingForm.selectedAiAgents.length === allAgents.length) {
                        setNewMeetingForm({ ...newMeetingForm, selectedAiAgents: ['agent_alex'] });
                      } else {
                        setNewMeetingForm({ ...newMeetingForm, selectedAiAgents: allAgents.map(a => a.id) });
                      }
                    }}
                    className="text-[11px] text-indigo-400 font-bold hover:underline"
                  >
                    {newMeetingForm.selectedAiAgents.length === allAgents.length ? 'Deselect All' : 'Select All 10 AI Agents'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {allAgents.map((a) => {
                    const isSelected = newMeetingForm.selectedAiAgents.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewMeetingForm({
                              ...newMeetingForm,
                              selectedAiAgents: newMeetingForm.selectedAiAgents.filter(id => id !== a.id)
                            });
                          } else {
                            setNewMeetingForm({
                              ...newMeetingForm,
                              selectedAiAgents: [...newMeetingForm.selectedAiAgents, a.id]
                            });
                          }
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center space-x-2.5 transition ${
                          isSelected 
                            ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img src={a.avatar} alt={a.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div className="truncate">
                          <div className="font-bold text-[11px] truncate">{a.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{a.department}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Staff Members */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Invite Added Staff Members</label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {allUsers.filter(u => u.role !== 'SUPER_ADMIN').map((u) => {
                    const isSelected = newMeetingForm.selectedStaff.includes(u.uid || u.id);
                    return (
                      <div 
                        key={u.uid || u.id}
                        onClick={() => {
                          const id = u.uid || u.id;
                          if (isSelected) {
                            setNewMeetingForm({
                              ...newMeetingForm,
                              selectedStaff: newMeetingForm.selectedStaff.filter(x => x !== id)
                            });
                          } else {
                            setNewMeetingForm({
                              ...newMeetingForm,
                              selectedStaff: [...newMeetingForm.selectedStaff, id]
                            });
                          }
                        }}
                        className={`p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected 
                            ? 'bg-emerald-600/20 border-emerald-500 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">
                            {u.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-[11px] text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.roleTitle || u.role}</div>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                          className="rounded text-indigo-600 pointer-events-none" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Launch Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowCreateMeetingModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateMeetingModal(false);
                  handleLaunchLiveVideoCall(newMeetingForm.title);
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Start Video Conference Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
