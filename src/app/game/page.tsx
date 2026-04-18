"use client";

import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("@/components/game/GameClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-me-plum">
      <p className="text-lg text-me-cream">Načítavam hru...</p>
    </div>
  ),
});

export default function GamePage() {
  return <GameClient />;
}
