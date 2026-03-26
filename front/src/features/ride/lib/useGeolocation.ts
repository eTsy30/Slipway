import { useEffect, useRef } from 'react';

interface Point {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
}

export const useGeolocation = (
  isRecording: boolean,
  onNewPoint: (point: Point) => void
) => {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        onNewPoint({
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
          speed: speed ? speed * 3.6 : 0, // м/с → км/ч
        });
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRecording, onNewPoint]);
};