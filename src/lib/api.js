const STORAGE_KEYS = {
  USERS: "cg_users",
  CURRENT_USER: "cg_current_user",
  ALERTS: "cg_alerts",
  SAFE_WALKS: "cg_safe_walks",
  INCIDENTS: "cg_incidents",
  GUARDIANS: "cg_guardians",
  BROADCASTS: "cg_broadcasts",
  NOTIFICATIONS: "cg_notifications",
  SETTINGS: "cg_settings",
  PASSWORDS: "cg_passwords",
  SECURITY_IDS: "cg_security_ids",
};

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Security IDs ──
function generateSecurityCode() {
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
  return `KNS${digits}`;
}

function seedSecurityIds() {
  const existing = getFromStorage(STORAGE_KEYS.SECURITY_IDS, []);
  if (existing.length === 0) {
    const initial = Array.from({ length: 10 }, () => ({
      id: generateId(),
      code: generateSecurityCode(),
      used: false,
      created_at: new Date().toISOString(),
    }));
    saveToStorage(STORAGE_KEYS.SECURITY_IDS, initial);
  }
}

export function getSecurityIds() {
  seedSecurityIds();
  return getFromStorage(STORAGE_KEYS.SECURITY_IDS, []);
}

export function generateNewSecurityIds(count = 5) {
  const existing = getFromStorage(STORAGE_KEYS.SECURITY_IDS, []);
  const existingCodes = new Set(existing.map((r) => r.code));
  const newIds = [];
  let attempts = 0;
  while (newIds.length < count && attempts < 100) {
    const code = generateSecurityCode();
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      newIds.push({ id: generateId(), code, used: false, created_at: new Date().toISOString() });
    }
    attempts++;
  }
  saveToStorage(STORAGE_KEYS.SECURITY_IDS, [...existing, ...newIds]);
  return newIds;
}

export function validateSecurityId(code) {
  const ids = getSecurityIds();
  const record = ids.find((r) => r.code === code.toUpperCase().trim());
  if (!record) return { valid: false, error: "Invalid Security ID. Contact your administrator." };
  if (record.used) return { valid: false, error: "This Security ID has already been claimed." };
  return { valid: true };
}

export function claimSecurityId(code, userId, userName) {
  const ids = getFromStorage(STORAGE_KEYS.SECURITY_IDS, []);
  const idx = ids.findIndex((r) => r.code === code.toUpperCase().trim());
  if (idx !== -1) {
    ids[idx].used = true;
    ids[idx].used_by = userId;
    ids[idx].used_by_name = userName;
    ids[idx].claimed_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.SECURITY_IDS, ids);
  }
}

// ── Demo Accounts ──
const DEMO_ACCOUNTS = [
  { email: "student@demo.com", password: "demo123", full_name: "Demo Student", student_id: "20230001", phone: "+233241000001", role: "student" },
  { email: "security@demo.com", password: "demo123", full_name: "Demo Security", student_id: "", phone: "+233241000002", role: "security" },
  { email: "guardian@demo.com", password: "demo123", full_name: "Demo Guardian", student_id: "", phone: "+233241000003", role: "guardian" },
];

export function seedDemoAccounts() {
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  const passwords = getFromStorage(STORAGE_KEYS.PASSWORDS, {});
  let seeded = false;
  DEMO_ACCOUNTS.forEach((demo) => {
    if (!users.find((u) => u.email === demo.email)) {
      users.push({
        id: generateId(),
        email: demo.email,
        full_name: demo.full_name,
        student_id: demo.student_id,
        phone: demo.phone,
        role: demo.role,
        created_at: new Date().toISOString(),
      });
      passwords[demo.email] = demo.password;
      seeded = true;
    }
  });
  if (seeded) {
    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.PASSWORDS, passwords);
  }
}

export function getDemoAccounts() {
  return DEMO_ACCOUNTS.map(({ email, password, full_name, role }) => ({ email, password, full_name, role }));
}

// ── Auth ──
export function registerUser(email, password, full_name, student_id, phone, role = "student", security_code) {
  if (role === "security") {
    if (!security_code) return { success: false, error: "Security ID is required for security personnel." };
    const validation = validateSecurityId(security_code);
    if (!validation.valid) return { success: false, error: validation.error };
  }
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "Email already registered" };
  }
  const user = {
    id: generateId(),
    email,
    full_name,
    student_id,
    phone,
    role,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  const passwords = getFromStorage(STORAGE_KEYS.PASSWORDS, {});
  passwords[email] = password;
  saveToStorage(STORAGE_KEYS.PASSWORDS, passwords);
  if (role === "security" && security_code) {
    claimSecurityId(security_code, user.id, full_name);
  }
  return { success: true, user };
}

export function loginUser(email, password) {
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  const user = users.find((u) => u.email === email);
  if (!user) return { success: false, error: "User not found" };
  const passwords = getFromStorage(STORAGE_KEYS.PASSWORDS, {});
  if (!passwords[email] || passwords[email] !== password) {
    return { success: false, error: "Invalid password" };
  }
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  return { success: true, user };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser() {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
}

export function getAllUsers() {
  return getFromStorage(STORAGE_KEYS.USERS, []);
}

export function updateUser(userId, updates) {
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, users);
    const current = getCurrentUser();
    if (current?.id === userId) saveToStorage(STORAGE_KEYS.CURRENT_USER, users[idx]);
  }
}

export function deleteUser(userId) {
  const users = getFromStorage(STORAGE_KEYS.USERS, []);
  saveToStorage(STORAGE_KEYS.USERS, users.filter((u) => u.id !== userId));
}

// ── Settings ──
export function getUserSettings(userId) {
  const all = getFromStorage(STORAGE_KEYS.SETTINGS, []);
  return all.find((s) => s.user_id === userId) || {
    user_id: userId,
    notifications_sos: true,
    notifications_incidents: true,
    notifications_broadcasts: true,
    location_sharing: true,
    dark_mode: false,
    mute_non_emergency: false,
  };
}

export function saveUserSettings(settings) {
  const all = getFromStorage(STORAGE_KEYS.SETTINGS, []);
  const idx = all.findIndex((s) => s.user_id === settings.user_id);
  if (idx !== -1) all[idx] = settings;
  else all.push(settings);
  saveToStorage(STORAGE_KEYS.SETTINGS, all);
}

// ── SOS Alerts ──
export function createAlert(userId, userName, userPhone, alertType, severity, latitude, longitude, message) {
  const alert = {
    id: generateId(), user_id: userId, user_name: userName, user_phone: userPhone,
    alert_type: alertType, severity, message, latitude, longitude,
    status: "pending", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  const alerts = getFromStorage(STORAGE_KEYS.ALERTS, []);
  alerts.unshift(alert);
  saveToStorage(STORAGE_KEYS.ALERTS, alerts);
  addNotification("all-security", "New SOS Alert", `${userName} triggered a ${alertType} alert`, "sos");
  return alert;
}

export function getAlerts() {
  return getFromStorage(STORAGE_KEYS.ALERTS, []).filter((a) => !a.archived);
}

export function getUserAlerts(userId) {
  return getAlerts().filter((a) => a.user_id === userId);
}

export function updateAlertStatus(alertId, status, responderId, responderName) {
  const alerts = getFromStorage(STORAGE_KEYS.ALERTS, []);
  const idx = alerts.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    alerts[idx].status = status;
    alerts[idx].updated_at = new Date().toISOString();
    if (responderId) alerts[idx].responder_id = responderId;
    if (responderName) alerts[idx].responder_name = responderName;
    if (status === "resolved") {
      alerts[idx].archived = true;
      alerts[idx].archived_at = new Date().toISOString();
    }
    saveToStorage(STORAGE_KEYS.ALERTS, alerts);
    addNotification(alerts[idx].user_id, "Alert Update", `Your alert status changed to: ${status}`, "sos");
  }
}

// ── Safe Walk ──
export function createSafeWalk(userId, userName, destination, latitude, longitude, sharedWith, durationMinutes = 30) {
  const session = {
    id: generateId(), user_id: userId, user_name: userName, destination, latitude, longitude,
    status: "active", shared_with: sharedWith,
    checkin_deadline: new Date(Date.now() + durationMinutes * 60000).toISOString(),
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  const sessions = getFromStorage(STORAGE_KEYS.SAFE_WALKS, []);
  sessions.unshift(session);
  saveToStorage(STORAGE_KEYS.SAFE_WALKS, sessions);
  sharedWith.forEach((gId) => {
    addNotification(gId, "Safe Walk Started", `${userName} started walking to ${destination}`, "safewalk");
  });
  return session;
}

export function getSafeWalks() {
  return getFromStorage(STORAGE_KEYS.SAFE_WALKS, []);
}

export function getUserSafeWalks(userId) {
  return getSafeWalks().filter((s) => s.user_id === userId);
}

export function updateSafeWalkStatus(sessionId, status) {
  const sessions = getFromStorage(STORAGE_KEYS.SAFE_WALKS, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].status = status;
    sessions[idx].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.SAFE_WALKS, sessions);
    if (status === "completed") {
      sessions[idx].shared_with.forEach((gId) => {
        addNotification(gId, "Safe Arrival", `${sessions[idx].user_name} has checked in safely`, "safewalk");
      });
    }
  }
}

export function updateSafeWalkLocation(sessionId, latitude, longitude) {
  const sessions = getFromStorage(STORAGE_KEYS.SAFE_WALKS, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].latitude = latitude;
    sessions[idx].longitude = longitude;
    sessions[idx].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.SAFE_WALKS, sessions);
  }
}

// ── Incidents ──
export function createIncident(userId, userName, title, description, severity = "medium", locationDescription, latitude, longitude, imageUrl) {
  const incident = {
    id: generateId(), user_id: userId, user_name: userName, title, description,
    location_description: locationDescription, latitude, longitude, image_url: imageUrl,
    status: "pending", severity, created_at: new Date().toISOString(),
  };
  const incidents = getFromStorage(STORAGE_KEYS.INCIDENTS, []);
  incidents.unshift(incident);
  saveToStorage(STORAGE_KEYS.INCIDENTS, incidents);
  addNotification("all-security", "New Incident Report", `${userName} reported: ${title}`, "incident");
  return incident;
}

export function getIncidents() {
  return getFromStorage(STORAGE_KEYS.INCIDENTS, []);
}

export function getUserIncidents(userId) {
  return getIncidents().filter((i) => i.user_id === userId);
}

export function updateIncidentStatus(incidentId, status) {
  const incidents = getFromStorage(STORAGE_KEYS.INCIDENTS, []);
  const idx = incidents.findIndex((i) => i.id === incidentId);
  if (idx !== -1) {
    incidents[idx].status = status;
    saveToStorage(STORAGE_KEYS.INCIDENTS, incidents);
    addNotification(incidents[idx].user_id, "Report Update", `Your incident report status: ${status}`, "incident");
  }
}

// ── Guardians ──
export function getGuardians(studentId) {
  return getFromStorage(STORAGE_KEYS.GUARDIANS, []).filter((g) => g.student_id === studentId);
}

export function addGuardian(studentId, name, phone, relationship, email, guardianUserId) {
  const guardian = {
    id: generateId(), student_id: studentId, guardian_user_id: guardianUserId,
    name, phone, email, relationship,
  };
  const guardians = getFromStorage(STORAGE_KEYS.GUARDIANS, []);
  guardians.push(guardian);
  saveToStorage(STORAGE_KEYS.GUARDIANS, guardians);
  return guardian;
}

export function deleteGuardian(guardianId) {
  const guardians = getFromStorage(STORAGE_KEYS.GUARDIANS, []);
  saveToStorage(STORAGE_KEYS.GUARDIANS, guardians.filter((g) => g.id !== guardianId));
}

// ── Broadcasts ──
export function createBroadcast(createdBy, createdByName, title, message, severity) {
  const broadcast = {
    id: generateId(), created_by: createdBy, created_by_name: createdByName,
    title, message, severity, created_at: new Date().toISOString(),
  };
  const broadcasts = getFromStorage(STORAGE_KEYS.BROADCASTS, []);
  broadcasts.unshift(broadcast);
  saveToStorage(STORAGE_KEYS.BROADCASTS, broadcasts);
  addNotification("all", title, message, "broadcast");
  return broadcast;
}

export function getBroadcasts() {
  return getFromStorage(STORAGE_KEYS.BROADCASTS, []);
}

export function deleteBroadcast(broadcastId) {
  const broadcasts = getFromStorage(STORAGE_KEYS.BROADCASTS, []);
  saveToStorage(STORAGE_KEYS.BROADCASTS, broadcasts.filter((b) => b.id !== broadcastId));
}

// ── Notifications ──
export function addNotification(userId, title, message, type) {
  const notif = {
    id: generateId(), user_id: userId, title, message, type,
    read: false, created_at: new Date().toISOString(),
  };
  const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  notifs.unshift(notif);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  return notif;
}

export function getNotifications(userId, userRole) {
  return getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []).filter(
    (n) => n.user_id === userId || n.user_id === "all" || (n.user_id === "all-security" && userRole === "security")
  );
}

export function getUnreadCount(userId, userRole) {
  return getNotifications(userId, userRole).filter((n) => !n.read).length;
}

export function markNotificationRead(notifId) {
  const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  const idx = notifs.findIndex((n) => n.id === notifId);
  if (idx !== -1) {
    notifs[idx].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

export function markAllNotificationsRead(userId, userRole) {
  const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  notifs.forEach((n) => {
    if (n.user_id === userId || n.user_id === "all" || (n.user_id === "all-security" && userRole === "security")) {
      n.read = true;
    }
  });
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
}

// ── Change Password ──
export function changePassword(email, oldPassword, newPassword) {
  const passwords = getFromStorage(STORAGE_KEYS.PASSWORDS, {});
  if (passwords[email] !== oldPassword) return { success: false, error: "Current password is incorrect" };
  passwords[email] = newPassword;
  saveToStorage(STORAGE_KEYS.PASSWORDS, passwords);
  return { success: true };
}
