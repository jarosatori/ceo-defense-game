import * as Phaser from "phaser";
import type { BusinessType, GameState } from "../types";
import {
  BUSINESS_TYPE_CONFIGS,
  CSS_COLORS,
  STARTING_BUDGET,
} from "../constants";
import { formatMoney, formatPercent } from "../utils/pnlCalculator";
import { playTone } from "../utils/audio";

export class BusinessTypeScene extends Phaser.Scene {
  constructor() {
    super({ key: "BusinessTypeScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 6; i++) {
      bg.fillStyle(0x1a1a2e, 0.05 + i * 0.025);
      bg.fillCircle(centerX, height / 2, Math.max(width, height) * (1 - i * 0.14));
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
    this.add
      .text(centerX, 60, "AKÝ BIZNIS VEDIEŠ?", {
        fontSize: "28px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Accent line
    this.add.rectangle(centerX, 102, 60, 3, 0xeab308);

    // Subtitle
    this.add
      .text(centerX, 118, "Výber ovplyvní tvoju štartovú ekonomiku.", {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#a3a3a3",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Cards layout
    const cardWidth = Math.min(300, (width - 80) / 2);
    const cardHeight = 360;
    const gap = 24;
    const totalWidth = cardWidth * 2 + gap;
    const cardsStartX = centerX - totalWidth / 2;
    const cardsY = 170;

    // E-shop card
    this.drawCard(cardsStartX, cardsY, cardWidth, cardHeight, "eshop");

    // Services card
    this.drawCard(
      cardsStartX + cardWidth + gap,
      cardsY,
      cardWidth,
      cardHeight,
      "services",
    );

    // Footer hint
    this.add
      .text(centerX, cardsY + cardHeight + 24, "Klikni na kartu a začni hru.", {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#555",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
  }

  private drawCard(
    x: number,
    y: number,
    w: number,
    h: number,
    type: BusinessType,
  ): void {
    const cfg = BUSINESS_TYPE_CONFIGS[type];
    const accentColor = Phaser.Display.Color.HexStringToColor(cfg.characterColor).color;

    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRoundedRect(x, y, w, h, 12);
    bg.lineStyle(2, accentColor, 0.4);
    bg.strokeRoundedRect(x, y, w, h, 12);

    // Left accent bar
    bg.fillStyle(accentColor, 0.25);
    bg.fillRoundedRect(x, y, 5, h, { tl: 12, bl: 12, tr: 0, br: 0 });

    // Emoji
    this.add
      .text(x + w / 2, y + 36, cfg.emoji, {
        fontSize: "48px",
        fontFamily: "system-ui, sans-serif",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Label
    this.add
      .text(x + w / 2, y + 100, cfg.label, {
        fontSize: "22px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Description
    this.add
      .text(x + 18, y + 140, cfg.description, {
        fontSize: "12px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#a3a3a3",
        fontStyle: "500",
        resolution: 2,
        wordWrap: { width: w - 36 },
        align: "center",
      })
      .setOrigin(0, 0);

    // Metric rows
    let my = y + 220;
    const metricGap = 34;

    this.drawMetric(
      x + 18,
      my,
      w - 36,
      "Štartovný obrat",
      `${formatMoney(cfg.startingRevenue)}/mes`,
      CSS_COLORS.general,
    );
    my += metricGap;

    this.drawMetric(
      x + 18,
      my,
      w - 36,
      "Hrubá marža",
      formatPercent(cfg.startingGrossMargin),
      CSS_COLORS.operations,
    );
    my += metricGap;

    this.drawMetric(
      x + 18,
      my,
      w - 36,
      "Marketing ratio",
      formatPercent(cfg.startingMarketingRatio),
      CSS_COLORS.marketing,
    );

    // Hit area
    const hit = this.add
      .rectangle(x + w / 2, y + h / 2, w, h, 0, 0)
      .setInteractive({ useHandCursor: true });

    hit.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x181818, 1);
      bg.fillRoundedRect(x, y, w, h, 12);
      bg.lineStyle(2, accentColor, 0.9);
      bg.strokeRoundedRect(x, y, w, h, 12);
      bg.fillStyle(accentColor, 0.3);
      bg.fillRoundedRect(x, y, 5, h, { tl: 12, bl: 12, tr: 0, br: 0 });
    });
    hit.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x111111, 1);
      bg.fillRoundedRect(x, y, w, h, 12);
      bg.lineStyle(2, accentColor, 0.4);
      bg.strokeRoundedRect(x, y, w, h, 12);
      bg.fillStyle(accentColor, 0.25);
      bg.fillRoundedRect(x, y, 5, h, { tl: 12, bl: 12, tr: 0, br: 0 });
    });
    hit.on("pointerdown", () => {
      playTone(660, 0.15, "sine", 0.05);
      this.chooseBusinessType(type);
    });
  }

  private drawMetric(
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
    valueColor: string,
  ): void {
    this.add
      .text(x, y, label, {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#888",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.add
      .text(x + w, y, value, {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: valueColor,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(1, 0);
  }

  private chooseBusinessType(type: BusinessType): void {
    const cfg = BUSINESS_TYPE_CONFIGS[type];

    const initialState: GameState = {
      wave: 1,
      score: 0,
      budget: STARTING_BUDGET,
      damage: 0,
      businessType: type,
      baselineRatios: {
        grossMargin: cfg.startingGrossMargin,
        marketingRatio: cfg.startingMarketingRatio,
        revenueMultiplier: 1,
        teamEffectiveness: 1,
      },
      revenue: 0,
      profit: 0,
      monthlyRevenue: 0,
      monthlyProfit: 0,
      monthlyCosts: 0,
      pnlHistory: [],
      team: [],
      problemsCaught: 0,
      problemsMissed: 0,
      caughtByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
      missedByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
      manualClicks: 0,
      phase: "action",
      priorityHistory: [],
      selectedPriority: null,
    };

    this.scene.start("ActionScene", { gameState: initialState });
  }
}
