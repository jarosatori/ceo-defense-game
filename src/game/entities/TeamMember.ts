import * as Phaser from "phaser";
import type { Role, Level, Category } from "../types";
import { ROLE_CONFIGS, SENIOR_MULTIPLIER } from "../constants";

export class TeamMemberEntity extends Phaser.GameObjects.Container {
  role: Role;
  level: Level;
  memberId: string;
  catchCategories: Category[];
  catchSpeed: number;
  catchRadius: number;
  private catchCooldown: number = 0;
  private circle: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private orbitAngle: number;
  private orbitRadius: number;
  private orbitSpeed: number = 0.3;

  constructor(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    role: Role,
    level: Level,
    memberId: string,
    orbitIndex: number
  ) {
    super(scene, centerX, centerY);
    this.role = role;
    this.level = level;
    this.memberId = memberId;

    const config = ROLE_CONFIGS[role];
    this.catchCategories = config.catchCategories;
    this.catchSpeed = level === "senior"
      ? config.catchSpeed * SENIOR_MULTIPLIER.speedFactor
      : config.catchSpeed;
    this.catchRadius = level === "senior"
      ? config.catchRadius * SENIOR_MULTIPLIER.radiusFactor
      : config.catchRadius;

    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    this.orbitAngle = (Math.PI * 2 * orbitIndex) / 6;
    this.orbitRadius = 70;

    this.radiusIndicator = scene.add
      .circle(0, 0, this.catchRadius, color, 0.05)
      .setStrokeStyle(1, color, 0.15);

    const circleSize = level === "senior" ? 14 : 11;
    this.circle = scene.add.circle(0, 0, circleSize, color);

    const labelText = role === "va" ? "VA" : role.substring(0, 3).toUpperCase();
    const label = scene.add
      .text(0, 0, labelText, {
        fontSize: "8px",
        fontFamily: "Inter, sans-serif",
        color: "#0a0a0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([this.radiusIndicator, this.circle, label]);
    scene.add.existing(this);

    this.updateOrbitPosition(0);
  }

  updateOrbitPosition(delta: number): void {
    this.orbitAngle += this.orbitSpeed * (delta / 1000);
    const parentX = (this.parentContainer?.x ?? this.x);
    const parentY = (this.parentContainer?.y ?? this.y);
    this.x = parentX + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = parentY + Math.sin(this.orbitAngle) * this.orbitRadius;
  }

  canCatch(category: Category): boolean {
    if (this.catchCooldown > 0) return false;
    return this.catchCategories.includes(category);
  }

  performCatch(): void {
    this.catchCooldown = this.catchSpeed;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
    });
  }

  updateCooldown(delta: number): void {
    if (this.catchCooldown > 0) {
      this.catchCooldown = Math.max(0, this.catchCooldown - delta);
    }
  }
}
