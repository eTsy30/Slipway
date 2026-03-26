interface DistanceProps {
  meters: number;
}
import styles from './Distance.module.scss';

export const Distance = ({ meters }: DistanceProps) => {
  const km = (meters / 1000).toFixed(2);
  
  return (
   <div className={styles.container}>
  <div className={styles.value}>{km}</div>
  <div className={styles.label}>km</div>
</div>
  );
};