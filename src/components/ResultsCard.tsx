import type { BusinessType, CEOProfile } from "@/game/types";
import { BUSINESS_TYPE_CONFIGS, CSS_COLORS } from "@/game/constants";
import { formatMoney, formatPercent } from "@/game/utils/pnlCalculator";

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
  businessType?: BusinessType;
  milestone?: string;
  grossMargin?: number;
  ebitdaRatio?: number;
}

export default function ResultsCard({
  profile,
  waves,
  score,
  revenue,
  profit,
  team,
  businessType,
  milestone,
  grossMargin,
  ebitdaRatio,
}: ResultsCardProps) {
  const data = PROFILE_DATA[profile] || PROFILE_DATA["lone-wolf"];
  const teamMembers = team ? team.split(",") : [];

  const bizCfg = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;

  const profitCommentary =
    profit >= 0
      ? `Tvoja firma zarobila ${formatMoney(profit)} (${formatPercent(ebitdaRatio ?? 0)} EBITDA)`
      : `Tvoja firma je v strate (${formatMoney(profit)})`;

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">
        CEO DEFENSE
      </h2>

      {bizCfg && (
        <p className="text-sm text-[#a3a3a3]">
          <span className="text-lg">{bizCfg.emoji}</span> {bizCfg.label}
        </p>
      )}

      <div className="space-y-1">
        <p className="text-sm text-[#a3a3a3]">Prežil som</p>
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
        <p className="text-xs text-[#666]">{waves}/10 vĺn</p>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-white">{data.label}</p>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          {data.description}
        </p>
      </div>

      {milestone && (
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[#eab308]">{milestone}</p>
          <p className="text-xs text-[#a3a3a3]">
            Kumulatívny obrat: {formatMoney(revenue)}
          </p>
        </div>
      )}

      {!milestone && (
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[#eab308]">
            {formatMoney(revenue)}
          </p>
          <p className="text-xs text-[#a3a3a3]">Kumulatívny obrat</p>
        </div>
      )}

      <div className="space-y-1">
        <p
          className={`text-lg font-bold ${profit >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}
        >
          {formatMoney(profit)}
        </p>
        <p className="text-xs text-[#a3a3a3]">{profitCommentary}</p>
      </div>

      {(grossMargin !== undefined || ebitdaRatio !== undefined) && (
        <div className="grid grid-cols-2 gap-3 text-center">
          {grossMargin !== undefined && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-[#a3a3a3]">Hrubá marža</p>
              <p className="text-base font-bold text-[#22c55e]">
                {formatPercent(grossMargin)}
              </p>
            </div>
          )}
          {ebitdaRatio !== undefined && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-[#a3a3a3]">EBITDA %</p>
              <p
                className={`text-base font-bold ${ebitdaRatio >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}
              >
                {formatPercent(ebitdaRatio)}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-lg text-[#e5e5e5]">
        Score:{" "}
        <span className="font-bold text-white">{score.toLocaleString()}</span>
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
                roleShortLabels[role] || role.substring(0, 3).toUpperCase();
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
