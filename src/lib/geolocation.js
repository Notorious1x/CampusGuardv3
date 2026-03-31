export const KNUST_CENTER = { latitude: 6.6745, longitude: -1.5716 };

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  });
}

export function watchPosition(callback, onError) {
  if (!navigator.geolocation) return null;
  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => { if (onError) onError(error); },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );
}

export function clearWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
