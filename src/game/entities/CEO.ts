import * as Phaser from "phaser";
import { COLORS, CEO_CATCH_RADIUS } from "../constants";

export class CEO extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.radiusIndicator = scene.add
      .circle(0, 0, CEO_CATCH_RADIUS, 0xffffff, 0.05)
      .setStrokeStyle(1, 0xffffff, 0.15);

    this.circle = scene.add.circle(0, 0, 18, COLORS.ceo);

    this.label = scene.add
      .text(0, 0, "CEO", {
        fontSize: "10px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([this.radiusIndicator, this.circle, this.label]);
    scene.add.existing(this);
  }

  flashDamage(): void {
    this.scene.tweens.add({
      targets: this.circle,
      fillColor: { from: COLORS.finance, to: COLORS.ceo },
      duration: 300,
    });
  }
}
