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
      const width = Math.min(container.clientWidth, 800);
      const height = Math.min(container.clientHeight, 600);

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
      className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center"
    >
      <div id="phaser-game" />
    </div>
  );
}
