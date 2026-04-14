import * as Phaser from "phaser";
import type { Category } from "../types";
import { PROBLEM_CONFIGS } from "../constants";

export class Problem extends Phaser.GameObjects.Graphics {
  category: Category;
  speed: number;
  targetX: number;
  targetY: number;
  caught: boolean = false;
  private size: number = 12;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    category: Category,
    speed: number,
    targetX: number,
    targetY: number
  ) {
    super(scene, { x, y });
    this.category = category;
    this.speed = speed;
    this.targetX = targetX;
    this.targetY = targetY;

    this.drawShape();
    scene.add.existing(this);
  }

  private drawShape(): void {
    const config = PROBLEM_CONFIGS[this.category];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.fillStyle(color, 1);

    const s = this.size;
    switch (config.shape) {
      case "triangle":
        this.fillTriangle(0, -s, -s, s, s, s);
        break;
      case "diamond":
        this.fillPoints(
          [
            new Phaser.Geom.Point(0, -s),
            new Phaser.Geom.Point(s, 0),
            new Phaser.Geom.Point(0, s),
            new Phaser.Geom.Point(-s, 0),
          ],
          true
        );
        break;
      case "square":
        this.fillRect(-s, -s, s * 2, s * 2);
        break;
      case "circle":
        this.fillCircle(0, 0, s);
        break;
    }
  }

  update(delta: number): void {
    if (this.caught) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.emit("missed", this);
      this.destroy();
      return;
    }

    const pixelsPerMs = (this.scene.scale.width / this.speed) / 1000;
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
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 150,
      onComplete: () => this.destroy(),
    });
  }
}
