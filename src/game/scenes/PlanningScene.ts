import * as Phaser from "phaser";
import type { GameState, Role, Category, FocusActivity } from "../types";
import {
  COLORS,
  CSS_COLORS,
  ROLE_CONFIGS,
  PLANNING_DURATION,
  FOCUS_CONFIGS,
} from "../constants";
import { WAVES } from "../data/waves";
import { formatRevenue, formatProfit, calculateWaveFinancials } from "../utils/revenueCalculator";
import { playTone } from "../utils/audio";

const ALL_ROLES: Role[] = [
  "va", "sales", "marketing", "product", "support",
  "accountant", "cfo", "hr", "operations", "coo",
];

export class PlanningScene extends Phaser.Scene {
  private gameState!: GameState;
  private countdown: number = PLANNING_DURATION;
  private countdownLabel!: Phaser.GameObjects.Text;
  private countdownTimer!: Phaser.Time.TimerEvent;
  private budgetLabel!: Phaser.GameObjects.Text;
  private selectedFocus: FocusActivity | null = null;
  private projectionLabel!: Phaser.GameObjects.Text;

  // Scrolling state
  private contentHeight: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private scrollStartY: number = 0;

  constructor() {
    super({ key: "PlanningScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
    this.gameState.phase = "planning";
    this.countdown = PLANNING_DURATION;
    // Preserve focus selection across scene restarts (hire/upgrade/fire)
    this.selectedFocus = (data as { selectedFocus?: FocusActivity }).selectedFocus ?? null;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Layout boundaries
    const contentWidth = Math.min(420, width - 40);
    const contentX = centerX - contentWidth / 2;

    let y = 24;

    // Background — draw it large enough for scrolling
    // We'll set camera bounds after we know total content height
    this.drawBackground(width, 2400); // generous height, will clip

    // Title
    this.add
      .text(centerX, y, `VLNA ${this.gameState.wave} PREZITA`, {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.operations,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 22;

    this.add
      .text(centerX, y, "Planovacia faza", {
        fontSize: "26px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 44;

    // P&L Summary bar
    y = this.drawPnlSummary(contentX, y, contentWidth, centerX);
    y += 16;

    // Budget + Countdown side-by-side
    this.budgetLabel = this.add
      .text(contentX, y, `€${this.gameState.budget}`, {
        fontSize: "22px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.add
      .text(contentX, y + 26, "K dispozicii", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0, 0);

    this.countdownLabel = this.add
      .text(contentX + contentWidth, y, `${this.countdown}s`, {
        fontSize: "22px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.uiText,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(1, 0);

    this.add
      .text(contentX + contentWidth, y + 26, "Auto-start", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(1, 0);

    y += 48;

    // "Co ta zabilo" — bar chart
    this.add
      .text(contentX, y, "CO TA ZABILO", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    const categories: Category[] = [
      "marketing",
      "finance",
      "operations",
      "general",
    ];
    const catLabels: Record<Category, string> = {
      marketing: "Marketing",
      finance: "Financie",
      operations: "Operacie",
      general: "Ostatne",
    };

    const totalMissed = Object.values(this.gameState.missedByCategory).reduce(
      (s, v) => s + v,
      0
    );

    const barHeight = 8;
    const barMaxWidth = contentWidth - 80;

    for (const cat of categories) {
      const missed = this.gameState.missedByCategory[cat];
      const pct = totalMissed > 0 ? missed / totalMissed : 0;

      // Label
      this.add
        .text(contentX, y + 1, catLabels[cat], {
          fontSize: "11px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#ccc",
          resolution: 2,
        })
        .setOrigin(0, 0);

      // Bar background
      const bg = this.add.graphics();
      bg.fillStyle(0x222222, 1);
      bg.fillRoundedRect(contentX + 80, y + 2, barMaxWidth, barHeight, 4);

      // Bar fill
      if (pct > 0) {
        const barWidth = Math.max(3, pct * barMaxWidth);
        const fill = this.add.graphics();
        fill.fillStyle(COLORS[cat], 0.95);
        fill.fillRoundedRect(contentX + 80, y + 2, barWidth, barHeight, 4);
      }

      // Percentage
      this.add
        .text(contentX + contentWidth, y + 1, `${Math.round(pct * 100)}%`, {
          fontSize: "10px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#888",
          resolution: 2,
        })
        .setOrigin(1, 0);

      y += 18;
    }

    y += 8;

    // Focus activity selection
    this.add
      .text(contentX, y, "CO BUDES RIESIT", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    for (const focusCfg of FOCUS_CONFIGS) {
      const isSelected = this.selectedFocus === focusCfg.id;
      const focusY = y;

      const focusBg = this.add.graphics();
      this.drawFocusOption(focusBg, contentX, focusY, contentWidth, focusCfg.color, isSelected);

      // Radio circle
      const radioColor = Phaser.Display.Color.HexStringToColor(focusCfg.color).color;
      const outerCircle = this.add.circle(contentX + 16, focusY + 16, 7, 0x000000, 0);
      outerCircle.setStrokeStyle(2, isSelected ? radioColor : 0x555555);
      this.add.circle(contentX + 16, focusY + 16, 4, radioColor, isSelected ? 1 : 0);

      this.add
        .text(contentX + 30, focusY + 8, focusCfg.label, {
          fontSize: "11px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: isSelected ? "#fff" : "#ccc",
          fontStyle: "600",
          resolution: 2,
        })
        .setOrigin(0, 0);

      this.add
        .text(contentX + 30, focusY + 22, focusCfg.description, {
          fontSize: "9px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: isSelected ? "#aaa" : "#555",
          resolution: 2,
        })
        .setOrigin(0, 0);

      const focusHit = this.add
        .rectangle(contentX + contentWidth / 2, focusY + 16, contentWidth, 32, 0, 0)
        .setInteractive({ useHandCursor: true });

      focusHit.on("pointerdown", () => {
        playTone(440, 0.06, "sine", 0.04);
        this.selectedFocus = focusCfg.id;
        this.countdownTimer.destroy();
        this.scene.restart({ gameState: this.gameState, selectedFocus: this.selectedFocus });
      });

      y += 36;
    }

    y += 12;

    // Revenue projection
    this.projectionLabel = this.add
      .text(centerX, y, "", {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#888",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    this.updateProjection();
    y += 24;

    // HIRING SECTION — scrollable list of all 10 roles
    this.add
      .text(contentX, y, "NAJMI DO TIMU", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    const roleCardHeight = 54;
    const roleCardGap = 6;

    for (const role of ALL_ROLES) {
      const config = ROLE_CONFIGS[role];
      const canAfford = this.gameState.budget >= config.cost;
      this.drawHireRow(contentX, y, contentWidth, roleCardHeight, role, config, canAfford);
      y += roleCardHeight + roleCardGap;
    }

    y += 8;

    // YOUR TEAM section
    if (this.gameState.team.length > 0) {
      this.add
        .text(contentX, y, "TVOJ TIM", {
          fontSize: "10px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#666",
          fontStyle: "700",
          resolution: 2,
        })
        .setOrigin(0, 0);
      y += 18;

      for (const member of this.gameState.team) {
        const config = ROLE_CONFIGS[member.role];
        const color = Phaser.Display.Color.HexStringToColor(config.color).color;
        const alpha = 1;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a1a, alpha);
        bg.fillRoundedRect(contentX, y, contentWidth, 42, 6);
        bg.lineStyle(1, 0x333333, 0.5);
        bg.strokeRoundedRect(contentX, y, contentWidth, 42, 6);

        // Color accent
        bg.fillStyle(color, 0.15);
        bg.fillRoundedRect(contentX, y, 4, 42, { tl: 6, bl: 6, tr: 0, br: 0 });

        // Role circle
        this.add.circle(contentX + 22, y + 21, 10, color);
        const labelShort = this.getRoleShortLabel(member.role);
        this.add
          .text(contentX + 22, y + 21, labelShort, {
            fontSize: "7px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#0a0a0a",
            fontStyle: "800",
            resolution: 2,
          })
          .setOrigin(0.5);

        // Name + level badge
        const levelBadge = member.level === "senior" ? " [Senior]" : " [Junior]";
        this.add
          .text(contentX + 38, y + 10, config.label + levelBadge, {
            fontSize: "10px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#fff",
            fontStyle: "600",
            resolution: 2,
          })
          .setOrigin(0, 0);

        // Monthly cost
        this.add
          .text(contentX + 38, y + 24, `€${config.monthlyCost}k/mes`, {
            fontSize: "9px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#888",
            resolution: 2,
          })
          .setOrigin(0, 0);

        // Upgrade button (if junior)
        let btnEndX = contentX + contentWidth - 10;
        if (member.level === "junior") {
          const canUpgrade = this.gameState.budget >= config.upgradeCost;
          const upgBtnW = 70;
          const upgBtnX = btnEndX - upgBtnW;
          const upgBtnY = y + 4;
          const upgBtnH = 16;

          const upgBg = this.add.graphics();
          upgBg.fillStyle(canUpgrade ? 0x333333 : 0x1a1a1a, 1);
          upgBg.fillRoundedRect(upgBtnX, upgBtnY, upgBtnW, upgBtnH, 4);

          this.add
            .text(upgBtnX + upgBtnW / 2, upgBtnY + upgBtnH / 2, `Upgrade €${config.upgradeCost}`, {
              fontSize: "8px",
              fontFamily: "'Inter', system-ui, sans-serif",
              color: canUpgrade ? CSS_COLORS.general : "#555",
              fontStyle: "700",
              resolution: 2,
            })
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

        // Fire button
        const fireBtnW = 60;
        const fireBtnX = btnEndX - fireBtnW;
        const fireBtnY = y + 22;
        const fireBtnH = 16;

        const fireBg = this.add.graphics();
        fireBg.fillStyle(0x2a1515, 1);
        fireBg.fillRoundedRect(fireBtnX, fireBtnY, fireBtnW, fireBtnH, 4);

        this.add
          .text(fireBtnX + fireBtnW / 2, fireBtnY + fireBtnH / 2, "Prepustit", {
            fontSize: "8px",
            fontFamily: "'Inter', system-ui, sans-serif",
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

    // Big "Pokracovat" button
    y += 16;
    const btnW = contentWidth;
    const btnH = 52;
    const btnX = contentX;
    const btnY = y;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xeab308, 1);
    btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);

    const btnText = this.add
      .text(centerX, btnY + btnH / 2, "POKRACOVAT ->", {
        fontSize: "16px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5);

    const btnHit = this.add
      .rectangle(centerX, btnY + btnH / 2, btnW, btnH, 0, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on("pointerover", () => {
      btnBg.clear();
      btnBg.fillStyle(0xfacc15, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
      btnText.setScale(1.03);
    });
    btnHit.on("pointerout", () => {
      btnBg.clear();
      btnBg.fillStyle(0xeab308, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
      btnText.setScale(1);
    });
    btnHit.on("pointerdown", () => {
      playTone(660, 0.15, "sine", 0.05);
      this.startNextWave();
    });

    y += btnH + 40; // padding at bottom

    // Set total content height and camera bounds for scrolling
    this.contentHeight = y;
    const viewHeight = height;

    if (this.contentHeight > viewHeight) {
      this.cameras.main.setBounds(0, 0, width, this.contentHeight);
      this.setupScrolling(viewHeight);
    }

    // Start countdown timer
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.countdown--;
        this.countdownLabel.setText(`${this.countdown}s`);
        if (this.countdown <= 0) {
          this.startNextWave();
        }
      },
      loop: true,
    });
  }

  private setupScrolling(viewHeight: number): void {
    // Mouse wheel scrolling
    this.input.on("wheel", (_pointer: Phaser.Input.Pointer, _gx: number[], _gy: number[], _gz: number[], _gw: number, _event: Event, dy: number) => {
      // The 'wheel' event in Phaser passes (pointer, gameObjects, deltaX, deltaY, deltaZ, event)
      // But the signature differs — let's use a simpler approach
    });

    // Use the scene's input manager for wheel
    if (this.input.mouse) {
      this.input.on("wheel" as string, (_pointer: unknown, _objects: unknown, _dx: number, dy: number) => {
        const cam = this.cameras.main;
        cam.scrollY = Phaser.Math.Clamp(
          cam.scrollY + dy * 0.5,
          0,
          Math.max(0, this.contentHeight - viewHeight)
        );
      });
    }

    // Pointer drag scrolling (touch + mouse)
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
        Math.max(0, this.contentHeight - viewHeight)
      );
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  private drawPnlSummary(x: number, y: number, w: number, _centerX: number): number {
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRoundedRect(x, y, w, 48, 8);
    bg.lineStyle(1, 0x333333, 0.5);
    bg.strokeRoundedRect(x, y, w, 48, 8);

    const colW = w / 4;

    // Obrat
    this.add
      .text(x + colW * 0.5, y + 12, formatRevenue(this.gameState.revenue), {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(x + colW * 0.5, y + 30, "Obrat", {
        fontSize: "9px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Zisk
    const profitColor = this.gameState.profit >= 0 ? CSS_COLORS.operations : CSS_COLORS.finance;
    this.add
      .text(x + colW * 1.5, y + 12, formatProfit(this.gameState.profit), {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: profitColor,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(x + colW * 1.5, y + 30, "Zisk", {
        fontSize: "9px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Tim
    this.add
      .text(x + colW * 2.5, y + 12, `${this.gameState.team.length}`, {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#fff",
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(x + colW * 2.5, y + 30, "Tim", {
        fontSize: "9px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    // Naklady
    this.add
      .text(x + colW * 3.5, y + 12, `€${this.gameState.monthlyCosts}k`, {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.finance,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(x + colW * 3.5, y + 30, "Naklady/mes", {
        fontSize: "9px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0.5, 0);

    return y + 48;
  }

  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle vertical gradient highlights
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
    config: (typeof ROLE_CONFIGS)[string],
    canAfford: boolean
  ): void {
    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    const alpha = canAfford ? 1 : 0.35;

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, alpha);
    bg.fillRoundedRect(x, y, w, h, 6);
    bg.lineStyle(1, canAfford ? color : 0x333333, canAfford ? 0.4 : 0.2);
    bg.strokeRoundedRect(x, y, w, h, 6);

    // Left color accent
    bg.fillStyle(color, canAfford ? 0.15 : 0.05);
    bg.fillRoundedRect(x, y, 4, h, { tl: 6, bl: 6, tr: 0, br: 0 });

    // Role circle
    this.add.circle(x + 22, y + h / 2, 10, color).setAlpha(alpha);
    const labelShort = this.getRoleShortLabel(role);
    this.add
      .text(x + 22, y + h / 2, labelShort, {
        fontSize: "7px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(alpha);

    // Role name
    this.add
      .text(x + 40, y + 10, config.label, {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "700",
        resolution: 2,
      })
      .setAlpha(alpha);

    // Description
    this.add
      .text(x + 40, y + 24, config.description, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#777",
        resolution: 2,
        wordWrap: { width: w - 150 },
      })
      .setAlpha(alpha);

    // Hire cost + monthly cost on right side
    this.add
      .text(x + w - 10, y + 12, `€${config.cost}`, {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: canAfford ? CSS_COLORS.general : "#555",
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setAlpha(alpha);

    this.add
      .text(x + w - 10, y + 28, `+€${config.monthlyCost}k/mes`, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#888",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setAlpha(alpha);

    // NAJAT button
    const btnW = 50;
    const btnH = 18;
    const btnX = x + w - btnW - 8;
    const btnY = y + h - btnH - 5;

    if (canAfford) {
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x333333, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);

      this.add
        .text(btnX + btnW / 2, btnY + btnH / 2, "NAJAT", {
          fontSize: "9px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: CSS_COLORS.general,
          fontStyle: "800",
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

  private getRoleShortLabel(role: Role): string {
    switch (role) {
      case "va": return "VA";
      case "sales": return "SAL";
      case "marketing": return "MKT";
      case "product": return "PRD";
      case "support": return "SUP";
      case "accountant": return "ACC";
      case "cfo": return "CFO";
      case "hr": return "HR";
      case "operations": return "OPS";
      case "coo": return "COO";
      default: return "";
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

    // Recalculate monthly costs
    this.recalcMonthlyCosts();

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState, selectedFocus: this.selectedFocus });
  }

  private upgrade(memberId: string): void {
    const member = this.gameState.team.find((m) => m.id === memberId);
    if (!member) return;

    const config = ROLE_CONFIGS[member.role];
    if (this.gameState.budget < config.upgradeCost) return;

    this.gameState.budget -= config.upgradeCost;
    member.level = "senior";

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState, selectedFocus: this.selectedFocus });
  }

  private fire(memberId: string): void {
    const index = this.gameState.team.findIndex((m) => m.id === memberId);
    if (index === -1) return;

    this.gameState.team.splice(index, 1);

    // Recalculate monthly costs
    this.recalcMonthlyCosts();

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState, selectedFocus: this.selectedFocus });
  }

  private recalcMonthlyCosts(): void {
    this.gameState.monthlyCosts = this.gameState.team.reduce((sum, m) => {
      const cfg = ROLE_CONFIGS[m.role];
      return sum + cfg.monthlyCost;
    }, 0);
  }

  private startNextWave(): void {
    this.countdownTimer.destroy();
    if (this.selectedFocus) {
      this.gameState.focusHistory.push(this.selectedFocus);
    }
    this.gameState.wave++;
    this.scene.start("ActionScene", { gameState: this.gameState });
  }

  private drawFocusOption(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    color: string,
    selected: boolean
  ): void {
    const colorHex = Phaser.Display.Color.HexStringToColor(color).color;
    gfx.fillStyle(selected ? 0x1a1a1a : 0x111111, 1);
    gfx.fillRoundedRect(x, y, w, 32, 6);
    gfx.lineStyle(1, selected ? colorHex : 0x222222, selected ? 0.6 : 0.3);
    gfx.strokeRoundedRect(x, y, w, 32, 6);
  }

  private updateProjection(): void {
    const nextWaveConfig = WAVES[this.gameState.wave]; // wave is 0-indexed after current
    if (!nextWaveConfig) {
      this.projectionLabel.setText("");
      return;
    }
    const { revenueGain, profitGain } = calculateWaveFinancials(
      this.gameState,
      nextWaveConfig,
      this.selectedFocus
    );
    this.projectionLabel.setText(
      `Potencial dalsej vlny: +${formatRevenue(revenueGain)} obrat, ${formatProfit(profitGain)} zisk`
    );
  }
}
