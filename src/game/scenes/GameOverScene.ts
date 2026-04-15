import * as Phaser from "phaser";
import type { GameState } from "../types";
import { calculateProfile } from "../utils/profileCalculator";
import { playChord, playTone } from "../utils/audio";

export class GameOverScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 6; i++) {
      bg.fillStyle(0x1a1a2e, 0.05 + i * 0.025);
      bg.fillCircle(centerX, centerY, Math.max(width, height) * (1 - i * 0.14));
    }

    const survived = this.gameState.damage < 100;
    const profile = calculateProfile(this.gameState);

    // Sound
    if (survived) {
      playChord([523, 659, 784, 1046], 0.4); // C major chord ascending
    } else {
      playTone(180, 0.5, "sawtooth", 0.1);
      this.time.delayedCall(200, () => playTone(140, 0.6, "sawtooth", 0.1));
    }

    // Splash text
    const splashText = survived ? "PREŽIL SI" : "FIRMA SA ZRÚTILA";
    const splashColor = survived ? "#22c55e" : "#ef4444";

    const splash = this.add
      .text(centerX, centerY - 30, splashText, {
        fontSize: "36px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: splashColor,
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.8);

    this.tweens.add({
      targets: splash,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: "Back.easeOut",
    });

    const subText = survived
      ? `Vlna 5 zvládnutá • Skóre ${this.gameState.score}`
      : `Vlna ${this.gameState.wave} • Skóre ${this.gameState.score}`;

    this.add
      .text(centerX, centerY + 20, subText, {
        fontSize: "16px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#a3a3a3",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    this.add
      .text(centerX, centerY + 60, "Načítavam výsledky...", {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#555",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    // Fade in delayed elements
    this.tweens.add({
      targets: this.children.list.filter(
        (c) => (c as Phaser.GameObjects.Text).getData?.("delayedShow")
      ),
      alpha: 1,
      duration: 600,
      delay: 400,
    });

    // Build URL params
    const teamString = this.gameState.team
      .map((m) => `${m.role}:${m.level}`)
      .join(",");

    const params = new URLSearchParams({
      profile,
      waves: String(survived ? 5 : this.gameState.wave),
      score: String(this.gameState.score),
      team: teamString,
      caught: String(this.gameState.problemsCaught),
      missed: String(this.gameState.problemsMissed),
      clicks: String(this.gameState.manualClicks),
    });

    // Fire MailerLite enrichment
    try {
      const email =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("ceo-defense-email")
          : null;
      if (email) {
        fetch("/api/lead/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            profile,
            waves: survived ? 5 : this.gameState.wave,
            score: this.gameState.score,
          }),
        }).catch(() => {});
      }
    } catch {
      // sessionStorage unavailable
    }

    // Redirect after 2.8s
    this.time.delayedCall(2800, () => {
      if (typeof window !== "undefined") {
        window.location.href = `/results?${params.toString()}`;
      }
    });
  }
}
