'use client';
import styles from './RideControls.module.scss';
import cn from 'classnames';
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
    <button className={cn(styles.buttonBase,styles.start)} onClick={onStart}>START</button>
  ) : (
    <button className={cn(styles.buttonBase,styles.stop)} onClick={onStop}>STOP</button>
  )}
  
  {canReset && (
    <button className={cn(styles.buttonBase,styles.reset)} onClick={onReset}>RESET</button>
  )}
</div>

  );
};