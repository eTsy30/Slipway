/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTimer } from '@/features/ride/lib/useTimer';
import { useGeolocation } from '@/features/ride/lib/useGeolocation';
import { haversine } from '@/features/ride/lib/geo';

import { MapView } from '@/features/ride/ui/Map/MapView';
import { RideControls } from '@/features/ride/ui/RideControls/RideControls';
import { RideHUD } from '@/features/ride/ui/RideHUD/RideHUD';

interface Point {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
}

interface Coin {
  id: string;
  lat: number;
  lng: number;
  order: number;
}

const TOTAL_COINS = 5;
const COLLECT_DISTANCE = 30; // метров

const generateNextCoin = (centerLat: number, centerLng: number, order: number): Coin => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 150 + Math.random() * 350; // 150-500м
  
  const latOffset = (distance * Math.cos(angle)) / 111000;
  const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(centerLat * Math.PI / 180));
  
  return {
    id: `coin-${order}-${Date.now()}`,
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
    order,
  };
};

export const RidePage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [route, setRoute] = useState<Point[]>([]);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [currentCoin, setCurrentCoin] = useState<Coin | null>(null);
  const [collectedCount, setCollectedCount] = useState(0);
  
  const gameStarted = useRef(false);
  const currentCoinRef = useRef<Coin | null>(null);

  const { elapsed, reset: resetTimer } = useTimer(isRecording);

  const handleNewPoint = useCallback((point: Point) => {
    setRoute(prev => [...prev, point]);
    if (point.speed > maxSpeed) setMaxSpeed(point.speed);
  }, [maxSpeed]);

  useGeolocation(isRecording, handleNewPoint);

  const currentPosition = route.length > 0 
    ? { lat: route[route.length-1].lat, lng: route[route.length-1].lng }
    : null;

  useEffect(() => {
    currentCoinRef.current = currentCoin;
  }, [currentCoin]);

  // Старт игры
  useEffect(() => {
    if (!isRecording || gameStarted.current || route.length === 0) return;
    
    const pos = route[route.length - 1];
    setCurrentCoin(generateNextCoin(pos.lat, pos.lng, 1));
    gameStarted.current = true;
  }, [isRecording, route.length]);

  // Проверка сбора
  useEffect(() => {
    if (!currentPosition || !currentCoinRef.current || !isRecording) return;
    
    const coin = currentCoinRef.current;
    const dist = haversine(currentPosition.lat, currentPosition.lng, coin.lat, coin.lng);
    
    if (dist < COLLECT_DISTANCE) {
      const newCount = collectedCount + 1;
      setCollectedCount(newCount);
      
      if (newCount >= TOTAL_COINS) {
        setCurrentCoin(null);
        currentCoinRef.current = null;
        setIsRecording(false);
        return;
      }
      
      setCurrentCoin(generateNextCoin(currentPosition.lat, currentPosition.lng, newCount + 1));
    }
  }, [collectedCount, currentPosition, isRecording]);

  const distance = useMemo(() => {
    if (route.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < route.length; i++) {
      dist += haversine(route[i-1].lat, route[i-1].lng, route[i].lat, route[i].lng);
    }
    return dist;
  }, [route]);

  const currentSpeed = route[route.length - 1]?.speed || 0;
  const combo = currentSpeed < 15 ? 1 : currentSpeed < 25 ? 2 : 3;

  const handleStart = () => {
    setIsRecording(true);
  };
  
  const handleStop = () => {
    setIsRecording(false);
  };
  
  const handleReset = () => {
    setIsRecording(false);
    resetTimer();
    setRoute([]);
    setMaxSpeed(0);
    setCurrentCoin(null);
    setCollectedCount(0);
    gameStarted.current = false;
    currentCoinRef.current = null;
  };

  const coinsForMap = currentCoin ? [currentCoin] : [];

  const isGameComplete = collectedCount >= TOTAL_COINS;

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative', background: '#0a0a0a' }}>
      <MapView 
        route={route} 
        currentPosition={currentPosition}
        coins={coinsForMap}
        isRecording={isRecording}
        currentCoinOrder={currentCoin?.order}
        totalCoins={TOTAL_COINS}
        isGameComplete={isGameComplete}
      />
      
      {!isGameComplete && (
        <RideHUD
          elapsed={elapsed}
          isRunning={isRecording}
          currentSpeed={currentSpeed}
          maxSpeed={maxSpeed}
          combo={combo}
          distance={distance}
          collectedCount={collectedCount}
          totalCoins={TOTAL_COINS}
          currentTarget={currentCoin?.order}
        />
      )}
      
      {isGameComplete && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          color: 'white',
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '32px' }}>RIDE COMPLETE</h1>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px 48px',
            minWidth: '280px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#737373' }}>Time</span>
              <span>{formatTime(elapsed)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#737373' }}>Distance</span>
              <span>{(distance / 1000).toFixed(2)} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#737373' }}>Max Speed</span>
              <span>{maxSpeed.toFixed(1)} km/h</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#737373' }}>Coins</span>
              <span style={{ color: '#fbbf24' }}>{collectedCount}/{TOTAL_COINS}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <span style={{ color: '#737373' }}>TOTAL SCORE</span>
              <span style={{ color: '#06b6d4', fontSize: '24px', fontWeight: 700 }}>
                {Math.floor(distance * combo + collectedCount * 100)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            style={{
              marginTop: '32px',
              background: '#06b6d4',
              color: 'black',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            SHARE
          </button>
        </div>
      )}
      
      {!isGameComplete && (
        <RideControls
          isRecording={isRecording}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          canReset={route.length > 0 || collectedCount > 0}
        />
      )}
    </div>
  );
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default RidePage;