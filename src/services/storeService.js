// PlotFlow Unified State Store & LocalStorage Persistence Service with Real-Time Cross-Web Sync
import { 
  INITIAL_PROJECTS, 
  INITIAL_LEGAL_DOCUMENTS, 
  INITIAL_LEADS, 
  INITIAL_SITE_SETTINGS, 
  INITIAL_AUDIT_LOGS,
  DEFAULT_HOMEPAGE_SECTIONS
} from '../data/mockData';

export const STORAGE_KEYS = {
  SETTINGS: 'plotflow_site_settings_v3',
  HOMEPAGE_SECTIONS: 'plotflow_homepage_sections_v3',
  TOWNSHIPS: 'plotflow_townships_v3',
  DOCUMENTS: 'plotflow_documents_v3',
  LEADS: 'plotflow_leads_v3',
  AUDIT_LOGS: 'plotflow_audit_logs_v3',
  SHORTLIST: 'plotflow_shortlist_v3'
};

// Cross-Window / Cross-Tab Master Synchronization Channel
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('plotflow_master_sync_channel_v3');
    broadcastChannel.onmessage = (event) => {
      const { eventName, detail } = event.data || {};
      if (eventName && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel sync init warning:', e);
  }
}

// Storage event listener for multi-tab fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue);
      if (e.key === STORAGE_KEYS.TOWNSHIPS) {
        window.dispatchEvent(new CustomEvent('plotflow_townships_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.SETTINGS) {
        window.dispatchEvent(new CustomEvent('plotflow_settings_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.HOMEPAGE_SECTIONS) {
        window.dispatchEvent(new CustomEvent('plotflow_sections_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.DOCUMENTS) {
        window.dispatchEvent(new CustomEvent('plotflow_documents_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.LEADS) {
        window.dispatchEvent(new CustomEvent('plotflow_leads_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.AUDIT_LOGS) {
        window.dispatchEvent(new CustomEvent('plotflow_audit_logs_updated', { detail: parsed }));
      } else if (e.key === STORAGE_KEYS.SHORTLIST) {
        window.dispatchEvent(new CustomEvent('plotflow_shortlist_updated', { detail: parsed }));
      }
    } catch (err) {
      // ignore parsing errors
    }
  });
}

export function broadcastSyncEvent(eventName, detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ eventName, detail, timestamp: Date.now() });
      } catch (err) {
        console.warn('Broadcast failed:', err);
      }
    }
  }
}

// Site Settings
export function getSiteSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_SITE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Error loading site settings:', e);
  }
  return INITIAL_SITE_SETTINGS;
}

export function saveSiteSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    broadcastSyncEvent('plotflow_settings_updated', settings);
  } catch (e) {
    console.warn('Error saving site settings:', e);
  }
}

// Homepage Sections Config
export function getHomepageSections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOMEPAGE_SECTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading homepage sections:', e);
  }
  return DEFAULT_HOMEPAGE_SECTIONS;
}

export function saveHomepageSections(sections) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOMEPAGE_SECTIONS, JSON.stringify(sections));
    broadcastSyncEvent('plotflow_sections_updated', sections);
  } catch (e) {
    console.warn('Error saving homepage sections:', e);
  }
}

// Townships
export function getStoredTownships() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOWNSHIPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error loading townships:', e);
  }
  localStorage.setItem(STORAGE_KEYS.TOWNSHIPS, JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
}

export function saveStoredTownships(townships) {
  try {
    localStorage.setItem(STORAGE_KEYS.TOWNSHIPS, JSON.stringify(townships));
    broadcastSyncEvent('plotflow_townships_updated', townships);
  } catch (e) {
    console.warn('Error saving townships:', e);
  }
}

// Documents
export function getStoredDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error loading documents:', e);
  }
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_LEGAL_DOCUMENTS));
  return INITIAL_LEGAL_DOCUMENTS;
}

export function saveStoredDocuments(documents) {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    broadcastSyncEvent('plotflow_documents_updated', documents);
  } catch (e) {
    console.warn('Error saving documents:', e);
  }
}

// Leads & CRM
export function getStoredLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error loading leads:', e);
  }
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
  return INITIAL_LEADS;
}

export function saveStoredLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    broadcastSyncEvent('plotflow_leads_updated', leads);
  } catch (e) {
    console.warn('Error saving leads:', e);
  }
}

export function addLead(newLead) {
  const leads = getStoredLeads();
  const leadEntry = {
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'New Lead',
    ...newLead
  };
  const updated = [leadEntry, ...leads];
  saveStoredLeads(updated);
  addAuditLog(
    'NEW_LEAD_CAPTURED',
    leadEntry.email || 'Guest User',
    leadEntry.townshipName || 'Platform Inquiry',
    `Lead captured from ${leadEntry.source || 'Website Form'}: ${leadEntry.buyerName} (${leadEntry.phone})`,
    'INFO'
  );
  return leadEntry;
}

export function deleteLead(leadId) {
  const leads = getStoredLeads();
  const targetLead = leads.find(l => l.id === leadId);
  const updated = leads.filter(l => l.id !== leadId);
  saveStoredLeads(updated);
  if (targetLead) {
    addAuditLog(
      'LEAD_DELETED',
      'Super Admin',
      targetLead.buyerName,
      `Deleted CRM lead inquiry for ${targetLead.buyerName} (${targetLead.phone}).`,
      'WARNING'
    );
  }
  return updated;
}

// Audit Logs
export function getStoredAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error loading audit logs:', e);
  }
  return INITIAL_AUDIT_LOGS;
}

export function saveStoredAuditLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
    broadcastSyncEvent('plotflow_audit_logs_updated', logs.slice(0, 100));
  } catch (e) {
    console.warn('Error saving audit logs:', e);
  }
}

export function addAuditLog(action, actor, target, details, severity = 'INFO') {
  const currentLogs = getStoredAuditLogs();
  const newLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    action,
    actor: actor || 'Admin User',
    target: target || 'System Resource',
    details: details || '',
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    isoTimestamp: new Date().toISOString(),
    severity // 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER'
  };
  const updated = [newLog, ...currentLogs];
  saveStoredAuditLogs(updated);
  return newLog;
}

// Shortlist Management
export function getShortlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHORTLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error loading shortlist:', e);
  }
  return ['ts_01', 'ts_02'];
}

export function saveShortlist(shortlist) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHORTLIST, JSON.stringify(shortlist));
    broadcastSyncEvent('plotflow_shortlist_updated', shortlist);
  } catch (e) {
    console.warn('Error saving shortlist:', e);
  }
}

export function toggleShortlistInStore(townshipId) {
  const current = getShortlist();
  const next = current.includes(townshipId)
    ? current.filter(id => id !== townshipId)
    : [...current, townshipId];
  saveShortlist(next);
  return next;
}

// Reset Everything to Default Clean State
export function resetPlatformToDefaults() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.HOMEPAGE_SECTIONS, JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS));
  localStorage.setItem(STORAGE_KEYS.TOWNSHIPS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_LEGAL_DOCUMENTS));
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.SHORTLIST, JSON.stringify(['ts_01', 'ts_02']));
  
  broadcastSyncEvent('plotflow_settings_updated', INITIAL_SITE_SETTINGS);
  broadcastSyncEvent('plotflow_sections_updated', DEFAULT_HOMEPAGE_SECTIONS);
  broadcastSyncEvent('plotflow_townships_updated', INITIAL_PROJECTS);
  broadcastSyncEvent('plotflow_documents_updated', INITIAL_LEGAL_DOCUMENTS);
  broadcastSyncEvent('plotflow_leads_updated', INITIAL_LEADS);
  broadcastSyncEvent('plotflow_audit_logs_updated', INITIAL_AUDIT_LOGS);
  broadcastSyncEvent('plotflow_shortlist_updated', ['ts_01', 'ts_02']);

  addAuditLog('PLATFORM_RESET_DEFAULTS', 'Master Super Admin', 'Full Workspace Data', 'Reset all settings, townships, plots, documents, and leads to verified starter data.', 'WARNING');
  return true;
}
