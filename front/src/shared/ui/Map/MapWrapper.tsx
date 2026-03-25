"use client";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import("@/shared/ui/Map/Map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading...</div>
});

export default function MapWrapper() {
  return <Map />;
}