"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/shared/config/mapbox";

interface Point {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
}

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const sourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  
  const routeRef = useRef<Point[]>([]);
  const [route, setRoute] = useState<Point[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [27.5667, 53.9],
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#06b6d4",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      sourceRef.current = map.getSource("route") as mapboxgl.GeoJSONSource;
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => {
      map.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Таймер
  useEffect(() => {
    if (!isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // GPS трекинг
  useEffect(() => {
    if (!isRecording || !mapRef.current) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const kmh = speed ? speed * 3.6 : 0;
        
        setCurrentSpeed(kmh);
        
        const newPoint: Point = {
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
          speed: kmh,
        };

        const updatedRoute = [...routeRef.current, newPoint];
        routeRef.current = updatedRoute;
        setRoute(updatedRoute);

        // Обновляем линию
        if (sourceRef.current) {
          sourceRef.current.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: updatedRoute.map((p) => [p.lng, p.lat]),
            },
          });
        }

        // Маркер
        if (!markerRef.current) {
          const el = document.createElement("div");
          el.innerHTML = `<div style="width:20px;height:20px;background:#06b6d4;border-radius:50%;border:3px solid white;box-shadow:0 0 20px #06b6d4;"></div>`;
          markerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current!);
        } else {
          markerRef.current.setLngLat([longitude, latitude]);
        }

        mapRef.current?.setCenter([longitude, latitude]);
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRecording]);

  // Расчет дистанции
  const totalDistance = useMemo(() => {
    if (route.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < route.length; i++) {
      dist += haversine(route[i-1].lat, route[i-1].lng, route[i].lat, route[i].lng);
    }
    return dist;
  }, [route]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRecording(true);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setCurrentSpeed(0);
  };

  const handleStop = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    handleStop();
    startTimeRef.current = 0;
    routeRef.current = [];
    setRoute([]);
    setElapsedTime(0);
    setCurrentSpeed(0);
    if (sourceRef.current) {
      sourceRef.current.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      });
    }
  };

  // Мигающие двоеточие
  const [showColon, setShowColon] = useState(true);
  useEffect(() => {
    const blink = setInterval(() => setShowColon(c => !c), 500);
    return () => clearInterval(blink);
  }, []);

  const timeStr = formatTime(elapsedTime);
  const displayTime = showColon ? timeStr : timeStr.replace(/:/g, " ");

  return (
    <div style={{ width: "100%", height: "100dvh", position: "relative", background: "#0a0a0a" }}>
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />

      {/* HUD */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 20,
        color: "white",
        minWidth: 180,
        zIndex: 10,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <h1 style={{ margin: "0 0 16px 0", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>
          SLIPWAY
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Скорость */}
          <div>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#06b6d4", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {currentSpeed.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: "#737373", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
              km/h
            </div>
          </div>

          {/* Дистанция */}
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {(totalDistance / 1000).toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: "#737373", textTransform: "uppercase", letterSpacing: 1 }}>
              km
            </div>
          </div>

          {/* Время */}
          <div>
            <div style={{ 
              fontSize: 32, 
              fontWeight: 700, 
              lineHeight: 1, 
              fontVariantNumeric: "tabular-nums",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: isRecording ? "#fff" : "#737373"
            }}>
              {displayTime}
            </div>
            <div style={{ fontSize: 11, color: "#737373", textTransform: "uppercase", letterSpacing: 1 }}>
              {isRecording ? "● GPS ACTIVE" : "○ PAUSED"}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#525252", marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            Points: {route.length}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div style={{
        position: "absolute",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 12,
        zIndex: 10,
      }}>
        {!isRecording ? (
          <button
            onClick={handleStart}
            style={{
              background: "#06b6d4",
              color: "black",
              border: "none",
              padding: "16px 48px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(6,182,212,0.4)",
            }}
          >
            START
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "16px 48px",
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            STOP
          </button>
        )}
        
        {route.length > 0 && (
          <button
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "16px 24px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            RESET
          </button>
        )}
      </div>
    </div>
  );
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}