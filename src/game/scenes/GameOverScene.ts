import Phaser from "phaser";
import type { GameState } from "../types";
import { calculateProfile } from "../utils/profileCalculator";

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

    const survived = this.gameState.damage < 100;
    const profile = calculateProfile(this.gameState);

    // Splash text
    const splashText = survived ? "PREZIL SI!" : "TVOJA FIRMA SA ZRUTILA";
    const splashColor = survived ? "#22c55e" : "#ef4444";

    this.add
      .text(centerX, centerY - 20, splashText, {
        fontSize: "28px",
        fontFamily: "Inter, sans-serif",
        color: splashColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 20, `Profil: ${profile}`, {
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        color: "#e5e5e5",
      })
      .setOrigin(0.5);

    // Build URL params
    const teamString = this.gameState.team
      .map((m) => `${m.role}:${m.level}`)
      .join(",");

    const params = new URLSearchParams({
      profile,
      waves: String(this.gameState.wave),
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
          ? window.sessionStorage.getItem("email")
          : null;
      if (email) {
        fetch("/api/enrichment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            profile,
            waves: this.gameState.wave,
            score: this.gameState.score,
            team: teamString,
            caught: this.gameState.problemsCaught,
            missed: this.gameState.problemsMissed,
            clicks: this.gameState.manualClicks,
          }),
        }).catch(() => {
          // Silently fail — don't block redirect
        });
      }
    } catch {
      // sessionStorage may not be available
    }

    // Redirect after 2.5s
    this.time.delayedCall(2500, () => {
      if (typeof window !== "undefined") {
        window.location.href = `/results?${params.toString()}`;
      }
    });
  }
}
