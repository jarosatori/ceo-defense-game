import { describe, it, expect } from "vitest";
import { calculateProfile } from "../utils/profileCalculator";
import type { GameState, TeamMember } from "../types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    wave: 5,
    score: 1000,
    budget: 0,
    damage: 50,
    revenue: 15,
    profit: 0,
    monthlyCosts: 0,
    team: [],
    problemsCaught: 100,
    problemsMissed: 20,
    caughtByCategory: { marketing: 30, finance: 30, operations: 30, general: 10 },
    missedByCategory: { marketing: 5, finance: 5, operations: 5, general: 5 },
    manualClicks: 50,
    phase: "results",
    focusHistory: [],
    ...overrides,
  };
}

function makeMember(role: TeamMember["role"], level: TeamMember["level"] = "junior"): TeamMember {
  return { role, level, id: `${role}-${level}` };
}

describe("calculateProfile", () => {
  it("returns lone-wolf when 0-1 people hired", () => {
    const state = makeState({ team: [] });
    expect(calculateProfile(state)).toBe("lone-wolf");

    const state1 = makeState({ team: [makeMember("va")] });
    expect(calculateProfile(state1)).toBe("lone-wolf");
  });

  it("returns micromanager when team exists but manual clicks are high", () => {
    const state = makeState({
      team: [makeMember("marketing"), makeMember("accountant")],
      manualClicks: 80,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("micromanager");
  });

  it("returns generalist-trap when mostly VAs hired", () => {
    const state = makeState({
      team: [makeMember("va"), makeMember("va"), makeMember("va")],
      manualClicks: 20,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("generalist-trap");
  });

  it("returns delegator when specialists match wave patterns", () => {
    const state = makeState({
      team: [makeMember("marketing"), makeMember("accountant"), makeMember("operations")],
      manualClicks: 20,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("delegator");
  });

  it("returns strategist when survived wave 8+ with upgraded specialists", () => {
    const state = makeState({
      wave: 8,
      damage: 40,
      team: [
        makeMember("marketing", "senior"),
        makeMember("cfo", "senior"),
        makeMember("operations"),
      ],
      manualClicks: 15,
      problemsCaught: 100,
    });
    expect(calculateProfile(state)).toBe("strategist");
  });
});
