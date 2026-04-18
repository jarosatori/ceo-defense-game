import * as Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene";
import { ActionScene } from "./scenes/ActionScene";
import { COLORS } from "./constants";

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
    // Menu scenes (BusinessType, Planning, GameOver) now live as React overlays.
    // Only IntroScene + ActionScene remain inside Phaser.
    scene: [IntroScene, ActionScene],
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
