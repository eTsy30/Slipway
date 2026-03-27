'use client';

import { useState, useCallback } from 'react';
import { Point, Coin, Screen, ComboLevel } from '../model/types';
import { haversine } from './geo';
import { useTimer } from './useTimer';
import { useGeolocation } from './useGeolocation';

const TOTAL_COINS = 5;
const COLLECT_DISTANCE = 30;

const generateNextCoin = (centerLat: number, centerLng: number, order: number): Coin => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 150 + Math.random() * 350;

  const latOffset = (distance * Math.cos(angle)) / 111000;
  const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(centerLat * Math.PI / 180));

  return {
    id: `coin-${order}-${Date.now()}`,
    lat: centerLat + latOffset,
    lng: centerLng + lngOffset,
    order,
  };
};

export const useRideGame = () => {
  const [screen, setScreen] = useState<Screen>('start');
  const [route, setRoute] = useState<Point[]>([]);
  const [distance, setDistance] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [currentCoin, setCurrentCoin] = useState<Coin | null>(null);
  const [collectedCount, setCollectedCount] = useState(0);

  const isRecording = screen === 'ride';
  const { elapsed, reset: resetTimer } = useTimer(isRecording);

  const handleNewPoint = useCallback((point: Point) => {
    setRoute(prev => {
      const newRoute = [...prev, point];

      // Расстояние
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const segment = haversine(last.lat, last.lng, point.lat, point.lng);
        setDistance(d => d + segment);
      }

      // Максимальная скорость
      setMaxSpeed(prevMax => Math.max(prevMax, point.speed));

      // Генерация первой монеты, если нет
      if (!currentCoin) {
        setCurrentCoin(generateNextCoin(point.lat, point.lng, 1));
      }

      // Проверка сбора монеты
      if (currentCoin) {
        const distToCoin = haversine(point.lat, point.lng, currentCoin.lat, currentCoin.lng);
        if (distToCoin < COLLECT_DISTANCE) {
          const newCount = collectedCount + 1;
          setCollectedCount(newCount);

          if (newCount >= TOTAL_COINS) {
            setCurrentCoin(null);
            setScreen('complete');
          } else {
            setCurrentCoin(generateNextCoin(point.lat, point.lng, newCount + 1));
          }
        }
      }

      return newRoute;
    });
  }, [currentCoin, collectedCount]);

  useGeolocation(isRecording, handleNewPoint);

  const currentPosition =
    route.length > 0
      ? { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng }
      : null;

  const currentSpeed = route[route.length - 1]?.speed || 0;

  const combo: ComboLevel = currentSpeed < 15 ? 1 : currentSpeed < 25 ? 2 : 3;

  const score = Math.floor(distance * combo + collectedCount * 100);

  const startRide = useCallback(() => setScreen('ride'), []);
  const stopRide = useCallback(() => setScreen('complete'), []);
  const resetRide = useCallback(() => {
    resetTimer();
    setRoute([]);
    setDistance(0);
    setMaxSpeed(0);
    setCurrentCoin(null);
    setCollectedCount(0);
    setScreen('start');
  }, [resetTimer]);

  return {
    screen,
    isRecording,
    currentPosition,
    currentCoin,
    collectedCount,
    totalCoins: TOTAL_COINS,

    elapsed,
    distance,
    currentSpeed,
    maxSpeed,
    combo,
    score,

    startRide,
    stopRide,
    resetRide,

    route,
    coinsForMap: currentCoin ? [currentCoin] : [],
  };
};