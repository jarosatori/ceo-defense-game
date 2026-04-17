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
      const width = container.clientWidth;
      const height = container.clientHeight;

      const config = createGameConfig("phaser-game", width, height);
      gameRef.current = new Phaser.Game(config);

      // Retina DPR fix: scale canvas internal resolution while keeping CSS size
      const dpr = window.devicePixelRatio || 1;
      const canvas = gameRef.current.canvas;
      if (canvas && dpr > 1) {
        const cssW = canvas.clientWidth || width;
        const cssH = canvas.clientHeight || height;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }
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
      className="w-full h-[100dvh] bg-me-plum overflow-hidden touch-none"
    >
      <div id="phaser-game" className="w-full h-full" />
    </div>
  );
}
