import * as Phaser from "phaser";
import type { Role, Level, Category } from "../types";
import {
  ROLE_CONFIGS,
  SENIOR_MULTIPLIER,
  TEAM_ORBIT_RADIUS,
  TEAM_ORBIT_SPEED,
} from "../constants";
import { roleTextureKey } from "../utils/spriteLoader";

export class TeamMemberEntity extends Phaser.GameObjects.Container {
  role: Role;
  level: Level;
  memberId: string;
  catchCategories: Category[];
  catchSpeed: number;
  catchRadius: number;
  private catchCooldown: number = 0;
  private backgroundCircle!: Phaser.GameObjects.Arc;
  private icon!: Phaser.GameObjects.Image;
  private glow: Phaser.GameObjects.Arc;
  private radiusIndicator: Phaser.GameObjects.Arc;
  private tierIndicator?: Phaser.GameObjects.Graphics;
  private seniorDot?: Phaser.GameObjects.Arc;
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
    totalMembers: number = 6,
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
    const slots = Math.max(totalMembers, 4);
    this.orbitAngle = (Math.PI * 2 * orbitIndex) / slots - Math.PI / 2;
    this.orbitRadius = TEAM_ORBIT_RADIUS;

    // Catch radius indicator (subtle)
    this.radiusIndicator = scene.add
      .circle(0, 0, this.catchRadius, color, 0.04)
      .setStrokeStyle(1, color, 0.12);

    // Outer glow
    this.glow = scene.add.circle(
      0,
      0,
      level === "senior" ? 32 : 26,
      color,
      0.28,
    );

    // Background circle (role color, filled)
    const bgRadius = level === "senior" ? 22 : 18;
    this.backgroundCircle = scene.add.circle(0, 0, bgRadius, color);
    this.backgroundCircle.setStrokeStyle(1.5, 0xefedeb, 0.35);

    // Role icon centered on background circle
    this.icon = scene.add.image(0, 0, roleTextureKey(role, level));

    // Tier indicator
    this.tierIndicator = scene.add.graphics();
    if (level === "senior") {
      // Senior: orange arc sweep around background circle
      const arcRadius = bgRadius + 4;
      this.tierIndicator.lineStyle(2.5, 0xff7404, 0.85);
      this.tierIndicator.beginPath();
      this.tierIndicator.arc(
        0,
        0,
        arcRadius,
        Phaser.Math.DegToRad(-120),
        Phaser.Math.DegToRad(60),
        false,
      );
      this.tierIndicator.strokePath();

      // Senior notification dot (top-right)
      const dotAngle = Phaser.Math.DegToRad(-30);
      const dotX = Math.cos(dotAngle) * arcRadius;
      const dotY = Math.sin(dotAngle) * arcRadius;
      this.seniorDot = scene.add.circle(dotX, dotY, 3.5, 0xff7404, 1);
      this.seniorDot.setStrokeStyle(1, 0xefedeb, 0.9);
    } else {
      // Junior: dashed outline ring
      const ringRadius = bgRadius + 3;
      const segments = 12;
      this.tierIndicator.lineStyle(1.5, 0xefedeb, 0.35);
      for (let i = 0; i < segments; i++) {
        const start = (Math.PI * 2 * i) / segments;
        const end = start + (Math.PI * 2) / segments / 2;
        this.tierIndicator.beginPath();
        this.tierIndicator.arc(0, 0, ringRadius, start, end, false);
        this.tierIndicator.strokePath();
      }
    }

    const children: Phaser.GameObjects.GameObject[] = [
      this.radiusIndicator,
      this.glow,
      this.backgroundCircle,
      this.tierIndicator,
      this.icon,
    ];
    if (this.seniorDot) children.push(this.seniorDot);
    this.add(children);
    scene.add.existing(this);

    // Breathing glow
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.18, to: 0.4 },
      scale: { from: 0.9, to: 1.12 },
      duration: 1500 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.updateOrbitPosition(0);
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

    this.scene.tweens.add({
      targets: [this.backgroundCircle, this.icon],
      scale: { from: 1.45, to: 1 },
      duration: 180,
      ease: "Back.easeOut",
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.8, to: 0.28 },
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
