'use client';
import styles from './RideControls.module.scss';
interface RideControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  canReset: boolean;
}

export const RideControls = ({ 
  isRecording, 
  onStart, 
  onStop, 
  onReset, 
  canReset 
}: RideControlsProps) => {
  return (
    <div className={styles.container}>
  {!isRecording ? (
    <button className={styles.start} onClick={onStart}>START</button>
  ) : (
    <button className={styles.stop} onClick={onStop}>STOP</button>
  )}
  
  {canReset && (
    <button className={styles.reset} onClick={onReset}>RESET</button>
  )}
</div>

  );
};