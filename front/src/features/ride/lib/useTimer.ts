import { useEffect, useRef, useState } from 'react';

export const useTimer = (isRunning: boolean) => {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Запоминаем когда стартовали (вычитаем уже прошедшее)
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now() - (elapsed * 1000);
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const reset = () => {
    startTimeRef.current = 0;
    setElapsed(0);
  };

  return { elapsed, reset };
};