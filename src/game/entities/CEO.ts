import * as Phaser from "phaser";
import { COLORS, CEO_CATCH_RADIUS } from "../constants";
import { roleTextureKey } from "../utils/spriteLoader";

export class CEO extends Phaser.GameObjects.Container {
  private innerCircle: Phaser.GameObjects.Arc;
  private glowRing: Phaser.GameObjects.Arc;
  private pulseRing: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private icon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Catch radius indicator
    this.radiusIndicator = scene.add
      .circle(0, 0, CEO_CATCH_RADIUS, 0xffffff, 0.025)
      .setStrokeStyle(1, 0xffffff, 0.1);

    // Outer glow (pulsing)
    this.glowRing = scene.add.circle(0, 0, 42, COLORS.ceo, 0.1);

    // Middle pulsing ring
    this.pulseRing = scene.add
      .circle(0, 0, 30, 0xffffff, 0)
      .setStrokeStyle(2, 0xefedeb, 0.4);

    // Main body — cream circle with plum border
    this.innerCircle = scene.add.circle(0, 0, 26, COLORS.ceo);
    this.innerCircle.setStrokeStyle(2, 0x531e38, 0.9);

    // Crown icon on top — tinted plum for contrast on cream bg
    this.icon = scene.add.image(0, 0, roleTextureKey("ceo"));
    this.icon.setTint(0x531e38);

    this.add([
      this.radiusIndicator,
      this.glowRing,
      this.pulseRing,
      this.innerCircle,
      this.icon,
    ]);
    scene.add.existing(this);

    // Breathing animation
    scene.tweens.add({
      targets: this.glowRing,
      scale: { from: 0.9, to: 1.2 },
      alpha: { from: 0.08, to: 0.22 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Pulse ring expansion
    scene.tweens.add({
      targets: this.pulseRing,
      scale: { from: 1, to: 2.2 },
      alpha: { from: 0.55, to: 0 },
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
    this.scene.tweens.add({
      targets: this.icon,
      scale: { from: 1.3, to: 1 },
      duration: 380,
      ease: "Power2",
    });
  }

  celebrateCatch(): void {
    this.scene.tweens.add({
      targets: [this.innerCircle, this.icon],
      scale: { from: 1.15, to: 1 },
      duration: 150,
      ease: "Back.easeOut",
    });
  }
}
