"use client";

import { useEffect, useRef } from "react";

export default function PhaserGame() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !gameContainerRef.current) return;
    initRef.current = true;

    const initPhaser = async () => {
      const Phaser = (await import("phaser")).default;
      const { createGameConfig } = await import("@/game/config");

      const container = gameContainerRef.current!;
      // Use full container dimensions, capped sensibly
      const width = Math.min(container.clientWidth, 900);
      const height = Math.min(container.clientHeight, 900);

      const config = createGameConfig("phaser-game", width, height);
      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      className="w-full h-[100dvh] bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
    >
      <div id="phaser-game" className="w-full h-full max-w-[900px] max-h-[900px]" />
    </div>
  );
}
