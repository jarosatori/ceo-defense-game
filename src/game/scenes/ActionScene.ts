import Phaser from "phaser";

export class ActionScene extends Phaser.Scene {
  constructor() {
    super({ key: "ActionScene" });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, "Action Scene — Wave 1", {
        fontSize: "24px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
