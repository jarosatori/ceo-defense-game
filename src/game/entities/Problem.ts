import * as Phaser from "phaser";
import type { Category } from "../types";
import { PROBLEM_CONFIGS } from "../constants";

export class Problem extends Phaser.GameObjects.Container {
  category: Category;
  speed: number;
  targetX: number;
  targetY: number;
  caught: boolean = false;
  private shape!: Phaser.GameObjects.Graphics;
  private glow!: Phaser.GameObjects.Graphics;
  private size: number = 14;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    category: Category,
    speed: number,
    targetX: number,
    targetY: number
  ) {
    super(scene, x, y);
    this.category = category;
    this.speed = speed;
    this.targetX = targetX;
    this.targetY = targetY;

    this.drawGlow();
    this.drawShape();
    this.add([this.glow, this.shape]);
    scene.add.existing(this);

    // Gentle rotation for visual interest
    if (category === "marketing" || category === "finance") {
      scene.tweens.add({
        targets: this.shape,
        angle: 360,
        duration: 4000,
        repeat: -1,
        ease: "Linear",
      });
    }

    // Subtle breathing glow
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.4, to: 0.65 },
      scale: { from: 0.95, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private drawGlow(): void {
    const config = PROBLEM_CONFIGS[this.category];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.glow = this.scene.add.graphics();

    // Layered soft glow
    this.glow.fillStyle(color, 0.2);
    this.glow.fillCircle(0, 0, this.size * 2.2);
    this.glow.fillStyle(color, 0.35);
    this.glow.fillCircle(0, 0, this.size * 1.5);
  }

  private drawShape(): void {
    const config = PROBLEM_CONFIGS[this.category];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.shape = this.scene.add.graphics();
    this.shape.fillStyle(color, 1);
    this.shape.lineStyle(1.5, 0xffffff, 0.5);

    const s = this.size;
    switch (config.shape) {
      case "triangle":
        this.shape.fillTriangle(0, -s, -s, s * 0.85, s, s * 0.85);
        this.shape.strokeTriangle(0, -s, -s, s * 0.85, s, s * 0.85);
        break;
      case "diamond":
        this.shape.fillPoints(
          [
            new Phaser.Geom.Point(0, -s),
            new Phaser.Geom.Point(s, 0),
            new Phaser.Geom.Point(0, s),
            new Phaser.Geom.Point(-s, 0),
          ],
          true
        );
        this.shape.strokePoints(
          [
            new Phaser.Geom.Point(0, -s),
            new Phaser.Geom.Point(s, 0),
            new Phaser.Geom.Point(0, s),
            new Phaser.Geom.Point(-s, 0),
            new Phaser.Geom.Point(0, -s),
          ]
        );
        break;
      case "square": {
        const r = 3;
        this.shape.fillRoundedRect(-s, -s, s * 2, s * 2, r);
        this.shape.strokeRoundedRect(-s, -s, s * 2, s * 2, r);
        break;
      }
      case "circle":
        this.shape.fillCircle(0, 0, s);
        this.shape.strokeCircle(0, 0, s);
        break;
    }
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
}
