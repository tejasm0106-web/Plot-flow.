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
  TrendingUp
} from 'lucide-react';
import { conductAiTeamMeeting, getAiAgents } from '../../services/aiWorkforceService';

export default function AiMeetingRoom({ onOpenTaskModal, onOpenReportModal }) {
  const defaultTopic = 'Should PlotFlow Expand Outside Bangalore into Hyderabad & Mysore in Q1 2027?';
  const [topicInput, setTopicInput] = useState(defaultTopic);
  const [activeMeeting, setActiveMeeting] = useState(() => conductAiTeamMeeting(defaultTopic));
  const [isRunning, setIsRunning] = useState(false);

  const predefinedAgendas = [
    'How do we double our monthly token bookings without increasing ad budget?',
    'Should PlotFlow Expand Outside Bangalore into Hyderabad & Mysore in Q1 2027?',
    'Should we launch an automated WhatsApp Concierge bot for weekend site visits?',
    'How do we optimize platform take-rates: 2.5% vs 3% developer success fee?'
  ];

  const handleStartMeeting = (selectedTopic) => {
    const t = selectedTopic || topicInput;
    if (!t.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const newMeeting = conductAiTeamMeeting(t);
      setActiveMeeting(newMeeting);
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Simulated Boardroom
                </span>
                <span className="text-xs text-slate-400">7 Department Heads Present</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                AI Executive Team Meetings
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-400 max-w-sm">
            Propose any strategic question or dilemma. Alex moderates the debate, Maya, Ryan, Arjun, Fin, Olivia & Lex debate trade-offs, and Alex delivers unified consensus for your approval.
          </div>
        </div>

        {/* Meeting Topic Input Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter a strategic dilemma or topic for the AI executive team..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={() => handleStartMeeting(topicInput)}
              disabled={isRunning || !topicInput.trim()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg flex items-center space-x-2 flex-shrink-0"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Convening Team...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Convene Meeting</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Agenda Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pb-1 no-scrollbar">
            <span className="text-slate-500 font-bold flex-shrink-0">Pre-set Agendas:</span>
            {predefinedAgendas.map((agenda, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopicInput(agenda);
                  handleStartMeeting(agenda);
                }}
                className="px-3 py-1 rounded-full bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition flex-shrink-0"
              >
                {agenda}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Boardroom Meeting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Debate Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Executive Meeting Debate Transcript</span>
            </h3>
            <span className="text-xs text-slate-400">Moderator: Alex (Chief Strategy Officer)</span>
          </div>

          <div className="space-y-3">
            {activeMeeting.transcript.map((turn, idx) => {
              const isAlex = turn.speaker.includes('Alex');
              const isFin = turn.speaker.includes('Fin');
              const isLex = turn.speaker.includes('Lex');
              const isMaya = turn.speaker.includes('Maya');
              const isRyan = turn.speaker.includes('Ryan');

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
                    <span className={`font-black text-xs ${
                      isAlex ? 'text-indigo-400' :
                      isMaya ? 'text-rose-400' :
                      isRyan ? 'text-emerald-400' :
                      isFin ? 'text-teal-400' :
                      isLex ? 'text-emerald-500' : 'text-cyan-400'
                    }`}>
                      {turn.speaker}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Department Perspective</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {turn.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Synthesis & Founder Decision Card */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 px-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Alex's Executive Synthesis</span>
          </h3>

          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl text-xs">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">Team Consensus</span>
              <p className="text-slate-300 leading-relaxed font-medium">
                {activeMeeting.synthesis.consensus}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">Key Debate / Disagreements</span>
              <p className="text-slate-400 leading-relaxed">
                {activeMeeting.synthesis.disagreements}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block">Identified Risks</span>
              <p className="text-slate-400 leading-relaxed">
                {activeMeeting.synthesis.risks}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/40 space-y-2 pt-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Founder Decision</span>
              </span>
              <p className="text-white font-bold leading-relaxed">
                {activeMeeting.synthesis.founderDecisionRequired}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('Founder Decision Recorded into PlotFlow Executive Action Trail!')}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Authorize Action</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
