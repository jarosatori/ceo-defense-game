import * as Phaser from "phaser";
import { preloadSprites, roleTextureKey } from "../utils/spriteLoader";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  preload(): void {
    preloadSprites(this);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Plum background
    const bg = this.add.graphics();
    bg.fillStyle(0x531e38, 1); // me-plum
    bg.fillRect(0, 0, width, height);
    // Magenta radial glow
    for (let i = 0; i < 5; i++) {
      bg.fillStyle(0x9f2d6d, 0.04 + i * 0.015);
      bg.fillCircle(centerX, centerY, Math.max(width, height) * (0.7 - i * 0.12));
    }

    // Subtle cream dots
    const dots = this.add.graphics();
    dots.fillStyle(0xefedeb, 0.04);
    for (let x = 44; x < width; x += 44) {
      for (let y = 44; y < height; y += 44) {
        dots.fillCircle(x, y, 1);
      }
    }

    // Title — cream Plex Mono
    const title = this.add
      .text(centerX, centerY - 100, "CEO DEFENSE", {
        fontSize: "44px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#EFEDEB",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Orange period after title (the brand signature)
    const period = this.add
      .text(0, centerY - 100, ".", {
        fontSize: "44px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#FF7404",
        fontStyle: "600",
        resolution: 2,
      })
      .setAlpha(0);

    // Orange accent line under title
    const accent = this.add
      .rectangle(centerX, centerY - 60, 60, 3, 0xff7404)
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
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // CEO preview — cream disc with plum-tinted crown icon (matches CEO entity)
    const ceoGlow = this.add
      .circle(centerX, centerY + 70, 38, 0xefedeb, 0.1)
      .setAlpha(0);
    const ceoBody = this.add
      .circle(centerX, centerY + 70, 26, 0xefedeb)
      .setStrokeStyle(2, 0x531e38, 0.9)
      .setAlpha(0);

    // Crown icon (cream stroke originally — tint plum to show on cream bg)
    let ceoIcon: Phaser.GameObjects.Image | null = null;
    if (this.textures.exists(roleTextureKey("ceo"))) {
      ceoIcon = this.add
        .image(centerX, centerY + 70, roleTextureKey("ceo"))
        .setTint(0x531e38)
        .setAlpha(0);
    }

    // Start hint
    const startHint = this.add
      .text(centerX, centerY + 130, "Ty si CEO. Všetko ide cez teba.", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const loadingLabel = this.add
      .text(centerX, height - 40, "10 mesiacov · 9 priorít · 10 pozícií", {
        fontSize: "11px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Position the orange period right after the title text once it's measured
    title.once("destroy", () => period.destroy());
    this.time.delayedCall(0, () => {
      const titleRight = title.x + title.displayWidth / 2;
      period.setPosition(titleRight + 6, centerY - 100);
    });

    // Animate in sequence
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: centerY - 120,
      duration: 800,
      ease: "Power2",
    });

    this.tweens.add({
      targets: period,
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

    const ceoTargets: Phaser.GameObjects.GameObject[] = [ceoGlow, ceoBody];
    if (ceoIcon) ceoTargets.push(ceoIcon);

    this.tweens.add({
      targets: ceoTargets,
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
      alpha: { from: 0.1, to: 0.25 },
      duration: 1200,
      delay: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const finish = () => {
      if (this.scene.isActive("IntroScene")) {
        this.game.events.emit("intro-complete");
        this.scene.stop();
      }
    };

    // Skip on click
    this.input.once("pointerdown", finish);

    // Auto-advance after intro
    this.time.delayedCall(3200, finish);
  }
}
