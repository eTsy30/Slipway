'use client';

import styles from './CompleteScreen.module.scss';

interface CompleteScreenProps {
  elapsed: number;
  distance: number;
  maxSpeed: number;
  collectedCount: number;
  totalCoins: number;
  score: number;
  onReset: () => void;
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const CompleteScreen = ({
  elapsed,
  distance,
  maxSpeed,
  collectedCount,
  totalCoins,
  score,
  onReset,
}: CompleteScreenProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RIDE COMPLETE</h1>
      
      <div className={styles.stats}>
        <div className={styles.row}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>{formatTime(elapsed)}</span>
        </div>
        
        <div className={styles.row}>
          <span className={styles.label}>Distance</span>
          <span className={styles.value}>{(distance / 1000).toFixed(2)} km</span>
        </div>
        
        <div className={styles.row}>
          <span className={styles.label}>Max Speed</span>
          <span className={styles.value}>{maxSpeed.toFixed(1)} km/h</span>
        </div>
        
        <div className={styles.row}>
          <span className={styles.label}>Coins</span>
          <span className={`${styles.value} ${styles.coins}`}>
            {collectedCount}/{totalCoins}
          </span>
        </div>
        
        <div className={styles.total}>
          <span className={styles.label}>TOTAL SCORE</span>
          <span className={styles.score}>{score}</span>
        </div>
      </div>
      
      <button className={styles.shareBtn} onClick={onReset}>
        SHARE
      </button>
    </div>
  );
};