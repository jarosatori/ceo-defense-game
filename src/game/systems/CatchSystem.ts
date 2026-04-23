import type { Problem } from "../entities/Problem";
import type { TeamMemberEntity } from "../entities/TeamMember";
import { CEO_CATCH_RADIUS } from "../constants";

export interface TeamCatchEvent {
  problem: Problem;
  catcher: TeamMemberEntity;
}

export class CatchSystem {
  /**
   * Returns problems caught + which team member caught each.
   * Used by ActionScene to draw team beams.
   */
  checkTeamCatches(
    teamMembers: TeamMemberEntity[],
    problems: Problem[],
  ): TeamCatchEvent[] {
    const caught: TeamCatchEvent[] = [];

    for (const member of teamMembers) {
      for (const problem of problems) {
        if (problem.caught) continue;
        if (!member.canCatch(problem.category)) continue;

        const dx = member.x - problem.x;
        const dy = member.y - problem.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= member.catchRadius) {
          problem.catch();
          member.performCatch();
          caught.push({ problem, catcher: member });
          break;
        }
      }
    }

    return caught;
  }

  checkCEOClick(
    ceoX: number,
    ceoY: number,
    clickX: number,
    clickY: number,
    problems: Problem[],
  ): Problem | null {
    let closest: Problem | null = null;
    let closestDist = Infinity;

    for (const problem of problems) {
      if (problem.caught) continue;

      const dx = clickX - problem.x;
      const dy = clickY - problem.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= CEO_CATCH_RADIUS && dist < closestDist) {
        closest = problem;
        closestDist = dist;
      }
    }

    if (closest) {
      closest.catch();
    }

    return closest;
  }
}
