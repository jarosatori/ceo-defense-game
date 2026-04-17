import * as Phaser from "phaser";
import type { Category } from "../types";
import { PROBLEM_CONFIGS } from "../constants";
import { randomTaskGlyph } from "../utils/spriteLoader";

export class Problem extends Phaser.GameObjects.Container {
  category: Category;
  speed: number;
  targetX: number;
  targetY: number;
  caught: boolean = false;
  private icon!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Graphics;
  private size: number = 14;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    category: Category,
    speed: number,
    targetX: number,
    targetY: number,
  ) {
    super(scene, x, y);
    this.category = category;
    this.speed = speed;
    this.targetX = targetX;
    this.targetY = targetY;

    this.drawGlow();

    const key = randomTaskGlyph(this.category);
    this.icon = scene.add.image(0, 0, key);

    this.add([this.glow, this.icon]);
    scene.add.existing(this);

    // Subtle breathing glow
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.4, to: 0.7 },
      scale: { from: 0.95, to: 1.12 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Gentle idle float on icon
    scene.tweens.add({
      targets: this.icon,
      scale: { from: 0.98, to: 1.04 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private drawGlow(): void {
    const config = PROBLEM_CONFIGS[this.category];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.glow = this.scene.add.graphics();

    // Layered soft halo behind icon
    this.glow.fillStyle(color, 0.18);
    this.glow.fillCircle(0, 0, 30);
    this.glow.fillStyle(color, 0.32);
    this.glow.fillCircle(0, 0, 22);
    this.glow.fillStyle(color, 0.45);
    this.glow.fillCircle(0, 0, 16);
  }

  update(delta: number): void {
    if (this.caught) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      this.emit("missed", this);
      this.destroy();
      return;
    }

    const pixelsPerMs = this.scene.scale.width / this.speed / 1000;
    const moveDistance = pixelsPerMs * delta;
    const ratio = moveDistance / dist;

    this.x += dx * ratio;
    this.y += dy * ratio;
  }

  catch(): void {
    this.caught = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: { from: 1, to: 1.6 },
      duration: 220,
      ease: "Back.easeOut",
      onComplete: () => this.destroy(),
    });
  }

  // Preserve size accessor for any external callers
  getSize(): number {
    return this.size;
  }
}
