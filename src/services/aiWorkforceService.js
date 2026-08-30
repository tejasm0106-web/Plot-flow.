// PlotFlow AI Workforce & Multi-Agent Architecture Service
// Manages 10 Specialized AI Employees, Task Pipelines, Memory, Collaboration, and Governance

import { 
  getStoredTownships, 
  getStoredLeads, 
  getStoredDocuments, 
  getStoredAuditLogs,
  saveStoredLeads,
  addAuditLog
} from './storeService';
import { getStoredUsers } from './userService';

const STORAGE_KEYS = {
  AGENTS_CONFIG: 'plotflow_ai_agents_v1',
  TASKS: 'plotflow_ai_tasks_v1',
  REPORTS: 'plotflow_ai_reports_v1',
  COMPANY_MEMORY: 'plotflow_ai_company_memory_v1',
  AGENT_MEMORY: 'plotflow_ai_agent_memory_v1',
  APPROVALS: 'plotflow_ai_approvals_v1',
  COLLABORATIONS: 'plotflow_ai_collaborations_v1',
  MEETINGS: 'plotflow_ai_meetings_v1',
  AUTOMATIONS: 'plotflow_ai_automations_v1',
  ACTIVITY_LOGS: 'plotflow_ai_activity_logs_v1',
  MODEL_SETTINGS: 'plotflow_ai_model_settings_v1',
  CHAT_HISTORIES: 'plotflow_ai_chat_histories_v1'
};

// ----------------------------------------------------
// 1. 10 AI EMPLOYEE DEFINITIONS
// ----------------------------------------------------
export const INITIAL_AI_AGENTS = [
  {
    id: 'agent_alex',
    name: 'Alex',
    role: 'AI Co-Founder & Chief Strategy Officer',
    department: 'Executive Strategy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    color: 'indigo',
    accentHex: '#6366f1',
    status: 'Working', // 'Working' | 'Waiting for approval' | 'Analyzing' | 'Attention required' | 'Offline'
    statusMessage: 'Synthesizing Q3 BMRDA expansion strategy and lead conversion bottlenecks',
    mission: 'Act as the strategic co-founder to the human CEO, driving exponential growth, defensible margins, and multi-department execution.',
    responsibilities: [
      'Overall PlotFlow business & growth strategy',
      'Business model, pricing, and revenue optimization',
      'Competitor monitoring & defensive positioning',
      'Synthesizing cross-department reports and recommendations',
      'Risk assessment & investor readiness'
    ],
    skills: ['Strategic Synthesis', 'Scenario Modeling', 'Cross-Agent Delegation', 'Executive Briefings'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false, // Requires founder approval
      requiresApprovalFor: ['Pricing changes', 'Budget allocation', 'Partnership terms', 'Strategic pivots']
    },
    metrics: {
      tasksCompleted: 84,
      pendingTasks: 3,
      performanceScore: 98,
      strategicInsightsCount: 142
    },
    personality: 'Pragmatic, visionary, data-driven, concise, candid and structured like a tier-1 venture builder.',
    systemPrompt: `You are Alex, the AI Co-Founder and Chief Strategy Officer of PlotFlow. You partner closely with the human founder/CEO. You analyze business data, challenge assumptions with respectful candor, coordinate other department heads (Maya, Ryan, Olivia, Arjun, Fin, Sara, Leo, Data, Lex), and deliver actionable strategic guidance structured as: What is happening, Why it is happening, What PlotFlow should do next, Priority, Impact, Risks, and Required Founder Decision.`
  },
  {
    id: 'agent_maya',
    name: 'Maya',
    role: 'AI Head of Marketing & Growth',
    department: 'Marketing & Brand',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    color: 'rose',
    accentHex: '#f43f5e',
    status: 'Analyzing',
    statusMessage: 'Analyzing Facebook & Google Ad campaign CPCs for Sarjapur Corridor',
    mission: 'Generate high-intent qualified plot buyer demand, orchestrate omnichannel campaigns, and elevate PlotFlow brand authority.',
    responsibilities: [
      'Omnichannel marketing & ad campaign strategies (Meta, Google, LinkedIn)',
      'Social media content calendars & viral video/Reels concepts',
      'SEO keyword optimization for BMRDA/Kaveri-2 land searches',
      'Ad copywriting, landing page messaging, and conversion rate optimization',
      'Target buyer personas (HNIs, NRI investors, first-time villa builders)'
    ],
    skills: ['Ad Copywriting', 'SEO Analysis', 'Campaign Architecture', 'Social Calendars', 'Persona Mapping'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Publishing live social ads', 'Modifying ad spend budgets', 'Mass email blasts']
    },
    metrics: {
      tasksCompleted: 62,
      pendingTasks: 2,
      performanceScore: 94,
      campaignsCreated: 18
    },
    personality: 'Creative, energetic, growth-obsessed, metrics-grounded, empathetic to buyer psychology.',
    systemPrompt: `You are Maya, AI Head of Marketing for PlotFlow. You specialize in real estate lead generation, high-converting ad copy, viral social hooks, SEO, and omnichannel campaigns for plotted developments in Bangalore and tier-1 Indian metros.`
  },
  {
    id: 'agent_ryan',
    name: 'Ryan',
    role: 'AI Head of Sales & Conversions',
    department: 'Sales & CRM',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    color: 'emerald',
    accentHex: '#10b981',
    status: 'Working',
    statusMessage: 'Qualifying 14 inbound weekend leads and drafting personalized WhatsApp cadences',
    mission: 'Maximize lead-to-site-visit velocity, score buyer intent with surgical precision, and craft high-converting outreach scripts.',
    responsibilities: [
      'Inbound lead qualification and HOT / WARM / COLD / UNQUALIFIED tiering',
      'Generating context-aware WhatsApp and Email sales scripts',
      'Site visit scheduling & cab concierge coordination analysis',
      'Buyer budget & timeline qualification matrix',
      'Sales pipeline velocity and lost-deal autopsy'
    ],
    skills: ['Lead Scoring', 'WhatsApp Scripting', 'Objection Handling', 'Pipeline Forecasting'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Sending WhatsApp messages to clients', 'Offering special price discounts', 'Closing lead records']
    },
    metrics: {
      tasksCompleted: 112,
      pendingTasks: 5,
      performanceScore: 96,
      leadsProcessed: 248
    },
    personality: 'Persuasive, highly organized, responsive, empathetic, sharp closer focused on high-touch buyer experiences.',
    systemPrompt: `You are Ryan, AI Head of Sales at PlotFlow. You analyze inbound real estate inquiries, assign clear HOT/WARM/COLD tiers with transparent reasoning, write tailored WhatsApp follow-up messages, handle price objections, and optimize site-visit conversion rates.`
  },
  {
    id: 'agent_olivia',
    name: 'Olivia',
    role: 'AI Head of Operations & Quality Control',
    department: 'Operations & Fulfillment',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    color: 'amber',
    accentHex: '#f59e0b',
    status: 'Attention required',
    statusMessage: 'Flagged 2 plot entries missing 11E survey sketches in Devanahalli inventory',
    mission: 'Ensure zero-defect listing data, streamline document workflows, monitor developer SLAs, and eliminate operational friction.',
    responsibilities: [
      'Plot inventory listing completeness & metadata validation',
      'Developer onboarding & KYC verification pipelines',
      'Document audit SLA tracking (Kaveri-2 EC, 11E Sketch, Form 15)',
      'Identifying operational bottlenecks and duplicate records',
      'Site-visit logistical quality control'
    ],
    skills: ['SLA Monitoring', 'Anomaly Flagging', 'Workflow Automation', 'Quality Assurance'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Delisting a township or plot', 'Flagging developer accounts as non-compliant']
    },
    metrics: {
      tasksCompleted: 78,
      pendingTasks: 4,
      performanceScore: 95,
      issuesFlagged: 29
    },
    personality: 'Meticulous, process-driven, vigilant, detail-oriented, intolerant of substandard data or slow turnaround.',
    systemPrompt: `You are Olivia, AI Head of Operations at PlotFlow. You enforce listing data accuracy, track document verification workflows, detect operational bottlenecks, and maintain strict quality standards across all plotted townships.`
  },
  {
    id: 'agent_arjun',
    name: 'Arjun',
    role: 'AI Head of Real Estate Research & Micro-Markets',
    department: 'Market Intelligence',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    color: 'cyan',
    accentHex: '#06b6d4',
    status: 'Working',
    statusMessage: 'Compiling infrastructure impact report on STRR Satellite Ring Road & Metro Phase 3',
    mission: 'Provide institutional-grade micro-market research, pricing benchmarks, infrastructure tracking, and locality investment ratings.',
    responsibilities: [
      'Locality price benchmark reports (Avg ₹/sq.ft, YoY capital appreciation)',
      'Infrastructure tracking (Metro lines, STRR, PRR, IT corridor developments)',
      'Plot demand vs supply indicators across Bangalore corridors',
      'Competitor project benchmarking and pricing elasticity',
      'Macroeconomic & regulatory landscape reports'
    ],
    skills: ['Locality Benchmarking', 'Infrastructure Analysis', 'Price Trend Prediction', 'Supply/Demand Analytics'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Publishing public market research reports']
    },
    metrics: {
      tasksCompleted: 49,
      pendingTasks: 1,
      performanceScore: 97,
      localityReports: 34
    },
    personality: 'Analytical, objective, deeply informed on urban planning & zoning, honest about risks, never fabricates speculative numbers.',
    systemPrompt: `You are Arjun, AI Head of Market Research at PlotFlow. You provide rigorous, objective micro-market analysis for Bangalore & tier-1 plotted land corridors. You clearly distinguish between empirical registry data, infrastructure plans, and conservative price projections.`
  },
  {
    id: 'agent_fin',
    name: 'Fin',
    role: 'AI Head of Finance & Unit Economics',
    department: 'Finance & FP&A',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    color: 'teal',
    accentHex: '#14b8a6',
    status: 'Working',
    statusMessage: 'Simulating 3-case cash flow forecast (Base, Optimistic, Conservative) for FY26',
    mission: 'Safeguard capital efficiency, maximize unit economics (LTV/CAC, take-rates), and deliver transparent financial projections.',
    responsibilities: [
      'Revenue, commission take-rate (2-3%), and gross margin analysis',
      'Customer Acquisition Cost (CAC) and Lifetime Value (LTV) models',
      'Scenario forecasting: Base Case, Optimistic Case, Conservative Case',
      'Cash runway, burn-rate, and operational expenditure tracking',
      'Escrow & token advance transaction financial reconciliations'
    ],
    skills: ['Unit Economics', 'Scenario Planning', 'Financial Modeling', 'CAC/LTV Optimization'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Modifying platform commission structure', 'Changing escrow refund terms']
    },
    metrics: {
      tasksCompleted: 53,
      pendingTasks: 2,
      performanceScore: 99,
      forecastAccuracy: '94%'
    },
    personality: 'Prudent, rigorous, disciplined, transparent with assumptions, always labels forward-looking models as estimates.',
    systemPrompt: `You are Fin, AI Head of Finance at PlotFlow. You evaluate unit economics, calculate customer acquisition costs, forecast revenue across Base/Optimistic/Conservative cases, and safeguard financial sustainability.`
  },
  {
    id: 'agent_sara',
    name: 'Sara',
    role: 'AI Head of Customer Experience & Buyer Success',
    department: 'Customer Experience',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    color: 'purple',
    accentHex: '#a855f7',
    status: 'Working',
    statusMessage: 'Drafting resolution templates for NRI buyer survey sketch inquiries',
    mission: 'Deliver white-glove customer satisfaction, resolve buyer anxiety with transparent information, and turn plot buyers into brand advocates.',
    responsibilities: [
      'Customer sentiment tracking & support ticket analysis',
      'Buyer & developer FAQ generation and documentation clarity',
      'Drafting empathetic, accurate support responses for legal & site queries',
      'Post-visit feedback collection and NPS monitoring',
      'Customer retention & referral incentive strategy'
    ],
    skills: ['Empathy Engineering', 'FAQ Generation', 'Support Drafting', 'NPS Analytics'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Sending official resolution letters', 'Issuing goodwill compensation']
    },
    metrics: {
      tasksCompleted: 91,
      pendingTasks: 3,
      performanceScore: 96,
      npsScore: '+78'
    },
    personality: 'Warm, empathetic, swift, clarifying, proactive in de-escalating customer friction.',
    systemPrompt: `You are Sara, AI Head of Customer Experience at PlotFlow. You ensure buyers and landowners receive prompt, reassuring, and precise guidance regarding their plots, site visits, legal clearances, and booking advances.`
  },
  {
    id: 'agent_leo',
    name: 'Leo',
    role: 'AI Lead Product Manager',
    department: 'Product & UX',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    color: 'sky',
    accentHex: '#0284c7',
    status: 'Analyzing',
    statusMessage: 'Prioritizing Three.js 3D Twin mobile gesture optimizations for Q4 roadmap',
    mission: 'Translate buyer friction into high-impact product features using the RICE framework (Reach, Impact, Confidence, Effort).',
    responsibilities: [
      'User feedback synthesis & UX drop-off analysis',
      'Feature prioritization: Impact, Effort, Urgency, Revenue Potential',
      'Product specifications (PRDs) and interactive wireframe concepts',
      '3D Sun-Path & Map interactive experience optimization',
      'Maintaining the PlotFlow 12-month product roadmap'
    ],
    skills: ['PRD Writing', 'RICE Scoring', 'UX Friction Analysis', 'Roadmap Architecture'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Committing features to public roadmap']
    },
    metrics: {
      tasksCompleted: 58,
      pendingTasks: 2,
      performanceScore: 95,
      prdsAuthored: 22
    },
    personality: 'User-centric, structured, iterative, focused on reducing friction and maximizing user delight.',
    systemPrompt: `You are Leo, AI Lead Product Manager at PlotFlow. You analyze user telemetry, prioritize features using Impact vs Effort, write clear product requirements, and continuously enhance the PlotFlow web & 3D experience.`
  },
  {
    id: 'agent_data',
    name: 'Data',
    role: 'AI Lead Business Intelligence & Analytics',
    department: 'Data Intelligence',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    color: 'blue',
    accentHex: '#3b82f6',
    status: 'Working',
    statusMessage: 'Scanning 6 townships & 120 plot parcels for conversion rate correlations',
    mission: 'Uncover hidden revenue signals, detect funnel anomalies, and provide real-time statistical truth to the entire AI workforce.',
    responsibilities: [
      'Continuous database indexing (Townships, Plots, Leads, Legal Documents, Users)',
      'Conversion funnel drop-off analytics & attribution modeling',
      'Anomaly detection (sudden spike in unsold inventory, dormant leads)',
      'High-performing plot attribute correlation (Facing, Dimension, Price band)',
      'Automated executive KPI dashboards and cohort analyses'
    ],
    skills: ['Cohort Analysis', 'Anomaly Detection', 'Funnel Diagnostics', 'SQL/Data Synthesis'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Exporting sensitive user data dumps']
    },
    metrics: {
      tasksCompleted: 145,
      pendingTasks: 4,
      performanceScore: 99,
      queriesProcessed: 1840
    },
    personality: 'Precision-first, objective, statistical, rigorous, speaks in concise charts, ratios, and percentages.',
    systemPrompt: `You are Data, AI Business Intelligence Analyst at PlotFlow. You monitor all database records, detect anomalies, analyze conversion funnels, and provide quantitative evidence to Alex and the other department heads.`
  },
  {
    id: 'agent_lex',
    name: 'Lex',
    role: 'AI Compliance & Legal Verification Assistant',
    department: 'Legal & Risk Compliance',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
    color: 'emerald',
    accentHex: '#059669',
    status: 'Working',
    statusMessage: 'Verifying 30-Year Kaveri-2 Encumbrance Certificate rules across 5 active projects',
    mission: 'Ensure airtight title compliance checklists, flag missing statutory approvals (BMRDA, RERA, 11E), and mitigate buyer legal risks.',
    responsibilities: [
      'Statutory checklist audits (RERA Registration, BDA/BMRDA Approval, Kaveri-2 EC)',
      'Identifying missing title deeds or unverified survey sketch layers',
      'Explaining legal risks & due diligence terminology to prospective buyers',
      'Structuring standardized legal audit portal workflows',
      'Enforcing strict regulatory disclaimers (Informational guidance only)'
    ],
    skills: ['Statutory Audits', 'Title Risk Flagging', 'Due Diligence Checklists', 'RERA Compliance'],
    permissions: {
      canReadData: true,
      canAnalyze: true,
      canDraftActions: true,
      canAutoExecute: false,
      requiresApprovalFor: ['Issuing legal clearance status', 'Flagging title discrepancies to developers']
    },
    metrics: {
      tasksCompleted: 73,
      pendingTasks: 2,
      performanceScore: 98,
      documentsAudited: 126
    },
    personality: 'Careful, legally cautious, thorough, clear with disclaimers, never claims to be a licensed attorney.',
    systemPrompt: `You are Lex, AI Compliance Assistant at PlotFlow. You assist in reviewing land documentation, verifying RERA/BMRDA checklists, and identifying potential title risks. You ALWAYS include a disclaimer stating that guidance is for informational due diligence and recommend formal legal deed verification.`
  }
];

// ----------------------------------------------------
// 2. INITIAL SEED DATA FOR TASKS, REPORTS & MEMORY
// ----------------------------------------------------
export const INITIAL_AI_TASKS = [
  {
    id: 'task_001',
    title: 'Design Omnichannel Campaign for Sarjapur Corridor Launch',
    assignedAgentId: 'agent_maya',
    delegatedBy: 'agent_alex',
    priority: 'HIGH', // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    status: 'WAITING FOR APPROVAL', // 'TODO' | 'IN PROGRESS' | 'WAITING FOR APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    createdDate: '2026-08-28T10:15:00.000Z',
    deadline: '2026-09-02T18:00:00.000Z',
    description: 'Create a high-converting Meta and Google Search ad campaign targeting tech professionals in Bellandur/ORR for 30x40 & 30x50 villa plots.',
    inputData: 'Township: Emerald Sanctuary (Sarjapur), Price: ₹4,200/sq.ft, Target Audience: Tech HNIs aged 28-45.',
    outputData: {
      summary: 'Drafted 3 high-converting ad variants with Meta Carousel previews, target keywords, and ₹45,000 budget recommendation.',
      deliverables: [
        'Variant A: "Own 1200 sq.ft Land with 30-Yr Clear Title near Sarjapur SEZ"',
        'Variant B: "Stop Paying Rent in Bellandur: Custom Villa Plots with 3D Sun-Path"',
        'Recommended Budget: ₹1,500/day across Meta + Google PPC. Target CPA: ₹480/lead.'
      ]
    },
    founderApproval: {
      required: true,
      status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED'
      approvedAt: null,
      notes: ''
    }
  },
  {
    id: 'task_002',
    title: 'Audit Devanahalli Township Plot Documents for Missing 11E Sketches',
    assignedAgentId: 'agent_olivia',
    delegatedBy: 'agent_alex',
    priority: 'CRITICAL',
    status: 'WAITING FOR APPROVAL',
    createdDate: '2026-08-29T14:30:00.000Z',
    deadline: '2026-08-31T12:00:00.000Z',
    description: 'Scan all 24 plots in Devanahalli Aerotropolis township to verify 11E survey sketches and Form 15 EC attachments.',
    inputData: 'Township: Devanahalli Aerotropolis, Active inventory: 24 plots.',
    outputData: {
      summary: 'Identified 2 plot entries (Plot #12 and Plot #19) missing individual 11E survey drawings. Recommended requesting upload from developer.',
      deliverables: [
        'Flag Plot #12 & Plot #19 in Admin Inventory',
        'Draft automated notice to Developer partner: "Action Required: Upload 11E Mojini Sketch"',
        'Temporary lock on retail token booking for unverified plots'
      ]
    },
    founderApproval: {
      required: true,
      status: 'PENDING',
      approvedAt: null,
      notes: ''
    }
  },
  {
    id: 'task_003',
    title: 'Lead Velocity & Intent Scoring for 14 Weekend Inbound Enquiries',
    assignedAgentId: 'agent_ryan',
    delegatedBy: 'agent_alex',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdDate: '2026-08-29T08:00:00.000Z',
    deadline: '2026-08-30T10:00:00.000Z',
    description: 'Analyze all 14 inbound leads received via 3D Sun-Path simulator and map coordinates to classify into HOT/WARM/COLD tiers.',
    inputData: '14 lead records from CRM database.',
    outputData: {
      summary: 'Classified 6 HOT leads (Budget > ₹60L, ready to visit within 48 hrs), 5 WARM, 3 COLD. Drafted personalized WhatsApp messages.',
      deliverables: [
        'HOT Lead #1: Vikram Sharma (Looking for East-facing 30x50 in Whitefield) - Cab booked for Sunday 11 AM.',
        'HOT Lead #2: Ananya Roy (NRI Investor from Singapore) - Requested 30-year Kaveri-2 Title Audit PDF.',
        'Generated 6 tailored WhatsApp follow-up templates ready for sales team dispatch.'
      ]
    },
    founderApproval: {
      required: false,
      status: 'APPROVED',
      approvedAt: '2026-08-29T11:00:00.000Z',
      notes: 'Executed automated CRM tagging.'
    }
  },
  {
    id: 'task_004',
    title: 'North Bangalore Micro-Market Growth & STRR Highway Impact Study',
    assignedAgentId: 'agent_arjun',
    delegatedBy: 'agent_alex',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdDate: '2026-08-27T09:00:00.000Z',
    deadline: '2026-08-29T18:00:00.000Z',
    description: 'Synthesize price trends along Satellite Ring Road (STRR) and KIADB Aerospace Park for land buyers.',
    inputData: 'Sub-registrar transaction registry benchmarks + public infrastructure gazettes.',
    outputData: {
      summary: 'Average plot price in Devanahalli-Doddaballapur stretch appreciated 18.4% YoY. High investor demand for gated layouts with BMRDA sanctions.',
      deliverables: [
        'Average Price Benchmark: ₹3,850 to ₹5,400 per sq.ft.',
        'Key Driver: Metro Blue Line connectivity to Airport (ETA 2026).',
        'Recommendation: Onboard 2 new vetted plotted townships in Doddaballapur corridor.'
      ]
    },
    founderApproval: {
      required: false,
      status: 'APPROVED',
      approvedAt: '2026-08-29T18:00:00.000Z'
    }
  },
  {
    id: 'task_005',
    title: 'Unit Economics & 3-Case Revenue Forecast (FY26)',
    assignedAgentId: 'agent_fin',
    delegatedBy: 'agent_alex',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdDate: '2026-08-28T11:00:00.000Z',
    deadline: '2026-08-30T16:00:00.000Z',
    description: 'Model platform take-rates (2.5% developer success fee + ₹25,000 refundable token advances) across Base, Optimistic, and Conservative scenarios.',
    inputData: 'Current inventory: 120 plots across 6 townships. Avg plot value: ₹54 Lakhs.',
    outputData: {
      summary: 'Base Case projects ₹1.62 Cr annual platform gross margin at 120 plot volume. LTV/CAC ratio stands strong at 5.2x.',
      deliverables: [
        'Base Case (60% sell-through): ₹1.62 Cr revenue, ₹31L CAC.',
        'Optimistic Case (85% sell-through): ₹2.29 Cr revenue.',
        'Conservative Case (40% sell-through): ₹1.08 Cr revenue.'
      ]
    },
    founderApproval: {
      required: false,
      status: 'APPROVED',
      approvedAt: '2026-08-28T16:00:00.000Z'
    }
  }
];

export const INITIAL_AI_REPORTS = [
  {
    id: 'rep_001',
    title: 'Executive Growth & Unit Economics Strategy: H2 2026',
    authorAgentId: 'agent_alex',
    contributors: ['agent_fin', 'agent_maya', 'agent_ryan', 'agent_data'],
    category: 'Executive Strategy',
    createdDate: '2026-08-29T16:00:00.000Z',
    status: 'PUBLISHED',
    executiveSummary: 'PlotFlow holds a distinct competitive moat with its 3D Sun-Path Digital Twin and 5-Layer Due Diligence verification. By optimizing lead response velocity to under 5 minutes and expanding into North Bangalore corridors, PlotFlow can double monthly token advances with zero increase in blended CAC.',
    keyFindings: [
      'Conversion rate for buyers who interact with the 3D Sun-Path simulator is 3.4x higher than static 2D brochure viewers.',
      'East and North facing plots command an 8.5% price premium and sell out 42% faster.',
      'Current buyer friction centers on statutory 11E survey sketch clarity; surfacing these directly in the 3D viewer resolves 80% of legal hesitancy.',
      'Blended Customer Acquisition Cost (CAC) is ₹3,850 with an expected platform Gross LTV of ₹1,35,000 per completed transaction.'
    ],
    dataUsed: 'PlotFlow internal database (6 Townships, 120 Plots, 48 Inbound CRM Leads) + BMRDA sub-registrar registry benchmarks.',
    problemsIdentified: [
      '2 townships have pending document audits causing a 3-day delay in inventory release.',
      'Weekend site visit cab requests have 18% unassigned lead buffer during peak Sunday slots.',
      'Organic Google Search traffic is under-indexed for "RERA approved plots near STRR Bangalore".'
    ],
    recommendations: [
      'Launch an automated WhatsApp concierge bot supervised by Ryan for instant weekend site-visit confirmations.',
      'Release Maya\'s SEO content cluster targeting North Bangalore & Sarjapur plotted land keywords.',
      'Introduce a verified "Fast-Track Token" program with ₹25,000 escrow protection.'
    ],
    priority: 'HIGH',
    expectedImpact: '+65% increase in monthly token reservations; CAC reduction from ₹3,850 to ₹2,400 within 60 days.',
    risks: 'Developer supply bottleneck if onboarding pace lags behind retail buyer demand.',
    nextSteps: 'Founder approval on the Sarjapur marketing budget and approval of the automated lead-scoring cadence.',
    founderDecisionRequired: 'Approve ₹45,000 ad budget for Sarjapur campaign and authorize the automated WhatsApp lead routing rule.'
  },
  {
    id: 'rep_002',
    title: 'Omnichannel Marketing & High-Intent Buyer Acquisition Plan',
    authorAgentId: 'agent_maya',
    contributors: ['agent_data', 'agent_ryan'],
    category: 'Marketing',
    createdDate: '2026-08-29T12:00:00.000Z',
    status: 'PUBLISHED',
    executiveSummary: 'Comprehensive 30-day marketing blueprint targeting Bangalore tech corridors (Sarjapur, Whitefield, Devanahalli). Combines high-performing 3D video reels, Google Search intent ads, and LinkedIn NRI investor targeting.',
    keyFindings: [
      'Video ads showcasing the 3D Sun-Path shadow simulator achieve a 4.8% Click-Through Rate (CTR), 2.2x higher than generic plot images.',
      'NRI segment (Dubai & Singapore) accounts for 28% of high-ticket token inquiries for plots > ₹80 Lakhs.',
      'Cost per Lead (CPL) on Meta is ₹420 vs Google Search at ₹680, but Google leads convert to site visits at 2.4x velocity.'
    ],
    dataUsed: 'Meta Ads Manager telemetry + Google Analytics + CRM inbound lead attribution.',
    problemsIdentified: [
      'Landing page mobile drop-off occurs on slow 3D loading connections (now resolved with Three.js WebGL procedural shaders).',
      'Need dedicated NRI landing pages featuring Kaveri-2 remote legal verification.'
    ],
    recommendations: [
      'Deploy 3 video ad variants showcasing 3D Solar simulation and verified title badges.',
      'Execute a weekly LinkedIn thought-leadership series by the Founder on "Avoiding Land Title Fraud in Bangalore".'
    ],
    priority: 'HIGH',
    expectedImpact: 'Generate 120+ qualified buyer leads within 30 days at sub-₹500 CPL.',
    risks: 'Ad fatigue on static creatives; requires bi-weekly creative refreshment.',
    nextSteps: 'Activate Meta Ads campaign once Founder approves budget.',
    founderDecisionRequired: 'Approve monthly digital ad allocation.'
  }
];

export const INITIAL_COMPANY_MEMORY = [
  {
    id: 'cm_01',
    category: 'Business Model',
    title: 'Platform Take-Rate & Revenue Structure',
    content: 'PlotFlow earns a 2.5% success commission from vetted developers upon completed land sale, plus premium SaaS listing tiers and ₹25,000 refundable token reservations held in escrow.',
    author: 'Founder & Alex',
    updatedAt: '2026-08-28T00:00:00.000Z'
  },
  {
    id: 'cm_02',
    category: 'Core Moat',
    title: '3D Digital Twin & 5-Layer Due Diligence',
    content: 'PlotFlow’s core differentiator is 100% verified 30-year Kaveri-2 sub-registrar title searches combined with interactive 3D physics sun-path simulation for every individual plot parcel.',
    author: 'Founder & Leo',
    updatedAt: '2026-08-28T00:00:00.000Z'
  },
  {
    id: 'cm_03',
    category: 'Brand Voice',
    title: 'Tone & Communication Philosophy',
    content: 'PlotFlow speaks with institutional credibility, absolute transparency, zero speculative hype, and deep empathy for first-time land buyers and long-term villa investors.',
    author: 'Maya & Sara',
    updatedAt: '2026-08-28T00:00:00.000Z'
  },
  {
    id: 'cm_04',
    category: 'Target Demographics',
    title: 'Primary Buyer Personas',
    content: '1) Tech HNIs in Bangalore (30-45 yrs) seeking custom villa plots. 2) NRI Investors (US, UAE, Singapore) seeking 30-year clear title land. 3) High-growth plotted township developers.',
    author: 'Ryan & Arjun',
    updatedAt: '2026-08-28T00:00:00.000Z'
  }
];

export const INITIAL_AUTOMATIONS = [
  {
    id: 'auto_01',
    name: 'Morning Executive Briefing',
    agentId: 'agent_alex',
    trigger: 'Every Morning at 08:00 AM',
    action: 'Scan inventory, CRM leads, and document audits to compile the Top 5 Founder Insights.',
    enabled: true,
    lastRun: '2026-08-30T08:00:00.000Z',
    status: 'ACTIVE'
  },
  {
    id: 'auto_02',
    name: 'Inbound Lead Scoring & Auto-Triage',
    agentId: 'agent_ryan',
    trigger: 'When a new lead submits inquiry',
    action: 'Analyze budget, timeline, and plot orientation to score HOT/WARM/COLD and draft WhatsApp message.',
    enabled: true,
    lastRun: '2026-08-30T07:15:00.000Z',
    status: 'ACTIVE'
  },
  {
    id: 'auto_03',
    name: 'Plot Document Integrity Watchdog',
    agentId: 'agent_olivia',
    trigger: 'When a new plot is added or updated',
    action: 'Verify 11E survey sketch, RERA number, and Form 15 EC document attachment completeness.',
    enabled: true,
    lastRun: '2026-08-29T22:30:00.000Z',
    status: 'ACTIVE'
  },
  {
    id: 'auto_04',
    name: 'Weekly Micro-Market Price Tracker',
    agentId: 'agent_arjun',
    trigger: 'Every Friday at 05:00 PM',
    action: 'Index sub-registrar registry prices and calculate corridor appreciation rates.',
    enabled: true,
    lastRun: '2026-08-28T17:00:00.000Z',
    status: 'ACTIVE'
  }
];

// ----------------------------------------------------
// 3. STORAGE & STATE RETRIEVAL METHODS
// ----------------------------------------------------

export function getAiAgents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENTS_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading AI agents:', e);
  }
  localStorage.setItem(STORAGE_KEYS.AGENTS_CONFIG, JSON.stringify(INITIAL_AI_AGENTS));
  return INITIAL_AI_AGENTS;
}

export function saveAiAgents(agents) {
  try {
    localStorage.setItem(STORAGE_KEYS.AGENTS_CONFIG, JSON.stringify(agents));
    window.dispatchEvent(new CustomEvent('plotflow_ai_agents_updated', { detail: agents }));
  } catch (e) {
    console.warn('Error saving AI agents:', e);
  }
}

export function updateAgent(agentId, partialData) {
  const agents = getAiAgents();
  const index = agents.findIndex(a => a.id === agentId);
  if (index !== -1) {
    agents[index] = { ...agents[index], ...partialData };
    saveAiAgents(agents);
    logAiActivity({
      agentId,
      agentName: agents[index].name,
      action: `Updated agent configuration & status to ${partialData.status || 'Active'}`,
      category: 'Agent Management',
      status: 'SUCCESS'
    });
    return agents[index];
  }
  return null;
}

// Tasks
export function getAiTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading AI tasks:', e);
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_AI_TASKS));
  return INITIAL_AI_TASKS;
}

export function saveAiTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent('plotflow_ai_tasks_updated', { detail: tasks }));
  } catch (e) {
    console.warn('Error saving AI tasks:', e);
  }
}

export function createAiTask(taskData) {
  const tasks = getAiTasks();
  const agents = getAiAgents();
  const assignedAgent = agents.find(a => a.id === taskData.assignedAgentId) || agents[0];

  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: taskData.title || 'Untitled AI Task',
    assignedAgentId: assignedAgent.id,
    delegatedBy: taskData.delegatedBy || 'Founder / CEO',
    priority: taskData.priority || 'HIGH',
    status: taskData.status || 'IN PROGRESS',
    createdDate: new Date().toISOString(),
    deadline: taskData.deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
    description: taskData.description || '',
    inputData: taskData.inputData || '',
    outputData: taskData.outputData || null,
    founderApproval: taskData.founderApproval || {
      required: true,
      status: 'PENDING',
      approvedAt: null,
      notes: ''
    }
  };

  const updated = [newTask, ...tasks];
  saveAiTasks(updated);

  logAiActivity({
    agentId: assignedAgent.id,
    agentName: assignedAgent.name,
    action: `Created new task: "${newTask.title}" (Priority: ${newTask.priority})`,
    category: 'Task Execution',
    status: 'IN_PROGRESS'
  });

  return newTask;
}

export function updateAiTaskStatus(taskId, status, approvalNotes = '') {
  const tasks = getAiTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    const task = tasks[index];
    task.status = status;
    if (status === 'COMPLETED') {
      task.founderApproval.status = 'APPROVED';
      task.founderApproval.approvedAt = new Date().toISOString();
      if (approvalNotes) task.founderApproval.notes = approvalNotes;
    } else if (status === 'CANCELLED') {
      task.founderApproval.status = 'REJECTED';
      if (approvalNotes) task.founderApproval.notes = approvalNotes;
    }

    saveAiTasks(tasks);

    logAiActivity({
      agentId: task.assignedAgentId,
      agentName: 'AI Agent',
      action: `Task "${task.title}" status updated to ${status}`,
      category: 'Governance & Approval',
      status: status === 'COMPLETED' ? 'SUCCESS' : 'INFO'
    });

    return task;
  }
  return null;
}

// Reports
export function getAiReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading AI reports:', e);
  }
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_AI_REPORTS));
  return INITIAL_AI_REPORTS;
}

export function saveAiReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('plotflow_ai_reports_updated', { detail: reports }));
  } catch (e) {
    console.warn('Error saving AI reports:', e);
  }
}

export function createAiReport(reportData) {
  const reports = getAiReports();
  const newReport = {
    id: `rep_${Date.now()}`,
    title: reportData.title || 'Executive Strategy Report',
    authorAgentId: reportData.authorAgentId || 'agent_alex',
    contributors: reportData.contributors || ['agent_fin', 'agent_data'],
    category: reportData.category || 'Executive Strategy',
    createdDate: new Date().toISOString(),
    status: 'PUBLISHED',
    executiveSummary: reportData.executiveSummary || '',
    keyFindings: reportData.keyFindings || [],
    dataUsed: reportData.dataUsed || 'PlotFlow Real-Time Database',
    problemsIdentified: reportData.problemsIdentified || [],
    recommendations: reportData.recommendations || [],
    priority: reportData.priority || 'HIGH',
    expectedImpact: reportData.expectedImpact || '',
    risks: reportData.risks || '',
    nextSteps: reportData.nextSteps || '',
    founderDecisionRequired: reportData.founderDecisionRequired || ''
  };

  const updated = [newReport, ...reports];
  saveAiReports(updated);
  return newReport;
}

// Memory
export function getCompanyMemory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_MEMORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading company memory:', e);
  }
  localStorage.setItem(STORAGE_KEYS.COMPANY_MEMORY, JSON.stringify(INITIAL_COMPANY_MEMORY));
  return INITIAL_COMPANY_MEMORY;
}

export function saveCompanyMemory(memories) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY_MEMORY, JSON.stringify(memories));
  } catch (e) {
    console.warn('Error saving company memory:', e);
  }
}

export function addCompanyMemory(memoryData) {
  const list = getCompanyMemory();
  const newEntry = {
    id: `cm_${Date.now()}`,
    category: memoryData.category || 'Strategic Insight',
    title: memoryData.title || 'Untitled Memory',
    content: memoryData.content || '',
    author: memoryData.author || 'Founder / CEO',
    updatedAt: new Date().toISOString()
  };
  const updated = [newEntry, ...list];
  saveCompanyMemory(updated);
  return newEntry;
}

export function deleteCompanyMemory(id) {
  const list = getCompanyMemory();
  const updated = list.filter(m => m.id !== id);
  saveCompanyMemory(updated);
  return updated;
}

// Activity Logs
export function getAiActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading AI activity logs:', e);
  }
  return [
    {
      id: 'log_01',
      timestamp: '2026-08-30T08:15:00.000Z',
      agentId: 'agent_alex',
      agentName: 'Alex',
      action: 'Synthesized daily executive briefing with 5 strategic priorities',
      category: 'Executive Strategy',
      status: 'SUCCESS'
    },
    {
      id: 'log_02',
      timestamp: '2026-08-30T07:45:00.000Z',
      agentId: 'agent_ryan',
      agentName: 'Ryan',
      action: 'Qualified 14 weekend inbound buyer leads; assigned 6 HOT tiers',
      category: 'Sales CRM',
      status: 'SUCCESS'
    },
    {
      id: 'log_03',
      timestamp: '2026-08-30T07:10:00.000Z',
      agentId: 'agent_olivia',
      agentName: 'Olivia',
      action: 'Audited 24 plots in Devanahalli; flagged Plot #12 and #19 for survey sketch upload',
      category: 'Quality Control',
      status: 'ATTENTION_REQUIRED'
    },
    {
      id: 'log_04',
      timestamp: '2026-08-29T21:05:00.000Z',
      agentId: 'agent_maya',
      agentName: 'Maya',
      action: 'Created Sarjapur Facebook & Google Ad campaign recommendation',
      category: 'Marketing',
      status: 'WAITING_APPROVAL'
    }
  ];
}

export function logAiActivity(log) {
  try {
    const logs = getAiActivityLogs();
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      agentId: log.agentId || 'agent_system',
      agentName: log.agentName || 'AI System',
      action: log.action || 'Performed automated check',
      category: log.category || 'General',
      status: log.status || 'SUCCESS'
    };
    const updated = [entry, ...logs.slice(0, 150)];
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('plotflow_ai_logs_updated', { detail: updated }));
    return entry;
  } catch (e) {
    console.warn('Error logging AI activity:', e);
  }
}

// Automations
export function getAiAutomations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading automations:', e);
  }
  localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(INITIAL_AUTOMATIONS));
  return INITIAL_AUTOMATIONS;
}

export function toggleAiAutomation(autoId) {
  const list = getAiAutomations();
  const index = list.findIndex(a => a.id === autoId);
  if (index !== -1) {
    list[index].enabled = !list[index].enabled;
    list[index].status = list[index].enabled ? 'ACTIVE' : 'PAUSED';
    localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(list));
    return list[index];
  }
  return null;
}

// AI Model Settings
export function getAiModelSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODEL_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading AI model settings:', e);
  }
  return {
    provider: 'Google Gemini Pro / Flash 3.7',
    modelName: 'gemini-3.7-flash',
    temperature: 0.3,
    maxTokens: 4096,
    multiAgentOrchestration: true,
    autoSafetyGuards: true,
    realTimeDbSync: true,
    founderOverrideEnabled: true
  };
}

export function saveAiModelSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.MODEL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving model settings:', e);
  }
}

// ----------------------------------------------------
// 4. REAL DATA SYNTHESIS & BRIEFING ENGINE
// ----------------------------------------------------

/**
 * Synthesizes dynamic "Today's Top 5 Briefings" for the Founder from real PlotFlow data
 */
export function generateTodayBriefing() {
  const townships = getStoredTownships();
  const leads = getStoredLeads();
  const documents = getStoredDocuments();
  const users = getStoredUsers();

  let totalPlots = 0;
  let availablePlots = 0;
  let reservedPlots = 0;
  let soldPlots = 0;

  townships.forEach(t => {
    (t.plots || []).forEach(p => {
      totalPlots++;
      if (p.status === 'Available') availablePlots++;
      else if (p.status === 'Reserved') reservedPlots++;
      else soldPlots++;
    });
  });

  const pendingDocs = documents.filter(d => d.status === 'PENDING_AUDIT' || d.verificationStatus === 'IN_REVIEW');
  const hotLeads = leads.filter(l => (l.status === 'NEW' || l.status === 'HOT' || l.score > 80));

  return [
    {
      id: 'br_01',
      title: `${hotLeads.length || 6} High-Intent Buyer Leads Require Follow-Up`,
      desc: `Ryan identified ${hotLeads.length || 6} hot prospects looking for East/North facing plots with immediate weekend site-visit availability.`,
      agent: 'Ryan (Sales Head)',
      agentId: 'agent_ryan',
      priority: 'HIGH',
      actionLabel: 'View Qualified Leads',
      actionTab: 'sales'
    },
    {
      id: 'br_02',
      title: `${pendingDocs.length || 3} Plot Documents Flagged in Legal Audit Queue`,
      desc: `Lex & Olivia discovered ${pendingDocs.length || 3} listings awaiting final 30-year Kaveri-2 sub-registrar title sign-off before public marketplace release.`,
      agent: 'Lex (Compliance)',
      agentId: 'agent_lex',
      priority: 'CRITICAL',
      actionLabel: 'Inspect Legal Vault',
      actionTab: 'operations'
    },
    {
      id: 'br_03',
      title: 'Sarjapur Villa Campaign Ready for Founder Approval',
      desc: 'Maya drafted a targeted ₹45k Meta & Google Search campaign targeting IT corridor HNIs with an estimated ₹480 Cost-Per-Lead.',
      agent: 'Maya (Marketing Head)',
      agentId: 'agent_maya',
      priority: 'HIGH',
      actionLabel: 'Review Campaign Draft',
      actionTab: 'marketing'
    },
    {
      id: 'br_04',
      title: 'North Bangalore Micro-Market Price Appreciation Alert',
      desc: 'Arjun reports a +18.4% YoY surge in plotted land demand near STRR & Airport corridor with supply compression.',
      agent: 'Arjun (Research Head)',
      agentId: 'agent_arjun',
      priority: 'MEDIUM',
      actionLabel: 'Read Market Report',
      actionTab: 'research'
    },
    {
      id: 'br_05',
      title: 'Unit Economics: LTV/CAC Healthy at 5.2x',
      desc: 'Fin simulated the Q3 revenue model projecting ₹1.62 Cr annual gross margin at current 2.5% developer take-rate.',
      agent: 'Fin (Finance Head)',
      agentId: 'agent_fin',
      priority: 'MEDIUM',
      actionLabel: 'View Financial Model',
      actionTab: 'finance'
    }
  ];
}

// ----------------------------------------------------
// 5. NATURAL LANGUAGE FOUNDER COMMAND ROUTER
// ----------------------------------------------------

/**
 * Intelligent Multi-Agent Command Router
 * Maps natural language prompts to individual or collaborative multi-agent execution workflows.
 */
export function executeFounderCommand(promptText) {
  const p = (promptText || '').toLowerCase().trim();
  const agents = getAiAgents();

  // Multi-Department Collaboration triggers
  if (
    p.includes('revenue') || 
    p.includes('growth') || 
    p.includes('leads') || 
    p.includes('expand') || 
    p.includes('investor') || 
    p.includes('bottleneck') || 
    p.includes('competitor') ||
    p.includes('30-day') ||
    p.includes('strategy')
  ) {
    return runMultiAgentCollaboration(promptText);
  }

  // Single Agent Routing
  if (p.includes('market') || p.includes('price') || p.includes('locality') || p.includes('bangalore') || p.includes('research')) {
    return runSingleAgentResponse('agent_arjun', promptText, 'Arjun compiled a detailed micro-market price benchmark and demand projection.');
  }

  if (p.includes('ad') || p.includes('campaign') || p.includes('instagram') || p.includes('seo') || p.includes('social') || p.includes('content')) {
    return runSingleAgentResponse('agent_maya', promptText, 'Maya authored an omnichannel campaign strategy and 7-day social content calendar.');
  }

  if (p.includes('sales') || p.includes('whatsapp') || p.includes('script') || p.includes('lead') || p.includes('buyer') || p.includes('close')) {
    return runSingleAgentResponse('agent_ryan', promptText, 'Ryan scored your active buyer leads and generated context-aware WhatsApp scripts.');
  }

  if (p.includes('operation') || p.includes('document') || p.includes('verification') || p.includes('listing') || p.includes('quality') || p.includes('sla')) {
    return runSingleAgentResponse('agent_olivia', promptText, 'Olivia completed an operational audit across all active plot parcels and flagged pending SLAs.');
  }

  if (p.includes('finance') || p.includes('forecast') || p.includes('unit economic') || p.includes('cac') || p.includes('ltv') || p.includes('budget') || p.includes('cash')) {
    return runSingleAgentResponse('agent_fin', promptText, 'Fin prepared a 3-case scenario financial projection model (Base, Optimistic, Conservative).');
  }

  if (p.includes('product') || p.includes('roadmap') || p.includes('feature') || p.includes('ux') || p.includes('feedback') || p.includes('3d')) {
    return runSingleAgentResponse('agent_leo', promptText, 'Leo authored a PRD specification with RICE impact-effort prioritization.');
  }

  if (p.includes('legal') || p.includes('compliance') || p.includes('kaveri') || p.includes('rera') || p.includes('title') || p.includes('deed')) {
    return runSingleAgentResponse('agent_lex', promptText, 'Lex conducted a 5-layer statutory compliance checklist review with standard disclaimers.');
  }

  // Default to Alex (Co-Founder)
  return runSingleAgentResponse('agent_alex', promptText, 'Alex synthesized your request with actionable executive recommendations.');
}

/**
 * Executes a Multi-Agent Collaborative Task Pipeline
 */
export function runMultiAgentCollaboration(goalPrompt) {
  const id = `collab_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const collaborationRecord = {
    id,
    title: `Strategic Multi-Agent Execution: "${goalPrompt}"`,
    initiatedBy: 'Founder / CEO',
    timestamp,
    status: 'COMPLETED',
    orchestrator: 'Alex (AI Co-Founder)',
    timeline: [
      {
        step: 1,
        agentId: 'agent_alex',
        agentName: 'Alex',
        role: 'AI Co-Founder',
        action: 'Analyzed CEO goal, framed strategic objectives, and orchestrated 5 departmental workstreams.',
        output: 'Created delegation plan: Maya (Marketing), Ryan (Sales), Data (Analytics), Arjun (Research), Fin (Budget).'
      },
      {
        step: 2,
        agentId: 'agent_data',
        agentName: 'Data',
        role: 'AI Data Analyst',
        action: 'Extracted cohort telemetry: 120 inventory plots, 3.4x 3D viewer conversion correlation.',
        output: 'Provided funnel baseline: 4.2% visitor-to-lead, 28% lead-to-site-visit rate.'
      },
      {
        step: 3,
        agentId: 'agent_arjun',
        agentName: 'Arjun',
        role: 'AI Market Research',
        action: 'Mapped high-demand corridors: Sarjapur (Tech villa buyers) & Devanahalli (STRR investor demand).',
        output: 'Benchmark: ₹4,200/sq.ft Sarjapur; ₹4,850/sq.ft North Bangalore.'
      },
      {
        step: 4,
        agentId: 'agent_maya',
        agentName: 'Maya',
        role: 'AI Marketing Head',
        action: 'Formulated high-converting 3D video ad campaign targeting tech professionals in ORR/Bellandur.',
        output: 'Drafted 3 ad variants; recommended ₹45,000 monthly ad spend at ₹480 target CPL.'
      },
      {
        step: 5,
        agentId: 'agent_ryan',
        agentName: 'Ryan',
        role: 'AI Sales Head',
        action: 'Designed automated WhatsApp concierge sequence with instant free cab scheduling for site visits.',
        output: 'Projected +40% increase in weekend site-visit completions.'
      },
      {
        step: 6,
        agentId: 'agent_fin',
        agentName: 'Fin',
        role: 'AI Finance Head',
        action: 'Calculated financial feasibility: LTV/CAC at 5.2x with ₹1.62 Cr projected annual margin.',
        output: 'Approved unit economics across Base and Optimistic growth cases.'
      },
      {
        step: 7,
        agentId: 'agent_alex',
        agentName: 'Alex',
        role: 'AI Co-Founder',
        action: 'Synthesized all 5 departmental reports into a unified Executive Action Proposal for Founder Approval.',
        output: 'Proposal ready: 3 Founder decisions required to activate live growth engine.'
      }
    ],
    synthesis: {
      whatIsHappening: 'PlotFlow has high-intent demand but lacks an automated rapid-response bridge between 3D plot exploration and weekend site visits.',
      whyIsItHappening: 'Buyers love the 3D Sun-Path simulation but delay booking token advances without instant legal title reassurance.',
      whatToDoNext: '1) Approve Maya’s Sarjapur digital campaign. 2) Enable Ryan’s automated WhatsApp site-visit booking. 3) Feature Kaveri-2 title audit badges prominently.',
      expectedImpact: '+75% monthly token volume within 45 days, with CAC dropping to sub-₹3,000.',
      risks: 'Ensuring developer partners maintain 100% verified document response times under 24 hours.',
      founderDecisionRequired: 'Authorize ₹45k marketing budget and enable automated WhatsApp CRM lead routing.'
    }
  };

  logAiActivity({
    agentId: 'agent_alex',
    agentName: 'Alex',
    action: `Completed multi-agent collaboration: "${goalPrompt}" across 6 departments`,
    category: 'Multi-Agent Collaboration',
    status: 'SUCCESS'
  });

  return collaborationRecord;
}

function runSingleAgentResponse(agentId, prompt, summary) {
  const agents = getAiAgents();
  const agent = agents.find(a => a.id === agentId) || agents[0];

  const record = {
    id: `single_${Date.now()}`,
    title: `Response from ${agent.name}: "${prompt}"`,
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    timestamp: new Date().toISOString(),
    summary,
    recommendations: [
      `Immediate action: Review PlotFlow data for ${prompt}`,
      `Secondary optimization: Coordinate with ${agentId === 'agent_alex' ? 'Maya & Ryan' : 'Alex'} for execution`,
      'Submit final approval request to Founder'
    ],
    founderDecisionRequired: 'Review draft and approve execution.'
  };

  logAiActivity({
    agentId: agent.id,
    agentName: agent.name,
    action: `Responded to founder prompt: "${prompt}"`,
    category: 'Agent Consultation',
    status: 'SUCCESS'
  });

  return record;
}

// ----------------------------------------------------
// 6. SIMULATED AI TEAM BOARDROOM MEETINGS
// ----------------------------------------------------

/**
 * Conducts a structured executive team meeting on any topic
 */
export function conductAiTeamMeeting(topic) {
  return {
    id: `meeting_${Date.now()}`,
    topic: topic || 'Should PlotFlow Expand Outside Bangalore into Hyderabad & Mysore?',
    timestamp: new Date().toISOString(),
    moderator: 'Alex (AI Co-Founder)',
    attendees: [
      { id: 'agent_alex', name: 'Alex', role: 'Chief Strategy Officer' },
      { id: 'agent_maya', name: 'Maya', role: 'Head of Marketing' },
      { id: 'agent_ryan', name: 'Ryan', role: 'Head of Sales' },
      { id: 'agent_arjun', name: 'Arjun', role: 'Head of Market Research' },
      { id: 'agent_fin', name: 'Fin', role: 'Head of Finance' },
      { id: 'agent_olivia', name: 'Olivia', role: 'Head of Operations' },
      { id: 'agent_lex', name: 'Lex', role: 'Compliance Assistant' }
    ],
    transcript: [
      {
        speaker: 'Alex (Co-Founder)',
        text: 'Team, the Founder has asked us to evaluate: "' + topic + '". Let\'s examine our market positioning, unit economics, regulatory moats, and operational capacity.'
      },
      {
        speaker: 'Arjun (Research)',
        text: 'From a market perspective, Hyderabad’s Shamshabad & Gachibowli growth corridors show high plotted demand (+22% YoY). However, land title systems in Telangana (Dharani portal) operate differently than Karnataka’s Kaveri-2 system. We must adapt our 5-layer due diligence framework before entering.'
      },
      {
        speaker: 'Maya (Marketing)',
        text: 'Our 3D Sun-Path simulator gives us instant brand virality in any metro. In Hyderabad, tech professionals are hungry for verified plotted land. We could achieve a ₹520 CPL with tailored Telugu & English Meta ad variants.'
      },
      {
        speaker: 'Ryan (Sales)',
        text: 'I agree with Maya, but we must establish local site visit cab logistics before generating leads. A buyer who cannot visit within 72 hours drops conversion by 65%.'
      },
      {
        speaker: 'Fin (Finance)',
        text: 'Financially, expanding to a new city requires ₹12 Lakhs upfront for sub-registrar legal integrations and micro-market mapping. I recommend a phased pilot: onboard 2 premium townships in Hyderabad first to validate take-rate elasticity.'
      },
      {
        speaker: 'Olivia (Operations)',
        text: 'Operationally, we should first achieve 100% document automation in Bangalore East & North before stretching our developer onboarding team across state lines.'
      },
      {
        speaker: 'Lex (Compliance)',
        text: 'Mandatory caution: Telangana RERA and Gram Panchayat layout regularizations (LRS) have unique litigation patterns. All title clearance templates must be verified by local Telangana land advocates.'
      },
      {
        speaker: 'Alex (Co-Founder)',
        text: 'Excellent synthesis. Here is my strategic consensus for the Founder: We should NOT do an immediate full-scale expansion. Instead, we run a disciplined Phase-1 Pilot in North Hyderabad with 2 Tier-1 developers while consolidating our dominant market share in Bangalore.'
      }
    ],
    synthesis: {
      consensus: 'Expansion is highly lucrative but requires adapting our legal verification engine to regional state registry portals.',
      disagreements: 'Marketing/Sales want immediate geographic expansion; Operations/Finance advocate for consolidation before scaling.',
      risks: 'Regulatory unfamiliarity with out-of-state land titling systems (Telangana Dharani portal vs Karnataka Kaveri-2).',
      recommendation: 'Launch a controlled Phase-1 Hyderabad Pilot (2 selected gated townships) starting Q1 2027.',
      founderDecisionRequired: 'Approve Phase-1 Pilot feasibility budget of ₹10 Lakhs or keep 100% focus on Bangalore dominance for the next 6 months.'
    }
  };
}
