import type { CEOProfile, GameState } from "../types";

export function calculateProfile(state: GameState): CEOProfile {
  const { team, manualClicks, problemsCaught, wave, damage } = state;

  // Lone Wolf: 0-1 hires
  if (team.length <= 1) {
    return "lone-wolf";
  }

  const vaCount = team.filter((m) => m.role === "va").length;
  const specialistCount = team.length - vaCount;
  const seniorCount = team.filter((m) => m.level === "senior").length;
  const manualRatio = problemsCaught > 0 ? manualClicks / problemsCaught : 1;

  // Strategist: survived wave 5, has upgraded specialists, low manual ratio
  if (wave >= 5 && damage < 100 && seniorCount >= 2 && manualRatio < 0.25) {
    return "strategist";
  }

  // Micromanager: has team but still does most work manually (>50% manual)
  if (manualRatio > 0.5) {
    return "micromanager";
  }

  // Generalist Trap: majority of team are VAs
  if (vaCount > specialistCount) {
    return "generalist-trap";
  }

  // Delegator: has specialists, reasonable manual ratio
  return "delegator";
}
