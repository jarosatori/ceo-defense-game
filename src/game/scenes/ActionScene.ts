import Phaser from "phaser";
import type { GameState, Category } from "../types";
import { COLORS, CSS_COLORS, BUDGET_PER_CATCH, STARTING_BUDGET } from "../constants";
import { WAVES } from "../data/waves";
import { CEO } from "../entities/CEO";
import { TeamMemberEntity } from "../entities/TeamMember";
import { WaveSpawner } from "../systems/WaveSpawner";
import { CatchSystem } from "../systems/CatchSystem";
import { DamageSystem } from "../systems/DamageSystem";
import { BudgetSystem } from "../systems/BudgetSystem";

export class ActionScene extends Phaser.Scene {
  private gameState!: GameState;
  private ceo!: CEO;
  private teamEntities: TeamMemberEntity[] = [];
  private spawner!: WaveSpawner;
  private catchSystem!: CatchSystem;
  private damageSystem!: DamageSystem;
  private budgetSystem!: BudgetSystem;
  private waveLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private waveNameLabel!: Phaser.GameObjects.Text;
  private missFlash!: Phaser.GameObjects.Rectangle;
  private waveStarted: boolean = false;

  constructor() {
    super({ key: "ActionScene" });
  }

  init(data?: { gameState: GameState }): void {
    if (data?.gameState) {
      this.gameState = data.gameState;
    } else {
      this.gameState = {
        wave: 1,
        score: 0,
        budget: STARTING_BUDGET,
        damage: 0,
        team: [],
        problemsCaught: 0,
        problemsMissed: 0,
        caughtByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
        missedByCategory: { marketing: 0, finance: 0, operations: 0, general: 0 },
        manualClicks: 0,
        phase: "action",
      };
    }
    this.gameState.phase = "action";
    this.teamEntities = [];
    this.waveStarted = false;
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // UI labels
    this.waveLabel = this.add
      .text(20, 12, "", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.uiText,
        fontStyle: "bold",
      })
      .setOrigin(0, 0);

    this.scoreLabel = this.add
      .text(centerX, 12, "", {
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.uiText,
      })
      .setOrigin(0.5, 0);

    // Wave name splash (hidden initially)
    this.waveNameLabel = this.add
      .text(centerX, centerY - 80, "", {
        fontSize: "28px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Miss flash overlay
    this.missFlash = this.add
      .rectangle(centerX, centerY, width, height, 0xff0000, 0)
      .setDepth(100);

    // Systems
    this.damageSystem = new DamageSystem(this);
    this.damageSystem.damage = this.gameState.damage;
    // Redraw with current damage by adding 0
    if (this.gameState.damage > 0) {
      this.damageSystem.addDamage(0);
    }

    this.budgetSystem = new BudgetSystem(this, this.gameState.budget);
    this.catchSystem = new CatchSystem();

    // CEO
    this.ceo = new CEO(this, centerX, centerY);

    // Recreate team member entities
    this.gameState.team.forEach((member, index) => {
      const entity = new TeamMemberEntity(
        this,
        centerX,
        centerY,
        member.role,
        member.level,
        member.id,
        index
      );
      this.teamEntities.push(entity);
    });

    // Wave spawner
    this.spawner = new WaveSpawner(this, centerX, centerY);
    this.spawner.onProblemMissed = (problem) => {
      this.gameState.problemsMissed++;
      this.gameState.missedByCategory[problem.category]++;
      this.damageSystem.addDamage();
      this.ceo.flashDamage();
      this.flashMissColor(problem.category);
    };

    // Input
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const activeProblems = this.spawner.getActiveProblems();
      const caught = this.catchSystem.checkCEOClick(
        this.ceo.x,
        this.ceo.y,
        pointer.worldX,
        pointer.worldY,
        activeProblems
      );
      if (caught) {
        this.gameState.manualClicks++;
        this.gameState.score++;
        this.gameState.problemsCaught++;
        this.gameState.caughtByCategory[caught.category]++;
        this.budgetSystem.earn(BUDGET_PER_CATCH);
        this.spawner.removeProblem(caught);
      }
    });

    // Start the wave
    this.startWave();
  }

  private startWave(): void {
    const waveConfig = WAVES[this.gameState.wave - 1];
    if (!waveConfig) return;

    this.waveLabel.setText(`Vlna ${waveConfig.wave}`);
    this.scoreLabel.setText(`Skóre: ${this.gameState.score}`);

    // Wave name splash animation
    this.waveNameLabel.setText(waveConfig.name);
    this.waveNameLabel.setAlpha(1);
    this.tweens.add({
      targets: this.waveNameLabel,
      alpha: 0,
      duration: 2000,
      delay: 800,
      ease: "Power2",
    });

    this.spawner.startWave(waveConfig);
    this.waveStarted = true;
  }

  update(_time: number, delta: number): void {
    if (!this.waveStarted) return;

    // Update score label
    this.scoreLabel.setText(`Skóre: ${this.gameState.score}`);

    // Update team positions and cooldowns
    for (const member of this.teamEntities) {
      member.updateOrbitPosition(delta);
      member.updateCooldown(delta);
    }

    // Update active problems
    const activeProblems = this.spawner.getActiveProblems();
    for (const problem of activeProblems) {
      problem.update(delta);
    }

    // Team auto-catch
    const caughtByTeam = this.catchSystem.checkTeamCatches(
      this.teamEntities,
      this.spawner.getActiveProblems()
    );
    for (const problem of caughtByTeam) {
      this.gameState.score++;
      this.gameState.problemsCaught++;
      this.gameState.caughtByCategory[problem.category]++;
      this.budgetSystem.earn(BUDGET_PER_CATCH);
      this.spawner.removeProblem(problem);
    }

    // Check game over
    if (this.damageSystem.isGameOver()) {
      this.endGame(false);
      return;
    }

    // Check wave complete
    if (this.spawner.isWaveComplete()) {
      this.waveStarted = false;
      if (this.gameState.wave >= 5) {
        this.endGame(true);
      } else {
        this.goToPlanning();
      }
    }
  }

  private flashMissColor(category: Category): void {
    const colorHex = COLORS[category] ?? 0xef4444;
    this.missFlash.setFillStyle(colorHex, 0.15);
    this.tweens.add({
      targets: this.missFlash,
      alpha: { from: 1, to: 0 },
      duration: 300,
      ease: "Power2",
    });
  }

  private goToPlanning(): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    this.cleanup();
    this.scene.start("PlanningScene", { gameState: this.gameState });
  }

  private endGame(survived: boolean): void {
    this.gameState.budget = this.budgetSystem.budget;
    this.gameState.damage = this.damageSystem.damage;
    if (!survived) {
      this.gameState.phase = "gameover";
    } else {
      this.gameState.phase = "results";
    }
    this.cleanup();
    this.scene.start("GameOverScene", { gameState: this.gameState });
  }

  private cleanup(): void {
    this.spawner.destroy();
    this.damageSystem.destroy();
    this.budgetSystem.destroy();
    this.input.removeAllListeners();
  }
}
