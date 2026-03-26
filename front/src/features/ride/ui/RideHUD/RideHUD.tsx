import { Distance } from "../Distance/Distance";
import { Speedometer } from "../Speedometer/Speedometer";
import { Timer } from "../Timer/Timer";
import styles from './HUD.module.scss';

interface RideHUDProps {
  elapsed: number;
  isRunning: boolean;
  currentSpeed: number;
  maxSpeed: number;
  combo: number;
  distance: number;
  collectedCount: number;
  totalCoins?: number;
  currentTarget?: number;
}

export const RideHUD = ({
  elapsed,
  isRunning,
  currentSpeed,
  maxSpeed,
  combo,
  distance,
  collectedCount,
  totalCoins,
  currentTarget,
}: RideHUDProps) => {
  return (
    <div className={styles.hud}>
      <div className={styles.header}>
        <div className={styles.logo}>SLIPWAY</div>
        <div className={styles.status}>
          <div className={styles.statusDot} />
          <span>{isRunning ? 'RIDING' : 'PAUSED'}</span>
        </div>
      </div>
      
      <div className={styles.main}>
        <Speedometer current={currentSpeed} max={maxSpeed} combo={combo} />
        <Distance meters={distance} />
        <Timer elapsed={elapsed} isRunning={isRunning} />
      </div>
      
      <div className={styles.stats}>
        <span>{(distance / 1000).toFixed(2)} km</span>
        <span className={styles.statCoins}>
          {currentTarget ? `🎯 #${currentTarget} ` : ''}
          {collectedCount}/{totalCoins || 5} 🪙
        </span>
        <span className={styles.statPoints}>{Math.floor(distance * combo)} pts</span>
      </div>
    </div>
  );
};