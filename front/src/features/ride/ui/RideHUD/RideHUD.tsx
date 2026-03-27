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
  
}: RideHUDProps) => {
  return (
    <div className={styles.hud}>
      {/* Speedometer — левый верхний угол */}
      <div className={styles.speedContainer}>
        <Speedometer currentSpeed={currentSpeed} maxScale={maxSpeed} />
         <div className={styles.container}>
        <Distance meters={distance} />
          <Timer elapsed={elapsed} isRunning={isRunning} />
          </div>
         <div className={styles.container}>
          <span className={styles.statCoins}>
            {collectedCount}/{totalCoins || 5} 🪙
          </span>
          <span className={styles.statPoints}>{Math.floor(distance * combo)} pts</span>
        </div>
      </div>
    </div>)
};