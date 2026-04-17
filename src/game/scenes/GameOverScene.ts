import * as Phaser from "phaser";
import type { GameState } from "../types";
import { calculateProfile } from "../utils/profileCalculator";
import {
  formatMoney,
  formatPercent,
  getBusinessMilestone,
} from "../utils/pnlCalculator";
import { BUSINESS_TYPE_CONFIGS } from "../constants";
import { playChord, playTone } from "../utils/audio";
import { preloadSprites } from "../utils/spriteLoader";

export class GameOverScene extends Phaser.Scene {
  private gameState!: GameState;
  private cashCrunch: boolean = false;
  private survivedFlag: boolean | undefined;

  constructor() {
    super({ key: "GameOverScene" });
  }

  preload(): void {
    preloadSprites(this);
  }

  init(data: { gameState: GameState; cashCrunch?: boolean; survived?: boolean }): void {
    this.gameState = data.gameState;
    this.cashCrunch = data.cashCrunch ?? false;
    this.survivedFlag = data.survived;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 6; i++) {
      bg.fillStyle(0x1a1a2e, 0.05 + i * 0.025);
      bg.fillCircle(centerX, centerY, Math.max(width, height) * (1 - i * 0.14));
    }

    const survived =
      this.survivedFlag ?? (this.gameState.damage < 100 && !this.cashCrunch);
    const profile = calculateProfile(this.gameState);

    const ebitdaRatio =
      this.gameState.revenue > 0
        ? this.gameState.profit / this.gameState.revenue
        : 0;
    const milestone = getBusinessMilestone(this.gameState.revenue, ebitdaRatio);

    const bizCfg = BUSINESS_TYPE_CONFIGS[this.gameState.businessType];

    // Sound
    if (survived) {
      playChord([523, 659, 784, 1046], 0.4);
    } else {
      playTone(180, 0.5, "sawtooth", 0.1);
      this.time.delayedCall(200, () => playTone(140, 0.6, "sawtooth", 0.1));
    }

    // Splash
    let splashText: string;
    if (survived) {
      splashText = "PREŽIL SI";
    } else if (this.cashCrunch) {
      splashText = "FIRMA JE V STRATE";
    } else {
      splashText = "FIRMA SA ZRÚTILA";
    }
    const splashColor = survived ? "#FF7404" : "#E81A1E";

    const splash = this.add
      .text(centerX, centerY - 80, splashText, {
        fontSize: "36px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: splashColor,
        fontStyle: "600",
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

    if (this.cashCrunch) {
      this.add
        .text(centerX, centerY - 40, "Nemáš na výplaty.", {
          fontSize: "14px",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          color: "#E81A1E",
          fontStyle: "500",
          resolution: 2,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setData("delayedShow", true);
    }

    // Milestone
    this.add
      .text(centerX, centerY - 15, milestone.toUpperCase(), {
        fontSize: "20px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#FF7404",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    // Business type
    this.add
      .text(centerX, centerY + 10, `${bizCfg.emoji} ${bizCfg.label}`, {
        fontSize: "12px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    // Revenue
    this.add
      .text(centerX, centerY + 40, `Obrat: ${formatMoney(this.gameState.revenue)}`, {
        fontSize: "18px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#FF7404",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    // Profit
    const profitColor = this.gameState.profit >= 0 ? "#FF7404" : "#E81A1E";
    this.add
      .text(
        centerX,
        centerY + 62,
        `Zisk: ${formatMoney(this.gameState.profit)} (${formatPercent(ebitdaRatio)})`,
        {
          fontSize: "16px",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          color: profitColor,
          fontStyle: "700",
          resolution: 2,
        },
      )
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    // Score + wave summary
    const subText = survived
      ? `Vlna 10 zvládnutá • Score ${this.gameState.score}`
      : `Vlna ${this.gameState.wave} • Score ${this.gameState.score}`;
    this.add
      .text(centerX, centerY + 88, subText, {
        fontSize: "12px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    this.add
      .text(centerX, centerY + 120, "Načítavam výsledky...", {
        fontSize: "11px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#7A736A",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setData("delayedShow", true);

    this.tweens.add({
      targets: this.children.list.filter(
        (c) => (c as Phaser.GameObjects.Text).getData?.("delayedShow"),
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
      waves: String(survived ? 10 : this.gameState.wave),
      score: String(this.gameState.score),
      revenue: String(Math.round(this.gameState.revenue * 100) / 100),
      profit: String(Math.round(this.gameState.profit * 100) / 100),
      grossMargin: String(this.gameState.baselineRatios.grossMargin),
      marketingRatio: String(this.gameState.baselineRatios.marketingRatio),
      ebitdaRatio: String(Math.round(ebitdaRatio * 1000) / 1000),
      businessType: this.gameState.businessType,
      milestone,
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
            waves: survived ? 10 : this.gameState.wave,
            score: this.gameState.score,
            revenue: this.gameState.revenue,
            profit: this.gameState.profit,
            businessType: this.gameState.businessType,
            milestone,
          }),
        }).catch(() => {});
      }
    } catch {
      // sessionStorage unavailable
    }

    this.time.delayedCall(2800, () => {
      if (typeof window !== "undefined") {
        window.location.href = `/results?${params.toString()}`;
      }
    });
  }
}
