// PlotFlow Unified State Store & LocalStorage Persistence Service with Real-Time Firestore & Cross-Web Sync
import { 
  INITIAL_PROJECTS, 
  INITIAL_LEGAL_DOCUMENTS, 
  INITIAL_LEADS, 
  INITIAL_SITE_SETTINGS, 
  INITIAL_AUDIT_LOGS,
  DEFAULT_HOMEPAGE_SECTIONS
} from '../data/mockData';

import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp 
} from './firebase';

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

/* ========================================================================== */
/* FIRESTORE REAL-TIME CLOUD PERSISTENCE & REAL-TIME LISTENERS                 */
/* ========================================================================== */

// Helper to push document update to Firestore asynchronously
async function syncDocToFirestore(docId, data) {
  if (!db) return;
  try {
    const docRef = doc(db, 'platform_data', docId);
    await setDoc(docRef, {
      payload: data,
      lastModified: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
      updatedBy: 'PlotFlow Realtime Orchestrator'
    }, { merge: true });
  } catch (error) {
    // Graceful fallback to local persistence if offline or unprovisioned
    console.debug(`Firestore sync notice for [${docId}]:`, error?.message || error);
  }
}

/**
 * Real-time listener for Townships collection in Firestore.
 * Updates local cache and emits event across all active components.
 */
export function subscribeToTownshipsRealtime(callback) {
  if (!db) {
    const handleLocal = (e) => callback(e.detail || getStoredTownships());
    window.addEventListener('plotflow_townships_updated', handleLocal);
    return () => window.removeEventListener('plotflow_townships_updated', handleLocal);
  }

  try {
    const docRef = doc(db, 'platform_data', 'townships');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload && Array.isArray(data.payload)) {
          localStorage.setItem(STORAGE_KEYS.TOWNSHIPS, JSON.stringify(data.payload));
          callback(data.payload);
          broadcastSyncEvent('plotflow_townships_updated', data.payload);
        }
      }
    }, (err) => {
      console.debug('Townships onSnapshot notice (using local store):', err?.message || err);
    });

    const handleLocal = (e) => callback(e.detail || getStoredTownships());
    window.addEventListener('plotflow_townships_updated', handleLocal);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('plotflow_townships_updated', handleLocal);
    };
  } catch (e) {
    console.debug('subscribeToTownshipsRealtime fallback:', e);
    const handleLocal = (e) => callback(e.detail || getStoredTownships());
    window.addEventListener('plotflow_townships_updated', handleLocal);
    return () => window.removeEventListener('plotflow_townships_updated', handleLocal);
  }
}

/**
 * Real-time listener for Site Settings in Firestore.
 */
export function subscribeToSettingsRealtime(callback) {
  if (!db) {
    const handleLocal = (e) => callback(e.detail || getSiteSettings());
    window.addEventListener('plotflow_settings_updated', handleLocal);
    return () => window.removeEventListener('plotflow_settings_updated', handleLocal);
  }

  try {
    const docRef = doc(db, 'platform_data', 'settings');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload) {
          const merged = { ...INITIAL_SITE_SETTINGS, ...data.payload };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
          callback(merged);
          broadcastSyncEvent('plotflow_settings_updated', merged);
        }
      }
    }, (err) => {
      console.debug('Settings onSnapshot notice:', err?.message || err);
    });

    const handleLocal = (e) => callback(e.detail || getSiteSettings());
    window.addEventListener('plotflow_settings_updated', handleLocal);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('plotflow_settings_updated', handleLocal);
    };
  } catch (e) {
    const handleLocal = (e) => callback(e.detail || getSiteSettings());
    window.addEventListener('plotflow_settings_updated', handleLocal);
    return () => window.removeEventListener('plotflow_settings_updated', handleLocal);
  }
}

/**
 * Real-time listener for Legal Documents in Firestore.
 */
export function subscribeToDocumentsRealtime(callback) {
  if (!db) {
    const handleLocal = (e) => callback(e.detail || getStoredDocuments());
    window.addEventListener('plotflow_documents_updated', handleLocal);
    return () => window.removeEventListener('plotflow_documents_updated', handleLocal);
  }

  try {
    const docRef = doc(db, 'platform_data', 'documents');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload && Array.isArray(data.payload)) {
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.payload));
          callback(data.payload);
          broadcastSyncEvent('plotflow_documents_updated', data.payload);
        }
      }
    }, (err) => {
      console.debug('Documents onSnapshot notice:', err?.message || err);
    });

    const handleLocal = (e) => callback(e.detail || getStoredDocuments());
    window.addEventListener('plotflow_documents_updated', handleLocal);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('plotflow_documents_updated', handleLocal);
    };
  } catch (e) {
    const handleLocal = (e) => callback(e.detail || getStoredDocuments());
    window.addEventListener('plotflow_documents_updated', handleLocal);
    return () => window.removeEventListener('plotflow_documents_updated', handleLocal);
  }
}

/**
 * Real-time listener for Leads & CRM inquiries in Firestore.
 */
export function subscribeToLeadsRealtime(callback) {
  if (!db) {
    const handleLocal = (e) => callback(e.detail || getStoredLeads());
    window.addEventListener('plotflow_leads_updated', handleLocal);
    return () => window.removeEventListener('plotflow_leads_updated', handleLocal);
  }

  try {
    const docRef = doc(db, 'platform_data', 'leads');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.payload && Array.isArray(data.payload)) {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(data.payload));
          callback(data.payload);
          broadcastSyncEvent('plotflow_leads_updated', data.payload);
        }
      }
    }, (err) => {
      console.debug('Leads onSnapshot notice:', err?.message || err);
    });

    const handleLocal = (e) => callback(e.detail || getStoredLeads());
    window.addEventListener('plotflow_leads_updated', handleLocal);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('plotflow_leads_updated', handleLocal);
    };
  } catch (e) {
    const handleLocal = (e) => callback(e.detail || getStoredLeads());
    window.addEventListener('plotflow_leads_updated', handleLocal);
    return () => window.removeEventListener('plotflow_leads_updated', handleLocal);
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
    syncDocToFirestore('settings', settings);
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
    syncDocToFirestore('sections', sections);
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
    syncDocToFirestore('townships', townships);
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
    syncDocToFirestore('documents', documents);
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
    syncDocToFirestore('leads', leads);
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
    syncDocToFirestore('audit_logs', logs.slice(0, 100));
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

  syncDocToFirestore('settings', INITIAL_SITE_SETTINGS);
  syncDocToFirestore('townships', INITIAL_PROJECTS);
  syncDocToFirestore('documents', INITIAL_LEGAL_DOCUMENTS);
  syncDocToFirestore('leads', INITIAL_LEADS);

  addAuditLog('PLATFORM_RESET_DEFAULTS', 'Master Super Admin', 'Full Workspace Data', 'Reset all settings, townships, plots, documents, and leads to verified starter data.', 'WARNING');
  return true;
}

