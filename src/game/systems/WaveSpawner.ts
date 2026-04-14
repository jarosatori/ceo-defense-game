import Phaser from "phaser";
import type { Category, WaveConfig } from "../types";
import { Problem } from "../entities/Problem";

export class WaveSpawner {
  private scene: Phaser.Scene;
  private waveConfig: WaveConfig;
  private centerX: number;
  private centerY: number;
  private spawnedCount: number = 0;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private problems: Problem[] = [];
  private burstTimer: Phaser.Time.TimerEvent | null = null;

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

    const intervalMs = (config.duration / config.problemCount) * 1000;

    this.spawnTimer = this.scene.time.addEvent({
      delay: intervalMs,
      callback: () => this.spawnProblem(),
      loop: true,
    });

    if (config.burstEnabled && config.burstSize > 0) {
      const burstDelay = (config.duration * 1000) / 3;
      this.burstTimer = this.scene.time.addEvent({
        delay: burstDelay,
        callback: () => this.spawnBurst(),
        repeat: 1,
      });
    }
  }

  private spawnProblem(): void {
    if (this.spawnedCount >= this.waveConfig.problemCount) {
      this.spawnTimer?.destroy();
      return;
    }

    const category = this.pickCategory();
    const { x, y } = this.randomEdgePosition();
    const problem = new Problem(
      this.scene,
      x,
      y,
      category,
      this.waveConfig.problemSpeed,
      this.centerX,
      this.centerY
    );

    problem.on("missed", (p: Problem) => {
      this.removeProblem(p);
      this.onProblemMissed?.(p);
    });

    this.problems.push(problem);
    this.spawnedCount++;
  }

  private spawnBurst(): void {
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
    this.spawnTimer?.destroy();
    this.burstTimer?.destroy();
    this.problems.forEach((p) => p.destroy());
    this.problems = [];
  }
}
