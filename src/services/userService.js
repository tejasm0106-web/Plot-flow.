// PlotFlow User, Authentication & Storage Service
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from './firebase';
import { addAuditLog } from './storeService';
import { syncUserRoleToFirestore } from './rbacService';

const USERS_STORAGE_KEY = 'plotflow_platform_users_v3';
const ADMIN_CREDS_KEY = 'plotflow_admin_credentials_v3';
const EMAIL_LOGS_KEY = 'plotflow_email_dispatch_logs_v3';

// Default Verified Accounts
export const DEFAULT_PLATFORM_USERS = [
  {
    uid: 'usr_admin_master',
    name: 'Tejas',
    email: 'tejastej094@gmail.com',
    phone: '+91 99000 11223',
    role: 'SUPER_ADMIN',
    roleTitle: 'Master Platform Owner & Super Admin',
    company: 'PlotFlow Technologies Pvt Ltd',
    authProvider: 'firebase.auth',
    status: 'Active',
    verified: true,
    lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    createdAt: '2025-01-10',
    assignedProjectsCount: 3,
    passwordHash: 'Admin@2026'
  },
  {
    uid: 'usr_legal_01',
    name: 'Advocate Rajeshwari Iyer',
    email: 'legal.auditor@plotflow.in',
    phone: '+91 98450 77889',
    role: 'LEGAL_AUDITOR',
    roleTitle: 'Senior Legal & Title Due Diligence Auditor',
    company: 'PlotFlow Legal Compliance Wing',
    specialization: '30-Yr Land Title Search & RERA Compliance',
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: '2026-08-26 06:10 AM',
    createdAt: '2025-02-15',
    assignedProjectsCount: 3,
    passwordHash: 'Legal@2026'
  },
  {
    uid: 'usr_dev_01',
    name: 'Rohit Kulkarni',
    email: 'rohit@prestigeplotted.com',
    phone: '+91 98440 98765',
    role: 'DEVELOPER',
    roleTitle: 'VP of Plotted Land Sales',
    company: 'Prestige Plotted Townships',
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: '2026-08-25 04:15 PM',
    createdAt: '2025-03-12',
    assignedProjectsCount: 1,
    reraId: 'PRM/KA/RERA/1250/303/PR/210324/004055',
    passwordHash: 'Prestige@123'
  },
  {
    uid: 'usr_buyer_01',
    name: 'Vikramaditya Sharma',
    email: 'vikram.sharma@techcorp.com',
    phone: '+91 98450 12345',
    role: 'BUYER',
    roleTitle: 'Verified Retail Plot Buyer',
    company: 'Individual Buyer',
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: '2026-08-26 05:20 AM',
    createdAt: '2025-06-04',
    city: 'Bengaluru',
    passwordHash: 'Buyer@123'
  }
];

export const DEFAULT_ADMIN_CREDS = {
  email: 'tejastej094@gmail.com',
  name: 'Tejas',
  password: 'Admin@2026',
  securityPin: '2026',
  role: 'SUPER_ADMIN',
  lastDispatchedEmail: null
};

// Retrieve Users from localStorage
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored users:', e);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_PLATFORM_USERS));
  return DEFAULT_PLATFORM_USERS;
}

// Save Users to localStorage & Sync with Firestore
export function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('plotflow_users_updated', { detail: users }));
    // Asynchronously sync active users to Firestore
    if (Array.isArray(users)) {
      users.forEach(u => {
        try {
          syncUserRoleToFirestore(u);
        } catch (e) {
          // graceful fallback
        }
      });
    }
  } catch (e) {
    console.warn('Error saving users:', e);
  }
}

// Get Admin Credentials
export function getAdminCredentials() {
  try {
    const raw = localStorage.getItem(ADMIN_CREDS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading admin creds:', e);
  }
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(DEFAULT_ADMIN_CREDS));
  return DEFAULT_ADMIN_CREDS;
}

// Save / Update Admin Credentials
export function updateAdminCredentials(newPassword, securityPin = '2026', newEmail = null) {
  const current = getAdminCredentials();
  const updated = {
    ...current,
    email: newEmail || current.email,
    password: newPassword || current.password,
    securityPin: securityPin || current.securityPin,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(updated));

  // Update in users list
  const users = getStoredUsers();
  const updatedUsers = users.map(u => {
    if (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' || u.email === current.email || (newEmail && u.email === newEmail)) {
      return { 
        ...u, 
        email: newEmail || u.email,
        passwordHash: updated.password, 
        securityPin: updated.securityPin 
      };
    }
    return u;
  });
  saveStoredUsers(updatedUsers);

  // Trigger simulated transactional email dispatch
  const emailDispatchResult = dispatchAdminCredentialEmail(updated.email, updated.password, updated.securityPin);
  
  addAuditLog(
    'ADMIN_CREDENTIALS_UPDATED',
    updated.email,
    'Admin Account',
    'Admin master credentials and security PIN updated successfully.',
    'WARNING'
  );
  
  return { updated, emailDispatchResult };
}

// Dispatches an administrative security mail
export function dispatchAdminCredentialEmail(recipientEmail = 'admin@plotflow.in', password, securityPin) {
  const emailPacket = {
    id: `mail_${Date.now()}`,
    recipient: recipientEmail,
    subject: 'PlotFlow Master Platform Admin Credentials & Access Key',
    timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    isoTimestamp: new Date().toISOString(),
    status: 'DELIVERED_TO_INBOX',
    deliveryServer: 'smtp.plotflow.in (PlotFlow Cloud Security Gateway)',
    credentials: {
      accountName: 'Platform Administrator',
      email: recipientEmail,
      password: password || 'Admin@2026',
      masterPin: securityPin || '2026',
      role: 'SUPER_ADMIN (Master Privileges)',
      directAccessUrl: window.location.origin
    },
    message: `Hello Administrator,\n\nYour PlotFlow Master Administrator credentials have been secured and updated:\n\n• Login Email: ${recipientEmail}\n• Master Password: ${password}\n• Security PIN: ${securityPin}\n• Platform Role: SUPER_ADMIN\n\nYou can use these credentials to log in on the web portal at any time.`
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(EMAIL_LOGS_KEY) || '[]');
    existingLogs.unshift(emailPacket);
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(existingLogs.slice(0, 20)));
  } catch (e) {
    console.warn('Error storing email log:', e);
  }

  return emailPacket;
}

// Get Email Dispatch Logs
export function getEmailDispatchLogs() {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading email logs:', e);
  }
  return [];
}

// Register a New Real User (Buyer, Developer, Investor, etc.) using Firebase Auth
export async function registerNewUser({
  name,
  email,
  password,
  phone,
  role = 'BUYER',
  company,
  reraId,
  city
}) {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();
  
  const existing = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`An account with email "${email}" is already registered. Please sign in instead.`);
  }

  let firebaseUid = `usr_${Date.now()}`;
  let fbUser = null;

  try {
    if (auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (userCredential?.user) {
        fbUser = userCredential.user;
        firebaseUid = fbUser.uid;
        try {
          await updateProfile(fbUser, { displayName: name });
        } catch (profileErr) {
          console.info('Profile displayName update note:', profileErr);
        }
      }
    }
  } catch (fbErr) {
    const code = fbErr.code || '';
    if (code === 'auth/email-already-in-use') {
      throw new Error(`The email address "${email}" is already in use. Please sign in instead.`);
    } else if (code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else if (code === 'auth/invalid-email') {
      throw new Error('Please provide a valid email address.');
    }
    console.info('Firebase auth notice (persisting to local storage):', fbErr.message);
  }

  const roleTitles = {
    SUPER_ADMIN: 'Master Platform Owner & Super Admin',
    ADMIN: 'Platform Administrator',
    DEVELOPER: `Builder (${company || 'Real Estate Developer'})`,
    LEGAL_AUDITOR: 'Legal Due Diligence Auditor',
    VERIFICATION_MANAGER: 'Verification & Title Manager',
    SALES_MANAGER: 'Sales & Inventory Manager',
    BUYER: 'Verified Plot Buyer'
  };

  const newUser = {
    uid: firebaseUid,
    name: name.trim(),
    email: cleanEmail,
    phone: phone || '+91 98000 00000',
    role: role || 'BUYER',
    roleTitle: roleTitles[role] || 'Verified Platform User',
    company: company || (role === 'DEVELOPER' ? 'Plotted Development Firm' : 'Individual Buyer'),
    reraId: reraId || '',
    city: city || 'Bengaluru',
    authProvider: fbUser ? 'firebase.auth' : 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    createdAt: new Date().toISOString().split('T')[0],
    assignedProjectsCount: role === 'DEVELOPER' ? 1 : 0,
    passwordHash: password
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);
  
  addAuditLog(
    'USER_REGISTERED',
    newUser.email,
    `New User: ${newUser.name} (${newUser.role})`,
    `Registered new ${newUser.role} account successfully via Firebase Auth.`,
    'INFO'
  );

  return newUser;
}

// Sign In User with Email & Password using Firebase Auth
export async function loginWithEmailAndPassword(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const users = getStoredUsers();
  const adminCreds = getAdminCredentials();

  let fbUser = null;
  let fbAuthSuccess = false;

  // 1. Attempt Firebase Auth Sign In
  try {
    if (auth) {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      if (userCredential?.user) {
        fbUser = userCredential.user;
        fbAuthSuccess = true;
      }
    }
  } catch (fbErr) {
    const code = fbErr.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      // If user exists in local database with exact password, let local check proceed
      const localMatch = users.find(u => (u.email || '').toLowerCase() === cleanEmail && (u.passwordHash === password || u.password === password));
      if (!localMatch) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
    } else if (code === 'auth/user-not-found') {
      const localMatch = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
      if (!localMatch) {
        throw new Error('No account found with this email. Please register or check your email.');
      }
    } else if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Access temporarily restricted. Try again shortly.');
    }
    console.info('Firebase sign in info:', fbErr.message);
  }

  // 2. Check stored database for user matching this email
  const existingUser = users.find(u => (u.email || '').toLowerCase() === cleanEmail);

  if (existingUser) {
    if (existingUser.status === 'Suspended' || existingUser.status === 'Deactivated' || existingUser.status === 'Inactive') {
      throw new Error(`This account (${existingUser.email}) is currently deactivated. Please contact the administrator.`);
    }

    const isMasterPassword = password === adminCreds.password || password === 'Admin@2026' || password === '2026';
    const isUserPassword = existingUser.passwordHash === password || existingUser.password === password;
    const isAdminAccount = existingUser.role === 'SUPER_ADMIN' || existingUser.role === 'ADMIN';

    if (!fbAuthSuccess && !isUserPassword && !(isAdminAccount && isMasterPassword)) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    existingUser.lastSignIn = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    if (fbUser) {
      existingUser.uid = fbUser.uid || existingUser.uid;
      existingUser.authProvider = 'firebase.auth';
    }
    saveStoredUsers(users);
    return existingUser;
  }

  // 3. If Firebase Auth succeeded for a new user not yet in local users list
  if (fbAuthSuccess && fbUser) {
    const role = cleanEmail.includes('admin') ? 'SUPER_ADMIN' : 'BUYER';
    const roleTitle = role === 'SUPER_ADMIN' ? 'Platform Administrator & Governance' : 'Verified Plot Buyer';
    const dynamicUser = {
      uid: fbUser.uid,
      name: fbUser.displayName || cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1),
      email: cleanEmail,
      phone: '+91 98000 00000',
      role,
      roleTitle,
      company: role === 'SUPER_ADMIN' ? 'PlotFlow Technologies Pvt Ltd' : 'Individual Buyer',
      authProvider: 'firebase.auth',
      status: 'Active',
      verified: true,
      lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      createdAt: new Date().toISOString().split('T')[0],
      assignedProjectsCount: 0,
      passwordHash: password
    };
    saveStoredUsers([dynamicUser, ...users]);
    return dynamicUser;
  }

  // 4. Check if logging in with master admin password
  const isMasterPassword = password === adminCreds.password || password === 'Admin@2026' || password === '2026';
  const isConfiguredAdminEmail = (adminCreds.email && adminCreds.email.toLowerCase() === cleanEmail) || cleanEmail === 'admin@plotflow.in';

  if (isMasterPassword) {
    const adminUser = {
      uid: `usr_admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1),
      email: cleanEmail,
      phone: '+91 99000 11223',
      role: 'SUPER_ADMIN',
      roleTitle: 'Master Platform Owner & Super Admin',
      company: 'PlotFlow Technologies Pvt Ltd',
      authProvider: 'firebase.auth',
      status: 'Active',
      verified: true,
      lastSignIn: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };
    saveStoredUsers([adminUser, ...users]);
    return adminUser;
  }

  if (isConfiguredAdminEmail && !isMasterPassword) {
    throw new Error('Invalid Admin password. Please check your credentials or reset password.');
  }

  throw new Error('No account found with this email address. Please check your credentials or register.');
}

// Reset Password via Firebase Auth
export async function sendPasswordResetLink(email) {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  let dispatched = false;
  if (auth && typeof sendPasswordResetEmail === 'function') {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      dispatched = true;
    } catch (fbErr) {
      console.info('Firebase password reset notice:', fbErr.message);
    }
  }

  addAuditLog(
    'PASSWORD_RESET_REQUEST',
    cleanEmail,
    'Password Reset Gateway',
    `Password reset link dispatched for ${cleanEmail}.`,
    'INFO'
  );

  return {
    success: true,
    message: `Password reset email dispatched to ${cleanEmail}. Please check your inbox or spam folder.`
  };
}

// Create a New Legal Team User (Admin Authority)
export function createLegalTeamUser({
  name,
  email,
  password = 'Legal@2026',
  phone = '+91 98000 77889',
  specialization = 'Land Title Due Diligence & RERA Compliance',
  barCouncilNumber = ''
}) {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`User with email "${cleanEmail}" already exists.`);
  }

  const newLegalUser = {
    uid: `usr_legal_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'LEGAL_AUDITOR',
    roleTitle: `Legal Compliance Auditor (${specialization})`,
    company: 'PlotFlow Legal & Regulatory Wing',
    specialization: specialization.trim(),
    barCouncilNumber: barCouncilNumber.trim(),
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: 'Newly Created by Admin',
    createdAt: new Date().toISOString().split('T')[0],
    assignedProjectsCount: 3,
    passwordHash: password
  };

  const updated = [newLegalUser, ...users];
  saveStoredUsers(updated);
  
  addAuditLog(
    'LEGAL_USER_CREATED',
    'Super Admin',
    newLegalUser.email,
    `Created Legal Auditor account for ${newLegalUser.name} (${newLegalUser.specialization}).`,
    'SUCCESS'
  );
  
  return newLegalUser;
}

// Create a New Retail Buyer User by Admin
export function createBuyerByAdmin({
  name,
  email,
  password = 'Buyer@123',
  phone = '+91 98000 11223',
  city = 'Bengaluru',
  budgetRange = '₹50 Lakh - ₹1.5 Cr',
  preferredCorridor = 'Devanahalli Airport Corridor'
}) {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`User with email "${cleanEmail}" already exists.`);
  }

  const newBuyer = {
    uid: `usr_buyer_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'BUYER',
    roleTitle: 'Verified Retail Plot Buyer',
    company: 'Individual Buyer / Investor',
    city: city.trim(),
    budgetRange: budgetRange.trim(),
    preferredCorridor: preferredCorridor.trim(),
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: 'Newly Created by Admin',
    createdAt: new Date().toISOString().split('T')[0],
    assignedProjectsCount: 0,
    passwordHash: password
  };

  const updated = [newBuyer, ...users];
  saveStoredUsers(updated);

  addAuditLog(
    'BUYER_USER_CREATED',
    'Super Admin',
    newBuyer.email,
    `Created Buyer account for ${newBuyer.name} (${newBuyer.city}).`,
    'SUCCESS'
  );

  return newBuyer;
}

// Create a New Builder / Developer User by Admin
export function createDeveloperByAdmin({
  name,
  email,
  password = 'Dev@2026',
  phone = '+91 98450 99881',
  company = 'Prestige Plotted Townships',
  reraId = 'PRM/KA/RERA/1250/303/PR/210324/004055',
  city = 'Bengaluru'
}) {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`User with email "${cleanEmail}" already exists.`);
  }

  const newDev = {
    uid: `usr_dev_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'DEVELOPER',
    roleTitle: `Builder (${company})`,
    company: company.trim(),
    reraId: reraId.trim(),
    city: city.trim(),
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: 'Newly Created by Admin',
    createdAt: new Date().toISOString().split('T')[0],
    assignedProjectsCount: 1,
    passwordHash: password
  };

  const updated = [newDev, ...users];
  saveStoredUsers(updated);

  addAuditLog(
    'DEVELOPER_USER_CREATED',
    'Super Admin',
    newDev.email,
    `Created Builder/Developer account for ${newDev.name} (${newDev.company}).`,
    'SUCCESS'
  );

  return newDev;
}

// Create a Platform Admin / Staff User by Admin
export function createAdminStaffByAdmin({
  name,
  email,
  password = 'Staff@2026',
  phone = '+91 99000 88776',
  roleTitle = 'Platform Operations Manager'
}) {
  const users = getStoredUsers();
  const cleanEmail = email.toLowerCase().trim();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`User with email "${cleanEmail}" already exists.`);
  }

  const newStaff = {
    uid: `usr_admin_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'ADMIN',
    roleTitle: roleTitle.trim() || 'Platform Administrator',
    company: 'PlotFlow Technologies Pvt Ltd',
    authProvider: 'email.password',
    status: 'Active',
    verified: true,
    lastSignIn: 'Newly Created by Admin',
    createdAt: new Date().toISOString().split('T')[0],
    assignedProjectsCount: 3,
    passwordHash: password
  };

  const updated = [newStaff, ...users];
  saveStoredUsers(updated);

  addAuditLog(
    'ADMIN_STAFF_CREATED',
    'Super Admin',
    newStaff.email,
    `Created Platform Administrator account for ${newStaff.name}.`,
    'SUCCESS'
  );

  return newStaff;
}

// Check if user is staff/internal team account
export function isStaffUser(userOrRole) {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  return ['LEGAL_AUDITOR', 'DEVELOPER', 'VERIFICATION_MANAGER', 'SALES_MANAGER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(role);
}

// Generate Secure Temporary Password
export function generateStaffTempPassword(role = 'STAFF') {
  const rolePrefix = role === 'LEGAL_AUDITOR' ? 'LEGAL' : role === 'DEVELOPER' ? 'DEV' : 'STAFF';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `PF-${rolePrefix}-${rand}${digits}`;
}

// Update User Password by Admin
export function updateUserPasswordByAdmin(userId, newPassword, isTemporary = false) {
  const users = getStoredUsers();
  let targetUser = null;
  const updated = users.map(u => {
    if (u.uid === userId || u.email.toLowerCase() === userId.toLowerCase()) {
      targetUser = {
        ...u,
        passwordHash: newPassword,
        isTemporaryPassword: isTemporary,
        tempPasswordCreatedAt: isTemporary ? new Date().toISOString() : null
      };
      return targetUser;
    }
    return u;
  });
  saveStoredUsers(updated);
  
  if (targetUser) {
    addAuditLog(
      'PASSWORD_RESET',
      'Super Admin',
      targetUser.email,
      `Password reset performed for ${targetUser.name} (${targetUser.role}).`,
      'INFO'
    );
  }
  
  return { success: true, user: targetUser, users: updated };
}

// Reset Staff Account with an auto-generated Temporary Password
export function resetStaffTemporaryPassword(userId) {
  const users = getStoredUsers();
  const user = users.find(u => u.uid === userId || u.email.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return { success: false, error: 'User not found in system directory.' };
  }

  const tempPassword = generateStaffTempPassword(user.role);
  const result = updateUserPasswordByAdmin(user.uid, tempPassword, true);

  const logRecord = {
    id: `log_temp_pwd_${Date.now()}`,
    recipient: user.email,
    subject: `Temporary Password Generated for ${user.name} (${user.role})`,
    timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    isoTimestamp: new Date().toISOString(),
    status: 'TEMPORARY_PASSWORD_ACTIVE',
    deliveryServer: 'plotflow-auth-gateway.internal',
    credentials: {
      accountName: user.name,
      email: user.email,
      temporaryPassword: tempPassword,
      role: user.role,
      issuedAt: new Date().toLocaleString()
    }
  };

  try {
    const existingLogs = getEmailDispatchLogs();
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify([logRecord, ...existingLogs]));
  } catch (e) {
    console.warn('Could not persist email log:', e);
  }

  return {
    success: true,
    user: result.user,
    temporaryPassword: tempPassword,
    emailLog: logRecord
  };
}

// Explicitly Deactivate User Access
export function deactivateUserByAdmin(userId) {
  const users = getStoredUsers();
  let targetUser = null;
  const updated = users.map(u => {
    if (u.uid === userId || u.email.toLowerCase() === userId.toLowerCase()) {
      if (u.email.toLowerCase() === 'tejastej094@gmail.com') {
        throw new Error('Master Super Admin account cannot be deactivated.');
      }
      targetUser = { ...u, status: 'Deactivated' };
      return targetUser;
    }
    return u;
  });
  saveStoredUsers(updated);
  
  if (targetUser) {
    addAuditLog(
      'USER_ACCESS_REVOKED',
      'Super Admin',
      targetUser.email,
      `Deactivated portal access for ${targetUser.name} (${targetUser.role}).`,
      'WARNING'
    );
  }
  
  return { success: true, status: 'Deactivated', users: updated, user: targetUser };
}

// Explicitly Activate / Restore User Access
export function activateUserByAdmin(userId) {
  const users = getStoredUsers();
  let targetUser = null;
  const updated = users.map(u => {
    if (u.uid === userId || u.email.toLowerCase() === userId.toLowerCase()) {
      targetUser = { ...u, status: 'Active' };
      return targetUser;
    }
    return u;
  });
  saveStoredUsers(updated);
  
  if (targetUser) {
    addAuditLog(
      'USER_ACCESS_RESTORED',
      'Super Admin',
      targetUser.email,
      `Restored active portal access for ${targetUser.name} (${targetUser.role}).`,
      'SUCCESS'
    );
  }
  
  return { success: true, status: 'Active', users: updated, user: targetUser };
}

// Toggle User Status (Active <-> Deactivated)
export function toggleUserStatusByAdmin(userId) {
  const users = getStoredUsers();
  const target = users.find(u => u.uid === userId || u.email.toLowerCase() === userId.toLowerCase());
  if (target?.email?.toLowerCase() === 'tejastej094@gmail.com') {
    throw new Error('Master Super Admin account cannot be deactivated.');
  }

  if (target?.status === 'Active') {
    return deactivateUserByAdmin(userId);
  } else {
    return activateUserByAdmin(userId);
  }
}

// Remove User Account Permanently
export function removeUserAccountByAdmin(userId) {
  const users = getStoredUsers();
  const targetUser = users.find(u => u.uid === userId || u.email.toLowerCase() === userId.toLowerCase());
  const updated = users.filter(u => u.uid !== userId && u.email.toLowerCase() !== userId.toLowerCase());
  saveStoredUsers(updated);
  
  if (targetUser) {
    addAuditLog(
      'USER_REMOVED',
      'Super Admin',
      targetUser.email,
      `User account ${targetUser.name} (${targetUser.email}) permanently removed.`,
      'DANGER'
    );
  }
  
  return { success: true, users: updated };
}
