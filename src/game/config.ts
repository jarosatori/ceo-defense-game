import * as Phaser from "phaser";
import { IntroScene } from "./scenes/IntroScene";
import { ActionScene } from "./scenes/ActionScene";
import { PlanningScene } from "./scenes/PlanningScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { COLORS } from "./constants";

export function createGameConfig(
  parent: string,
  width: number,
  height: number
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: COLORS.background,
    scene: [IntroScene, ActionScene, PlanningScene, GameOverScene],
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
