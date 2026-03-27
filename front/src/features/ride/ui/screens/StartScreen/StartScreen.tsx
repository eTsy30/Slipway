'use client';

import styles from './StartScreen.module.scss';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.logo}>SLIPWAY</h1>
        <p className={styles.tagline}>
          Собери все монеты. Быстрее = больше очков
        </p>
        <button className={styles.startBtn} onClick={onStart}>
          START
        </button>
      </div>
      
      <div className={styles.preview}>
        <div className={styles.hudPreview}>
          <div className={styles.speed}>0.0</div>
          <div className={styles.time}>00:00</div>
        </div>
      </div>
    </div>
  );
};