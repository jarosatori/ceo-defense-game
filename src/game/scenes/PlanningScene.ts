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
import { formatRevenue, calculateWaveRevenue } from "../utils/revenueCalculator";
import { playTone } from "../utils/audio";

export class PlanningScene extends Phaser.Scene {
  private gameState!: GameState;
  private countdown: number = PLANNING_DURATION;
  private countdownLabel!: Phaser.GameObjects.Text;
  private countdownTimer!: Phaser.Time.TimerEvent;
  private budgetLabel!: Phaser.GameObjects.Text;
  private selectedFocus: FocusActivity | null = null;
  private projectionLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PlanningScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
    this.gameState.phase = "planning";
    this.countdown = PLANNING_DURATION;
    // Preserve focus selection across scene restarts (hire/upgrade)
    this.selectedFocus = (data as { selectedFocus?: FocusActivity }).selectedFocus ?? null;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Background
    this.drawBackground(width, height);

    // Layout boundaries
    const contentWidth = Math.min(420, width - 40);
    const contentX = centerX - contentWidth / 2;

    let y = 24;

    // Title
    this.add
      .text(centerX, y, `VLNA ${this.gameState.wave} PREŽITÁ`, {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.operations,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 22;

    this.add
      .text(centerX, y, "Plánovacia fáza", {
        fontSize: "26px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 44;

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
      .text(contentX, y + 26, "K dispozícii", {
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
      .text(contentX + contentWidth, y + 26, "Auto-štart", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(1, 0);

    // Revenue display
    this.add
      .text(centerX, y, formatRevenue(this.gameState.revenue), {
        fontSize: "22px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 26;

    this.add
      .text(centerX, y, "Tvoj obrat", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        resolution: 2,
      })
      .setOrigin(0.5, 0);
    y += 18;

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

    y += 8;

    // "Čo ťa zabilo" — bar chart
    this.add
      .text(contentX, y, "ČO ŤA ZABILO", {
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
      operations: "Operácie",
      general: "Ostatné",
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
      .text(contentX, y, "ČO BUDEŠ RIEŠIŤ", {
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
      const innerCircle = this.add.circle(contentX + 16, focusY + 16, 4, radioColor, isSelected ? 1 : 0);

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

    y += 8;

    // Hire cards
    this.add
      .text(contentX, y, "NAJMI DO TÍMU", {
        fontSize: "10px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#666",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0);
    y += 18;

    const hireRoles: Role[] = ["va", "marketing", "finance", "operations"];
    const cardGap = 8;
    const cardWidth = (contentWidth - cardGap) / 2;
    const cardHeight = 78;

    hireRoles.forEach((role, index) => {
      const config = ROLE_CONFIGS[role];
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardX = contentX + col * (cardWidth + cardGap);
      const cardY = y + row * (cardHeight + cardGap);
      const canAfford = this.gameState.budget >= config.cost;
      this.drawHireCard(cardX, cardY, cardWidth, cardHeight, role, config, canAfford);
    });

    y += Math.ceil(hireRoles.length / 2) * (cardHeight + cardGap) + 6;

    // Upgrades
    const juniors = this.gameState.team.filter((m) => m.level === "junior");
    if (juniors.length > 0) {
      this.add
        .text(contentX, y, "UPGRADE NA SENIORA", {
          fontSize: "10px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#666",
          fontStyle: "700",
          resolution: 2,
        })
        .setOrigin(0, 0);
      y += 18;

      juniors.forEach((member) => {
        const config = ROLE_CONFIGS[member.role];
        const canAfford = this.gameState.budget >= config.upgradeCost;
        const alpha = canAfford ? 1 : 0.35;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a1a, alpha);
        bg.fillRoundedRect(contentX, y, contentWidth, 32, 6);
        bg.lineStyle(1, canAfford ? 0x444 : 0x222, alpha);
        bg.strokeRoundedRect(contentX, y, contentWidth, 32, 6);

        const color = Phaser.Display.Color.HexStringToColor(config.color).color;
        this.add.circle(contentX + 16, y + 16, 6, color).setAlpha(alpha);

        this.add
          .text(contentX + 30, y + 16, `${config.label} → ⭐ Senior`, {
            fontSize: "11px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#fff",
            fontStyle: "600",
            resolution: 2,
          })
          .setOrigin(0, 0.5)
          .setAlpha(alpha);

        this.add
          .text(contentX + contentWidth - 16, y + 16, `€${config.upgradeCost}`, {
            fontSize: "12px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CSS_COLORS.general,
            fontStyle: "700",
            resolution: 2,
          })
          .setOrigin(1, 0.5)
          .setAlpha(alpha);

        if (canAfford) {
          const hitArea = this.add
            .rectangle(contentX + contentWidth / 2, y + 16, contentWidth, 32, 0, 0)
            .setInteractive({ useHandCursor: true });
          hitArea.on("pointerdown", () => this.upgrade(member.id));
        }

        y += 40;
      });

      y += 4;
    }

    // Current team (if any)
    if (this.gameState.team.length > 0) {
      this.add
        .text(contentX, y, "TVOJ TÍM", {
          fontSize: "10px",
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#666",
          fontStyle: "700",
          resolution: 2,
        })
        .setOrigin(0, 0);
      y += 22;

      const teamMemberCount = this.gameState.team.length + 1;
      const gap = 36;
      const teamWidth = (teamMemberCount - 1) * gap;
      const teamStartX = centerX - teamWidth / 2;

      this.drawTeamMemberChip(teamStartX, y, "CEO", 0xffffff, "junior");
      this.gameState.team.forEach((m, i) => {
        const cfg = ROLE_CONFIGS[m.role];
        const color = Phaser.Display.Color.HexStringToColor(cfg.color).color;
        const label =
          m.role === "va" ? "VA" : m.role.substring(0, 3).toUpperCase();
        this.drawTeamMemberChip(teamStartX + (i + 1) * gap, y, label, color, m.level);
      });

      y += 40;
    }

    // Big "Pokračovať" button
    y = height - 72;
    const btnW = contentWidth;
    const btnH = 52;
    const btnX = contentX;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xeab308, 1);
    btnBg.fillRoundedRect(btnX, y, btnW, btnH, 10);

    const btnText = this.add
      .text(centerX, y + btnH / 2, "POKRAČOVAŤ →", {
        fontSize: "16px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5);

    const btnHit = this.add
      .rectangle(centerX, y + btnH / 2, btnW, btnH, 0, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on("pointerover", () => {
      btnBg.clear();
      btnBg.fillStyle(0xfacc15, 1);
      btnBg.fillRoundedRect(btnX, y, btnW, btnH, 10);
      btnText.setScale(1.03);
    });
    btnHit.on("pointerout", () => {
      btnBg.clear();
      btnBg.fillStyle(0xeab308, 1);
      btnBg.fillRoundedRect(btnX, y, btnW, btnH, 10);
      btnText.setScale(1);
    });
    btnHit.on("pointerdown", () => {
      playTone(660, 0.15, "sine", 0.05);
      this.startNextWave();
    });

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

  private drawHireCard(
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

    // Card background with colored accent
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, alpha);
    bg.fillRoundedRect(x, y, w, h, 8);
    bg.lineStyle(1, canAfford ? color : 0x333, canAfford ? 0.4 : 0.2);
    bg.strokeRoundedRect(x, y, w, h, 8);

    // Left color accent
    bg.fillStyle(color, canAfford ? 0.15 : 0.05);
    bg.fillRoundedRect(x, y, 4, h, { tl: 8, bl: 8, tr: 0, br: 0 });

    // Role circle
    this.add.circle(x + 22, y + 22, 11, color).setAlpha(alpha);
    const labelShort =
      role === "va" ? "VA" : role.substring(0, 3).toUpperCase();
    this.add
      .text(x + 22, y + 22, labelShort, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(alpha);

    // Role name
    this.add
      .text(x + 40, y + 14, config.label, {
        fontSize: "11px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "700",
        resolution: 2,
      })
      .setAlpha(alpha);

    // Description
    this.add
      .text(x + 40, y + 28, config.description, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#777",
        resolution: 2,
        wordWrap: { width: w - 52 },
      })
      .setAlpha(alpha);

    // Cost
    this.add
      .text(x + 40, y + 46, `€${config.cost}`, {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: canAfford ? CSS_COLORS.general : "#555",
        fontStyle: "800",
        resolution: 2,
      })
      .setAlpha(alpha);

    // Hint (what it catches)
    const hint = this.getRoleHint(role);
    this.add
      .text(x + w - 10, y + h - 8, hint, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#555",
        resolution: 2,
      })
      .setOrigin(1, 1)
      .setAlpha(alpha);

    if (canAfford) {
      const hit = this.add
        .rectangle(x + w / 2, y + h / 2, w, h, 0, 0)
        .setInteractive({ useHandCursor: true });
      hit.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(0x222222, 1);
        bg.fillRoundedRect(x, y, w, h, 8);
        bg.lineStyle(1.5, color, 0.8);
        bg.strokeRoundedRect(x, y, w, h, 8);
        bg.fillStyle(color, 0.25);
        bg.fillRoundedRect(x, y, 4, h, { tl: 8, bl: 8, tr: 0, br: 0 });
      });
      hit.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(0x1a1a1a, 1);
        bg.fillRoundedRect(x, y, w, h, 8);
        bg.lineStyle(1, color, 0.4);
        bg.strokeRoundedRect(x, y, w, h, 8);
        bg.fillStyle(color, 0.15);
        bg.fillRoundedRect(x, y, 4, h, { tl: 8, bl: 8, tr: 0, br: 0 });
      });
      hit.on("pointerdown", () => {
        playTone(520, 0.1, "sine", 0.05);
        this.hire(role);
      });
    }
  }

  private getRoleHint(role: Role): string {
    switch (role) {
      case "va":
        return "• všetko pomaly";
      case "marketing":
        return "▲ marketing";
      case "finance":
        return "◆ financie";
      case "operations":
        return "■ operácie";
    }
  }

  private drawTeamMemberChip(
    x: number,
    y: number,
    label: string,
    color: number,
    level: string
  ): void {
    const size = level === "senior" ? 14 : 11;
    this.add.circle(x, y, size + 3, color, 0.3);
    this.add.circle(x, y, size, color).setStrokeStyle(1, 0xffffff, 0.5);
    this.add
      .text(x, y, label, {
        fontSize: "8px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0a0a0a",
        fontStyle: "800",
        resolution: 2,
      })
      .setOrigin(0.5);

    if (level === "senior") {
      this.add
        .text(x + size, y - size, "★", {
          fontSize: "10px",
          fontFamily: "system-ui, sans-serif",
          color: "#ffd700",
          resolution: 2,
        })
        .setOrigin(0.5);
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
    const projected = calculateWaveRevenue(
      this.gameState,
      nextWaveConfig,
      this.selectedFocus
    );
    this.projectionLabel.setText(`Potenciál ďalšej vlny: +${formatRevenue(projected)}`);
  }
}
