import { supabase } from "./supabase";

// ── Security IDs ──
function generateSecurityCode() {
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
  return `KNS${digits}`;
}

export async function getSecurityIds() {
  const { data } = await supabase.from("security_ids").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function generateNewSecurityIds(count = 5) {
  const { data: existing } = await supabase.from("security_ids").select("code");
  const existingCodes = new Set((existing || []).map((r) => r.code));
  const newIds = [];
  let attempts = 0;
  while (newIds.length < count && attempts < 100) {
    const code = generateSecurityCode();
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      newIds.push({ code, used: false });
    }
    attempts++;
  }
  if (newIds.length > 0) await supabase.from("security_ids").insert(newIds);
  return newIds;
}

export async function validateSecurityId(code) {
  const { data } = await supabase.from("security_ids").select("*").eq("code", code.toUpperCase().trim()).single();
  if (!data) return { valid: false, error: "Invalid Security ID. Contact your administrator." };
  if (data.used) return { valid: false, error: "This Security ID has already been claimed." };
  return { valid: true };
}

export async function claimSecurityId(code, userId, userName) {
  await supabase.from("security_ids").update({
    used: true, used_by: userId, used_by_name: userName, claimed_at: new Date().toISOString(),
  }).eq("code", code.toUpperCase().trim());
}

// ── Demo Accounts ──
const DEMO_ACCOUNTS = [
  { email: "student@demo.com", password: "demo123", full_name: "Demo Student", student_id: "20230001", phone: "+233241000001", role: "student" },
  { email: "security@demo.com", password: "demo123", full_name: "Demo Security", student_id: "", phone: "+233241000002", role: "security" },
  { email: "guardian@demo.com", password: "demo123", full_name: "Demo Guardian", student_id: "", phone: "+233241000003", role: "guardian" },
];

export async function seedDemoAccounts() {
  for (const demo of DEMO_ACCOUNTS) {
    await supabase.auth.signUp({
      email: demo.email,
      password: demo.password,
      options: { data: { full_name: demo.full_name, student_id: demo.student_id, phone: demo.phone, role: demo.role } },
    });
  }
}

export function getDemoAccounts() {
  return DEMO_ACCOUNTS.map(({ email, password, full_name, role }) => ({ email, password, full_name, role }));
}

// ── Auth ──
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  return { success: true, user: profile };
}

export async function registerUser(email, password, full_name, student_id, phone, role = "student", security_code) {
  if (role === "security") {
    if (!security_code) return { success: false, error: "Security ID is required for security personnel." };
    const validation = await validateSecurityId(security_code);
    if (!validation.valid) return { success: false, error: validation.error };
  }
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, student_id: student_id || "", phone: phone || "", role } },
  });
  if (error) return { success: false, error: error.message };
  if (role === "security" && security_code) {
    await claimSecurityId(security_code, data.user.id, full_name);
  }
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  return { success: true, user: profile };
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  return data;
}

export async function getAllUsers() {
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function updateUser(userId, updates) {
  await supabase.from("profiles").update(updates).eq("id", userId);
}

export async function deleteUser(userId) {
  await supabase.from("profiles").delete().eq("id", userId);
}

// ── Settings ──
const DEFAULT_SETTINGS = {
  notifications_sos: true,
  notifications_incidents: true,
  notifications_broadcasts: true,
  location_sharing: true,
  dark_mode: false,
  mute_non_emergency: false,
};

export async function getUserSettings(userId) {
  const { data } = await supabase.from("settings").select("*").eq("user_id", userId).single();
  return data || { user_id: userId, ...DEFAULT_SETTINGS };
}

export async function saveUserSettings(settings) {
  const { user_id, id, created_at, updated_at, ...rest } = settings;
  const { data: existing } = await supabase.from("settings").select("id").eq("user_id", user_id).single();
  if (existing) {
    await supabase.from("settings").update({ ...rest, updated_at: new Date().toISOString() }).eq("user_id", user_id);
  } else {
    await supabase.from("settings").insert({ user_id, ...rest });
  }
}

// ── SOS Alerts ──
export async function createAlert(userId, userName, userPhone, alertType, severity, latitude, longitude, message) {
  const { data } = await supabase.from("alerts").insert({
    user_id: userId, user_name: userName, user_phone: userPhone,
    alert_type: alertType, severity, message, latitude, longitude, status: "pending",
  }).select().single();
  await addNotification("all-security", "New SOS Alert", `${userName} triggered a ${alertType} alert`, "sos");
  return data;
}

export async function getAlerts() {
  const { data } = await supabase.from("alerts").select("*").eq("archived", false).order("created_at", { ascending: false });
  return data || [];
}

export async function getUserAlerts(userId) {
  const { data } = await supabase.from("alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

export async function updateAlertStatus(alertId, status, responderId, responderName) {
  const updates = { status, updated_at: new Date().toISOString() };
  if (responderId) updates.responder_id = responderId;
  if (responderName) updates.responder_name = responderName;
  if (status === "resolved") { updates.archived = true; updates.archived_at = new Date().toISOString(); }
  await supabase.from("alerts").update(updates).eq("id", alertId);
  const { data: alert } = await supabase.from("alerts").select("user_id").eq("id", alertId).single();
  if (alert) await addNotification(alert.user_id, "Alert Update", `Your alert status changed to: ${status}`, "sos");
}

// ── Safe Walk ──
export async function createSafeWalk(userId, userName, destination, latitude, longitude, sharedWith, durationMinutes = 30) {
  const { data } = await supabase.from("safe_walks").insert({
    user_id: userId, user_name: userName, destination, latitude, longitude,
    status: "active", shared_with: sharedWith,
    checkin_deadline: new Date(Date.now() + durationMinutes * 60000).toISOString(),
  }).select().single();
  for (const gId of sharedWith) {
    await addNotification(gId, "Safe Walk Started", `${userName} started walking to ${destination}`, "safewalk");
  }
  return data;
}

export async function getSafeWalks() {
  const { data } = await supabase.from("safe_walks").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function getUserSafeWalks(userId) {
  const { data } = await supabase.from("safe_walks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

export async function updateSafeWalkStatus(sessionId, status) {
  await supabase.from("safe_walks").update({ status, updated_at: new Date().toISOString() }).eq("id", sessionId);
  if (status === "completed") {
    const { data: walk } = await supabase.from("safe_walks").select("shared_with, user_name").eq("id", sessionId).single();
    if (walk?.shared_with) {
      for (const gId of walk.shared_with) {
        await addNotification(gId, "Safe Arrival", `${walk.user_name} has checked in safely`, "safewalk");
      }
    }
  }
}

export async function updateSafeWalkLocation(sessionId, latitude, longitude) {
  await supabase.from("safe_walks").update({ latitude, longitude, updated_at: new Date().toISOString() }).eq("id", sessionId);
}

// ── Incidents ──
export async function createIncident(userId, userName, title, description, severity = "medium", locationDescription, latitude, longitude, imageUrl) {
  const { data } = await supabase.from("incidents").insert({
    user_id: userId, user_name: userName, title, description,
    location_description: locationDescription, latitude, longitude, image_url: imageUrl,
    status: "pending", severity,
  }).select().single();
  await addNotification("all-security", "New Incident Report", `${userName} reported: ${title}`, "incident");
  return data;
}

export async function getIncidents() {
  const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function getUserIncidents(userId) {
  const { data } = await supabase.from("incidents").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

export async function updateIncidentStatus(incidentId, status) {
  await supabase.from("incidents").update({ status }).eq("id", incidentId);
  const { data: inc } = await supabase.from("incidents").select("user_id").eq("id", incidentId).single();
  if (inc) await addNotification(inc.user_id, "Report Update", `Your incident report status: ${status}`, "incident");
}

// ── Guardians ──
export async function getGuardians(studentId) {
  const { data } = await supabase.from("guardians").select("*").eq("student_id", studentId);
  return data || [];
}

export async function addGuardian(studentId, name, phone, relationship, email, guardianUserId) {
  const { data } = await supabase.from("guardians").insert({
    student_id: studentId, guardian_user_id: guardianUserId || null, name, phone, email, relationship,
  }).select().single();
  return data;
}

export async function deleteGuardian(guardianId) {
  await supabase.from("guardians").delete().eq("id", guardianId);
}

// ── Broadcasts ──
export async function createBroadcast(createdBy, createdByName, title, message, severity) {
  const { data } = await supabase.from("broadcasts").insert({
    created_by: createdBy, created_by_name: createdByName, title, message, severity,
  }).select().single();
  await addNotification("all", title, message, "broadcast");
  return data;
}

export async function getBroadcasts() {
  const { data } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function deleteBroadcast(broadcastId) {
  await supabase.from("broadcasts").delete().eq("id", broadcastId);
}

// ── Notifications ──
export async function addNotification(userId, title, message, type) {
  const { data } = await supabase.from("notifications").insert({
    user_id: String(userId), title, message, type, read: false,
  }).select().single();
  return data;
}

export async function getNotifications(userId, userRole) {
  const targets = [String(userId), "all"];
  if (userRole === "security") targets.push("all-security");
  const { data } = await supabase.from("notifications").select("*").in("user_id", targets).order("created_at", { ascending: false });
  return data || [];
}

export async function getUnreadCount(userId, userRole) {
  const notifs = await getNotifications(userId, userRole);
  return notifs.filter((n) => !n.read).length;
}

export async function markNotificationRead(notifId) {
  await supabase.from("notifications").update({ read: true }).eq("id", notifId);
}

export async function markAllNotificationsRead(userId, userRole) {
  const targets = [String(userId), "all"];
  if (userRole === "security") targets.push("all-security");
  await supabase.from("notifications").update({ read: true }).in("user_id", targets).eq("read", false);
}

// ── Change Password ──
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
