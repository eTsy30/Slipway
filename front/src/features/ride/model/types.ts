export interface Point {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
}

export interface Coin {
  id: string;
  lat: number;
  lng: number;
  order: number;
}

export type Screen = 'start' | 'ride' | 'complete';
export type ComboLevel = 1 | 2 | 3;