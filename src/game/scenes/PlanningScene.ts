import * as Phaser from "phaser";
import type { GameState, MonthlyPnl, Priority, Role } from "../types";
import {
  BUSINESS_TYPE_CONFIGS,
  CSS_COLORS,
  PLANNING_DURATION,
  PRIORITY_CONFIGS,
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
} from "../constants";
import { WAVES } from "../data/waves";
import {
  applyHireToBaseline,
  formatMoney,
  formatPercent,
  ratioHealth,
  simulatePnl,
} from "../utils/pnlCalculator";
import { playTone } from "../utils/audio";

const ALL_ROLES: Role[] = [
  "va",
  "sales",
  "marketing",
  "product",
  "support",
  "accountant",
  "cfo",
  "hr",
  "operations",
  "coo",
];

export class PlanningScene extends Phaser.Scene {
  private gameState!: GameState;
  private countdown: number = PLANNING_DURATION;
  private countdownLabel!: Phaser.GameObjects.Text;
  private countdownTimer!: Phaser.Time.TimerEvent;
  private budgetLabel!: Phaser.GameObjects.Text;

  private continueBtnBg!: Phaser.GameObjects.Graphics;
  private continueBtnText!: Phaser.GameObjects.Text;
  private continueBtnX: number = 0;
  private continueBtnY: number = 0;
  private continueBtnW: number = 0;
  private continueBtnH: number = 0;

  // Scrolling state
  private contentHeight: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private scrollStartY: number = 0;
  private viewHeight: number = 0;

  constructor() {
    super({ key: "PlanningScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
    this.gameState.phase = "planning";
    this.countdown = PLANNING_DURATION;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    this.viewHeight = height;

    const contentWidth = Math.min(440, width - 40);
    const contentX = centerX - contentWidth / 2;

    let y = 24;

    this.drawBackground(width, 2800);

    // Title
    this.add
      .text(centerX, y, `VLNA ${this.gameState.wave} PREŽITÁ`, {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: CSS_COLORS.operations,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 22;

    this.add
      .text(centerX, y, "Plánovacia fáza", {
        fontSize: "26px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#ffffff",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 44;

    // P&L last month
    const lastPnl = this.gameState.pnlHistory[this.gameState.pnlHistory.length - 1];
    if (lastPnl) {
      y = this.drawPnlBreakdown(contentX, y, contentWidth, lastPnl);
      y += 16;
    }

    // Budget + countdown
    this.budgetLabel = this.add
      .text(contentX, y, formatMoney(this.gameState.budget), {
        fontSize: "22px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: CSS_COLORS.general,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.add
      .text(contentX, y + 26, "Budget", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.countdownLabel = this.add
      .text(contentX + contentWidth, y, `${this.countdown}s`, {
        fontSize: "22px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: CSS_COLORS.uiText,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(1, 0);

    this.add
      .text(contentX + contentWidth, y + 26, "Auto-štart", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        resolution: 2,
      })
      .setOrigin(1, 0);

    y += 54;

    // PRIORITY selection
    this.add
      .text(contentX, y, "PRIORITA TOHTO MESIACA (povinná)", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    for (const priorityCfg of PRIORITY_CONFIGS) {
      const isSelected = this.gameState.selectedPriority === priorityCfg.id;
      const priorityY = y;

      const bg = this.add.graphics();
      this.drawPriorityOption(
        bg,
        contentX,
        priorityY,
        contentWidth,
        priorityCfg.color,
        isSelected,
      );

      const radioColor = Phaser.Display.Color.HexStringToColor(
        priorityCfg.color,
      ).color;
      const outer = this.add.circle(contentX + 16, priorityY + 18, 7, 0x000000, 0);
      outer.setStrokeStyle(2, isSelected ? radioColor : 0x555555);
      this.add.circle(contentX + 16, priorityY + 18, 4, radioColor, isSelected ? 1 : 0);

      this.add
        .text(contentX + 30, priorityY + 8, priorityCfg.label, {
          fontSize: "11px",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          color: isSelected ? "#fff" : "#ccc",
          fontStyle: "600",
          resolution: 2,
        })
        .setOrigin(0, 0);

      this.add
        .text(contentX + 30, priorityY + 22, priorityCfg.description, {
          fontSize: "9px",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          color: isSelected ? "#D4D4D1" : "#7A736A",
          resolution: 2,
          wordWrap: { width: contentWidth - 44 },
        })
        .setOrigin(0, 0);

      const hit = this.add
        .rectangle(contentX + contentWidth / 2, priorityY + 18, contentWidth, 36, 0, 0)
        .setInteractive({ useHandCursor: true });

      hit.on("pointerdown", () => {
        playTone(440, 0.06, "sine", 0.04);
        this.gameState.selectedPriority = priorityCfg.id;
        this.countdownTimer.destroy();
        this.scene.restart({ gameState: this.gameState });
      });

      y += 40;
    }

    y += 10;

    // YOUR TEAM section
    if (this.gameState.team.length > 0) {
      const totalSalary = this.gameState.team.reduce((sum, m) => {
        const cfg = ROLE_CONFIGS[m.role];
        return (
          sum +
          (m.level === "senior"
            ? cfg.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
            : cfg.monthlyCost)
        );
      }, 0);

      this.add
        .text(
          contentX,
          y,
          `TVOJ TÍM (${this.gameState.team.length} ľudí, ${formatMoney(totalSalary)}/mes)`,
          {
            fontSize: "10px",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            color: "#A69E92",
            fontStyle: "700",
            resolution: 2,
          },
        )
        .setOrigin(0, 0);
      y += 18;

      for (const member of this.gameState.team) {
        const config = ROLE_CONFIGS[member.role];
        const color = Phaser.Display.Color.HexStringToColor(config.color).color;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a1a, 1);
        bg.fillRoundedRect(contentX, y, contentWidth, 42, 6);
        bg.lineStyle(1, 0x333333, 0.5);
        bg.strokeRoundedRect(contentX, y, contentWidth, 42, 6);

        bg.fillStyle(color, 0.15);
        bg.fillRoundedRect(contentX, y, 4, 42, { tl: 6, bl: 6, tr: 0, br: 0 });

        this.add.circle(contentX + 22, y + 21, 10, color);
        const labelShort = this.getRoleShortLabel(member.role);
        this.add
          .text(contentX + 22, y + 21, labelShort, {
            fontSize: "7px",
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            color: "#EFEDEB",
            fontStyle: "600",
            resolution: 2,
          })
          .setOrigin(0.5);

        const levelBadge = member.level === "senior" ? " [Senior]" : " [Junior]";
        this.add
          .text(contentX + 38, y + 10, config.label + levelBadge, {
            fontSize: "10px",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            color: "#fff",
            fontStyle: "600",
            resolution: 2,
          })
          .setOrigin(0, 0);

        const monthlyCost =
          member.level === "senior"
            ? config.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
            : config.monthlyCost;
        this.add
          .text(contentX + 38, y + 24, `${formatMoney(monthlyCost)}/mes`, {
            fontSize: "9px",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            color: "#888",
            resolution: 2,
          })
          .setOrigin(0, 0);

        let btnEndX = contentX + contentWidth - 10;
        if (member.level === "junior") {
          const canUpgrade = this.gameState.budget >= config.upgradeCost;
          const upgBtnW = 80;
          const upgBtnX = btnEndX - upgBtnW;
          const upgBtnY = y + 4;
          const upgBtnH = 16;

          const upgBg = this.add.graphics();
          upgBg.fillStyle(canUpgrade ? 0x333333 : 0x1a1a1a, 1);
          upgBg.fillRoundedRect(upgBtnX, upgBtnY, upgBtnW, upgBtnH, 4);

          this.add
            .text(
              upgBtnX + upgBtnW / 2,
              upgBtnY + upgBtnH / 2,
              `Upgrade ${formatMoney(config.upgradeCost)}`,
              {
                fontSize: "8px",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                color: canUpgrade ? CSS_COLORS.general : "#7A736A",
                fontStyle: "700",
                resolution: 2,
              },
            )
            .setOrigin(0.5);

          if (canUpgrade) {
            const upgHit = this.add
              .rectangle(upgBtnX + upgBtnW / 2, upgBtnY + upgBtnH / 2, upgBtnW, upgBtnH, 0, 0)
              .setInteractive({ useHandCursor: true });
            upgHit.on("pointerdown", () => {
              playTone(520, 0.1, "sine", 0.05);
              this.upgrade(member.id);
            });
          }
          btnEndX = upgBtnX - 6;
        }

        const fireBtnW = 70;
        const fireBtnX = btnEndX - fireBtnW;
        const fireBtnY = y + 22;
        const fireBtnH = 16;

        const fireBg = this.add.graphics();
        fireBg.fillStyle(0x2a1515, 1);
        fireBg.fillRoundedRect(fireBtnX, fireBtnY, fireBtnW, fireBtnH, 4);

        this.add
          .text(fireBtnX + fireBtnW / 2, fireBtnY + fireBtnH / 2, "Prepustiť", {
            fontSize: "8px",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            color: CSS_COLORS.finance,
            fontStyle: "700",
            resolution: 2,
          })
          .setOrigin(0.5);

        const fireHit = this.add
          .rectangle(fireBtnX + fireBtnW / 2, fireBtnY + fireBtnH / 2, fireBtnW, fireBtnH, 0, 0)
          .setInteractive({ useHandCursor: true });
        fireHit.on("pointerdown", () => {
          playTone(200, 0.15, "sawtooth", 0.05);
          this.fire(member.id);
        });

        y += 50;
      }

      y += 8;
    }

    // HIRING section
    this.add
      .text(contentX, y, "NAJMI DO TÍMU", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    const roleCardHeight = 62;
    const roleCardGap = 6;

    for (const role of ALL_ROLES) {
      const config = ROLE_CONFIGS[role];
      const canAfford = this.gameState.budget >= config.cost;
      this.drawHireRow(contentX, y, contentWidth, roleCardHeight, role, canAfford);
      y += roleCardHeight + roleCardGap;
    }

    y += 16;

    // POKRACOVAT button
    const btnW = contentWidth;
    const btnH = 52;
    const btnX = contentX;
    const btnY = y;
    this.continueBtnX = btnX;
    this.continueBtnY = btnY;
    this.continueBtnW = btnW;
    this.continueBtnH = btnH;

    this.continueBtnBg = this.add.graphics();
    this.continueBtnText = this.add
      .text(centerX, btnY + btnH / 2, "POKRAČOVAŤ →", {
        fontSize: "16px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#EFEDEB",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5);

    this.renderContinueButton();

    const btnHit = this.add
      .rectangle(centerX, btnY + btnH / 2, btnW, btnH, 0, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on("pointerover", () => {
      if (this.gameState.selectedPriority !== null) {
        this.renderContinueButton(true);
      }
    });
    btnHit.on("pointerout", () => {
      this.renderContinueButton(false);
    });
    btnHit.on("pointerdown", () => {
      if (this.gameState.selectedPriority === null) {
        // feedback — shake
        this.cameras.main.shake(120, 0.004);
        playTone(150, 0.15, "sawtooth", 0.05);
        return;
      }
      playTone(660, 0.15, "sine", 0.05);
      this.startNextWave();
    });

    y += btnH + 40;

    // Set content height + scroll setup
    this.contentHeight = y;
    if (this.contentHeight > this.viewHeight) {
      this.cameras.main.setBounds(0, 0, width, this.contentHeight);
      this.setupScrolling(this.viewHeight);
    }

    // Countdown timer
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.countdown--;
        this.countdownLabel.setText(`${this.countdown}s`);
        if (this.countdown <= 0) {
          // Auto-start only if priority is selected; otherwise keep waiting
          if (this.gameState.selectedPriority !== null) {
            this.startNextWave();
          } else {
            this.countdown = 5; // keep prompting
            this.countdownLabel.setText(`${this.countdown}s`);
          }
        }
      },
      loop: true,
    });
  }

  private renderContinueButton(hover: boolean = false): void {
    const enabled = this.gameState.selectedPriority !== null;
    const bg = this.continueBtnBg;
    bg.clear();
    const color = enabled ? (hover ? 0xfacc15 : 0xeab308) : 0x2a2a2a;
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(
      this.continueBtnX,
      this.continueBtnY,
      this.continueBtnW,
      this.continueBtnH,
      10,
    );

    this.continueBtnText.setColor(enabled ? "#EFEDEB" : "#A69E92");
    this.continueBtnText.setText(
      enabled ? "POKRAČOVAŤ →" : "VYBER PRIORITU",
    );
    this.continueBtnText.setScale(hover && enabled ? 1.03 : 1);
  }

  private setupScrolling(viewHeight: number): void {
    if (this.input.mouse) {
      this.input.on(
        "wheel" as string,
        (_pointer: unknown, _objects: unknown, _dx: number, dy: number) => {
          const cam = this.cameras.main;
          cam.scrollY = Phaser.Math.Clamp(
            cam.scrollY + dy * 0.5,
            0,
            Math.max(0, this.contentHeight - viewHeight),
          );
        },
      );
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartY = pointer.y;
      this.scrollStartY = this.cameras.main.scrollY;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging || !pointer.isDown) {
        this.isDragging = false;
        return;
      }
      const dy = this.dragStartY - pointer.y;
      const cam = this.cameras.main;
      cam.scrollY = Phaser.Math.Clamp(
        this.scrollStartY + dy,
        0,
        Math.max(0, this.contentHeight - viewHeight),
      );
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  private drawPnlBreakdown(
    x: number,
    y: number,
    w: number,
    pnl: MonthlyPnl,
  ): number {
    const bizCfg = BUSINESS_TYPE_CONFIGS[this.gameState.businessType];

    // Container
    const height = 222;
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRoundedRect(x, y, w, height, 10);
    bg.lineStyle(1, 0x333333, 0.5);
    bg.strokeRoundedRect(x, y, w, height, 10);

    const padding = 14;
    const lineH = 18;
    let ly = y + 12;

    this.add
      .text(x + padding, ly, "P&L MINULÝ MESIAC", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    ly += 22;

    // Revenue
    this.drawPnlLine(x + padding, ly, w - padding * 2, "Obrat", formatMoney(pnl.revenue), "#fff");
    ly += lineH;

    // COGS
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      "COGS",
      `-${formatMoney(pnl.cogs)}`,
      "#D4D4D1",
    );
    ly += lineH;

    // Gross margin (with ratio indicator)
    const gmHealth = ratioHealth(pnl.grossMarginRatio, bizCfg.maxGrossMargin * 0.85);
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      `= Hrubá marža (${formatPercent(pnl.grossMarginRatio)})`,
      formatMoney(pnl.grossMargin),
      this.healthColor(gmHealth),
      true,
    );
    ly += lineH;

    // Marketing (lower is better → invert)
    const mkHealth = ratioHealth(
      pnl.marketingRatio,
      Math.max(bizCfg.minMarketingRatio * 1.5, 0.12),
      true,
    );
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      `Marketing (${formatPercent(pnl.marketingRatio)})`,
      `-${formatMoney(pnl.marketingCost)}`,
      this.healthColor(mkHealth),
    );
    ly += lineH;

    // CP3 (target 25%)
    const cp3Health = ratioHealth(pnl.cp3Ratio, 0.25);
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      `= CP3 (${formatPercent(pnl.cp3Ratio)})`,
      formatMoney(pnl.cp3),
      this.healthColor(cp3Health),
      true,
    );
    ly += lineH;

    // Salaries
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      "Mzdy",
      `-${formatMoney(pnl.salaries)}`,
      "#D4D4D1",
    );
    ly += lineH;

    // EBITDA
    const ebitdaHealth = ratioHealth(pnl.ebitdaRatio, 0.15);
    this.drawPnlLine(
      x + padding,
      ly,
      w - padding * 2,
      `= EBITDA (${formatPercent(pnl.ebitdaRatio)})`,
      formatMoney(pnl.ebitda),
      this.healthColor(ebitdaHealth),
      true,
    );
    ly += lineH + 6;

    // Cumulative profit
    const cumColor =
      this.gameState.profit >= 0 ? CSS_COLORS.operations : CSS_COLORS.finance;
    this.add
      .text(x + padding, ly, "Kumulatívny zisk:", {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#888",
        resolution: 2,
      })
      .setOrigin(0, 0);
    this.add
      .text(x + w - padding, ly, formatMoney(this.gameState.profit), {
        fontSize: "11px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: cumColor,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(1, 0);

    return y + height;
  }

  private drawPnlLine(
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
    valueColor: string,
    bold: boolean = false,
  ): void {
    this.add
      .text(x, y, label, {
        fontSize: "10px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#bbb",
        fontStyle: bold ? "700" : "400",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.add
      .text(x + w, y, value, {
        fontSize: "11px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: valueColor,
        fontStyle: bold ? "800" : "600",
        resolution: 2,
      })
      .setOrigin(1, 0);
  }

  private healthColor(h: "good" | "warning" | "bad"): string {
    switch (h) {
      case "good":
        return CSS_COLORS.operations;
      case "warning":
        return CSS_COLORS.accent;
      case "bad":
        return CSS_COLORS.finance;
    }
  }

  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 4; i++) {
      bg.fillStyle(0x1a1a2e, 0.05 + i * 0.02);
      bg.fillCircle(width / 2, height / 2, Math.max(width, height) * (0.8 - i * 0.15));
    }
    bg.setDepth(-10);
  }

  private drawHireRow(
    x: number,
    y: number,
    w: number,
    h: number,
    role: Role,
    canAfford: boolean,
  ): void {
    const config = ROLE_CONFIGS[role];
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    const alpha = canAfford ? 1 : 0.35;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, alpha);
    bg.fillRoundedRect(x, y, w, h, 6);
    bg.lineStyle(1, canAfford ? color : 0x333333, canAfford ? 0.4 : 0.2);
    bg.strokeRoundedRect(x, y, w, h, 6);

    bg.fillStyle(color, canAfford ? 0.15 : 0.05);
    bg.fillRoundedRect(x, y, 4, h, { tl: 6, bl: 6, tr: 0, br: 0 });

    this.add.circle(x + 22, y + h / 2, 10, color).setAlpha(alpha);
    const labelShort = this.getRoleShortLabel(role);
    this.add
      .text(x + 22, y + h / 2, labelShort, {
        fontSize: "7px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#EFEDEB",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(alpha);

    this.add
      .text(x + 40, y + 8, config.label, {
        fontSize: "11px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "700",
        resolution: 2,
      })
      .setAlpha(alpha);

    this.add
      .text(x + 40, y + 22, config.description, {
        fontSize: "8px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#777",
        resolution: 2,
        wordWrap: { width: w - 180 },
      })
      .setAlpha(alpha);

    // Simulation of next month impact (hover hint)
    const sim = this.simulateHire(role);
    if (sim) {
      this.add
        .text(
          x + 40,
          y + h - 14,
          `Ak najmeš: Δ obrat ${this.signed(sim.revDelta)}, Δ zisk ${this.signed(sim.profitDelta)}`,
          {
            fontSize: "8px",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            color: "#7A736A",
            resolution: 2,
          },
        )
        .setAlpha(alpha);
    }

    // Hire cost + monthly cost on right side
    this.add
      .text(x + w - 10, y + 8, `Fee ${formatMoney(config.cost)}`, {
        fontSize: "12px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: canAfford ? CSS_COLORS.general : "#7A736A",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setAlpha(alpha);

    this.add
      .text(x + w - 10, y + 24, `${formatMoney(config.monthlyCost)}/mes`, {
        fontSize: "8px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#888",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setAlpha(alpha);

    // NAJAT button
    const btnW = 56;
    const btnH = 18;
    const btnX = x + w - btnW - 8;
    const btnY = y + h - btnH - 5;

    if (canAfford) {
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x333333, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);

      this.add
        .text(btnX + btnW / 2, btnY + btnH / 2, "NAJAŤ", {
          fontSize: "9px",
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          color: CSS_COLORS.general,
          fontStyle: "600",
          resolution: 2,
        })
        .setOrigin(0.5);

      const hit = this.add
        .rectangle(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH, 0, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerover", () => {
        btnBg.clear();
        btnBg.fillStyle(0x444444, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
      });
      hit.on("pointerout", () => {
        btnBg.clear();
        btnBg.fillStyle(0x333333, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
      });
      hit.on("pointerdown", () => {
        playTone(520, 0.1, "sine", 0.05);
        this.hire(role);
      });
    }
  }

  private simulateHire(role: Role): { revDelta: number; profitDelta: number } | null {
    const nextWaveConfig = WAVES[this.gameState.wave]; // next wave (0-indexed)
    if (!nextWaveConfig) return null;

    const priority = this.gameState.selectedPriority;

    const baseline = simulatePnl(
      this.gameState,
      nextWaveConfig,
      priority,
      this.gameState.team,
      this.gameState.baselineRatios,
    );

    const hypoTeam = [
      ...this.gameState.team,
      { role, level: "junior" as const, id: "sim" },
    ];
    const hypoRatios = applyHireToBaseline(
      this.gameState.baselineRatios,
      role,
      this.gameState.businessType,
    );
    const withHire = simulatePnl(
      this.gameState,
      nextWaveConfig,
      priority,
      hypoTeam,
      hypoRatios,
    );

    return {
      revDelta: withHire.revenue - baseline.revenue,
      profitDelta: withHire.ebitda - baseline.ebitda,
    };
  }

  private signed(n: number): string {
    const prefix = n >= 0 ? "+" : "";
    return prefix + formatMoney(n);
  }

  private getRoleShortLabel(role: Role): string {
    switch (role) {
      case "va":
        return "VA";
      case "sales":
        return "SAL";
      case "marketing":
        return "MKT";
      case "product":
        return "PRD";
      case "support":
        return "SUP";
      case "accountant":
        return "ACC";
      case "cfo":
        return "CFO";
      case "hr":
        return "HR";
      case "operations":
        return "OPS";
      case "coo":
        return "COO";
      default:
        return "";
    }
  }

  private hire(role: Role): void {
    const config = ROLE_CONFIGS[role];
    if (this.gameState.budget < config.cost) return;

    this.gameState.budget -= config.cost;
    this.gameState.team.push({
      role,
      level: "junior",
      id: `${role}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    });

    // Apply one-time ratio improvements from hiring
    this.gameState.baselineRatios = applyHireToBaseline(
      this.gameState.baselineRatios,
      role,
      this.gameState.businessType,
    );

    this.recalcMonthlyCosts();

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState });
  }

  private upgrade(memberId: string): void {
    const member = this.gameState.team.find((m) => m.id === memberId);
    if (!member) return;

    const config = ROLE_CONFIGS[member.role];
    if (this.gameState.budget < config.upgradeCost) return;

    this.gameState.budget -= config.upgradeCost;
    member.level = "senior";

    this.recalcMonthlyCosts();

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState });
  }

  private fire(memberId: string): void {
    const index = this.gameState.team.findIndex((m) => m.id === memberId);
    if (index === -1) return;

    this.gameState.team.splice(index, 1);

    this.recalcMonthlyCosts();

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState });
  }

  private recalcMonthlyCosts(): void {
    this.gameState.monthlyCosts = this.gameState.team.reduce((sum, m) => {
      const cfg = ROLE_CONFIGS[m.role];
      const cost =
        m.level === "senior"
          ? cfg.monthlyCost * SENIOR_MULTIPLIER.monthlyCostFactor
          : cfg.monthlyCost;
      return sum + cost;
    }, 0);
  }

  private startNextWave(): void {
    this.countdownTimer.destroy();
    // selectedPriority is kept on gameState — ActionScene reads it after wave
    this.gameState.wave++;
    this.scene.start("ActionScene", { gameState: this.gameState });
  }

  private drawPriorityOption(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    color: string,
    selected: boolean,
  ): void {
    const colorHex = Phaser.Display.Color.HexStringToColor(color).color;
    gfx.fillStyle(selected ? 0x1a1a1a : 0x111111, 1);
    gfx.fillRoundedRect(x, y, w, 36, 6);
    gfx.lineStyle(1, selected ? colorHex : 0x222222, selected ? 0.6 : 0.3);
    gfx.strokeRoundedRect(x, y, w, 36, 6);
  }
}
