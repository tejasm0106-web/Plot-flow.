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
  ChevronRight
} from 'lucide-react';
import { 
  getStoredTownships, 
  getStoredLeads, 
  getStoredDocuments 
} from '../../services/storeService';
import { logAiActivity } from '../../services/aiWorkforceService';

export default function AiAgentChatModal({ agent, onClose, onDelegateToAnotherAgent }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatBottomRef = useRef(null);

  // Initialize chat history with agent's personalized greeting
  useEffect(() => {
    if (!agent) return;

    const initialGreeting = {
      id: 'msg_init',
      sender: 'agent',
      agentName: agent.name,
      agentRole: agent.role,
      avatar: agent.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello Founder. I am **${agent.name}**, your **${agent.role}**. 

I am actively tracking our PlotFlow operations and ready to assist you. What objective or analysis would you like us to execute today?`
    };

    setMessages([initialGreeting]);
  }, [agent]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = {
    agent_alex: [
      'What are our top 3 growth bottlenecks this month?',
      'How do we maximize our 2.5% platform commission take-rate?',
      'Should we expand into Hyderabad or consolidate Bangalore?'
    ],
    agent_maya: [
      'Draft a high-converting Meta ad copy for Sarjapur villa plots',
      'Create a 7-day social media content calendar for NRI investors',
      'How can we reduce our blended CAC from ₹3,850 to sub-₹2,500?'
    ],
    agent_ryan: [
      'Score and qualify our latest inbound buyer leads',
      'Draft an empathetic WhatsApp script for a hesitant buyer',
      'How do we improve our Sunday site-visit attendance rate?'
    ],
    agent_olivia: [
      'Audit our active plot listings for missing 11E sketches',
      'How do we reduce developer onboarding SLA to under 48 hours?',
      'Flag any inventory anomalies in Devanahalli or Whitefield'
    ],
    agent_arjun: [
      'Give me a price benchmark report for STRR & North Bangalore',
      'Compare appreciation rates between Sarjapur and Devanahalli',
      'What is the infrastructure impact of the upcoming Metro Phase 3?'
    ],
    agent_fin: [
      'Show me our 3-case revenue projection model for FY26',
      'What is our current Gross LTV to CAC ratio?',
      'How does a ₹25,000 token advance escrow impact our cash flow?'
    ],
    agent_sara: [
      'Draft an empathetic response to an NRI inquiry regarding Kaveri-2 title deed verification',
      'Create an FAQ guide for first-time plotted land buyers in Bangalore',
      'How can we increase customer NPS and referral bookings?'
    ],
    agent_leo: [
      'Prioritize our Q4 roadmap features using the RICE framework',
      'How can we optimize our Three.js 3D Sun-Path simulator UX?',
      'Draft a PRD for the instant WhatsApp site-visit booking widget'
    ],
    agent_data: [
      'Show conversion funnel telemetry: 3D viewer vs static brochure',
      'Identify our top-performing plot orientations and price bands',
      'Scan database for any stagnant inventory (>60 days unsold)'
    ],
    agent_lex: [
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

    // Simulate AI response grounded in real PlotFlow state
    setTimeout(() => {
      const responseText = generateAgentResponse(agent, text);
      const agentMsg = {
        id: `agt_${Date.now()}`,
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
        action: `Answered founder inquiry in 1-on-1 chat: "${text.slice(0, 40)}..."`,
        category: 'Direct Consultation',
        status: 'SUCCESS'
      });
    }, 1000);
  };

  const generateAgentResponse = (currentAgent, prompt) => {
    const p = prompt.toLowerCase();
    const townships = getStoredTownships();
    const leads = getStoredLeads();
    const docs = getStoredDocuments();

    if (currentAgent.id === 'agent_alex') {
      return `### Strategic Analysis & Action Plan
Based on our current database of **${townships.length} townships** and **${leads.length} active leads**, here is my executive recommendation:

1. **Core Observation**: Our primary growth driver is the **3D Sun-Path Digital Twin**. Users who simulate plot shadow patterns convert at a **3.4x higher velocity**.
2. **Immediate Bottleneck**: Document audit turnaround for Kaveri-2 ECs currently takes ~3 days, creating a delay in releasing new inventory parcels.
3. **Recommended Founder Decision**:
   - Authorize Maya to launch the **₹45k Sarjapur PPC campaign**.
   - Instruct Ryan to deploy automated WhatsApp site-visit booking confirmations.
   - Instruct Olivia to enforce strict 24-hr document upload SLAs for developer partners.

*Would you like me to assign these sub-tasks to Maya, Ryan, and Olivia now?*`;
    }

    if (currentAgent.id === 'agent_maya') {
      return `### Marketing Blueprint & Campaign Execution
Here is the high-converting marketing framework tailored to your request:

- **Target Audience**: Tech professionals in Bellandur, Outer Ring Road, and Whitefield (Age 30–45, Household Income ₹35L+).
- **Core Hook**: *"Why buy an apartment when you can own 1,200 sq.ft of BMRDA-approved land with 30-year clear title?"*
- **Ad Creative Concept**: 15-second screen recording of our interactive **3D Sun-Path Simulator** demonstrating morning East-facing light on a 30x50 villa parcel.
- **Projected Metrics**:
  - Daily Budget: **₹1,500/day** (Meta + Google PPC)
  - Target Cost-Per-Lead (CPL): **₹480**
  - Expected Inbound Inquiries: **90+ qualified leads / month**

I have submitted this campaign draft to your **Approvals Queue** for your sign-off!`;
    }

    if (currentAgent.id === 'agent_ryan') {
      return `### Sales Qualification & Inbound Lead Cadence
I have reviewed our CRM pipeline of **${leads.length} active leads**.

**Lead Intent Breakdown**:
- **HOT Tier (Immediate Site Visit)**: 6 Leads (Budgets ₹60L–₹1.2 Cr, requested cab pick-up).
- **WARM Tier (Evaluating Financing/Title)**: 5 Leads (Requested Kaveri-2 legal title report).
- **COLD Tier (Browsing/Unresponsive)**: 3 Leads.

**Personalized WhatsApp Script Ready for Dispatch**:
> *"Namaste [Name], this is Ryan from the PlotFlow Founders Concierge. We noticed you analyzed the East-facing 1,500 sq.ft villa plot in Emerald Sanctuary on our 3D Digital Twin. We have arranged a complimentary luxury chauffeur visit for you this Sunday at 10:30 AM with our legal audit team on-site. May we confirm your slot?"*

*Would you like me to dispatch this to the HOT cohort upon your approval?*`;
    }

    if (currentAgent.id === 'agent_olivia') {
      return `### Operations & Listing Quality Audit
I have completed a real-time scan across all **${townships.length} townships** and active plot parcels:

- **100% Compliant Listings**: 4 Townships (All BMRDA sanctions, Kaveri-2 30-year ECs, and 11E Mojini sketches verified).
- **Flagged Discrepancies**: 2 Plots in Devanahalli Aerotropolis are missing individual 11E survey sketch attachments.
- **Action Taken**: Drafted automated SLA notice to the developer partner giving 24 hours to upload before retail token booking is locked.

I am keeping your listing data pristine and fraud-proof.`;
    }

    if (currentAgent.id === 'agent_arjun') {
      return `### Micro-Market Research & Corridor Valuation
Here is the empirical price benchmark for the Bangalore plotted development ecosystem:

- **Sarjapur Corridor**: Avg ₹4,200 – ₹5,600 / sq.ft (YoY Growth: **+14.2%**). Driven by RGA Tech Park & upcoming Metro connectivity.
- **North Bangalore (STRR & Devanahalli)**: Avg ₹3,850 – ₹5,400 / sq.ft (YoY Growth: **+18.4%**). Driven by KIADB Aerospace SEZ & Metro Blue Line.
- **Whitefield Extension (Hoskote)**: Avg ₹3,400 – ₹4,600 / sq.ft (YoY Growth: **+11.8%**).

**Key Takeaway**: North Bangalore is experiencing severe supply compression for genuine RERA/BMRDA approved layouts. Adding 2 more townships here will yield highest sales velocity.`;
    }

    if (currentAgent.id === 'agent_fin') {
      return `### Unit Economics & Financial Scenario Modeling
Here is the breakdown of our platform unit economics:

- **Average Plot Transaction Value**: **₹54,00,000**
- **PlotFlow Commission Take-Rate (2.5%)**: **₹1,35,000 / transaction**
- **Customer Acquisition Cost (CAC)**: **₹3,850** (Blended Meta + Google PPC + Chauffeur Concierge)
- **LTV / CAC Ratio**: **35.0x** (Gross Margin) / **5.2x** (Fully Loaded Operational Margin)

**Scenario Projections (FY26)**:
- **Base Case (120 Plots Sold)**: **₹1.62 Cr Platform Revenue** | ₹31L Operating Cost | **₹1.31 Cr Net Platform Margin**
- **Optimistic Case (170 Plots Sold)**: **₹2.29 Cr Platform Revenue**
- **Conservative Case (80 Plots Sold)**: **₹1.08 Cr Platform Revenue**`;
    }

    if (currentAgent.id === 'agent_lex') {
      return `### Statutory Due Diligence & Compliance Review
*Disclaimer: AI compliance guidance is provided for informational due diligence and does not substitute formal legal conveyance by a licensed advocate.*

**PlotFlow 5-Layer Statutory Audit Status**:
1. **RERA Registration**: Validated on Karnataka RERA portal.
2. **Layout Sanction**: Verified BMRDA / BDA / DTCP master plan sanction numbers.
3. **Kaveri-2 Encumbrance (30-Year)**: Form 15 NIL encumbrance certified.
4. **Revenue Mojini 11E Sketch**: Survey numbers cross-matched with village revenue maps.
5. **Podi & Mutation Extracts**: Current Khata (A-Khata / E-Khata) verified without title disputes.

All active listings conform to standard compliance thresholds.`;
    }

    // Generic fallback for Sara, Leo, Data
    return `### Assessment & Next Steps from ${currentAgent.name}
I have analyzed our real-time database regarding "${prompt}".

- **Key Observation**: Real-time telemetry shows strong buyer engagement across our 3D visualization layers.
- **Priority Level**: HIGH.
- **Recommended Action**: Proceed with structured execution and log all actions in the Founder Audit trail.

How would you like to proceed?`;
  };

  const handleCopy = (text, index) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden">
        
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
              </div>
              <p className="text-xs text-slate-400 font-medium">{agent.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Suggested:</span>
          </span>
          {(quickPrompts[agent.id] || quickPrompts.agent_alex).map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-white transition text-[11px] flex-shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-900/40">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id || idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                      CEO
                    </div>
                  ) : (
                    <img 
                      src={msg.avatar || agent.avatar} 
                      alt={msg.agentName}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-700" 
                    />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  isUser 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-300">{isUser ? 'Founder / CEO' : msg.agentName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Render content */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Action bar for agent responses */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Verified AI Employee</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-3">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-700 animate-pulse" 
              />
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-2 shadow-lg">
                <span className="text-xs text-indigo-300 font-bold">{agent.name} is synthesizing data</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${agent.name} about ${agent.department.toLowerCase()}, data analysis, strategy, or tasks...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl transition shadow-lg flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Commands are executed within Founder Governance Guardrails.</span>
            <span>PlotFlow AI Workforce Engine v1.0</span>
          </div>
        </div>

      </div>
    </div>
  );
}
