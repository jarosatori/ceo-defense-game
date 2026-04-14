import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Game Over", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ef4444",
      })
      .setOrigin(0.5);
  }
}
