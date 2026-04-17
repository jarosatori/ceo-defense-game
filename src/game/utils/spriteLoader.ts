import * as Phaser from "phaser";
import type { Category, Role, Level } from "../types";

const TASK_GLYPHS: Record<Category, string[]> = {
  marketing: [
    "megaphone",
    "heart",
    "speech",
    "star",
    "eye",
    "hashtag",
    "thumbs",
    "flag",
    "target",
    "sparkle",
  ],
  finance: [
    "coin",
    "invoice",
    "trendingdown",
    "diamond",
    "wallet",
    "calculator",
    "bank",
    "alert",
    "card",
    "percent",
  ],
  operations: [
    "gear",
    "truck",
    "wrench",
    "clipboard",
    "box",
    "settings",
    "link",
    "flow",
    "checklist",
    "stack",
  ],
  general: [
    "mail",
    "phone",
    "calendar",
    "folder",
    "clock",
    "bell",
    "bookmark",
    "tag",
    "help",
    "inbox",
  ],
};

const ROLE_SPRITES: (Role | "ceo")[] = [
  "ceo",
  "marketing",
  "operations",
  "cfo",
  "accountant",
  "va",
  "support",
  "sales",
  "coo",
  "hr",
  "product",
];

export function taskTextureKey(category: Category, name: string): string {
  return `task-${category}-${name}`;
}

export function roleTextureKey(
  role: Role | "ceo",
  level: Level = "junior",
): string {
  return level === "senior" ? `role-${role}-senior` : `role-${role}`;
}

export function preloadSprites(scene: Phaser.Scene): void {
  // Load task glyphs
  for (const [cat, names] of Object.entries(TASK_GLYPHS) as [
    Category,
    string[],
  ][]) {
    for (const name of names) {
      const key = taskTextureKey(cat, name);
      if (!scene.textures.exists(key)) {
        scene.load.svg(key, `/sprites/tasks/${cat}/${name}.svg`, {
          width: 48,
          height: 48,
        });
      }
    }
  }
  // Load role icons (junior + senior)
  for (const role of ROLE_SPRITES) {
    const jrKey = roleTextureKey(role, "junior");
    const srKey = roleTextureKey(role, "senior");
    if (!scene.textures.exists(jrKey)) {
      scene.load.svg(jrKey, `/sprites/roles/${role}.svg`, {
        width: 40,
        height: 40,
      });
    }
    if (!scene.textures.exists(srKey)) {
      scene.load.svg(srKey, `/sprites/roles/${role}-senior.svg`, {
        width: 48,
        height: 48,
      });
    }
  }
}

export function randomTaskGlyph(category: Category): string {
  const names = TASK_GLYPHS[category];
  const name = names[Math.floor(Math.random() * names.length)];
  return taskTextureKey(category, name);
}

export { TASK_GLYPHS };
