'use client';

import { Point, Coin } from '../../model/types';
import { useMapbox } from './useMapbox';
import styles from './MapView.module.scss';

interface MapViewProps {
  route: Point[];
  currentPosition: { lat: number; lng: number } | null; 
  coins: Coin[];
  isRecording: boolean;
}

export const MapView = ({ route, currentPosition, coins, isRecording }: MapViewProps) => {
  const { mapContainer, userInteracted, recenter } = useMapbox({
    route,
    currentPosition,
    coins,
    isFollowing: isRecording,
  });

  const showRecenter = !isRecording || userInteracted;

  return (
    <div className={styles.container}>
      <div ref={mapContainer} className={styles.map} />
      
      {showRecenter && currentPosition && (
        <button className={styles.recenterBtn} onClick={recenter}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          <span>НА МЕНЯ</span>
        </button>
      )}
    </div>
  );
};