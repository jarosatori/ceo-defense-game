import * as Phaser from "phaser";
import type { GameState, Role, Category } from "../types";
import { COLORS, CSS_COLORS, ROLE_CONFIGS, PLANNING_DURATION } from "../constants";

export class PlanningScene extends Phaser.Scene {
  private gameState!: GameState;
  private countdown: number = PLANNING_DURATION;
  private countdownLabel!: Phaser.GameObjects.Text;
  private countdownTimer!: Phaser.Time.TimerEvent;

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
    let yOffset = 20;

    // Header
    this.add
      .text(centerX, yOffset, "PLANOVACIA FAZA", {
        fontSize: "20px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    yOffset += 32;

    // Budget display
    this.add
      .text(centerX, yOffset, `Budget: €${this.gameState.budget}`, {
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    yOffset += 28;

    // Countdown
    this.countdownLabel = this.add
      .text(centerX, yOffset, `${this.countdown}s`, {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.uiText,
      })
      .setOrigin(0.5, 0);
    yOffset += 30;

    // "Co ta zabilo" bar chart
    this.add
      .text(centerX, yOffset, "Co ta zabilo", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    yOffset += 24;

    const categories: Category[] = ["marketing", "finance", "operations", "general"];
    const totalMissed = Object.values(this.gameState.missedByCategory).reduce(
      (sum, val) => sum + val,
      0
    );
    const barMaxWidth = width - 80;
    const barHeight = 14;

    for (const cat of categories) {
      const missed = this.gameState.missedByCategory[cat];
      const pct = totalMissed > 0 ? missed / totalMissed : 0;
      const barWidth = Math.max(2, pct * barMaxWidth);
      const color = COLORS[cat];

      // Bar background
      this.add.rectangle(40, yOffset + barHeight / 2, barMaxWidth, barHeight, 0x333333).setOrigin(0, 0.5);
      // Bar fill
      if (barWidth > 0) {
        this.add.rectangle(40, yOffset + barHeight / 2, barWidth, barHeight, color).setOrigin(0, 0.5);
      }
      // Percentage
      this.add
        .text(40 + barMaxWidth + 8, yOffset + barHeight / 2, `${Math.round(pct * 100)}%`, {
          fontSize: "10px",
          fontFamily: "Inter, sans-serif",
          color: CSS_COLORS.uiText,
        })
        .setOrigin(0, 0.5);

      yOffset += barHeight + 6;
    }

    yOffset += 10;

    // Hire cards
    this.add
      .text(centerX, yOffset, "Najmi do timu", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    yOffset += 24;

    const hireRoles: Role[] = ["va", "marketing", "finance", "operations"];
    const cardWidth = (width - 60) / 2;
    const cardHeight = 60;
    const cardGap = 10;

    hireRoles.forEach((role, index) => {
      const config = ROLE_CONFIGS[role];
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardX = 20 + col * (cardWidth + cardGap);
      const cardY = yOffset + row * (cardHeight + cardGap);
      const canAfford = this.gameState.budget >= config.cost;

      const cardColor = canAfford ? 0x1a1a1a : 0x111111;
      const cardAlpha = canAfford ? 1 : 0.4;

      const card = this.add
        .rectangle(cardX + cardWidth / 2, cardY + cardHeight / 2, cardWidth, cardHeight, cardColor)
        .setStrokeStyle(1, canAfford ? 0x444444 : 0x222222)
        .setAlpha(cardAlpha);

      // Color dot
      const dotColor = Phaser.Display.Color.HexStringToColor(config.color).color;
      this.add.circle(cardX + 14, cardY + cardHeight / 2, 6, dotColor).setAlpha(cardAlpha);

      // Role name
      this.add
        .text(cardX + 26, cardY + 12, config.label, {
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setAlpha(cardAlpha);

      // Cost
      this.add
        .text(cardX + 26, cardY + 30, `€${config.cost}`, {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          color: CSS_COLORS.general,
        })
        .setAlpha(cardAlpha);

      if (canAfford) {
        card.setInteractive({ useHandCursor: true });
        card.on("pointerdown", () => this.hire(role));
      }
    });

    yOffset += Math.ceil(hireRoles.length / 2) * (cardHeight + cardGap) + 10;

    // Upgrade section
    const juniors = this.gameState.team.filter((m) => m.level === "junior");
    if (juniors.length > 0) {
      this.add
        .text(centerX, yOffset, "Upgraduj na seniora", {
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0);
      yOffset += 24;

      juniors.forEach((member) => {
        const config = ROLE_CONFIGS[member.role];
        const canAfford = this.gameState.budget >= config.upgradeCost;
        const alpha = canAfford ? 1 : 0.4;

        const btn = this.add
          .rectangle(centerX, yOffset + 14, width - 60, 28, canAfford ? 0x1a1a1a : 0x111111)
          .setStrokeStyle(1, canAfford ? 0x444444 : 0x222222)
          .setAlpha(alpha);

        this.add
          .text(centerX, yOffset + 14, `${config.label} → Senior (€${config.upgradeCost})`, {
            fontSize: "11px",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          })
          .setOrigin(0.5)
          .setAlpha(alpha);

        if (canAfford) {
          btn.setInteractive({ useHandCursor: true });
          btn.on("pointerdown", () => this.upgrade(member.id));
        }

        yOffset += 36;
      });

      yOffset += 6;
    }

    // Current team display
    this.add
      .text(centerX, yOffset, "Tvoj tim", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    yOffset += 24;

    const teamDisplayY = yOffset + 16;
    const totalMembers = this.gameState.team.length + 1; // +1 for CEO
    const circleGap = 30;
    const startX = centerX - ((totalMembers - 1) * circleGap) / 2;

    // CEO circle
    this.add.circle(startX, teamDisplayY, 12, COLORS.ceo);
    this.add
      .text(startX, teamDisplayY, "CEO", {
        fontSize: "7px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Team member circles
    this.gameState.team.forEach((member, i) => {
      const config = ROLE_CONFIGS[member.role];
      const color = Phaser.Display.Color.HexStringToColor(config.color).color;
      const x = startX + (i + 1) * circleGap;
      const size = member.level === "senior" ? 12 : 9;
      this.add.circle(x, teamDisplayY, size, color);
      const labelText = member.role === "va" ? "VA" : member.role.substring(0, 3).toUpperCase();
      this.add
        .text(x, teamDisplayY, labelText, {
          fontSize: "6px",
          fontFamily: "Inter, sans-serif",
          color: "#0a0a0a",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
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
    this.scene.restart({ gameState: this.gameState });
  }

  private upgrade(memberId: string): void {
    const member = this.gameState.team.find((m) => m.id === memberId);
    if (!member) return;

    const config = ROLE_CONFIGS[member.role];
    if (this.gameState.budget < config.upgradeCost) return;

    this.gameState.budget -= config.upgradeCost;
    member.level = "senior";

    this.countdownTimer.destroy();
    this.scene.restart({ gameState: this.gameState });
  }

  private startNextWave(): void {
    this.countdownTimer.destroy();
    this.gameState.wave++;
    this.scene.start("ActionScene", { gameState: this.gameState });
  }
}
