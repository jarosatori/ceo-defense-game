import * as Phaser from "phaser";
import { BUDGET_PER_CATCH, CSS_COLORS } from "../constants";

export class BudgetSystem {
  budget: number;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, initialBudget: number) {
    this.budget = initialBudget;
    const { width } = scene.scale;

    this.label = scene.add
      .text(width - 20, 12, `€${this.budget}`, {
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        color: CSS_COLORS.general,
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

    this.updateLabel();
  }

  earn(amount: number = BUDGET_PER_CATCH): void {
    this.budget += amount;
    this.updateLabel();
  }

  canAfford(cost: number): boolean {
    return this.budget >= cost;
  }

  spend(cost: number): boolean {
    if (!this.canAfford(cost)) return false;
    this.budget -= cost;
    this.updateLabel();
    return true;
  }

  private updateLabel(): void {
    this.label.setText(`€${this.budget}`);
  }

  destroy(): void {
    this.label.destroy();
  }
}
