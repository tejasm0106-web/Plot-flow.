// PlotFlow Role-Based Access Control (RBAC) System with Firestore
import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from './firebase';

/**
 * Standard Canonical Roles
 */
export const ROLES = {
  ADMIN: 'admin',
  LEGAL: 'legal',
  BUYER: 'buyer',
  DEVELOPER: 'developer'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Super Administrator / Admin',
  [ROLES.LEGAL]: 'Legal Due Diligence Auditor',
  [ROLES.BUYER]: 'Retail Plot Buyer & Investor',
  [ROLES.DEVELOPER]: 'Builder & Land Developer'
};

export const PORTALS = {
  ADMIN: 'admin',
  LEGAL: 'legal',
  DEVELOPER: 'developer',
  MAIN: 'main'
};

/**
 * Normalizes any role string (e.g. 'SUPER_ADMIN', 'LEGAL_AUDITOR') to canonical:
 * 'admin' | 'legal' | 'buyer' | 'developer'
 */
export function normalizeRole(role) {
  if (!role) return ROLES.BUYER;
  const upper = String(role).trim().toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return ROLES.ADMIN;
  if (upper === 'LEGAL_AUDITOR' || upper === 'LEGAL' || upper === 'AUDITOR' || upper === 'ADVOCATE') return ROLES.LEGAL;
  if (upper === 'DEVELOPER' || upper === 'BUILDER' || upper === 'PROMOTER') return ROLES.DEVELOPER;
  return ROLES.BUYER;
}

/**
 * Extract normalized role from a user object or string
 */
export function getUserRole(user) {
  if (!user) return ROLES.BUYER;
  if (typeof user === 'string') return normalizeRole(user);
  return normalizeRole(user.role);
}

/**
 * Checks if a user's account is currently active (not deactivated)
 */
export function isAccountActive(user) {
  if (!user) return false;
  if (user.status === 'Deactivated' || user.active === false) return false;
  return true;
}

/**
 * Checks if a user is the primary super admin
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  if (user.email === 'tejastej094@gmail.com') return true;
  const upper = String(user.role || '').toUpperCase();
  return upper === 'SUPER_ADMIN';
}

/**
 * Checks if user has a specific required role
 */
export function hasRole(user, requiredRole) {
  if (!user) return false;
  if (!isAccountActive(user)) return false;
  const userNorm = getUserRole(user);
  const reqNorm = normalizeRole(requiredRole);

  // Master Admin can access everything
  if (userNorm === ROLES.ADMIN) return true;
  return userNorm === reqNorm;
}

/**
 * Checks if user has any of the allowed roles
 */
export function hasAnyRole(user, allowedRoles = []) {
  if (!user) return false;
  if (!isAccountActive(user)) return false;
  const userNorm = getUserRole(user);
  if (userNorm === ROLES.ADMIN) return true; // Admin bypass

  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  return normalizedAllowed.includes(userNorm);
}

/**
 * Portal Access Policy Gatekeeper:
 * - Admin Portal: Requires 'admin'
 * - Legal Portal: Requires 'legal' (or 'admin')
 * - Developer Portal: Requires 'developer' (or 'admin')
 * - Main / Buyer Marketplace: Accessible to all active users
 */
export function canAccessPortal(user, targetPortal) {
  if (!user) return false;
  if (!isAccountActive(user)) return false;

  const userNorm = getUserRole(user);
  const portalKey = String(targetPortal).toLowerCase();

  switch (portalKey) {
    case PORTALS.ADMIN:
      // Only Admin / Super Admin
      return userNorm === ROLES.ADMIN;

    case PORTALS.LEGAL:
      // Legal team or Admin
      return userNorm === ROLES.LEGAL || userNorm === ROLES.ADMIN;

    case PORTALS.DEVELOPER:
      // Developer or Admin
      return userNorm === ROLES.DEVELOPER || userNorm === ROLES.ADMIN;

    case PORTALS.MAIN:
    default:
      // Open to all registered roles
      return true;
  }
}

/**
 * Navigation View Route Gatekeeper:
 * Checks if current user is authorized to open a specific screen/view.
 */
export function canAccessView(user, viewName) {
  if (!user) return true; // Public landing allowed
  if (!isAccountActive(user)) return false;

  const userNorm = getUserRole(user);

  if (viewName === 'admin' || viewName === 'admin-panel') {
    return userNorm === ROLES.ADMIN;
  }
  if (viewName === 'legal' || viewName === 'legal-audit') {
    return userNorm === ROLES.LEGAL || userNorm === ROLES.ADMIN;
  }
  if (viewName === 'developer-portal') {
    return userNorm === ROLES.DEVELOPER || userNorm === ROLES.ADMIN;
  }

  return true;
}

/**
 * Detailed Access Evaluation with human-friendly diagnostic feedback
 */
export function evaluateAccess(user, targetPortalOrView) {
  if (!user) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      message: 'Please sign in with authorized credentials to access this portal.',
      requiredRoles: [targetPortalOrView === 'admin' ? ROLES.ADMIN : ROLES.LEGAL]
    };
  }

  if (!isAccountActive(user)) {
    return {
      allowed: false,
      reason: 'DEACTIVATED',
      message: `Account "${user.email}" has been deactivated by the Super Administrator. Access is blocked across all portals.`,
      userRole: getUserRole(user)
    };
  }

  const allowed = canAccessPortal(user, targetPortalOrView) && canAccessView(user, targetPortalOrView);
  const userNorm = getUserRole(user);

  let requiredRoles = [];
  if (targetPortalOrView === 'admin' || targetPortalOrView === 'admin-panel') {
    requiredRoles = [ROLES.ADMIN];
  } else if (targetPortalOrView === 'legal' || targetPortalOrView === 'legal-audit') {
    requiredRoles = [ROLES.LEGAL, ROLES.ADMIN];
  } else if (targetPortalOrView === 'developer' || targetPortalOrView === 'developer-portal') {
    requiredRoles = [ROLES.DEVELOPER, ROLES.ADMIN];
  }

  if (!allowed) {
    return {
      allowed: false,
      reason: 'FORBIDDEN_ROLE',
      message: `Access Denied: Your account role is "${ROLE_LABELS[userNorm] || userNorm}", but this portal requires "${requiredRoles.map(r => ROLE_LABELS[r] || r).join(' or ')}" privileges.`,
      userRole: userNorm,
      requiredRoles
    };
  }

  return {
    allowed: true,
    reason: 'AUTHORIZED',
    message: `Authorized as ${ROLE_LABELS[userNorm] || userNorm}`,
    userRole: userNorm
  };
}

/* ========================================================================== */
/* FIRESTORE RBAC INTEGRATION                                                 */
/* ========================================================================== */

/**
 * Fetch a user's authoritative role document from Firestore collection: 'users/{uid}'
 */
export async function fetchUserRoleFromFirestore(uid) {
  if (!uid) return null;
  if (!db) {
    console.warn('Firestore not initialized, using local fallback for user role');
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        ...data,
        normalizedRole: normalizeRole(data.role),
        status: data.status || 'Active'
      };
    }
  } catch (error) {
    console.warn('Firestore getDoc warning (falling back gracefully):', error?.message || error);
  }
  return null;
}

/**
 * Synchronize a user's role and RBAC metadata to Firestore 'users/{uid}'
 */
export async function syncUserRoleToFirestore(user) {
  if (!user || (!user.uid && !user.id && !user.email)) return null;
  const uid = user.uid || user.id || user.email.replace(/[^a-zA-Z0-9]/g, '_');
  const normalizedRole = normalizeRole(user.role);

  const payload = {
    uid,
    name: user.name || 'Platform User',
    email: user.email,
    role: user.role || (normalizedRole === ROLES.ADMIN ? 'SUPER_ADMIN' : normalizedRole.toUpperCase()),
    normalizedRole,
    status: user.status || 'Active',
    company: user.company || '',
    phone: user.phone || '',
    specialization: user.specialization || '',
    barCouncilNumber: user.barCouncilNumber || '',
    reraId: user.reraId || '',
    updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
  };

  if (!db) return payload;

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, payload, { merge: true });
    return payload;
  } catch (error) {
    console.warn('Firestore setDoc notice (saved locally):', error?.message || error);
    return payload;
  }
}

/**
 * Update a user's role in Firestore
 */
export async function updateUserRoleInFirestore(uid, newRole) {
  if (!uid || !newRole) return;
  const normalizedRole = normalizeRole(newRole);

  if (db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        role: newRole,
        normalizedRole,
        updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
      });
    } catch (error) {
      console.warn('Firestore updateDoc error:', error?.message || error);
    }
  }
}

/**
 * Real-time listener for Firestore user role changes (Live RBAC Enforcement)
 */
export function subscribeToUserRbac(uid, onRoleChanged) {
  if (!uid || !db) return () => {};

  try {
    const userDocRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onRoleChanged({
            ...data,
            normalizedRole: normalizeRole(data.role),
            status: data.status || 'Active'
          });
        }
      },
      (err) => {
        console.warn('Firestore onSnapshot notice:', err?.message || err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToUserRbac listener error:', err?.message || err);
    return () => {};
  }
}
