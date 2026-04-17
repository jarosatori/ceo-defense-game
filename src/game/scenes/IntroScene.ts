import * as Phaser from "phaser";
import { COLORS, CSS_COLORS } from "../constants";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Gradient background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 6; i++) {
      bg.fillStyle(0x1a1a2e, 0.05 + i * 0.025);
      bg.fillCircle(centerX, centerY, Math.max(width, height) * (1 - i * 0.14));
    }

    // Subtle dots
    const dots = this.add.graphics();
    dots.fillStyle(0xffffff, 0.04);
    for (let x = 40; x < width; x += 40) {
      for (let y = 40; y < height; y += 40) {
        dots.fillCircle(x, y, 1);
      }
    }

    // Title
    const title = this.add
      .text(centerX, centerY - 100, "CEO DEFENSE", {
        fontSize: "44px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#ffffff",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Accent line under title
    const accent = this.add
      .rectangle(centerX, centerY - 60, 60, 3, 0xeab308)
      .setAlpha(0);

    // Subtitle
    const subtitle = this.add
      .text(
        centerX,
        centerY - 20,
        "Dokážeš vybudovať firmu,\nktorá funguje bez teba?",
        {
          fontSize: "17px",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          color: "#EFEDEB",
          align: "center",
          lineSpacing: 6,
          resolution: 2,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // CEO preview (with glow)
    const ceoGlow = this.add.circle(centerX, centerY + 60, 32, COLORS.ceo, 0.12).setAlpha(0);
    const ceoCircle = this.add.circle(centerX, centerY + 60, 18, COLORS.ceo).setAlpha(0);
    const ceoLabel = this.add
      .text(centerX, centerY + 60, "CEO", {
        fontSize: "10px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#EFEDEB",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Start hint
    const startHint = this.add
      .text(centerX, centerY + 120, "Ty si CEO. Všetko ide cez teba.", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const loadingLabel = this.add
      .text(centerX, height - 40, "10 levelov biznis problemov...", {
        fontSize: "11px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#7A736A",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animate in sequence
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: centerY - 120,
      duration: 800,
      ease: "Power2",
    });

    this.tweens.add({
      targets: accent,
      alpha: 1,
      scaleX: { from: 0, to: 1 },
      duration: 500,
      delay: 500,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 700,
      delay: 900,
    });

    this.tweens.add({
      targets: [ceoGlow, ceoCircle, ceoLabel],
      alpha: { from: 0, to: 1 },
      duration: 500,
      delay: 1400,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: startHint,
      alpha: 1,
      duration: 500,
      delay: 1800,
    });

    this.tweens.add({
      targets: loadingLabel,
      alpha: 1,
      duration: 400,
      delay: 2400,
    });

    // Pulsing CEO glow
    this.tweens.add({
      targets: ceoGlow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 0.12, to: 0.25 },
      duration: 1200,
      delay: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Skip on click
    this.input.once("pointerdown", () => {
      this.scene.start("BusinessTypeScene");
    });

    // Transition to ActionScene after intro
    this.time.delayedCall(3500, () => {
      this.scene.start("BusinessTypeScene");
    });
  }
}
