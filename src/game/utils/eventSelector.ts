import type { GameEvent, GameState } from "../types";
import { EVENTS } from "../data/events";
import { POLICY_BY_ID } from "../data/policies";

/**
 * Pick a narrative event for the upcoming month, or null to skip.
 * - Boss months always trigger their boss event (3, 6, 9).
 * - Otherwise, filter by trigger constraints + sample from eligible pool.
 * - Avoids repeating an event that already fired this run.
 */
export function pickEventForMonth(state: GameState): GameEvent | null {
  const upcomingMonth = state.wave; // GameClient increments wave BEFORE calling this

  // Boss months first
  const boss = EVENTS.find(
    (e) => e.isBoss && e.trigger.bossMonth === upcomingMonth,
  );
  if (boss) return boss;

  // No event on month 1 (fresh start — go straight into first wave)
  if (upcomingMonth <= 1) return null;

  // 50% chance of skipping non-boss event each month — keeps pacing varied.
  // Experiment policy can bump this probability.
  const experimentBonus = state.activePolicies
    .map((id) => POLICY_BY_ID[id]?.modifiers.bonusEventChance ?? 0)
    .reduce((a, b) => a + b, 0);
  const eventProbability = 0.5 + experimentBonus;
  if (Math.random() > eventProbability) return null;

  const investorBoost = state.activePolicies
    .map((id) => POLICY_BY_ID[id]?.modifiers.investorEventMultiplier ?? 1)
    .reduce((a, b) => Math.max(a, b), 1);

  const firedIds = new Set(
    state.runStory
      .filter((e) => e.kind === "event")
      .map((e) => e.text.split("|")[0]),
  );

  const eligible = EVENTS.filter((e) => {
    if (e.isBoss) return false;
    if (firedIds.has(e.id)) return false;
    const t = e.trigger;
    if (t.minMonth && upcomingMonth < t.minMonth) return false;
    if (t.maxMonth && upcomingMonth > t.maxMonth) return false;
    if (t.minReputation !== undefined && state.reputation < t.minReputation)
      return false;
    if (t.maxReputation !== undefined && state.reputation > t.maxReputation)
      return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Weight investor-related events higher if policy active
  const weighted: GameEvent[] = [];
  for (const e of eligible) {
    const isInvestor = e.id.includes("angel") || e.id.includes("vc");
    const weight = isInvestor ? Math.round(investorBoost) : 1;
    for (let i = 0; i < weight; i++) weighted.push(e);
  }

  const idx = Math.floor(Math.random() * weighted.length);
  return weighted[idx] ?? null;
}
