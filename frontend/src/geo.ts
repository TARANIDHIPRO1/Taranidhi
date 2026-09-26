// Geolocation helper — many screens need lat/lon.

export interface LatLon {
  lat: number;
  lon: number;
}

let cached: LatLon | null = null;

export function getCachedLocation(): LatLon | null {
  if (cached) return cached;
  const stored = localStorage.getItem("ov_location");
  if (stored) {
    try {
      cached = JSON.parse(stored);
      return cached;
    } catch { /* ignore */ }
  }
  return null;
}

export function setCachedLocation(loc: LatLon) {
  cached = loc;
  localStorage.setItem("ov_location", JSON.stringify(loc));
}

export function requestLocation(): Promise<LatLon> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: LatLon = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCachedLocation(loc);
        resolve(loc);
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
}
