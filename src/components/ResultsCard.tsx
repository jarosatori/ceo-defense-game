import type { CEOProfile } from "@/game/types";
import { CSS_COLORS } from "@/game/constants";
import { formatRevenue, formatProfit, getRevenueMilestone } from "@/game/utils/revenueCalculator";

const PROFILE_DATA: Record<
  CEOProfile,
  { label: string; description: string }
> = {
  "lone-wolf": {
    label: "LONE WOLF",
    description: "Vsetko si riesil sam. Tvoja firma stoji a pada s tebou.",
  },
  micromanager: {
    label: "MICROMANAGER",
    description: "Mas tim, ale stale hasis poziare sam. Nedoverujes im.",
  },
  "generalist-trap": {
    label: "GENERALIST TRAP",
    description:
      "Mas ludi, ale ziadnych specialistov. Vsetci robia vsetko, nikto nic poriadne.",
  },
  delegator: {
    label: "DELEGATOR",
    description:
      "Rozpoznal si, co ta brzdi, a najal si spravnych ludi. Tvoja firma rastie.",
  },
  strategist: {
    label: "STRATEG",
    description:
      "Postavil si system, ktory funguje bez teba. Toto je skalovatelny biznis.",
  },
};

const roleColorMap: Record<string, string> = {
  va: CSS_COLORS.general,
  sales: CSS_COLORS.marketing,
  marketing: CSS_COLORS.marketing,
  product: CSS_COLORS.marketing,
  support: CSS_COLORS.operations,
  accountant: CSS_COLORS.finance,
  cfo: CSS_COLORS.finance,
  hr: CSS_COLORS.general,
  operations: CSS_COLORS.operations,
  coo: CSS_COLORS.operations,
};

const roleShortLabels: Record<string, string> = {
  va: "VA",
  sales: "SAL",
  marketing: "MKT",
  product: "PRD",
  support: "SUP",
  accountant: "ACC",
  cfo: "CFO",
  hr: "HR",
  operations: "OPS",
  coo: "COO",
};

interface ResultsCardProps {
  profile: CEOProfile;
  waves: number;
  score: number;
  revenue: number;
  profit: number;
  team: string;
}

export default function ResultsCard({
  profile,
  waves,
  score,
  revenue,
  profit,
  team,
}: ResultsCardProps) {
  const data = PROFILE_DATA[profile] || PROFILE_DATA["lone-wolf"];
  const teamMembers = team ? team.split(",") : [];

  const profitCommentary =
    profit >= 0
      ? `Tvoja firma zaraba ${formatProfit(profit)} mesacne`
      : `Tvoja firma je v strate (${formatProfit(profit)})`;

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">
        CEO DEFENSE
      </h2>

      <div className="space-y-1">
        <p className="text-sm text-[#a3a3a3]">Prezil som</p>
        <div className="flex gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
            <div
              key={w}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                w <= waves
                  ? "bg-[#22c55e] text-[#0a0a0a]"
                  : "bg-[#1a1a1a] text-[#444]"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#666]">{waves}/10 vln</p>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-white">{data.label}</p>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          {data.description}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-[#eab308]">
          {formatRevenue(revenue)}
        </p>
        <p className="text-xs text-[#a3a3a3]">{getRevenueMilestone(revenue)}</p>
      </div>

      <div className="space-y-1">
        <p className={`text-lg font-bold ${profit >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
          {formatProfit(profit)}
        </p>
        <p className="text-xs text-[#a3a3a3]">{profitCommentary}</p>
      </div>

      <p className="text-lg text-[#e5e5e5]">
        Score: <span className="font-bold text-white">{score.toLocaleString()}</span>
      </p>

      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#a3a3a3]">Tvoj tim:</p>
          <div className="flex gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#0a0a0a]">CEO</span>
            </div>
            {teamMembers.map((m, i) => {
              const [role, level] = m.split(":");
              const color = roleColorMap[role] || CSS_COLORS.general;
              const label = roleShortLabels[role] || role.substring(0, 3).toUpperCase();
              return (
                <div
                  key={i}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: color,
                    width: level === "senior" ? 36 : 28,
                    height: level === "senior" ? 36 : 28,
                  }}
                >
                  <span className="text-[7px] font-bold text-[#0a0a0a]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
