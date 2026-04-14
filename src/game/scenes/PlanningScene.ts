import Phaser from "phaser";

export class PlanningScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlanningScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Planning Scene", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
