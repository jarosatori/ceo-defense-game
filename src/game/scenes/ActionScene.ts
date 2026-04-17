import * as Phaser from "phaser";
import type { GameState, Category } from "../types";
import {
  COLORS,
  CSS_COLORS,
  BUDGET_PER_CATCH,
  COMBO_WINDOW_MS,
  COMBO_BONUS_MULTIPLIER,
  PROFIT_GAMEOVER_THRESHOLD,
} from "../constants";
import {
  calculateMonthlyPnl,
  applyPriorityToBaseline,
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

  constructor() {
    super({ key: "ActionScene" });
  }

  init(data?: { gameState: GameState }): void {
    if (!data?.gameState) {
      throw new Error(
        "ActionScene requires a gameState from BusinessTypeScene/PlanningScene",
      );
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
  }

  create(): void {
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
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "900",
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(50);

    this.waveNameSubLabel = this.add
      .text(this.centerX, this.centerY - 75, "", {
        fontSize: "14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#a3a3a3",
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
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "800",
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
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-10);

    const maxRadius = Math.max(width, height);
    for (let i = 0; i < 6; i++) {
      const r = maxRadius * (1 - i * 0.15);
      const alpha = 0.05 + i * 0.03;
      bg.fillStyle(0x1a1a2e, alpha);
      bg.fillCircle(width / 2, height / 2, r);
    }

    const dots = this.add.graphics();
    dots.fillStyle(0xffffff, 0.04);
    const spacing = 40;
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        dots.fillCircle(x, y, 1);
      }
    }
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
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#ffffff",
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0, 0)
      .setDepth(16);

    this.scoreLabel = this.add
      .text(width * 0.3, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.uiText,
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(16);

    this.revenueLabel = this.add
      .text(width * 0.65, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(16);

    this.profitLabel = this.add
      .text(width - 16, 8, "", {
        fontSize: "13px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: CSS_COLORS.operations,
        fontStyle: "700",
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setDepth(16);
  }

  private startWave(): void {
    const waveConfig = WAVES[this.gameState.wave - 1];
    if (!waveConfig) return;

    this.waveLabel.setText(`VLNA ${waveConfig.wave}/10`);
    this.scoreLabel.setText(`Skóre: ${this.gameState.score}`);
    this.revenueLabel.setText(`Obrat: ${formatMoney(this.gameState.monthlyRevenue)}`);
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
    for (const problem of caughtByTeam) {
      this.handleCatch(problem.category, problem.x, problem.y, false);
      this.spawner.removeProblem(problem);
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

      const waveConfig = WAVES[this.gameState.wave - 1];
      if (waveConfig) {
        // Use the priority chosen during the preceding planning phase
        // (null on wave 1 — no planning has happened yet)
        const priority = this.gameState.selectedPriority;

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

    this.spawnCatchParticles(x, y, category);
    this.spawnScorePopup(x, y, `+${scoreGain}`, category);

    if (isManual) {
      this.ceo.celebrateCatch();
    }

    if (comboTier > 0) {
      this.showCombo(this.comboCount, multiplier);
    }

    const baseFreq = 440;
    const freq = baseFreq + comboTier * 80;
    playTone(freq, 0.08, "sine", 0.05);
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
        fontFamily: "'Inter', system-ui, sans-serif",
        color: cssColor,
        fontStyle: "800",
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
    this.scene.start("PlanningScene", { gameState: this.gameState });
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
    this.scene.start("GameOverScene", {
      gameState: this.gameState,
      cashCrunch,
      survived,
    });
  }

  private cleanup(): void {
    this.spawner.destroy();
    this.damageSystem.destroy();
    this.budgetSystem.destroy();
    this.input.removeAllListeners();
  }
}
