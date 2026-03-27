interface DistanceProps {
  meters: number;
}
import styles from './Distance.module.scss';

export const Distance = ({ meters }: DistanceProps) => {
  const km = (meters / 1000).toFixed(2);
  
  return (
  
  <div className={styles.value}>{km} km</div>

  );
};