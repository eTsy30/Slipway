'use client';

import styles from './Timer.module.scss';

interface TimerProps {
  elapsed: number;  // секунды
  isRunning: boolean;
}

export const Timer = ({ elapsed, isRunning }: TimerProps) => {
  // Формат MM:SS
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  const timeStr = `${m}:${s}`;

  return ( 
  <div className={styles.value} data-running={isRunning}>
    {timeStr}
  </div>
 
  );
};