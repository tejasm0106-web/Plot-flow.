import React, { useState, useEffect, useRef } from 'react';
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
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  PhoneOff,
  Hand,
  Volume2,
  VolumeX,
  Share2,
  FileText,
  Settings,
  Plus,
  Send,
  Download,
  Copy,
  Clock,
  Radio,
  Sliders,
  MoreVertical,
  Check,
  Maximize2,
  Minimize2,
  UserPlus,
  Compass
} from 'lucide-react';

import { 
  getAiAgents, 
  createAiTask, 
  logAiActivity 
} from '../../services/aiWorkforceService';
import { getStoredUsers } from '../../services/userService';
import { 
  speakTextWithVoice, 
  stopSpeaking, 
  generateHumanLikeAiResponse,
  generateLiveMeetingDiscussion 
} from '../../services/aiConversationalEngine';

export default function VideoConferenceRoom({ 
  currentUser, 
  onClose,
  initialTopic = 'Q3 Strategic Growth, Corridors & Platform Expansion Strategy' 
}) {
  // -------------------------------------------------------------
  // 1. MEETING STATE & CONFIGURATION
  // -------------------------------------------------------------
  const [meetingState, setMeetingState] = useState('active'); // 'setup' | 'active' | 'summary'
  const [meetingTopic, setMeetingTopic] = useState(initialTopic);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'speaker' | 'presentation'

  // User Hardware States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState(true);
  const [screenStream, setScreenStream] = useState(null);

  // Active Drawer States
  const [activeDrawer, setActiveDrawer] = useState('chat'); // 'chat' | 'participants' | 'transcript' | 'notes' | null
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState(
    '### Executive Meeting Notes\n- Reviewing Bangalore micro-markets and BMRDA compliance.\n- Expanding Sarjapur digital marketing campaign.\n- Validating Kaveri-2 sub-registrar 30-year title deeds.'
  );

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchInviteQuery, setSearchInviteQuery] = useState('');

  // Media Refs
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const transcriptBottomRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Load all available Participants
  const allAgents = getAiAgents();
  const allUsers = getStoredUsers();

  // Selected Invited Participants
  const [invitedParticipants, setInvitedParticipants] = useState(() => {
    const list = [];
    
    // 1. Current User (Host / Admin)
    list.push({
      id: currentUser?.uid || currentUser?.id || 'host_admin',
      name: currentUser?.name || 'Tejas (Host)',
      role: currentUser?.roleTitle || 'Master Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      type: 'user',
      isHost: true,
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true
    });

    // 2. Default AI Executives
    const defaultAiIds = ['agent_alex', 'agent_maya', 'agent_ryan', 'agent_arjun', 'agent_fin', 'agent_lex'];
    allAgents.forEach(a => {
      if (defaultAiIds.includes(a.id)) {
        list.push({
          id: a.id,
          name: a.name,
          role: a.role,
          avatar: a.avatar,
          department: a.department,
          type: 'ai',
          isHost: false,
          isSpeaking: false,
          isMuted: false,
          isVideoOn: true
        });
      }
    });

    // 3. Key Staff Member (Legal Auditor)
    const legalStaff = allUsers.find(u => u.role === 'LEGAL_AUDITOR') || {
      uid: 'usr_legal_01',
      name: 'Advocate Rajeshwari Iyer',
      roleTitle: 'Senior Legal & Title Due Diligence Auditor',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80'
    };

    list.push({
      id: legalStaff.uid || legalStaff.id || 'usr_legal_01',
      name: legalStaff.name,
      role: legalStaff.roleTitle || 'Legal Auditor',
      avatar: legalStaff.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
      type: 'staff',
      isHost: false,
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true
    });

    return list;
  });

  // Pre-populated Transcript & Debate Stream
  const [transcript, setTranscript] = useState(() => {
    const data = generateLiveMeetingDiscussion(initialTopic, invitedParticipants);
    return data.transcript;
  });

  const [actionItems, setActionItems] = useState(() => {
    const data = generateLiveMeetingDiscussion(initialTopic, invitedParticipants);
    return data.actionItems;
  });

  // -------------------------------------------------------------
  // 2. TIMERS & WEBCAM INITIALIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Request real user camera/mic stream
  useEffect(() => {
    let activeStream = null;

    async function initWebcam() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          activeStream = stream;
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Camera/Mic permission not granted or unavailable, using high-fidelity avatar simulation:', err);
      }
    }

    if (isVideoOn) {
      initWebcam();
    } else if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      stopSpeaking();
    };
  }, [isVideoOn]);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  // Format Duration string MM:SS
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------------------------------------------
  // 3. SCREEN SHARING
  // -------------------------------------------------------------
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      setLayoutMode('grid');
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setScreenStream(stream);
          setIsScreenSharing(true);
          setLayoutMode('presentation');

          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = stream;
          }

          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
            setLayoutMode('grid');
          };
        } else {
          // Simulation fallback
          setIsScreenSharing(true);
          setLayoutMode('presentation');
        }
      } catch (e) {
        console.warn('Screen share cancelled or failed:', e);
      }
    }
  };

  // -------------------------------------------------------------
  // 4. LIVE IN-MEETING CHAT & AI SPEECH (Natural Human-like response)
  // -------------------------------------------------------------
  const handleSendMeetingMessage = (customText) => {
    const text = customText || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      id: `m_msg_${Date.now()}`,
      senderId: currentUser?.uid || 'host_user',
      senderName: currentUser?.name || 'Tejas (Host)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: true
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentTyping(true);

    // Also push to Live Transcript
    setTranscript(prev => [
      ...prev,
      {
        id: `t_${Date.now()}`,
        speakerId: userMsg.senderId,
        speakerName: `${userMsg.senderName} (Admin / Host)`,
        avatar: userMsg.avatar,
        text: userMsg.text
      }
    ]);

    // Choose which AI agent responds (e.g. if mentioned, or Alex as CSO, or Maya/Ryan/Lex)
    const lower = text.toLowerCase();
    let respondingAgentId = 'agent_alex';

    if (lower.includes('maya') || lower.includes('marketing') || lower.includes('ad') || lower.includes('cpl')) {
      respondingAgentId = 'agent_maya';
    } else if (lower.includes('ryan') || lower.includes('sales') || lower.includes('lead') || lower.includes('whatsapp')) {
      respondingAgentId = 'agent_ryan';
    } else if (lower.includes('arjun') || lower.includes('research') || lower.includes('price') || lower.includes('bangalore') || lower.includes('market')) {
      respondingAgentId = 'agent_arjun';
    } else if (lower.includes('fin') || lower.includes('finance') || lower.includes('budget') || lower.includes('cac') || lower.includes('revenue')) {
      respondingAgentId = 'agent_fin';
    } else if (lower.includes('lex') || lower.includes('rajeshwari') || lower.includes('legal') || lower.includes('kaveri') || lower.includes('title')) {
      respondingAgentId = 'agent_lex';
    } else if (lower.includes('olivia') || lower.includes('audit') || lower.includes('operation') || lower.includes('sla')) {
      respondingAgentId = 'agent_olivia';
    }

    const respondingAgent = allAgents.find(a => a.id === respondingAgentId) || allAgents[0];

    setTimeout(() => {
      // Generate Human-like response
      const aiResponse = generateHumanLikeAiResponse(respondingAgent, text, chatMessages);

      const agentMsg = {
        id: `m_msg_ai_${Date.now()}`,
        senderId: respondingAgent.id,
        senderName: `${respondingAgent.name} (${respondingAgent.role})`,
        avatar: respondingAgent.avatar,
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true
      };

      setChatMessages(prev => [...prev, agentMsg]);
      setIsAgentTyping(false);
      setActiveSpeakerId(respondingAgent.id);

      // Add to transcript
      setTranscript(prev => [
        ...prev,
        {
          id: `t_ai_${Date.now()}`,
          speakerId: respondingAgent.id,
          speakerName: `${respondingAgent.name} (${respondingAgent.role})`,
          avatar: respondingAgent.avatar,
          text: aiResponse
        }
      ]);

      // Speak aloud with voice if enabled
      if (isVoiceAudioEnabled) {
        speakTextWithVoice(
          aiResponse, 
          respondingAgent,
          () => setActiveSpeakerId(respondingAgent.id),
          () => setActiveSpeakerId(null)
        );
      } else {
        setTimeout(() => setActiveSpeakerId(null), 4000);
      }

      logAiActivity({
        agentId: respondingAgent.id,
        agentName: respondingAgent.name,
        action: `Participated in Video Conference "${meetingTopic}": responded to Founder inquiry`,
        category: 'Live Video Conference',
        status: 'SUCCESS'
      });
    }, 1200);
  };

  // -------------------------------------------------------------
  // 5. INVITE NEW PARTICIPANTS (Staff, Admins, AI Agents)
  // -------------------------------------------------------------
  const handleAddParticipant = (p) => {
    if (invitedParticipants.some(x => x.id === p.id)) return;

    const newEntry = {
      id: p.id || p.uid,
      name: p.name,
      role: p.role || p.roleTitle || 'Staff Member',
      avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      type: p.id?.startsWith('agent_') ? 'ai' : 'staff',
      isHost: false,
      isSpeaking: false,
      isMuted: false,
      isVideoOn: true
    };

    setInvitedParticipants(prev => [...prev, newEntry]);

    // System announce
    setTranscript(prev => [
      ...prev,
      {
        id: `t_sys_${Date.now()}`,
        speakerId: 'system',
        speakerName: 'PlotFlow Meeting System',
        avatar: '',
        text: `📢 ${newEntry.name} (${newEntry.role}) joined the video conference.`
      }
    ]);

    setShowInviteModal(false);
  };

  // -------------------------------------------------------------
  // 6. EXPORT / CONVERT NOTES INTO AI WORKFORCE TASKS
  // -------------------------------------------------------------
  const handleConvertActionItemsToTasks = () => {
    actionItems.forEach(item => {
      createAiTask({
        title: item.task,
        assignedAgentId: item.assignedTo.includes('Maya') ? 'agent_maya' 
          : item.assignedTo.includes('Ryan') ? 'agent_ryan' 
          : item.assignedTo.includes('Fin') ? 'agent_fin' 
          : 'agent_alex',
        priority: 'HIGH',
        description: `Generated from Live Executive Boardroom Meeting on "${meetingTopic}".`,
        delegatedBy: `${currentUser?.name || 'Master Admin'} (Video Boardroom)`
      });
    });

    alert('✅ All 4 Action Items have been automatically assigned as active tasks to your AI Workforce!');
  };

  const handleDownloadMinutes = () => {
    const textContent = `PLOTFLOW EXECUTIVE VIDEO CONFERENCE MINUTES
Topic: ${meetingTopic}
Date: ${new Date().toLocaleDateString()}
Duration: ${formatDuration(duration)}
Host: ${currentUser?.name || 'Tejas'} (Super Admin)
Participants: ${invitedParticipants.map(p => `${p.name} [${p.role}]`).join(', ')}

==================================================
MEETING TRANSCRIPT & CONTRIBUTIONS:
==================================================
${transcript.map(t => `[${t.speakerName}]: ${t.text}\n`).join('\n')}

==================================================
ACTION ITEMS & TASKS DELEGATED:
==================================================
${actionItems.map((a, i) => `${i + 1}. ${a.task} (Assigned: ${a.assignedTo})`).join('\n')}

==================================================
NOTES:
${meetingNotes}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PlotFlow_Meeting_Minutes_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white font-sans overflow-hidden animate-fadeIn">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP BAR: Teams-style Header */}
      {/* ------------------------------------------------------------- */}
      <div className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between flex-shrink-0 z-20">
        
        {/* Left: Meeting Info */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md">
                {meetingTopic}
              </h2>
              {isRecording && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>REC</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-mono text-indigo-400 font-bold">{formatDuration(duration)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted HD Conference</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Layout & Actions */}
        <div className="flex items-center space-x-2">
          
          {/* AI Voice Toggle */}
          <button
            onClick={() => {
              setIsVoiceAudioEnabled(!isVoiceAudioEnabled);
              if (isVoiceAudioEnabled) stopSpeaking();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
              isVoiceAudioEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
            title="Toggle AI Speech Voice Synthesis (TTS)"
          >
            {isVoiceAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceAudioEnabled ? 'AI Voice On' : 'AI Voice Muted'}</span>
          </button>

          {/* Add / Invite Participant */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          {/* Layout Mode Selector */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setLayoutMode('speaker')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${layoutMode === 'speaker' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Spotlight
            </button>
            {isScreenSharing && (
              <button
                onClick={() => setLayoutMode('presentation')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${layoutMode === 'presentation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Screen
              </button>
            )}
          </div>

          {/* Leave Call */}
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 ml-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN MEETING BODY: Video Grid + Side Drawer */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: Video Conference Canvas */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto flex flex-col justify-center items-center bg-slate-950 relative">
          
          {/* Active Screen Share Tile (if screen share mode) */}
          {isScreenSharing && layoutMode === 'presentation' ? (
            <div className="w-full h-full max-h-[75vh] bg-slate-900 rounded-3xl border-2 border-indigo-500/40 overflow-hidden relative shadow-2xl flex flex-col">
              <div className="p-3 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <ScreenShare className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Live Screen Presentation (Admin Screen / 3D Digital Twin)</span>
                </div>
                <button 
                  onClick={handleToggleScreenShare}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold"
                >
                  Stop Share
                </button>
              </div>

              {screenStream ? (
                <video 
                  ref={screenVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full flex-1 object-contain bg-black"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-950">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-white">3D Sun-Path Digital Twin & Inventory Analytics</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    Presenting live plot layout coordinates, Kaveri-2 statutory title deeds, and solar shadow simulations to all board members.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Multi-Participant Video Grid */
            <div className={`w-full h-full max-w-6xl grid gap-3 sm:gap-4 p-1 auto-rows-fr ${
              invitedParticipants.length <= 2 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : invitedParticipants.length <= 4 
                  ? 'grid-cols-2' 
                  : invitedParticipants.length <= 6 
                    ? 'grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              
              {/* CURRENT USER VIDEO TILE */}
              <div className={`relative bg-slate-900 rounded-3xl border transition shadow-xl overflow-hidden flex flex-col justify-between p-3 ${
                isHandRaised ? 'ring-2 ring-amber-500 border-amber-500/60' : 'border-slate-800'
              }`}>
                {/* Real User Video Stream */}
                {isVideoOn ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/50">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-xl shadow-lg">
                      {currentUser?.name?.charAt(0) || 'T'}
                    </div>
                  </div>
                )}

                {/* Top Status Tags */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Host / Admin</span>
                  </span>
                  {isHandRaised && (
                    <span className="px-2 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center space-x-1 animate-bounce">
                      <Hand className="w-3 h-3 fill-current" />
                      <span>Hand Raised</span>
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Label */}
                <div className="relative z-10 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-xs font-bold text-white block truncate">
                      You ({currentUser?.name || 'Tejas'})
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {currentUser?.roleTitle || 'Master Super Admin'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {isMicOn ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Mic className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <MicOff className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OTHER PARTICIPANTS (AI Executives & Added Staff) */}
              {invitedParticipants.filter(p => !p.isHost).map((p) => {
                const isSpeaking = activeSpeakerId === p.id;
                const isAi = p.type === 'ai';

                return (
                  <div 
                    key={p.id}
                    className={`relative bg-slate-900 rounded-3xl border transition shadow-xl overflow-hidden flex flex-col justify-between p-3 ${
                      isSpeaking 
                        ? 'ring-4 ring-indigo-500 border-indigo-400 shadow-indigo-500/30' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Background Avatar / Live Video Graphic */}
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img 
                        src={p.avatar} 
                        alt={p.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isSpeaking ? 'scale-110 blur-sm opacity-60' : 'opacity-80'
                        }`} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Active Lip-Sync / Voice Waveform Pulse */}
                      {isSpeaking && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950/40 backdrop-blur-[2px]">
                          <div className="relative mb-3">
                            <img 
                              src={p.avatar} 
                              alt={p.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-indigo-400 ring-4 ring-indigo-500/40 shadow-2xl" 
                            />
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                              <Radio className="w-3 h-3 text-white animate-pulse" />
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold shadow-lg animate-pulse">
                            <span className="w-1.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="w-1.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                            <span className="ml-1.5">Speaking Live</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top Status Tags */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                        isAi 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {isAi ? 'AI Executive' : 'Staff Member'}
                      </span>

                      <div className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-emerald-400">
                        <Mic className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Bottom Identity Pill */}
                    <div className="relative z-10 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-xs font-bold text-white block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {p.role}
                        </span>
                      </div>
                      {isSpeaking && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT: Expandable Drawer (Chat / Transcript / Notes / Members) */}
        {/* ------------------------------------------------------------- */}
        {activeDrawer && (
          <div className="w-full sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl transition-all">
            
            {/* Drawer Header Tabs */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveDrawer('chat')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeDrawer === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat & Q&A</span>
                </button>
                <button
                  onClick={() => setActiveDrawer('transcript')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeDrawer === 'transcript' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Captions</span>
                </button>
                <button
                  onClick={() => setActiveDrawer('notes')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    activeDrawer === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tasks</span>
                </button>
              </div>

              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* TAB 1: LIVE CHAT & CONVERSATIONAL INTERACTION */}
            {activeDrawer === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden p-4">
                
                {/* Chat Messages Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                    💡 <strong>Live Meeting AI Assistant:</strong> Ask anything, suggest ideas, or ask specific AI team members (Alex, Maya, Ryan, Rajeshwari) to speak!
                  </div>

                  {chatMessages.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No chat messages yet. Type below or pick a preset prompt!
                    </div>
                  )}

                  {chatMessages.map((msg) => {
                    return (
                      <div 
                        key={msg.id}
                        className={`p-3 rounded-2xl border ${
                          msg.isHost 
                            ? 'bg-slate-950 border-slate-800' 
                            : 'bg-indigo-950/20 border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${msg.isHost ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                            <span>{msg.senderName}</span>
                          </span>
                          <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                        </div>
                        <div className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {isAgentTyping && (
                    <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center space-x-2 text-indigo-300">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Workforce formulating response...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Interactive Prompt Chips */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pb-1 no-scrollbar">
                    <button
                      onClick={() => handleSendMeetingMessage("Hi everyone! How is the meeting going?")}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    >
                      👋 Say "Hi everyone!"
                    </button>
                    <button
                      onClick={() => handleSendMeetingMessage("Alex, what is our revenue strategy for next quarter?")}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    >
                      📊 Ask Alex (Revenue)
                    </button>
                    <button
                      onClick={() => handleSendMeetingMessage("Maya, how is our Sarjapur marketing campaign performing?")}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    >
                      🚀 Ask Maya (Ads)
                    </button>
                    <button
                      onClick={() => handleSendMeetingMessage("Rajeshwari, are all Kaveri-2 title deeds fully verified?")}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition flex-shrink-0"
                    >
                      ⚖️ Ask Rajeshwari (Legal)
                    </button>
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMeetingMessage()}
                      placeholder="Message the room or ask AI..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSendMeetingMessage()}
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LIVE TRANSCRIPT & CLOSED CAPTIONS */}
            {activeDrawer === 'transcript' && (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                    <span className="font-bold">Live AI Transcription</span>
                    <button 
                      onClick={handleDownloadMinutes}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  {transcript.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-indigo-400 text-[11px]">{t.speakerName}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs">{t.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptBottomRef} />
                </div>
              </div>
            )}

            {/* TAB 3: MEETING ACTION ITEMS & NOTES */}
            {activeDrawer === 'notes' && (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden space-y-4">
                
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Delegated Action Items</h4>
                    <span className="text-[10px] text-emerald-400 font-bold">{actionItems.length} Tasks</span>
                  </div>

                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium">{item.task}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-5">
                          Assigned: <strong className="text-indigo-300">{item.assignedTo}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleConvertActionItemsToTasks}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Push to AI Workforce Task Board</span>
                    </button>
                  </div>

                  {/* Collaborative Notes Area */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400">Boardroom Minutes & Notes</label>
                    <textarea 
                      rows={5}
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownloadMinutes}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete Minutes (.txt)</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM CONTROLS BAR: Teams / Google Meet Style */}
      {/* ------------------------------------------------------------- */}
      <div className="h-20 px-4 sm:px-8 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between flex-shrink-0 z-20">
        
        {/* Left: Quick Status */}
        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex -space-x-2">
            {invitedParticipants.slice(0, 4).map(p => (
              <img 
                key={p.id} 
                src={p.avatar} 
                alt={p.name} 
                className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" 
              />
            ))}
          </div>
          <span>{invitedParticipants.length} Connected</span>
        </div>

        {/* Center: Core Call Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 mx-auto">
          
          {/* Mute Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isMicOn 
                ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Toggle Video Camera */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isVideoOn 
                ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isScreenSharing 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Share Screen or 3D Digital Twin"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Raise Hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isHandRaised 
                ? 'bg-amber-500 text-slate-950 font-bold' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="px-5 h-11 sm:h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition flex items-center space-x-2 shadow-lg shadow-rose-600/30"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">End Meeting</span>
          </button>

        </div>

        {/* Right: Drawer Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
            className={`p-3 rounded-2xl transition border ${
              activeDrawer === 'chat' 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Open Chat & AI Interaction"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'notes' ? null : 'notes')}
            className={`p-3 rounded-2xl transition border ${
              activeDrawer === 'notes' 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Meeting Notes & Tasks"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* INVITE PARTICIPANTS MODAL */}
      {/* ------------------------------------------------------------- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Invite to Video Conference</h3>
                <p className="text-xs text-slate-400">Add Admins, AI Workforce, or Staff to this live meeting</p>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <input 
              type="text"
              value={searchInviteQuery}
              onChange={(e) => setSearchInviteQuery(e.target.value)}
              placeholder="Search by name, department, or role..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {/* List of candidates */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              
              {/* AI Agents */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-1">AI Workforce Agents</div>
              {allAgents
                .filter(a => !invitedParticipants.some(p => p.id === a.id))
                .filter(a => !searchInviteQuery || a.name.toLowerCase().includes(searchInviteQuery.toLowerCase()) || a.role.toLowerCase().includes(searchInviteQuery.toLowerCase()))
                .map(a => (
                  <div key={a.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{a.name}</div>
                        <div className="text-[10px] text-slate-400">{a.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddParticipant(a)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      Invite
                    </button>
                  </div>
                ))}

              {/* Staff & Users */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-3">Staff & Platform Members</div>
              {allUsers
                .filter(u => !invitedParticipants.some(p => p.id === (u.uid || u.id)))
                .filter(u => !searchInviteQuery || u.name?.toLowerCase().includes(searchInviteQuery.toLowerCase()) || u.role?.toLowerCase().includes(searchInviteQuery.toLowerCase()))
                .map(u => (
                  <div key={u.uid || u.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.roleTitle || u.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddParticipant(u)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Invite
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
