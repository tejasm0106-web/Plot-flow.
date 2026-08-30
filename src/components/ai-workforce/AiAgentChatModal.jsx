import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  Share2, 
  ShieldCheck, 
  Clock, 
  Lightbulb, 
  Sliders, 
  MessageSquare,
  ChevronRight,
  Volume2,
  VolumeX,
  Radio,
  Check,
  Video
} from 'lucide-react';
import { logAiActivity } from '../../services/aiWorkforceService';
import { 
  generateHumanLikeAiResponse, 
  speakTextWithVoice, 
  stopSpeaking 
} from '../../services/aiConversationalEngine';

export default function AiAgentChatModal({ 
  agent, 
  currentUser,
  onClose, 
  onDelegateToAnotherAgent,
  onLaunchMeeting 
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState(null);
  const chatBottomRef = useRef(null);

  // Initialize chat history with agent's personalized, friendly greeting
  useEffect(() => {
    if (!agent) return;

    const initialGreeting = {
      id: 'msg_init',
      sender: 'agent',
      agentName: agent.name,
      agentRole: agent.role,
      avatar: agent.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello ${currentUser?.name ? currentUser.name : 'Founder'}! 👋 

I am **${agent.name}**, your **${agent.role}**. 

I understand conversations and questions just like ChatGPT and Gemini, and I'm grounded directly in our real-time PlotFlow database. Whether you have a quick greeting, want to brainstorm strategic ideas, need sales scripts or marketing blueprints, or have general questions, I'm here and ready to help.

How are you doing today, and what shall we work on?`
    };

    setMessages([initialGreeting]);

    return () => {
      stopSpeaking();
    };
  }, [agent, currentUser]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = {
    agent_alex: [
      'Hi Alex! How are things running today?',
      'What are our top 3 growth bottlenecks this month?',
      'How do we maximize our 2.5% platform commission take-rate?',
      'Should we expand into Hyderabad or consolidate Bangalore?'
    ],
    agent_maya: [
      'Hi Maya! How can we improve our marketing?',
      'Draft a high-converting Meta ad copy for Sarjapur villa plots',
      'Create a 7-day social media content calendar for NRI investors',
      'How can we reduce our blended CAC from ₹3,850 to sub-₹2,500?'
    ],
    agent_ryan: [
      'Hello Ryan! Can you give me an update on our buyer leads?',
      'Score and qualify our latest inbound buyer leads',
      'Draft an empathetic WhatsApp script for a hesitant buyer',
      'How do we improve our Sunday site-visit attendance rate?'
    ],
    agent_olivia: [
      'Hi Olivia! How are our listing audits looking?',
      'Audit our active plot listings for missing 11E sketches',
      'How do we reduce developer onboarding SLA to under 48 hours?',
      'Flag any inventory anomalies in Devanahalli or Whitefield'
    ],
    agent_arjun: [
      'Hi Arjun! What are the latest price trends in Bangalore?',
      'Give me a price benchmark report for STRR & North Bangalore',
      'Compare appreciation rates between Sarjapur and Devanahalli',
      'What is the infrastructure impact of the upcoming Metro Phase 3?'
    ],
    agent_fin: [
      'Hello Fin! Show me our revenue model',
      'Show me our 3-case revenue projection model for FY26',
      'What is our current Gross LTV to CAC ratio?',
      'How does a ₹25,000 token advance escrow impact our cash flow?'
    ],
    agent_sara: [
      'Hi Sara! How are our buyer NPS scores?',
      'Draft an empathetic response to an NRI inquiry regarding Kaveri-2 title deed verification',
      'Create an FAQ guide for first-time plotted land buyers in Bangalore',
      'How can we increase customer NPS and referral bookings?'
    ],
    agent_leo: [
      'Hi Leo! How is the 3D digital twin performing?',
      'Prioritize our Q4 roadmap features using the RICE framework',
      'How can we optimize our Three.js 3D Sun-Path simulator UX?',
      'Draft a PRD for the instant WhatsApp site-visit booking widget'
    ],
    agent_data: [
      'Hi Data! What do our conversion metrics look like?',
      'Show conversion funnel telemetry: 3D viewer vs static brochure',
      'Identify our top-performing plot orientations and price bands',
      'Scan database for any stagnant inventory (>60 days unsold)'
    ],
    agent_lex: [
      'Hello Lex! Can you explain our title verification process?',
      'What is our mandatory 5-layer due diligence checklist?',
      'Explain the difference between BMRDA approval and Gram Panchayat regularization',
      'Draft a legal disclaimer for our public property verification portal'
    ]
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call Human-like conversational reasoning engine
    setTimeout(() => {
      const responseText = generateHumanLikeAiResponse(agent, text, messages);
      const agentMsgId = `agt_${Date.now()}`;

      const agentMsg = {
        id: agentMsgId,
        sender: 'agent',
        agentName: agent.name,
        agentRole: agent.role,
        avatar: agent.avatar,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText
      };

      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);

      logAiActivity({
        agentId: agent.id,
        agentName: agent.name,
        action: `Answered user inquiry in 1-on-1 consultation: "${text.slice(0, 45)}..."`,
        category: 'Direct Consultation',
        status: 'SUCCESS'
      });
    }, 800);
  };

  const handleSpeakMessage = (msgId, text) => {
    if (isSpeakingActive && activeSpeakingMsgId === msgId) {
      stopSpeaking();
      setIsSpeakingActive(false);
      setActiveSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setActiveSpeakingMsgId(msgId);
      setIsSpeakingActive(true);

      speakTextWithVoice(
        text, 
        agent,
        () => setIsSpeakingActive(true),
        () => {
          setIsSpeakingActive(false);
          setActiveSpeakingMsgId(null);
        }
      );
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md" 
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 ring-2 ring-emerald-500/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">{agent.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {agent.department}
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Human-Level AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{agent.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onLaunchMeeting && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchMeeting(`Executive Sync with ${agent.name}: Strategic Priorities`);
                }}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold transition"
                title="Launch Video Conference"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Invite to Video Call</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const isPlayingThis = isSpeakingActive && activeSpeakingMsgId === msg.id;

            return (
              <div 
                key={msg.id || idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <img 
                    src={msg.avatar || agent.avatar} 
                    alt={msg.agentName || agent.name}
                    className="w-9 h-9 rounded-2xl object-cover border border-slate-700 shadow-md flex-shrink-0"
                  />
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-2 shadow-lg ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/10">
                    <span className="font-bold">{isUser ? (currentUser?.name || 'You') : msg.agentName}</span>
                    <span className={`text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          isPlayingThis 
                            ? 'bg-indigo-600 text-white animate-pulse' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={isPlayingThis ? 'Stop Speaking' : 'Listen with Voice Speech'}
                      >
                        {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{isPlayingThis ? 'Stop Voice' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center space-x-1"
                        title="Copy text"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-9 h-9 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-indigo-400 text-xs flex items-center space-x-2 shadow-lg">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{agent.name} is thinking and formulating response...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar & Preset Quick Prompts */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-3">
          
          {/* Quick Prompts Carousel */}
          <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 flex-shrink-0">Suggested:</span>
            {(quickPrompts[agent.id] || quickPrompts.agent_alex).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition flex-shrink-0 text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask ${agent.name} anything, say hi, or assign a task...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Grounded in Real-time PlotFlow State & Live Speech Synthesis</span>
            </span>
            <span>Press Enter ↵ to send</span>
          </div>

        </div>

      </div>
    </div>
  );
}
