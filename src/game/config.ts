import * as Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { ActionScene } from "./scenes/ActionScene";
import { COLORS } from "./constants";

/**
 * Phaser only handles the gameplay (ActionScene).
 * Intro / BusinessType / Planning / GameOver are rendered as React overlays
 * for full design-system fidelity.
 */
export function createGameConfig(
  parent: string,
  width: number,
  height: number,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: COLORS.background,
    // BootScene auto-starts and preloads sprites, then sits idle.
    // ActionScene is added but only started on demand by React via controller.startAction().
    scene: [BootScene, ActionScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
    },
  };
}
