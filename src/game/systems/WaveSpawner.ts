import * as Phaser from "phaser";
import type { Category, WaveConfig } from "../types";
import { Problem } from "../entities/Problem";

/**
 * One scheduled spawn — emitted at `atMs` from wave start.
 */
interface ScheduledSpawn {
  atMs: number;
  phase: number; // 1..5
  fired: boolean;
}

export class WaveSpawner {
  private scene: Phaser.Scene;
  private waveConfig: WaveConfig;
  private centerX: number;
  private centerY: number;
  private spawnedCount: number = 0;
  private problems: Problem[] = [];
  private schedule: ScheduledSpawn[] = [];
  private waveStartTime: number = 0;
  private burstTimer: Phaser.Time.TimerEvent | null = null;
  private tickEvent: Phaser.Time.TimerEvent | null = null;

  onProblemMissed?: (problem: Problem) => void;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number) {
    this.scene = scene;
    this.centerX = centerX;
    this.centerY = centerY;
    this.waveConfig = {} as WaveConfig;
  }

  startWave(config: WaveConfig): void {
    this.waveConfig = config;
    this.spawnedCount = 0;
    this.problems = [];
    this.schedule = this.buildSchedule(config);
    this.waveStartTime = this.scene.time.now;

    // Check schedule every 80ms — cheap, responsive.
    this.tickEvent = this.scene.time.addEvent({
      delay: 80,
      callback: () => this.tick(),
      loop: true,
    });

    // Burst only during Phase 4 (Swarm)
    if (config.burstEnabled && config.burstSize > 0) {
      const burstAt = config.duration * 1000 * 0.8; // middle of swarm phase
      this.burstTimer = this.scene.time.addEvent({
        delay: burstAt,
        callback: () => this.spawnBurst(),
        repeat: 0,
      });
    }
  }

  /**
   * 5-phase swarm rhythm:
   *  Phase 1 (0-20%):  Warm-up — 20% of problems
   *  Phase 2 (20-50%): Build  — 30%
   *  Phase 3 (50-70%): Calm   — 5%
   *  Phase 4 (70-95%): Swarm  — 40%
   *  Phase 5 (95-100%): Finale — 5%
   */
  private buildSchedule(config: WaveConfig): ScheduledSpawn[] {
    const totalMs = config.duration * 1000;
    const total = config.problemCount;

    const phases: Array<{ start: number; end: number; share: number; n: number }> = [
      { start: 0.0, end: 0.2, share: 0.2, n: 1 },
      { start: 0.2, end: 0.5, share: 0.3, n: 2 },
      { start: 0.5, end: 0.7, share: 0.05, n: 3 },
      { start: 0.7, end: 0.95, share: 0.4, n: 4 },
      { start: 0.95, end: 1.0, share: 0.05, n: 5 },
    ];

    const schedule: ScheduledSpawn[] = [];
    let assigned = 0;
    for (let i = 0; i < phases.length; i++) {
      const ph = phases[i];
      const isLast = i === phases.length - 1;
      const count = isLast
        ? Math.max(0, total - assigned)
        : Math.max(0, Math.round(total * ph.share));
      assigned += count;
      if (count === 0) continue;
      const phaseStart = ph.start * totalMs;
      const phaseEnd = ph.end * totalMs;
      const span = phaseEnd - phaseStart;
      for (let k = 0; k < count; k++) {
        // Evenly distribute with slight jitter
        const frac = (k + 0.5) / count;
        const jitter = (Math.random() - 0.5) * (span / count) * 0.3;
        schedule.push({
          atMs: phaseStart + frac * span + jitter,
          phase: ph.n,
          fired: false,
        });
      }
    }
    schedule.sort((a, b) => a.atMs - b.atMs);
    return schedule;
  }

  private tick(): void {
    const elapsed = this.scene.time.now - this.waveStartTime;
    for (const item of this.schedule) {
      if (!item.fired && elapsed >= item.atMs) {
        item.fired = true;
        this.spawnProblem();
      }
    }
    // Stop the tick once everything is scheduled and fired
    if (this.spawnedCount >= this.waveConfig.problemCount) {
      this.tickEvent?.destroy();
      this.tickEvent = null;
    }
  }

  /** Currently in Phase 4 (swarm)? Used to gate bursts. */
  isInSwarmPhase(): boolean {
    const elapsed = this.scene.time.now - this.waveStartTime;
    const totalMs = this.waveConfig.duration * 1000;
    const frac = elapsed / totalMs;
    return frac >= 0.7 && frac < 0.95;
  }

  private spawnProblem(): void {
    if (this.spawnedCount >= this.waveConfig.problemCount) return;

    const category = this.pickCategory();
    const { x, y } = this.randomEdgePosition();
    const problem = new Problem(
      this.scene,
      x,
      y,
      category,
      this.waveConfig.problemSpeed,
      this.centerX,
      this.centerY,
    );

    problem.on("missed", (p: Problem) => {
      this.removeProblem(p);
      this.onProblemMissed?.(p);
    });

    this.problems.push(problem);
    this.spawnedCount++;
  }

  private spawnBurst(): void {
    // Only fire burst if we're in the swarm window
    if (!this.isInSwarmPhase()) return;
    for (let i = 0; i < this.waveConfig.burstSize; i++) {
      this.spawnProblem();
    }
  }

  private pickCategory(): Category {
    const rand = Math.random();
    const dist = this.waveConfig.distribution;
    let cumulative = 0;

    for (const [cat, weight] of Object.entries(dist)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return cat as Category;
      }
    }
    return "general";
  }

  private randomEdgePosition(): { x: number; y: number } {
    const { width, height } = this.scene.scale;
    const margin = 20;
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0:
        return { x: Phaser.Math.Between(margin, width - margin), y: -margin };
      case 1:
        return { x: width + margin, y: Phaser.Math.Between(margin, height - margin) };
      case 2:
        return { x: Phaser.Math.Between(margin, width - margin), y: height + margin };
      case 3:
        return { x: -margin, y: Phaser.Math.Between(margin, height - margin) };
      default:
        return { x: -margin, y: height / 2 };
    }
  }

  getActiveProblems(): Problem[] {
    return this.problems.filter((p) => !p.caught && p.active);
  }

  removeProblem(problem: Problem): void {
    this.problems = this.problems.filter((p) => p !== problem);
  }

  isWaveComplete(): boolean {
    return (
      this.spawnedCount >= this.waveConfig.problemCount &&
      this.getActiveProblems().length === 0
    );
  }

  destroy(): void {
    this.tickEvent?.destroy();
    this.burstTimer?.destroy();
    this.problems.forEach((p) => p.destroy());
    this.problems = [];
  }
}
