import type { Problem } from "../entities/Problem";
import type { TeamMemberEntity } from "../entities/TeamMember";
import { CEO_CATCH_RADIUS } from "../constants";

export class CatchSystem {
  checkTeamCatches(
    teamMembers: TeamMemberEntity[],
    problems: Problem[]
  ): Problem[] {
    const caught: Problem[] = [];

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
          caught.push(problem);
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
    problems: Problem[]
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
