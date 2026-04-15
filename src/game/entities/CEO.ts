import * as Phaser from "phaser";
import { COLORS, CEO_CATCH_RADIUS } from "../constants";

export class CEO extends Phaser.GameObjects.Container {
  private innerCircle: Phaser.GameObjects.Arc;
  private glowRing: Phaser.GameObjects.Arc;
  private pulseRing: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Catch radius indicator (subtle ring)
    this.radiusIndicator = scene.add
      .circle(0, 0, CEO_CATCH_RADIUS, 0xffffff, 0.025)
      .setStrokeStyle(1, 0xffffff, 0.1);

    // Outer glow (pulsing)
    this.glowRing = scene.add.circle(0, 0, 38, COLORS.ceo, 0.08);

    // Pulsing middle ring
    this.pulseRing = scene.add
      .circle(0, 0, 26, 0xffffff, 0)
      .setStrokeStyle(2, 0xffffff, 0.35);

    // Main body
    this.innerCircle = scene.add.circle(0, 0, 22, COLORS.ceo);

    // Label
    this.label = scene.add
      .text(0, 0, "CEO", {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5);

    this.add([this.radiusIndicator, this.glowRing, this.pulseRing, this.innerCircle, this.label]);
    scene.add.existing(this);

    // Breathing animation
    scene.tweens.add({
      targets: this.glowRing,
      scale: { from: 0.9, to: 1.18 },
      alpha: { from: 0.06, to: 0.18 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Pulse ring expansion
    scene.tweens.add({
      targets: this.pulseRing,
      scale: { from: 1, to: 2.2 },
      alpha: { from: 0.5, to: 0 },
      duration: 2400,
      repeat: -1,
      ease: "Sine.easeOut",
    });
  }

  flashDamage(): void {
    this.scene.tweens.add({
      targets: this.innerCircle,
      fillColor: { from: COLORS.finance, to: COLORS.ceo },
      scale: { from: 1.3, to: 1 },
      duration: 380,
      ease: "Power2",
    });
  }

  celebrateCatch(): void {
    this.scene.tweens.add({
      targets: this.innerCircle,
      scale: { from: 1.15, to: 1 },
      duration: 150,
      ease: "Back.easeOut",
    });
  }
}
