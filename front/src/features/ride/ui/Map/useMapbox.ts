'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/shared/config/mapbox';
import { Point, Coin } from '../../model/types';

interface UseMapboxProps {
  route: Point[];
  currentPosition: { lat: number; lng: number } | null;
  coins: Coin[];
  isFollowing: boolean;
}

interface LatLng {
  lat: number;
  lng: number;
}

type Sources = {
  route: mapboxgl.GeoJSONSource;
  coin: mapboxgl.GeoJSONSource;
  nav: mapboxgl.GeoJSONSource;
};

const fetchRoute = async (
  from: LatLng,
  to: LatLng
): Promise<[number, number][] | null> => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.routes?.[0]?.geometry?.coordinates || null;
  } catch {
    return null;
  }
};

export const useMapbox = ({
  route,
  currentPosition,
  coins,
  isFollowing,
}: UseMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sourcesRef = useRef<Sources | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const isMapLoadedRef = useRef(false);
  const lastPositionRef = useRef<LatLng | null>(null);
  const requestIdRef = useRef(0);
  const [userInteracted, setUserInteracted] = useState(false);

  // 🗺️ INIT MAP
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      console.error('❌ Map container or token missing');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style:'mapbox://styles/mapbox/dark-v11',
      center: [27.5667, 53.9],
      zoom: 15,
      pitch: 30,
      bearing: 0,
      attributionControl: false,
    });

    const handleInteraction = () => setUserInteracted(true);
    map.on('dragstart', handleInteraction);
    map.on('zoomstart', handleInteraction);
    map.on('rotatestart', handleInteraction);
    map.on('pitchstart', handleInteraction);

    map.on('load', () => {
     

      // Sources
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
        lineMetrics: true,
      });

      map.addSource('navigation', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
      });

      map.addSource('coin', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Layers
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

      map.addLayer(
        {
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
        },
        'nav-line'
      );

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

      sourcesRef.current = {
        route: map.getSource('route') as mapboxgl.GeoJSONSource,
        coin: map.getSource('coin') as mapboxgl.GeoJSONSource,
        nav: map.getSource('navigation') as mapboxgl.GeoJSONSource,
      };

      isMapLoadedRef.current = true;
     
    });

  
    mapRef.current = map;

    return () => {
     
      isMapLoadedRef.current = false;
      map.remove();
    };
  }, []);

  // 📍 PLAYER MARKER 
  useEffect(() => {
   

    if (!mapRef.current || !currentPosition) {
     
      return;
    }

    // Проверяем валидность координат
    if (typeof currentPosition.lat !== 'number' || typeof currentPosition.lng !== 'number') {
      console.error('❌ Invalid coordinates:', currentPosition);
      return;
    }

  

    if (!markerRef.current) {
     
      
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #06b6d4; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 0 20px #06b6d4, 0 0 40px rgba(6,182,212,0.4);
          transform: translate(-50%, -50%);
        "></div>
      `;

      markerRef.current = new mapboxgl.Marker({
        element: el.firstElementChild as HTMLElement,
        anchor: 'center',
      })
        .setLngLat([currentPosition.lng, currentPosition.lat])
        .addTo(mapRef.current);
        
     
    } else {
    
      markerRef.current.setLngLat([currentPosition.lng, currentPosition.lat]);
    }

    if (isFollowing && !userInteracted) {
    
      mapRef.current.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        duration: 500,
      });
    }
  }, [currentPosition, isFollowing, userInteracted]);

  // 📏 ROUTE LINE
  useEffect(() => {
   
    
    if (!isMapLoadedRef.current || !sourcesRef.current) return;

    const coordinates = route.map(p => [p.lng, p.lat]);
   

    sourcesRef.current.route.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    });
  }, [route]);

  // 🪙 COIN + NAVIGATION
  useEffect(() => {
   
    if (!isMapLoadedRef.current || !sourcesRef.current) return;

    const coin = coins[0];

    if (!coin || !currentPosition) {
     
      sourcesRef.current.coin.setData({
        type: 'FeatureCollection',
        features: [],
      });
      sourcesRef.current.nav.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] },
      });
      return;
    }

    sourcesRef.current.coin.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coin.lng, coin.lat],
          },
          properties: {
            id: coin.id,
            order: coin.order,
          },
        },
      ],
    });

    const updateNav = async () => {
      if (!currentPosition) return;

      const last = lastPositionRef.current;

      if (
        last &&
        Math.abs(last.lat - currentPosition.lat) < 0.00005 &&
        Math.abs(last.lng - currentPosition.lng) < 0.00005
      ) {
        return;
      }

      lastPositionRef.current = currentPosition;
      const requestId = ++requestIdRef.current;

     
      const coords = await fetchRoute(currentPosition, coin);

      if (requestId !== requestIdRef.current) return;

      if (coords && sourcesRef.current) {
       
        sourcesRef.current.nav.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        });
      }
    };

    updateNav();
  }, [coins, currentPosition]);

  // 🎯 RECENTER
  const recenter = useCallback(() => {
    if (!mapRef.current || !currentPosition) return;
    setUserInteracted(false);
    mapRef.current.flyTo({
      center: [currentPosition.lng, currentPosition.lat],
      zoom: 16,
      pitch: 30,
      duration: 800,
    });
  }, [currentPosition]);

  return {
    mapContainer,
    userInteracted,
    recenter,
  };
};