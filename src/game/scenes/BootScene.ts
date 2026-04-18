import * as Phaser from "phaser";
import { preloadSprites } from "../utils/spriteLoader";

/**
 * Tiny boot scene — auto-started by Phaser at game init.
 * Preloads all sprites, then sits idle. React triggers ActionScene on demand
 * via controller.startAction(gameState).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    preloadSprites(this);
  }

  create(): void {
    // No-op. Sprites are preloaded into the global texture cache.
    // React will start ActionScene when the user picks a business type.
  }
}
