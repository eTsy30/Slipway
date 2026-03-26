'use client';

import { useState, useEffect } from 'react';
import styles from './Timer.module.scss';

interface TimerProps {
  elapsed: number;  // секунды
  isRunning: boolean;
}

export const Timer = ({ elapsed, isRunning }: TimerProps) => {
  // Мигающие двоеточие
  const [showColon, setShowColon] = useState(true);
  
  useEffect(() => {
    const blink = setInterval(() => setShowColon(c => !c), 500);
    return () => clearInterval(blink);
  }, []);

  // Формат MM:SS
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  const timeStr = `${m}:${s}`;
  
  // Мигаем через пробел
  const displayTime = showColon ? timeStr : timeStr.replace(/:/g, ' ');

  return (
    <div className={styles.container}>
  <div className={styles.value} data-running={isRunning}>
    {displayTime}
  </div>
  <div className={styles.label}>
    {isRunning ? '● GPS ACTIVE' : '○ PAUSED'}
  </div>
</div>
  );
};