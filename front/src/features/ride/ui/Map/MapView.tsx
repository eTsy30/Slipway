'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/shared/config/mapbox';
import styles from './MapView.module.scss';

interface Point {
  lat: number;
  lng: number;
}

interface Coin {
  id: string;
  lat: number;
  lng: number;
  order: number;
}

interface MapViewProps {
  route: Point[];
  currentPosition: Point | null;
  coins: Coin[];
  isRecording: boolean;
  currentCoinOrder?: number;
  totalCoins?: number;
  isGameComplete?: boolean;
}

const fetchRoute = async (from: Point, to: Point): Promise<[number, number][] | null> => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.routes?.[0]?.geometry?.coordinates || null;
  } catch {
    return null;
  }
};

export const MapView = ({ 
  route, 
  currentPosition, 
  coins, 
  isRecording,
  currentCoinOrder,
  totalCoins = 5,
  isGameComplete = false,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const routeSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const coinSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const navSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const isMapLoadedRef = useRef(false);
  const lastRouteUpdateRef = useRef<number>(0);
  
  const [userInteracted, setUserInteracted] = useState(false);

  const isFollowing = isRecording && !userInteracted;

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [27.5667, 53.9],
      zoom: 15,
      pitch: 30,
      bearing: 0,
      attributionControl: false,
    });

    const handleUserInteraction = () => {
      setUserInteracted(true);
    };

    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);
    map.on('rotatestart', handleUserInteraction);
    map.on('pitchstart', handleUserInteraction);

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        lineMetrics: true,
      });

      map.addSource('navigation', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });

      map.addSource('coin', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 5,
          'line-opacity': 0.9,
        },
      });

      map.addLayer({
        id: 'nav-line',
        type: 'line',
        source: 'navigation',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#fbbf24',
          'line-width': 6,
          'line-opacity': 0.9,
        },
      });

      map.addLayer({
        id: 'nav-glow',
        type: 'line',
        source: 'navigation',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#fbbf24',
          'line-width': 12,
          'line-opacity': 0.3,
          'line-blur': 4,
        },
      }, 'nav-line');

      map.addLayer({
        id: 'coin-pulse',
        type: 'circle',
        source: 'coin',
        paint: {
          'circle-radius': 35,
          'circle-color': '#fbbf24',
          'circle-opacity': 0.3,
          'circle-blur': 0.5,
        },
      });

      map.addLayer({
        id: 'coin-body',
        type: 'circle',
        source: 'coin',
        paint: {
          'circle-radius': 18,
          'circle-color': '#fbbf24',
          'circle-stroke-color': '#b45309',
          'circle-stroke-width': 3,
        },
      });

      map.addLayer({
        id: 'coin-label',
        type: 'symbol',
        source: 'coin',
        layout: {
          'text-field': ['get', 'order'],
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#78350f',
        },
      });

      routeSourceRef.current = map.getSource('route') as mapboxgl.GeoJSONSource;
      coinSourceRef.current = map.getSource('coin') as mapboxgl.GeoJSONSource;
      navSourceRef.current = map.getSource('navigation') as mapboxgl.GeoJSONSource;
      isMapLoadedRef.current = true;
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mapRef.current = map;

    return () => {
      isMapLoadedRef.current = false;
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="
        width: 20px; height: 20px; background: #06b6d4; border-radius: 50%; 
        border: 3px solid white; box-shadow: 0 0 20px #06b6d4, 0 0 40px rgba(6,182,212,0.4);
      "></div>`;

      markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([currentPosition.lng, currentPosition.lat])
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([currentPosition.lng, currentPosition.lat]);
    }

    if (isFollowing) {
      mapRef.current.setCenter([currentPosition.lng, currentPosition.lat]);
    }
  }, [currentPosition, isFollowing]);

  useEffect(() => {
    if (!isMapLoadedRef.current || !routeSourceRef.current) return;
    
    routeSourceRef.current.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.map(p => [p.lng, p.lat]),
      },
    });
  }, [route]);

  useEffect(() => {
    if (!isMapLoadedRef.current || !coinSourceRef.current || !navSourceRef.current) return;

    const coin = coins[0];

    if (!coin || !currentPosition) {
      coinSourceRef.current.setData({ type: 'FeatureCollection', features: [] });
      navSourceRef.current.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      return;
    }

    coinSourceRef.current.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [coin.lng, coin.lat] },
        properties: { id: coin.id, order: coin.order },
      }],
    });

    const updateNav = async () => {
      const now = Date.now();
      if (now - lastRouteUpdateRef.current < 3000) return;
      lastRouteUpdateRef.current = now;
      
      const coords = await fetchRoute(currentPosition, coin);
      
      if (coords) {
        navSourceRef.current?.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        });
      }
    };

    updateNav();
  }, [coins, currentPosition]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !currentPosition) return;
    setUserInteracted(false);
    mapRef.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 16,
      pitch: 30,
      duration: 800
    });
  }, [currentPosition]);

  return (
    <div className={styles.container}>
      <div ref={mapContainer} className={styles.map} />
      
      {isRecording && !isGameComplete && currentCoinOrder && (
        <div className={styles.coinIndicator}>
          <span className={styles.coinIcon}>🪙</span>
          <span className={styles.coinText}>{currentCoinOrder}/{totalCoins}</span>
        </div>
      )}
      
      {!isFollowing && currentPosition && !isGameComplete && (
        <button className={styles.recenterBtn} onClick={handleRecenter}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          <span>НА МЕНЯ</span>
        </button>
      )}

      <div className={`${styles.modeIndicator} ${isFollowing ? styles.following : styles.free}`}>
        {isFollowing ? '● СЛЕЖЕНИЕ' : '○ СВОБОДНЫЙ'}
      </div>
    </div>
  );
};