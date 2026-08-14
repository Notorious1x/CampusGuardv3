// Device notification helpers (browser/phone pop-up notifications)

export function isPushSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

export function getPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(`${process.env.PUBLIC_URL || ""}/sw.js`);
    return reg;
  } catch {
    return null;
  }
}

// Asks the user for notification permission. Returns true if granted.
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    await registerServiceWorker();
    return true;
  }
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  if (result === "granted") {
    await registerServiceWorker();
    return true;
  }
  return false;
}

// Shows a pop-up notification on the device. Uses the service worker so it
// also works on Android phones (required for mobile Chrome).
export async function showDeviceNotification(title, body, url = "/") {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const options = {
    body,
    icon: `${process.env.PUBLIC_URL || ""}/favicon.svg`,
    badge: `${process.env.PUBLIC_URL || ""}/favicon.svg`,
    vibrate: [200, 100, 200],
    data: { url },
    tag: `campusguard-${Date.now()}`,
  };
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    // fall through to the Notification constructor
  }
  try {
    new Notification(title, options);
  } catch {
    // Notification constructor is not supported on some mobile browsers
  }
}
