"use client";

import { useEffect, useRef } from "react";
import type * as PhaserType from "phaser";
import type { GameState } from "@/game/types";

interface GameOverPayload {
  gameState: GameState;
  cashCrunch: boolean;
  survived: boolean;
}

interface WaveCompletePayload {
  gameState: GameState;
}

interface GameCanvasProps {
  visible: boolean;
  onIntroComplete: () => void;
  onWaveComplete: (updatedState: GameState) => void;
  onGameOver: (data: GameOverPayload) => void;
  /** Called once the Phaser game is ready — React uses this to start waves with a given state. */
  onReady: (controller: GameController) => void;
}

export interface GameController {
  startAction: (gameState: GameState) => void;
  destroy: () => void;
}

/**
 * Thin wrapper around Phaser.
 * Phaser is always mounted; `visible` just toggles CSS display so React overlays
 * (BusinessType / Planning / Results) render on top without destroying the canvas.
 */
export default function GameCanvas({
  visible,
  onIntroComplete,
  onWaveComplete,
  onGameOver,
  onReady,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserType.Game | null>(null);
  const initRef = useRef(false);

  // Keep latest callbacks in refs so we don't re-run the init effect.
  const introCb = useRef(onIntroComplete);
  const waveCb = useRef(onWaveComplete);
  const overCb = useRef(onGameOver);
  const readyCb = useRef(onReady);

  introCb.current = onIntroComplete;
  waveCb.current = onWaveComplete;
  overCb.current = onGameOver;
  readyCb.current = onReady;

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    let cancelled = false;

    const init = async () => {
      const Phaser = (await import("phaser")).default;
      const { createGameConfig } = await import("@/game/config");

      if (cancelled || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const config = createGameConfig("phaser-game", width, height);
      const game = new Phaser.Game(config);
      gameRef.current = game;

      // Retina DPR fix
      const canvas = game.canvas;
      if (canvas) {
        const cssW = canvas.clientWidth || width;
        const cssH = canvas.clientHeight || height;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }

      // Bridge Phaser events → React callbacks
      game.events.on("intro-complete", () => {
        introCb.current();
      });
      game.events.on("wave-complete", (data: WaveCompletePayload) => {
        waveCb.current(data.gameState);
      });
      game.events.on("game-over", (data: GameOverPayload) => {
        overCb.current(data);
      });

      const controller: GameController = {
        startAction: (gameState: GameState) => {
          // Stop any currently-running scenes (Intro or prior Action), then start fresh ActionScene.
          const mgr = game.scene;
          const intro = mgr.getScene("IntroScene");
          if (intro && mgr.isActive("IntroScene")) {
            mgr.stop("IntroScene");
          }
          const prev = mgr.getScene("ActionScene");
          if (prev && mgr.isActive("ActionScene")) {
            mgr.stop("ActionScene");
          }
          mgr.start("ActionScene", { gameState });
        },
        destroy: () => {
          game.destroy(true);
        },
      };

      readyCb.current(controller);
    };

    init();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-me-plum overflow-hidden touch-none"
      style={{ display: visible ? "block" : "none" }}
    >
      <div id="phaser-game" className="w-full h-full" />
    </div>
  );
}
