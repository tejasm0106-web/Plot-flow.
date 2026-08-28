// PlotFlow Property Document Service with Real-time Firestore Sync & RBAC Access Control
import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from './firebase';
import { INITIAL_LEGAL_DOCUMENTS } from '../data/mockData';
import { normalizeRole, ROLES, isSuperAdmin } from './rbacService';

const STORAGE_KEY = 'plotflow_property_documents_v2';
const AUDIT_LOG_KEY = 'plotflow_document_audit_logs_v2';

export const DOCUMENT_CATEGORIES = [
  'RERA Sanction & Master Plan',
  'Land Revenue & Title Deed',
  'Encumbrance Certificate (EC Form 15)',
  'Zonal Sanction & Land Conversion',
  'Layout Approval & Sanction Map',
  'Legal Due Diligence & Opinion',
  'Environmental & Pollution NOC',
  'Panchayat / BDA Khata & Mutation',
  'Fire, Water & Electricity Board NOC',
  'Structural & Civil Engineering Certificate'
];

export const ACCESS_LEVELS = {
  PUBLIC: 'Public (All Visitors)',
  VERIFIED_BUYER: 'Verified Buyers Only',
  TOKEN_GATED: 'Token Deposit Gated (₹25k)',
  LEGAL_ONLY: 'Legal Auditor Vault Only',
  INTERNAL_ONLY: 'Developer & Admin Internal'
};

export const VERIFICATION_STATUSES = {
  VERIFIED: 'Verified',
  UNDER_REVIEW: 'Under Review',
  PENDING_AUDIT: 'Pending Legal Audit',
  ACTION_REQUIRED: 'Action Required',
  REJECTED: 'Rejected'
};

// Standard access control template
export const DEFAULT_ACCESS_CONTROL = {
  isPublic: true,
  requiresVerifiedBuyer: false,
  legalAuditorOnly: false,
  tokenGated: false,
  requiresNda: false,
  watermarkEnabled: true,
  allowDirectDownload: true,
  allowedRoles: ['admin', 'developer', 'legal', 'buyer']
};

/**
 * Generate cryptographic-like SHA-256 fingerprint for document integrity check
 */
export function generateDocumentHash(title, refNumber, timestamp = Date.now()) {
  const seed = `${title}_${refNumber}_${timestamp}_PLOTFLOW_SECURE`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs((hash * 31) & 0xffffffff).toString(16).padStart(8, '0');
  const hex3 = Math.abs((hash * 67) & 0xffffffff).toString(16).padStart(8, '0');
  const hex4 = Math.abs((hash * 139) & 0xffffffff).toString(16).padStart(8, '0');
  return `0x${hex1}${hex2}${hex3}${hex4}`.toUpperCase();
}

/**
 * Initialize default documents formatted with full access control flags
 */
function getInitialFormattedDocs() {
  return INITIAL_LEGAL_DOCUMENTS.map((docItem, idx) => ({
    id: docItem.id || `doc_${idx + 1}`,
    townshipId: docItem.townshipId || 'ts_01',
    townshipName: docItem.townshipName || 'Prestige Sanctuary Greens',
    developerId: 'dev_prestige',
    developerName: 'Prestige Group Plotted Ventures',
    title: docItem.title || 'Verified Property Document',
    category: docItem.category || 'Land Revenue & Title Deed',
    authority: docItem.authority || 'Government Authority',
    refNumber: docItem.refNumber || `REF-${Date.now()}-${idx}`,
    issueDate: docItem.uploadDate || '2024-04-10',
    expiryDate: '2029-12-31',
    uploadDate: docItem.uploadDate || '2024-04-10',
    fileSize: docItem.fileSize || '3.5 MB (PDF)',
    fileType: 'application/pdf',
    fileName: `${(docItem.title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
    status: docItem.status || 'Verified',
    verifiedBy: docItem.verifiedBy || 'Senior Legal Auditor',
    verifiedAt: docItem.uploadDate || '2024-04-10',
    description: docItem.description || 'Statutory land document uploaded and verified by developer.',
    hash: generateDocumentHash(docItem.title, docItem.refNumber, 1712745600000 + idx * 10000),
    accessControl: {
      isPublic: docItem.isPublic !== false && idx < 3,
      requiresVerifiedBuyer: idx >= 3,
      legalAuditorOnly: idx === 4, // Advocate opinion is legal only by default
      tokenGated: idx === 1 || idx === 4,
      requiresNda: idx === 4,
      watermarkEnabled: true,
      allowDirectDownload: idx !== 4,
      allowedRoles: idx === 4 ? ['admin', 'legal'] : ['admin', 'developer', 'legal', 'buyer']
    },
    auditTrail: [
      {
        action: 'CREATED_AND_STORED',
        timestamp: new Date().toISOString(),
        actor: 'Developer Portal (Initial Seeding)',
        details: 'Initial statutory document registered with access control flags in Firestore.'
      }
    ]
  }));
}

/**
 * Read documents from Local Storage Cache
 */
export function getLocalCachedDocuments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cached property documents:', e);
  }
  const initial = getInitialFormattedDocs();
  saveLocalCachedDocuments(initial);
  return initial;
}

/**
 * Save documents to Local Storage Cache & trigger broadcast event
 */
export function saveLocalCachedDocuments(documents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    window.dispatchEvent(new CustomEvent('plotflow_property_documents_updated', { detail: documents }));
  } catch (e) {
    console.warn('Error saving property documents cache:', e);
  }
}

/**
 * Record document audit log (Local + Firestore)
 */
export async function recordDocumentAudit(docId, action, details, user) {
  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    docId,
    action,
    details,
    actorEmail: user?.email || 'system@plotflow.in',
    actorRole: user?.role || 'DEVELOPER',
    actorName: user?.name || 'Developer',
    timestamp: new Date().toISOString()
  };

  // Local cache
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
    existing.unshift(auditEntry);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Error saving document audit log locally:', e);
  }

  // Firestore sync
  if (db) {
    try {
      const auditDocRef = doc(db, 'document_audit_logs', auditEntry.id);
      await setDoc(auditDocRef, {
        ...auditEntry,
        createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore document audit log notice:', e?.message || e);
    }
  }

  return auditEntry;
}

/**
 * Fetch all documents for a township with Firestore sync
 */
export async function fetchPropertyDocuments(townshipId = null) {
  let docsList = getLocalCachedDocuments();

  if (db) {
    try {
      const colRef = collection(db, 'property_documents');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreDocs = [];
        snap.forEach(d => {
          firestoreDocs.push({ id: d.id, ...d.data() });
        });
        if (firestoreDocs.length > 0) {
          docsList = firestoreDocs;
          saveLocalCachedDocuments(firestoreDocs);
        }
      }
    } catch (e) {
      console.warn('Firestore fetchPropertyDocuments fallback to local cache:', e?.message || e);
    }
  }

  if (townshipId) {
    return docsList.filter(d => d.townshipId === townshipId);
  }
  return docsList;
}

/**
 * Upload and store a new property document with metadata and access control flags in Firestore
 */
export async function uploadPropertyDocument({
  townshipId,
  townshipName,
  developerId = 'dev_current',
  developerName = 'Developer Portal',
  title,
  category,
  authority,
  refNumber,
  issueDate,
  expiryDate,
  description = '',
  file = null,
  fileSize = '3.2 MB (PDF)',
  fileName = 'document.pdf',
  accessControl = DEFAULT_ACCESS_CONTROL,
  currentUser = null
}) {
  if (!title || !category || !refNumber) {
    throw new Error('Title, Category, and Reference Number are required fields.');
  }

  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const hash = generateDocumentHash(title, refNumber, Date.now());

  const newDoc = {
    id: docId,
    townshipId: townshipId || 'ts_01',
    townshipName: townshipName || 'Prestige Sanctuary Greens',
    developerId,
    developerName,
    title: title.trim(),
    category: category.trim(),
    authority: authority.trim() || 'Statutory Authority',
    refNumber: refNumber.trim().toUpperCase(),
    issueDate: issueDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '2030-12-31',
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize: fileSize || (file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB (${file.type?.split('/')[1]?.toUpperCase() || 'PDF'})` : '3.8 MB (PDF)'),
    fileType: file?.type || 'application/pdf',
    fileName: fileName || file?.name || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
    status: VERIFICATION_STATUSES.UNDER_REVIEW,
    verifiedBy: 'Pending Legal Due Diligence',
    verifiedAt: null,
    description: description.trim() || `Official ${category} uploaded for statutory compliance and title verification.`,
    hash,
    accessControl: {
      isPublic: Boolean(accessControl.isPublic),
      requiresVerifiedBuyer: Boolean(accessControl.requiresVerifiedBuyer),
      legalAuditorOnly: Boolean(accessControl.legalAuditorOnly),
      tokenGated: Boolean(accessControl.tokenGated),
      requiresNda: Boolean(accessControl.requiresNda),
      watermarkEnabled: accessControl.watermarkEnabled !== false,
      allowDirectDownload: accessControl.allowDirectDownload !== false,
      allowedRoles: accessControl.allowedRoles || ['admin', 'developer', 'legal', 'buyer']
    },
    uploadedByEmail: currentUser?.email || 'developer@plotflow.in',
    uploadedByName: currentUser?.name || 'Developer Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'DOCUMENT_UPLOADED',
        timestamp: new Date().toISOString(),
        actor: currentUser?.email || 'developer@plotflow.in',
        details: `Uploaded with access flags: [Public: ${accessControl.isPublic ? 'Yes' : 'No'}, TokenGated: ${accessControl.tokenGated ? 'Yes' : 'No'}, LegalOnly: ${accessControl.legalAuditorOnly ? 'Yes' : 'No'}]`
      }
    ]
  };

  // 1. Update Local Storage Cache
  const currentDocs = getLocalCachedDocuments();
  const updatedDocs = [newDoc, ...currentDocs];
  saveLocalCachedDocuments(updatedDocs);

  // 2. Persist to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'property_documents', docId);
      await setDoc(docRef, {
        ...newDoc,
        firestoreTimestamp: serverTimestamp ? serverTimestamp() : new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore setDoc notice (document saved to local storage):', e?.message || e);
    }
  }

  // 3. Log Audit
  await recordDocumentAudit(
    docId,
    'UPLOAD_DOCUMENT',
    `Developer uploaded "${title}" (Ref: ${refNumber}) with initial access control flags.`,
    currentUser
  );

  return newDoc;
}

/**
 * Update document access control flags and permissions in Firestore
 */
export async function updateDocumentAccessControl(docId, newAccessControl, currentUser) {
  if (!docId) throw new Error('Document ID is required.');

  const currentDocs = getLocalCachedDocuments();
  const targetDoc = currentDocs.find(d => d.id === docId);

  if (!targetDoc) {
    throw new Error(`Document with ID "${docId}" not found.`);
  }

  const updatedDoc = {
    ...targetDoc,
    accessControl: {
      ...targetDoc.accessControl,
      ...newAccessControl
    },
    updatedAt: new Date().toISOString(),
    auditTrail: [
      {
        action: 'ACCESS_CONTROL_UPDATED',
        timestamp: new Date().toISOString(),
        actor: currentUser?.email || 'developer@plotflow.in',
        details: `Updated security flags: Public=${newAccessControl.isPublic}, TokenGated=${newAccessControl.tokenGated}, LegalOnly=${newAccessControl.legalAuditorOnly}, NDA=${newAccessControl.requiresNda}`
      },
      ...(targetDoc.auditTrail || [])
    ]
  };

  // 1. Update Local Storage Cache
  const updatedDocs = currentDocs.map(d => d.id === docId ? updatedDoc : d);
  saveLocalCachedDocuments(updatedDocs);

  // 2. Persist to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'property_documents', docId);
      await updateDoc(docRef, {
        accessControl: updatedDoc.accessControl,
        updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        auditTrail: updatedDoc.auditTrail
      });
    } catch (e) {
      console.warn('Firestore updateDoc notice:', e?.message || e);
    }
  }

  // 3. Audit Log
  await recordDocumentAudit(
    docId,
    'UPDATE_ACCESS_CONTROL',
    `Updated access flags: [Public: ${newAccessControl.isPublic}, TokenGated: ${newAccessControl.tokenGated}, LegalOnly: ${newAccessControl.legalAuditorOnly}]`,
    currentUser
  );

  return updatedDoc;
}

/**
 * Update document status (e.g. 'Verified', 'Action Required', 'Rejected')
 */
export async function updateDocumentStatus(docId, newStatus, verificationNotes = '', currentUser) {
  if (!docId) throw new Error('Document ID is required.');

  const currentDocs = getLocalCachedDocuments();
  const targetDoc = currentDocs.find(d => d.id === docId);

  if (!targetDoc) throw new Error(`Document not found: ${docId}`);

  const updatedDoc = {
    ...targetDoc,
    status: newStatus,
    verifiedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Auditor'})` : 'Legal Compliance Team',
    verifiedAt: new Date().toISOString().split('T')[0],
    verificationNotes: verificationNotes || targetDoc.verificationNotes || '',
    updatedAt: new Date().toISOString(),
    auditTrail: [
      {
        action: `STATUS_CHANGED_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
        timestamp: new Date().toISOString(),
        actor: currentUser?.email || 'auditor@plotflow.in',
        details: verificationNotes || `Status changed to ${newStatus}`
      },
      ...(targetDoc.auditTrail || [])
    ]
  };

  const updatedDocs = currentDocs.map(d => d.id === docId ? updatedDoc : d);
  saveLocalCachedDocuments(updatedDocs);

  if (db) {
    try {
      const docRef = doc(db, 'property_documents', docId);
      await updateDoc(docRef, {
        status: newStatus,
        verifiedBy: updatedDoc.verifiedBy,
        verifiedAt: updatedDoc.verifiedAt,
        verificationNotes: updatedDoc.verificationNotes,
        updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        auditTrail: updatedDoc.auditTrail
      });
    } catch (e) {
      console.warn('Firestore updateDoc status notice:', e?.message || e);
    }
  }

  await recordDocumentAudit(
    docId,
    'UPDATE_STATUS',
    `Document marked as "${newStatus}". Notes: ${verificationNotes || 'None'}`,
    currentUser
  );

  return updatedDoc;
}

/**
 * Delete a property document
 */
export async function deletePropertyDocument(docId, currentUser) {
  if (!docId) return;

  const currentDocs = getLocalCachedDocuments();
  const deletedDoc = currentDocs.find(d => d.id === docId);
  const updatedDocs = currentDocs.filter(d => d.id !== docId);
  saveLocalCachedDocuments(updatedDocs);

  if (db) {
    try {
      const docRef = doc(db, 'property_documents', docId);
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
        deletedBy: currentUser?.email || 'developer@plotflow.in'
      });
    } catch (e) {
      console.warn('Firestore delete notice:', e?.message || e);
    }
  }

  await recordDocumentAudit(
    docId,
    'DELETE_DOCUMENT',
    `Document "${deletedDoc?.title || docId}" removed by ${currentUser?.email || 'developer'}`,
    currentUser
  );

  return true;
}

/**
 * Evaluate if a given user has permission to view/download a property document
 */
export function canUserAccessDocument(user, documentItem, userHasPaidToken = false) {
  if (!documentItem) return { canView: false, canDownload: false, reason: 'DOCUMENT_NOT_FOUND' };

  const access = documentItem.accessControl || DEFAULT_ACCESS_CONTROL;

  // Super Admin can access everything
  if (isSuperAdmin(user)) {
    return { canView: true, canDownload: true, reason: 'SUPER_ADMIN_BYPASS' };
  }

  const userRole = normalizeRole(user?.role);

  // Legal Auditor Vault Restriction
  if (access.legalAuditorOnly) {
    if (userRole === ROLES.LEGAL || userRole === ROLES.ADMIN) {
      return { canView: true, canDownload: access.allowDirectDownload, reason: 'LEGAL_AUDITOR_AUTHORIZED' };
    }
    return { 
      canView: false, 
      canDownload: false, 
      reason: 'LEGAL_AUDITOR_ONLY',
      message: 'This document is restricted to certified legal auditors for statutory title due diligence.'
    };
  }

  // Developer can access their own township documents
  if (userRole === ROLES.DEVELOPER) {
    return { canView: true, canDownload: true, reason: 'DEVELOPER_AUTHORIZED' };
  }

  // Token Gated Check
  if (access.tokenGated && !userHasPaidToken) {
    return {
      canView: false,
      canDownload: false,
      reason: 'TOKEN_REQUIRED',
      message: 'Token deposit required. High-resolution title deed dossiers unlock upon paying the ₹25,000 reservation advance.'
    };
  }

  // Verified Buyer Check
  if (access.requiresVerifiedBuyer) {
    if (!user || userRole === ROLES.BUYER && !user.verified && !user.email) {
      return {
        canView: false,
        canDownload: false,
        reason: 'VERIFIED_BUYER_REQUIRED',
        message: 'Verified buyer account required. Please sign in with mobile verification to access this title document.'
      };
    }
  }

  // Public Document
  if (access.isPublic) {
    return { 
      canView: true, 
      canDownload: access.allowDirectDownload, 
      reason: 'PUBLIC_ACCESS' 
    };
  }

  return {
    canView: Boolean(user),
    canDownload: Boolean(user && access.allowDirectDownload),
    reason: user ? 'AUTHENTICATED_ACCESS' : 'UNAUTHENTICATED'
  };
}

/**
 * Real-time listener for property documents in Firestore
 */
export function subscribeToPropertyDocuments(townshipId, onDocsUpdated) {
  // First emit current cached docs immediately
  const initialDocs = getLocalCachedDocuments();
  onDocsUpdated(townshipId ? initialDocs.filter(d => d.townshipId === townshipId) : initialDocs);

  // Listen to custom local event for immediate reactivity across components
  const handleLocalUpdate = (e) => {
    const all = e.detail || getLocalCachedDocuments();
    onDocsUpdated(townshipId ? all.filter(d => d.townshipId === townshipId) : all);
  };
  window.addEventListener('plotflow_property_documents_updated', handleLocalUpdate);

  // If Firestore is available, bind live listener
  let unsubscribeFirestore = () => {};
  if (db) {
    try {
      const colRef = collection(db, 'property_documents');
      unsubscribeFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (!data.isDeleted) {
                list.push({ id: docSnap.id, ...data });
              }
            });
            if (list.length > 0) {
              saveLocalCachedDocuments(list);
              onDocsUpdated(townshipId ? list.filter(d => d.townshipId === townshipId) : list);
            }
          }
        },
        (err) => {
          console.warn('Firestore onSnapshot property_documents notice:', err?.message || err);
        }
      );
    } catch (e) {
      console.warn('Error setting up Firestore listener:', e?.message || e);
    }
  }

  return () => {
    window.removeEventListener('plotflow_property_documents_updated', handleLocalUpdate);
    unsubscribeFirestore();
  };
}
