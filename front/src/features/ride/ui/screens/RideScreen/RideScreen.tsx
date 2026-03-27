'use client';

import { MapView } from '../../Map/MapView';

import { Point, Coin } from '../../../model/types';
import styles from './RideScreen.module.scss';
import { RideControls } from '../../RideControls/RideControls';
import { RideHUD } from '../../RideHUD/RideHUD';

interface RideScreenProps {
  route: Point[];
  currentPosition: { lat: number; lng: number } | null;
  coins: Coin[];
  elapsed: number;
  currentSpeed: number;
  maxSpeed: number;
  combo: number;
  distance: number;
  collectedCount: number;
  totalCoins: number;
  onStop: () => void;
  onReset: () => void;
}

export const RideScreen = ({
  route,
  currentPosition,
  coins,
  elapsed,
  currentSpeed,
  maxSpeed,
  combo,
  distance,
  collectedCount,
  totalCoins,
  onStop,
  onReset,
}: RideScreenProps) => {
 
  return (
    <div className={styles.container}>
      <MapView 
        route={route} 
        currentPosition={currentPosition}
        coins={coins}
        isRecording={true}
      />
      
      <RideHUD
        elapsed={elapsed}
        isRunning={true}
        currentSpeed={currentSpeed}
        maxSpeed={maxSpeed}
        combo={combo}
        distance={distance}
        collectedCount={collectedCount}
        totalCoins={totalCoins}
       
      />
      
      <RideControls
        isRecording={true}
        onStart={() => {}}
        onStop={onStop}
        onReset={onReset}
        canReset={true}
      />
    </div>
  );
};