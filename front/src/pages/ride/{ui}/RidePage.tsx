'use client';

import { useRideGame } from "@/features/ride/lib/useRideGame";
import { CompleteScreen } from "@/features/ride/ui/screens/CompleteScreen/CompleteScreen";
import { RideScreen } from "@/features/ride/ui/screens/RideScreen/RideScreen";
import { StartScreen } from "@/features/ride/ui/screens/StartScreen/StartScreen";



export const RidePage = () => {
  const {
    screen,
    route,
    currentPosition,
    coinsForMap,
    elapsed,
    distance,
    currentSpeed,
    maxSpeed,
    combo,
    score,
    collectedCount,
    totalCoins,
    startRide,
    stopRide,
    resetRide,
  } = useRideGame();

  if (screen === 'start') {
    return <StartScreen onStart={startRide} />;
  }

  if (screen === 'complete') {
    return (
      <CompleteScreen
        elapsed={elapsed}
        distance={distance}
        maxSpeed={maxSpeed}
        collectedCount={collectedCount}
        totalCoins={totalCoins}
        score={score}
        onReset={resetRide}
      />
    );
  }

  return (
    <RideScreen
      route={route}
      currentPosition={currentPosition}
      coins={coinsForMap}
      elapsed={elapsed}
      currentSpeed={currentSpeed}
      maxSpeed={maxSpeed}
      combo={combo}
      distance={distance}
      collectedCount={collectedCount}
      totalCoins={totalCoins}
      onStop={stopRide}
      onReset={resetRide}
    />
  );
};

export default RidePage;