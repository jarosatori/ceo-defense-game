import type { GameState, RunStoryEntry } from "../types";
import { POLICY_BY_ID } from "../data/policies";

export interface StoryLine {
  month: number;
  kind: RunStoryEntry["kind"] | "header";
  text: string;
}

/**
 * Transform the raw runStory into displayable narrative lines.
 * Groups by month, adds milestones implicitly.
 */
export function buildStoryLines(state: GameState): StoryLine[] {
  const lines: StoryLine[] = [];

  // Header: policies
  const policyLabels = state.activePolicies
    .map((id) => POLICY_BY_ID[id]?.label ?? id)
    .join(" · ");
  if (policyLabels) {
    lines.push({
      month: 0,
      kind: "header",
      text: `POLICIES: ${policyLabels}`,
    });
  }

  // Sort story entries by month
  const sorted = [...state.runStory].sort((a, b) => a.month - b.month);
  for (const entry of sorted) {
    lines.push({
      month: entry.month,
      kind: entry.kind,
      text: entry.text,
    });
  }

  return lines;
}

/**
 * Serialize story lines to a compact URL-safe string for share card.
 * Format: "m|kind|text" per line, lines joined with ~~
 */
export function serializeRunStory(entries: RunStoryEntry[]): string {
  return entries
    .map((e) => `${e.month}|${e.kind}|${e.text.replace(/~/g, "-")}`)
    .join("~~");
}

export function parseRunStory(raw: string): RunStoryEntry[] {
  if (!raw) return [];
  return raw
    .split("~~")
    .filter(Boolean)
    .map((line) => {
      const [m, kind, ...rest] = line.split("|");
      return {
        month: parseInt(m, 10) || 0,
        kind: (kind || "milestone") as RunStoryEntry["kind"],
        text: rest.join("|"),
      };
    });
}
