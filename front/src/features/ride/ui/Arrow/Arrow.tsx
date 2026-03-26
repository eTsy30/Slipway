'use client';

import styles from './Arrow.module.scss';

interface ArrowProps {
  distance: number; // метры
  bearing: number;  // градусы (0-360)
}

export const Arrow = ({ distance, bearing }: ArrowProps) => {
  return (
    <div className={styles.container}>
      <div 
        className={styles.arrow}
        style={{ transform: `rotate(${bearing}deg)` }}
      />
      <div className={styles.distance}>{Math.round(distance)}m</div>
    </div>
  );
};