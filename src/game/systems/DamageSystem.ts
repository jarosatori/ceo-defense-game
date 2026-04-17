import * as Phaser from "phaser";
import { DAMAGE_PER_MISS, COLORS } from "../constants";

export class DamageSystem {
  damage: number = 0;
  private bar: Phaser.GameObjects.Graphics;
  private barWidth: number;
  private barHeight: number = 8;
  private barX: number;
  private barY: number;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { width } = scene.scale;
    this.barWidth = width - 80;
    this.barX = 16;
    this.barY = 34;

    this.bar = scene.add.graphics();
    this.bar.setDepth(16);
    this.label = scene.add
      .text(this.barX + this.barWidth + 8, this.barY + this.barHeight / 2, "0%", {
        fontSize: "9px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#888",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0, 0.5)
      .setDepth(16);

    this.draw();
  }

  addDamage(amount: number = DAMAGE_PER_MISS): void {
    this.damage = Math.min(100, this.damage + amount);
    this.draw();
  }

  isGameOver(): boolean {
    return this.damage >= 100;
  }

  private draw(): void {
    this.bar.clear();

    this.bar.fillStyle(0x333333, 1);
    this.bar.fillRoundedRect(this.barX, this.barY, this.barWidth, this.barHeight, 4);

    const fillWidth = (this.damage / 100) * this.barWidth;
    if (fillWidth > 0) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(COLORS.damageStart),
        Phaser.Display.Color.IntegerToColor(COLORS.damageEnd),
        100,
        this.damage
      );
      const fillColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      this.bar.fillStyle(fillColor, 1);
      this.bar.fillRoundedRect(this.barX, this.barY, fillWidth, this.barHeight, 4);
    }

    this.label.setText(`${Math.round(this.damage)}%`);
  }

  destroy(): void {
    this.bar.destroy();
    this.label.destroy();
  }
}
