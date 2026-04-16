import type { CEOProfile } from "@/game/types";
import { CSS_COLORS } from "@/game/constants";
import { formatRevenue, getRevenueMilestone } from "@/game/utils/revenueCalculator";

const PROFILE_DATA: Record<
  CEOProfile,
  { label: string; description: string }
> = {
  "lone-wolf": {
    label: "LONE WOLF",
    description: "Všetko si riešil sám. Tvoja firma stojí a padá s tebou.",
  },
  micromanager: {
    label: "MICROMANAGER",
    description: "Máš tím, ale stále hasíš požiare sám. Nedôveruješ im.",
  },
  "generalist-trap": {
    label: "GENERALIST TRAP",
    description:
      "Máš ľudí, ale žiadnych špecialistov. Všetci robia všetko, nikto nič poriadne.",
  },
  delegator: {
    label: "DELEGÁTOR",
    description:
      "Rozpoznal si, čo ťa brzdí, a najal si správnych ľudí. Tvoja firma rastie.",
  },
  strategist: {
    label: "STRATÉG",
    description:
      "Postavil si systém, ktorý funguje bez teba. Toto je škálovateľný biznis.",
  },
};

interface ResultsCardProps {
  profile: CEOProfile;
  waves: number;
  score: number;
  revenue: number;
  team: string;
}

export default function ResultsCard({
  profile,
  waves,
  score,
  revenue,
  team,
}: ResultsCardProps) {
  const data = PROFILE_DATA[profile] || PROFILE_DATA["lone-wolf"];
  const teamMembers = team ? team.split(",") : [];

  const roleColorMap: Record<string, string> = {
    va: CSS_COLORS.general,
    marketing: CSS_COLORS.marketing,
    finance: CSS_COLORS.finance,
    operations: CSS_COLORS.operations,
  };

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">
        CEO DEFENSE
      </h2>

      <div className="space-y-1">
        <p className="text-sm text-[#a3a3a3]">Prežil som</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((w) => (
            <div
              key={w}
              className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                w <= waves
                  ? "bg-[#22c55e] text-[#0a0a0a]"
                  : "bg-[#1a1a1a] text-[#444]"
              }`}
            >
              {w}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#666]">{waves}/5 vĺn</p>
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

      <p className="text-lg text-[#e5e5e5]">
        Score: <span className="font-bold text-white">{score.toLocaleString()}</span>
      </p>

      {teamMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#a3a3a3]">Tvoj tím:</p>
          <div className="flex gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#0a0a0a]">CEO</span>
            </div>
            {teamMembers.map((m, i) => {
              const [role, level] = m.split(":");
              const color = roleColorMap[role] || CSS_COLORS.general;
              const label =
                role === "va" ? "VA" : role.substring(0, 3).toUpperCase();
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
