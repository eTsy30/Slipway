'use client';

import {  useMemo } from 'react';
import styles from './Speedometer.module.scss';

interface SpeedometerProps {
  currentSpeed?: number;
  maxScale?: number;
}

export const Speedometer = ({ currentSpeed = 0, maxScale = 60 }: SpeedometerProps) => {

  
  const totalTicks = 60;
  const ticks = useMemo(
    () =>
      Array.from({ length: totalTicks + 1 }, (_, i) => {
        const angle = (i / totalTicks) * 270 - 135;
        const isMajor = i % 10 === 0;
        const r1 = isMajor ? 60 : 65;
        const r2 = 72;
        const rad = (angle * Math.PI) / 180;
        return {
          id: i,
          x1: 75 + r1 * Math.cos(rad),
          y1: 75 + r1 * Math.sin(rad),
          x2: 75 + r2 * Math.cos(rad),
          y2: 75 + r2 * Math.sin(rad),
          isMajor,
          isActive: i <= Math.floor((currentSpeed / maxScale) * totalTicks),
        };
      }),
    [currentSpeed, maxScale]
  );

  const getZoneColor = (speed: number) =>
    speed <= 20 ? '#22c55e' : speed <= 35 ? '#eab308' : '#ef4444';

  const zoneColor = getZoneColor(currentSpeed);
  return (
    <div className={styles.wrapper}>
      <div className={styles.speedometer}>
        <svg viewBox="0 0 150 150" className={styles.svg}>
          <g>
            {ticks.map(t => (
              <line
                key={t.id}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                className={styles.tick}
                stroke={t.isActive ? zoneColor : '#7c7c7c'}
                strokeWidth={t.isMajor ? 2.5 : 1.5}
              />
            ))}
          </g>
        </svg>

        <div className={styles.display}>
          <div className={styles.speedValue} style={{ color: zoneColor }}>
            {currentSpeed.toFixed(1)}
          </div>
          <div className={styles.speedUnit}>km/h</div>
          <div className={styles.maxLabel}>
            max <span>{maxScale.toFixed(1)}</span>
          </div>
        </div>

       
      </div>

      
    </div>
  );
};