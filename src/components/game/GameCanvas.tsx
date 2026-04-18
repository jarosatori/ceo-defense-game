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
 *
 * The init pattern below is React-strict-mode safe: each mount/unmount cycle
 * properly creates and destroys the Phaser game instance.
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
    if (!containerRef.current) return;

    let cancelled = false;
    let localGame: PhaserType.Game | null = null;

    const waitForSize = (): Promise<{ width: number; height: number }> =>
      new Promise((resolve) => {
        const check = () => {
          if (cancelled) return;
          const el = containerRef.current;
          if (!el) {
            requestAnimationFrame(check);
            return;
          }
          const w = el.clientWidth;
          const h = el.clientHeight;
          if (w > 0 && h > 0) {
            resolve({ width: w, height: h });
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });

    const init = async () => {
      const Phaser = (await import("phaser")).default;
      const { createGameConfig } = await import("@/game/config");

      // After awaits — bail if the effect was cleaned up while we waited.
      if (cancelled || !containerRef.current) return;
      // Don't double-create if a game already exists (defensive).
      if (gameRef.current) return;

      // Wait for container to have non-zero dimensions before booting Phaser.
      // Otherwise the canvas inits at 0×0 and Scale.RESIZE doesn't recover.
      const { width, height } = await waitForSize();
      if (cancelled) return;

      const config = createGameConfig("phaser-game", width, height);
      const game = new Phaser.Game(config);
      localGame = game;
      gameRef.current = game;

      // Force an immediate resize after boot so the canvas matches container.
      game.events.once("ready", () => {
        if (!cancelled && containerRef.current) {
          game.scale.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight,
          );
        }
      });

      // Also handle window resizes
      const handleResize = () => {
        if (cancelled || !containerRef.current) return;
        game.scale.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
        );
      };
      window.addEventListener("resize", handleResize);
      game.events.once("destroy", () => {
        window.removeEventListener("resize", handleResize);
      });

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
          const mgr = game.scene;
          // Stop any currently-running scenes (Intro or prior Action)
          if (mgr.isActive("IntroScene")) {
            mgr.stop("IntroScene");
          }
          if (mgr.isActive("ActionScene")) {
            mgr.stop("ActionScene");
          }
          // Brief delay to let stop() fully cycle before starting fresh
          setTimeout(() => {
            if (!cancelled && gameRef.current === game) {
              mgr.start("ActionScene", { gameState });
            }
          }, 0);
        },
        destroy: () => {
          game.destroy(true);
        },
      };

      readyCb.current(controller);
    };

    init().catch((err) => {
      // Surface init errors so we don't fail silently
      console.error("[GameCanvas] Phaser init failed:", err);
    });

    return () => {
      cancelled = true;
      // Destroy whichever game instance exists (covers strict-mode timing)
      if (localGame) {
        localGame.destroy(true);
        localGame = null;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Canvas is ALWAYS sized (display: block) so Phaser can boot.
  // When not visible, we hide it behind overlays via z-index + pointer-events
  // (overlays have z-20). Using `display: none` here would zero-size the inner
  // div and prevent Phaser from ever booting.
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-me-plum overflow-hidden touch-none"
      style={{
        zIndex: visible ? 10 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div id="phaser-game" className="w-full h-full" />
    </div>
  );
}
