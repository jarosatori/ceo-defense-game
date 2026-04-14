import * as Phaser from "phaser";
import { COLORS } from "../constants";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Title
    const title = this.add
      .text(centerX, centerY - 60, "CEO DEFENSE", {
        fontSize: "36px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Subtitle
    const subtitle = this.add
      .text(centerX, centerY, "Dokážeš vybudovať firmu,\nktorá funguje bez teba?", {
        fontSize: "18px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // CEO circle preview
    const ceoCircle = this.add
      .circle(centerX, centerY + 80, 20, COLORS.ceo)
      .setAlpha(0);

    const startHint = this.add
      .text(centerX, centerY + 130, "Ty si CEO. Všetko ide cez teba.", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#a3a3a3",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animate in sequence
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: centerY - 80,
      duration: 800,
      ease: "Power2",
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 800,
      delay: 600,
      ease: "Power2",
    });

    this.tweens.add({
      targets: ceoCircle,
      alpha: 1,
      duration: 600,
      delay: 1200,
      ease: "Power2",
    });

    this.tweens.add({
      targets: startHint,
      alpha: 1,
      duration: 600,
      delay: 1600,
      ease: "Power2",
    });

    // Transition to ActionScene after intro
    this.time.delayedCall(4000, () => {
      this.scene.start("ActionScene");
    });
  }
}
