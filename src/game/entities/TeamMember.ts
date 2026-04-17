import * as Phaser from "phaser";
import type { Role, Level, Category } from "../types";
import {
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
  TEAM_ORBIT_RADIUS,
  TEAM_ORBIT_SPEED,
} from "../constants";

export class TeamMemberEntity extends Phaser.GameObjects.Container {
  role: Role;
  level: Level;
  memberId: string;
  catchCategories: Category[];
  catchSpeed: number;
  catchRadius: number;
  private catchCooldown: number = 0;
  private bodyCircle!: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private orbitAngle: number;
  private orbitRadius: number;
  private orbitSpeed: number = TEAM_ORBIT_SPEED;

  constructor(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    role: Role,
    level: Level,
    memberId: string,
    orbitIndex: number,
    totalMembers: number = 6
  ) {
    super(scene, centerX, centerY);
    this.role = role;
    this.level = level;
    this.memberId = memberId;

    const config = ROLE_CONFIGS[role];
    this.catchCategories = config.catchCategories;
    this.catchSpeed =
      level === "senior"
        ? config.catchSpeed * SENIOR_MULTIPLIER.speedFactor
        : config.catchSpeed;
    this.catchRadius =
      level === "senior"
        ? config.catchRadius * SENIOR_MULTIPLIER.radiusFactor
        : config.catchRadius;

    const color = Phaser.Display.Color.HexStringToColor(config.color).color;
    // Spread members evenly around CEO based on total count (max 6)
    const slots = Math.max(totalMembers, 4);
    this.orbitAngle = (Math.PI * 2 * orbitIndex) / slots - Math.PI / 2;
    this.orbitRadius = TEAM_ORBIT_RADIUS;

    // Catch radius indicator (very subtle)
    this.radiusIndicator = scene.add
      .circle(0, 0, this.catchRadius, color, 0.04)
      .setStrokeStyle(1, color, 0.12);

    // Outer glow
    this.glow = scene.add.circle(0, 0, level === "senior" ? 22 : 18, color, 0.25);

    // Body
    const bodySize = level === "senior" ? 16 : 13;
    this.bodyCircle = scene.add.circle(0, 0, bodySize, color);
    this.bodyCircle.setStrokeStyle(1.5, 0xffffff, 0.4);

    // Label
    const labelText = this.getLabelText(role);
    const label = scene.add
      .text(0, 0, labelText, {
        fontSize: level === "senior" ? "9px" : "8px",
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        color: "#EFEDEB",
        fontStyle: "600",
        resolution: 2,
      })
      .setOrigin(0.5);

    // Senior badge (star-like)
    if (level === "senior") {
      const badge = scene.add
        .text(bodySize - 2, -bodySize + 2, "★", {
          fontSize: "10px",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
          resolution: 2,
        })
        .setOrigin(0.5);
      this.add(badge);
    }

    this.add([this.radiusIndicator, this.glow, this.bodyCircle, label]);
    scene.add.existing(this);

    // Breathing glow
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.15, to: 0.35 },
      scale: { from: 0.9, to: 1.1 },
      duration: 1500 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.updateOrbitPosition(0);
  }

  private getLabelText(role: Role): string {
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

  updateOrbitPosition(delta: number, centerX?: number, centerY?: number): void {
    this.orbitAngle += this.orbitSpeed * (delta / 1000);
    const cx = centerX ?? this.x;
    const cy = centerY ?? this.y;
    this.x = cx + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = cy + Math.sin(this.orbitAngle) * this.orbitRadius;
  }

  canCatch(category: Category): boolean {
    if (this.catchCooldown > 0) return false;
    return this.catchCategories.includes(category);
  }

  performCatch(): void {
    this.catchCooldown = this.catchSpeed;

    // Punchy catch feedback
    this.scene.tweens.add({
      targets: this.bodyCircle,
      scale: { from: 1.45, to: 1 },
      duration: 180,
      ease: "Back.easeOut",
    });

    // Glow burst
    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.8, to: 0.25 },
      scale: { from: 1.6, to: 1 },
      duration: 400,
      ease: "Power2",
    });
  }

  updateCooldown(delta: number): void {
    if (this.catchCooldown > 0) {
      this.catchCooldown = Math.max(0, this.catchCooldown - delta);
    }
  }
}
