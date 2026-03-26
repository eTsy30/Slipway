'use client';

import styles from './Coins.module.scss';

interface Coin {
  id: string;
  lat: number;
  lng: number;
  collected: boolean;
}

interface CoinsProps {
  coins: Coin[];
  onCollect: (id: string) => void;
}

export const Coins = ({ coins, onCollect }: CoinsProps) => {
  // В реальности позиции считаются относительно карты
  // Здесь упрощённая версия для демо
  return (
    <>
      {coins.map((coin, i) => !coin.collected && (
        <div
          key={coin.id}
          className={styles.coin}
          style={{
            top: `${30 + i * 10}%`,
            left: `${60 - i * 8}%`,
          }}
          onClick={() => onCollect(coin.id)}
        >
          🪙1
        </div>
      ))}
    </>
  );
};