import * as Phaser from "phaser";
import type { GameState, Category } from "../types";
import {
  COLORS,
  CSS_COLORS,
  BUDGET_PER_CATCH,
  COMBO_WINDOW_MS,
  COMBO_BONUS_MULTIPLIER,
  PROFIT_GAMEOVER_THRESHOLD,
  ROLE_CONFIGS,
} from "../constants";
import {
  calculateMonthlyPnl,
  applyPriorityToBaseline,
  applyEventToWave,
  formatMoney,
} from "../utils/pnlCalculator";
import { WAVES } from "../data/waves";
import { CEO } from "../entities/CEO";
import { TeamMemberEntity } from "../entities/TeamMember";
import { WaveSpawner } from "../systems/WaveSpawner";
import { CatchSystem } from "../systems/CatchSystem";
import { DamageSystem } from "../systems/DamageSystem";
import { BudgetSystem } from "../systems/BudgetSystem";
import { playTone } from "../utils/audio";
import { preloadSprites } from "../utils/spriteLoader";

export class ActionScene extends Phaser.Scene {
  private gameState!: GameState;
  private ceo!: CEO;
  private centerX: number = 0;
  private centerY: number = 0;
  private teamEntities: TeamMemberEntity[] = [];
  private spawner!: WaveSpawner;
  private catchSystem!: CatchSystem;
  private damageSystem!: DamageSystem;
  private budgetSystem!: BudgetSystem;
  private waveLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private revenueLabel!: Phaser.GameObjects.Text;
  private profitLabel!: Phaser.GameObjects.Text;
  private comboLabel!: Phaser.GameObjects.Text;
  private waveNameLabel!: Phaser.GameObjects.Text;
  private waveNameSubLabel!: Phaser.GameObjects.Text;
  private missFlash!: Phaser.GameObjects.Rectangle;
  private waveStarted: boolean = false;

  // Combo tracking
  private comboCount: number = 0;
  private lastCatchTime: number = 0;

  // Live P&L ticker
  private liveMonthlyRevenue: number = 0;
  private displayedRevenue: number = 0;
  private revenueTween?: Phaser.Tweens.Tween;
  private lastShownComboMilestone: number = 0;

  constructor() {
    super({ key: "ActionScene" });
  }

  preload(): void {
    preloadSprites(this);
  }

  init(data?: { gameState: GameState }): void {
    if (!data?.gameState) {
      // No state yet — bail silently. create() will also bail.
      // React will restart this scene with proper state via controller.startAction().
      return;
    }
    this.gameState = data.gameState;
    this.gameState.phase = "action";

    // Reset per-wave counters so performance/catchRate is measured on this month.
    this.gameState.problemsCaught = 0;
    this.gameState.problemsMissed = 0;
    this.gameState.caughtByCategory = {
      marketing: 0,
      finance: 0,
      operations: 0,
      general: 0,
    };
    this.gameState.missedByCategory = {
      marketing: 0,
      finance: 0,
      operations: 0,
      general: 0,
    };

    this.teamEntities = [];
    this.waveStarted = false;
    this.comboCount = 0;
    this.lastCatchTime = 0;
    this.liveMonthlyRevenue = 0;
    this.displayedRevenue = 0;
    this.lastShownComboMilestone = 0;
  }

  create(): void {
    // Guard: init() bailed because no gameState was passed (auto-start).
    if (!this.gameState) {
      return;
    }
    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;

    // Radial gradient background
    this.drawBackground(width, height);

    // UI top bar
    this.drawTopBar(width);

    // Wave name splash
    this.waveNameLabel = this.add
      .text(this.centerX, this.centerY - 110, "", {
        fontSize: "40px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#ffffff",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(50);

    this.waveNameSubLabel = this.add
      .text(this.centerX, this.centerY - 75, "", {
        fontSize: "14px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#A69E92",
        fontStyle: "500",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(50);

    // Combo label (hidden initially)
    this.comboLabel = this.add
      .text(this.centerX, this.centerY + 80, "", {
        fontSize: "18px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: CSS_COLORS.general,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(40);

    // Miss flash overlay
    this.missFlash = this.add
      .rectangle(this.centerX, this.centerY, width, height, 0xff0000, 0)
      .setDepth(90);

    // Systems
    this.damageSystem = new DamageSystem(this);
    this.damageSystem.damage = this.gameState.damage;
    if (this.gameState.damage > 0) {
      this.damageSystem.addDamage(0);
    }

    this.budgetSystem = new BudgetSystem(this, this.gameState.budget);
    this.catchSystem = new CatchSystem();

    // CEO in center
    this.ceo = new CEO(this, this.centerX, this.centerY);
    this.ceo.setDepth(20);

    // Team members
    const totalMembers = Math.max(this.gameState.team.length, 4);
    this.gameState.team.forEach((member, index) => {
      const entity = new TeamMemberEntity(
        this,
        this.centerX,
        this.centerY,
        member.role,
        member.level,
        member.id,
        index,
        totalMembers,
      );
      entity.setDepth(22);
      this.teamEntities.push(entity);
    });

    // Wave spawner
    this.spawner = new WaveSpawner(this, this.centerX, this.centerY);
    this.spawner.onProblemMissed = (problem) => {
      this.gameState.problemsMissed++;
      this.gameState.missedByCategory[problem.category]++;
      this.damageSystem.addDamage();
      this.ceo.flashDamage();
      this.flashMissColor(problem.category);
      this.resetCombo();
      // Money lost on miss
      const penalty = 0.3;
      this.liveMonthlyRevenue = Math.max(0, this.liveMonthlyRevenue - penalty);
      this.spawnFloatingMoney(problem.x, problem.y, -penalty, problem.category, true);
      this.tweenRevenueLabel();
      this.chromaticAberration();
      playTone(120, 0.2, "sawtooth", 0.08);
    };

    // Input — CEO manual click
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const activeProblems = this.spawner.getActiveProblems();
      const caught = this.catchSystem.checkCEOClick(
        this.ceo.x,
        this.ceo.y,
        pointer.worldX,
        pointer.worldY,
        activeProblems,
      );
      if (caught) {
        this.gameState.manualClicks++;
        this.handleCatch(caught.category, caught.x, caught.y, true);
        this.spawner.removeProblem(caught);
      }
    });

    // Start the wave
    this.startWave();
  }

  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    // Solid plum base
    bg.fillStyle(0x531e38, 1);
    bg.fillRect(0, 0, width, height);
    // Subtle magenta radial glow in center
    for (let i = 0; i < 4; i++) {
      const r = Math.max(width, height) * (0.7 - i * 0.12);
      bg.fillStyle(0x9f2d6d, 0.04);
      bg.fillCircle(width / 2, height / 2, r);
    }
    // Soft cream dot grid (subtle atmosphere)
    const dots = this.add.graphics();
    dots.fillStyle(0xefedeb, 0.04);
    const spacing = 44;
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        dots.fillCircle(x, y, 1);
      }
    }
    bg.setDepth(-10);
    dots.setDepth(-5);
  }

  private drawTopBar(width: number): void {
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.4);
    topBar.fillRect(0, 0, width, 30);
    topBar.setDepth(15);

    this.waveLabel = this.add
      .text(16, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0)
      .setDepth(16);

    this.scoreLabel = this.add
      .text(width * 0.3, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: CSS_COLORS.uiText,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(16);

    this.revenueLabel = this.add
      .text(width * 0.65, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(16);

    this.profitLabel = this.add
      .text(width - 16, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter Tight', system-ui, sans-serif",
        color: CSS_COLORS.operations,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setDepth(16);
  }

  private startWave(): void {
    const rawWave = WAVES[this.gameState.wave - 1];
    if (!rawWave) return;
    // Apply V9 event/policy modifiers (density + category skew)
    const waveConfig = applyEventToWave(rawWave, this.gameState);

    this.waveLabel.setText(`VLNA ${waveConfig.wave}/10`);
    this.scoreLabel.setText(`Skóre: ${this.gameState.score}`);
    this.displayedRevenue = this.gameState.monthlyRevenue;
    this.liveMonthlyRevenue = 0;
    this.revenueLabel.setText(`Obrat: ${formatMoney(this.displayedRevenue)}`);
    this.updateProfitLabel();

    // Wave name splash animation
    this.waveNameLabel.setText(waveConfig.name.toUpperCase());
    this.waveNameSubLabel.setText(
      `Mesiac ${waveConfig.wave} — ${waveConfig.problemCount} problémov`,
    );

    this.tweens.add({
      targets: [this.waveNameLabel, this.waveNameSubLabel],
      alpha: { from: 0, to: 1 },
      y: "-=10",
      duration: 500,
      ease: "Power2",
    });

    this.tweens.add({
      targets: [this.waveNameLabel, this.waveNameSubLabel],
      alpha: 0,
      duration: 600,
      delay: 1800,
      ease: "Power2",
    });

    this.time.delayedCall(700, () => {
      this.spawner.startWave(waveConfig);
      this.waveStarted = true;
    });
  }

  private updateProfitLabel(): void {
    const profitText = `Zisk/mes: ${formatMoney(this.gameState.monthlyProfit)}`;
    const profitColor =
      this.gameState.monthlyProfit >= 0
        ? CSS_COLORS.operations
        : CSS_COLORS.finance;
    this.profitLabel.setText(profitText);
    this.profitLabel.setColor(profitColor);
  }

  update(_time: number, delta: number): void {
    for (const member of this.teamEntities) {
      member.updateOrbitPosition(delta, this.centerX, this.centerY);
      member.updateCooldown(delta);
    }

    if (!this.waveStarted) return;

    this.scoreLabel.setText(`Skóre: ${this.gameState.score}`);

    const activeProblems = this.spawner.getActiveProblems();
    for (const problem of activeProblems) {
      problem.update(delta);
    }

    // Team auto-catch
    const caughtByTeam = this.catchSystem.checkTeamCatches(
      this.teamEntities,
      this.spawner.getActiveProblems(),
    );
    for (const evt of caughtByTeam) {
      this.drawTeamBeam(evt.catcher.x, evt.catcher.y, evt.problem.x, evt.problem.y, evt.catcher.role);
      this.handleCatch(evt.problem.category, evt.problem.x, evt.problem.y, false);
      this.spawner.removeProblem(evt.problem);
    }

    // Expire combo if timed out
    if (this.comboCount > 0 && _time - this.lastCatchTime > COMBO_WINDOW_MS) {
      this.resetCombo();
    }

    // Check game over (damage)
    if (this.damageSystem.isGameOver()) {
      this.endGame(false);
      return;
    }

    // Check game over (profit cash crunch) — on cumulative profit
    if (this.gameState.profit < PROFIT_GAMEOVER_THRESHOLD) {
      this.endGame(false, true);
      return;
    }

    // Check wave complete
    if (this.spawner.isWaveComplete()) {
      this.waveStarted = false;

      const rawWaveCfg = WAVES[this.gameState.wave - 1];
      if (rawWaveCfg) {
        // V9: priorities removed. selectedPriority is always null now.
        // Events apply their own revenue multipliers via pendingWaveModifiers
        // (read in calculateMonthlyRevenue).
        const priority = this.gameState.selectedPriority;
        const waveConfig = applyEventToWave(rawWaveCfg, this.gameState);

        const pnl = calculateMonthlyPnl(this.gameState, waveConfig, priority);

        // Apply to state
        this.gameState.monthlyRevenue = pnl.revenue;
        this.gameState.monthlyProfit = pnl.ebitda;
        this.gameState.monthlyCosts = pnl.salaries;
        this.gameState.revenue += pnl.revenue;
        this.gameState.profit += pnl.ebitda;
        this.gameState.pnlHistory.push(pnl);

        // After computing PnL, lock in the priority's permanent effects
        if (priority) {
          this.gameState.baselineRatios = applyPriorityToBaseline(
            this.gameState.baselineRatios,
            priority,
            this.gameState.businessType,
          );
          this.gameState.priorityHistory.push(priority);
          this.gameState.selectedPriority = null;
        }

        this.revenueLabel.setText(`Obrat: ${formatMoney(this.gameState.monthlyRevenue)}`);
        this.updateProfitLabel();
      }

      if (this.gameState.wave >= 10) {
        this.endGame(true);
      } else {
        this.goToPlanning();
      }
    }
  }

  private handleCatch(
    category: Category,
    x: number,
    y: number,
    isManual: boolean,
  ): void {
    const now = this.time.now;

    if (now - this.lastCatchTime < COMBO_WINDOW_MS) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastCatchTime = now;

    const comboTier = Math.min(Math.floor(this.comboCount / 3), 4);
    const multiplier = 1 + comboTier * COMBO_BONUS_MULTIPLIER;
    const scoreGain = Math.round(10 * multiplier);
    const budgetGain = BUDGET_PER_CATCH * multiplier;

    this.gameState.score += scoreGain;
    this.gameState.problemsCaught++;
    this.gameState.caughtByCategory[category]++;
    this.budgetSystem.earn(budgetGain);

    // Revenue ticker: each catch contributes a small amount, scaled by combo + margin.
    const baseAmount = 0.4 * (this.gameState.baselineRatios.grossMargin || 0.5);
    const gain = baseAmount * multiplier;
    const isHighValue = gain >= 2;
    this.liveMonthlyRevenue += gain;
    this.tweenRevenueLabel();

    this.spawnCatchParticles(x, y, category);
    this.spawnFloatingMoney(x, y, gain, category, false);
    this.spawnScorePopup(x, y, `+${scoreGain}`, category);

    if (isManual) {
      this.ceo.celebrateCatch();
    }

    // CEO scale-punch on every catch
    this.tweens.add({
      targets: this.ceo,
      scale: { from: 1.05, to: 1 },
      duration: 120,
      ease: "Back.easeOut",
    });

    if (comboTier > 0) {
      this.showCombo(this.comboCount, multiplier);
    }

    // Combo milestones
    if (
      (this.comboCount === 3 ||
        this.comboCount === 6 ||
        this.comboCount === 10) &&
      this.comboCount !== this.lastShownComboMilestone
    ) {
      this.lastShownComboMilestone = this.comboCount;
      this.flashComboMilestone(this.comboCount);
      this.ceoRipple();
    }

    // Pitch rises with combo (cap 880Hz)
    const freq = Math.min(880, 440 + this.comboCount * 40);
    playTone(freq, 0.08, "sine", 0.05);

    // High-value catch: slow-mo + color flash
    if (isHighValue) {
      this.highValueFlash(category);
    }
  }

  // ──────────────────────────────────────────────
  // Juice helpers
  // ──────────────────────────────────────────────

  private spawnFloatingMoney(
    x: number,
    y: number,
    amount: number,
    category: Category,
    isLoss: boolean,
  ): void {
    const colorHex = isLoss ? CSS_COLORS.finance : this.getCssColor(category);
    const sign = amount >= 0 ? "+" : "−";
    const abs = Math.abs(amount);
    const text = `${sign}€${abs >= 1 ? abs.toFixed(1) : (abs * 1000).toFixed(0) + ""}${abs >= 1 ? "k" : ""}`;
    const fontSize = Math.min(26, 14 + Math.log2(1 + abs * 2) * 4);

    const label = this.add
      .text(x, y, text, {
        fontSize: `${fontSize}px`,
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: colorHex,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(36)
      .setScale(0.6);

    this.tweens.add({
      targets: label,
      scale: 1.1,
      duration: 120,
      ease: "Back.easeOut",
      yoyo: false,
    });

    this.tweens.add({
      targets: label,
      y: y + (isLoss ? 40 : -50),
      alpha: 0,
      duration: 900,
      delay: 120,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy(),
    });
  }

  private tweenRevenueLabel(): void {
    if (!this.revenueLabel) return;
    const target = this.gameState.monthlyRevenue + this.liveMonthlyRevenue;
    this.revenueTween?.stop();
    const startVal = this.displayedRevenue;
    const obj = { v: startVal };
    this.revenueTween = this.tweens.add({
      targets: obj,
      v: target,
      duration: 220,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        this.displayedRevenue = obj.v;
        this.revenueLabel.setText(`Obrat: ${formatMoney(obj.v)}`);
      },
    });
  }

  private flashComboMilestone(count: number): void {
    const label =
      count >= 10 ? "x10 UNSTOPPABLE!" : count >= 6 ? `x${count}!` : `x${count} COMBO!`;
    const splash = this.add
      .text(this.centerX, this.centerY - 40, label, {
        fontSize: "32px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: CSS_COLORS.accent,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(60)
      .setScale(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: splash,
      scale: 1.2,
      alpha: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: splash,
      alpha: 0,
      y: "-=20",
      duration: 600,
      delay: 400,
      ease: "Power2",
      onComplete: () => splash.destroy(),
    });

    // Combo label scale pop
    this.tweens.add({
      targets: this.comboLabel,
      scale: { from: 1.6, to: 1 },
      duration: 280,
      ease: "Back.easeOut",
    });
  }

  private ceoRipple(): void {
    const ring = this.add.circle(this.ceo.x, this.ceo.y, 20, 0xff7404, 0);
    ring.setStrokeStyle(2, 0xff7404, 0.9);
    ring.setDepth(18);
    this.tweens.add({
      targets: ring,
      scale: 4,
      alpha: { from: 0.9, to: 0 },
      duration: 500,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
  }

  private highValueFlash(category: Category): void {
    const colorHex = COLORS[category] ?? 0xff7404;
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, colorHex, 0.25);
    flash.setDepth(80);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });
    // Brief slow-mo
    this.time.timeScale = 0.5;
    this.tweens.timeScale = 0.5;
    this.time.delayedCall(250, () => {
      this.time.timeScale = 1;
      this.tweens.timeScale = 1;
    });
  }

  private chromaticAberration(): void {
    const { width, height } = this.scale;
    const red = this.add.rectangle(width / 2 - 3, height / 2, width, height, 0xff0000, 0.08);
    const blue = this.add.rectangle(width / 2 + 3, height / 2, width, height, 0x00a8ff, 0.08);
    red.setDepth(88);
    blue.setDepth(88);
    this.tweens.add({
      targets: [red, blue],
      alpha: 0,
      duration: 180,
      ease: "Power2",
      onComplete: () => {
        red.destroy();
        blue.destroy();
      },
    });
  }

  private drawTeamBeam(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    role: string,
  ): void {
    const cfg = (ROLE_CONFIGS as Record<string, { color: string }>)[role];
    const colorStr = cfg?.color ?? CSS_COLORS.general;
    const color = Phaser.Display.Color.HexStringToColor(colorStr).color;

    // Wide translucent glow
    const glow = this.add.line(0, 0, fromX, fromY, toX, toY, color, 0.35);
    glow.setLineWidth(6);
    glow.setOrigin(0, 0);
    glow.setDepth(19);

    // Narrow bright core
    const core = this.add.line(0, 0, fromX, fromY, toX, toY, color, 0.9);
    core.setLineWidth(2);
    core.setOrigin(0, 0);
    core.setDepth(20);

    this.tweens.add({
      targets: [glow, core],
      alpha: 0,
      duration: 220,
      ease: "Cubic.easeOut",
      onComplete: () => {
        glow.destroy();
        core.destroy();
      },
    });
  }

  private resetCombo(): void {
    this.comboCount = 0;
    this.comboLabel.setAlpha(0);
  }

  private showCombo(count: number, multiplier: number): void {
    this.comboLabel.setText(`x${multiplier.toFixed(1)}  •  ${count} combo`);
    this.comboLabel.setAlpha(1);
    this.comboLabel.setScale(1.3);

    this.tweens.add({
      targets: this.comboLabel,
      scale: 1,
      duration: 200,
      ease: "Back.easeOut",
    });
  }

  private spawnCatchParticles(x: number, y: number, category: Category): void {
    const colorHex = COLORS[category] ?? 0xffffff;
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const distance = 25 + Math.random() * 25;
      const particle = this.add.circle(x, y, 3, colorHex, 1);
      particle.setDepth(30);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 500 + Math.random() * 200,
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  private spawnScorePopup(
    x: number,
    y: number,
    text: string,
    category: Category,
  ): void {
    const cssColor = this.getCssColor(category);
    const popup = this.add
      .text(x, y - 10, text, {
        fontSize: "16px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: cssColor,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(35);

    this.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => popup.destroy(),
    });
  }

  private getCssColor(category: Category): string {
    switch (category) {
      case "marketing":
        return CSS_COLORS.marketing;
      case "finance":
        return CSS_COLORS.finance;
      case "operations":
        return CSS_COLORS.operations;
      case "general":
        return CSS_COLORS.general;
    }
  }

  private flashMissColor(category: Category): void {
    const colorHex = COLORS[category] ?? 0xef4444;
    this.missFlash.setFillStyle(colorHex, 0.2);
    this.missFlash.setAlpha(1);
    this.tweens.add({
      targets: this.missFlash,
      alpha: 0,
      duration: 400,
      ease: "Power2",
    });

    this.cameras.main.shake(150, 0.003);
  }

  private goToPlanning(): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    this.cleanup();
    // Hand control back to React — PlanningOverlay takes over.
    this.game.events.emit("wave-complete", { gameState: this.gameState });
    this.scene.stop();
  }

  private endGame(survived: boolean, cashCrunch: boolean = false): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    if (!survived) {
      this.gameState.phase = "gameover";
    } else {
      this.gameState.phase = "results";
    }
    this.cleanup();
    // Emit game-over event — React navigates to /results
    this.game.events.emit("game-over", {
      gameState: this.gameState,
      cashCrunch,
      survived,
    });
    this.scene.stop();
  }

  private cleanup(): void {
    this.spawner.destroy();
    this.damageSystem.destroy();
    this.budgetSystem.destroy();
    this.input.removeAllListeners();
  }
}
