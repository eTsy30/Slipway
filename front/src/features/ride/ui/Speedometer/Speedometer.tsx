'use client';
import styles from './Speedometer.module.scss';

interface SpeedometerProps {
  current: number;  // км/ч
  max: number;
  combo: number;    // 1, 2, 3
}

export const Speedometer = ({ current, max, combo }: SpeedometerProps) => {
  // Цвет комбо
  const comboColor = combo === 1 ? '#737373' : combo === 2 ? '#eab308' : '#ef4444';

  return (
    <div className={styles.container}>
  <div className={styles.value}>
    {current.toFixed(1)}
    <span className={styles.combo} data-combo={combo}>x{combo}</span>
  </div>
  <div className={styles.max}>max {max.toFixed(1)}</div>
  <div className={styles.label}>km/h</div>
</div>

  );
};