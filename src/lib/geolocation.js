export const KNUST_CENTER = { latitude: 6.6745, longitude: -1.5716 };

export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: KNUST_CENTER.latitude + (Math.random() - 0.5) * 0.01,
        longitude: KNUST_CENTER.longitude + (Math.random() - 0.5) * 0.01,
      });
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
      () => {
        resolve({
          latitude: KNUST_CENTER.latitude + (Math.random() - 0.5) * 0.01,
          longitude: KNUST_CENTER.longitude + (Math.random() - 0.5) * 0.01,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export function watchPosition(callback) {
  if (!navigator.geolocation) return null;
  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    undefined,
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );
}

export function clearWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
