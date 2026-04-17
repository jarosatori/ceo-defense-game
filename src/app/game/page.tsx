"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-me-plum flex items-center justify-center">
      <p className="text-me-cream text-lg">Načítavam hru...</p>
    </div>
  ),
});

export default function GamePage() {
  return <PhaserGame />;
}
