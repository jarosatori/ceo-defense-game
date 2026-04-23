import type {
  BusinessType,
  CEOProfile,
  PolicyId,
  RunStoryEntry,
} from "@/game/types";
import { BUSINESS_TYPE_CONFIGS, CSS_COLORS } from "@/game/constants";
import { POLICY_BY_ID } from "@/game/data/policies";
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
  policies?: PolicyId[];
  storyEntries?: RunStoryEntry[];
  earlyExit?: boolean;
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
  policies = [],
  storyEntries = [],
  earlyExit = false,
}: ResultsCardProps) {
  const data = PROFILE_DATA[profile] || PROFILE_DATA["lone-wolf"];
  const teamMembers = team ? team.split(",") : [];
  const bizCfg = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;
  const positive = profit >= 0;
  const sign = positive ? "+" : "-";
  const profitCommentary = positive
    ? `EBITDA ${formatPercent(ebitdaRatio ?? 0)} · v pluse`
    : "v strate";

  const sortedStory = [...storyEntries].sort((a, b) => a.month - b.month);

  return (
    <div
      style={{
        background: "#531E38",
        borderRadius: 22,
        padding: "32px 30px",
        maxWidth: 480,
        width: "100%",
        color: "#EFEDEB",
        boxShadow: "0 20px 60px -24px rgba(83,30,56,.5)",
      }}
    >
      <div
        className="me-eyebrow"
        style={{ color: "#FF9DC8", marginBottom: 10 }}
      >
        CEO Defense · môj run
      </div>

      <div
        className="me-display"
        style={{ fontSize: 40, lineHeight: 0.95, marginBottom: 8 }}
      >
        {data.label}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "rgba(239,237,235,.8)",
          lineHeight: 1.55,
          marginBottom: 22,
        }}
      >
        {data.description}
      </p>

      {/* Business type + milestone banner */}
      {bizCfg && (
        <div
          style={{
            fontSize: 14,
            color: "rgba(239,237,235,.9)",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>{bizCfg.emoji}</span>
          <span style={{ fontWeight: 600 }}>{bizCfg.label}</span>
          {milestone && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                background: earlyExit ? "#FF7404" : "rgba(255,255,255,0.12)",
                color: earlyExit ? "#531E38" : "#EFEDEB",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {milestone}
            </span>
          )}
        </div>
      )}

      {/* Policies */}
      {policies.length > 0 && (
        <div
          style={{
            marginBottom: 22,
            paddingTop: 16,
            borderTop: "1px solid rgba(239,237,235,.12)",
          }}
        >
          <div
            className="me-label"
            style={{ color: "rgba(239,237,235,.55)", marginBottom: 8 }}
          >
            Policies
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {policies.map((pid) => {
              const p = POLICY_BY_ID[pid];
              return (
                <span
                  key={pid}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(239,237,235,.12)",
                    color: "#EFEDEB",
                    fontWeight: 500,
                  }}
                >
                  {p?.icon} {p?.label ?? pid}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Run story narrative */}
      {sortedStory.length > 0 && (
        <div
          style={{
            marginBottom: 22,
            paddingTop: 16,
            borderTop: "1px solid rgba(239,237,235,.12)",
          }}
        >
          <div
            className="me-label"
            style={{ color: "rgba(239,237,235,.55)", marginBottom: 10 }}
          >
            Môj príbeh
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedStory.map((entry, idx) => {
              if (entry.kind === "policy-picked") return null;
              const isBoss = entry.kind === "boss";
              const text =
                entry.kind === "event" && entry.text.includes("|")
                  ? entry.text.split("|").slice(1).join("|")
                  : entry.text;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "baseline",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "rgba(239,237,235,.88)",
                  }}
                >
                  <span
                    className="me-display"
                    style={{
                      fontSize: 10,
                      color: isBoss ? "#FF7404" : "rgba(239,237,235,.55)",
                      minWidth: 52,
                      fontWeight: 600,
                    }}
                  >
                    M{entry.month}
                  </span>
                  <span
                    style={{
                      color: isBoss ? "#FF7404" : "rgba(239,237,235,.88)",
                      fontWeight: isBoss ? 600 : 400,
                    }}
                  >
                    {isBoss ? "⚡ " : "› "}
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Waves bar */}
      <div
        className="me-label"
        style={{ color: "rgba(239,237,235,.55)", marginBottom: 10 }}
      >
        Prežil som
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => {
          const done = w < waves;
          const cur = w === waves;
          return (
            <div
              key={w}
              className="me-display"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                background: done ? "#EFEDEB" : cur ? "#FF7404" : "transparent",
                color: done ? "#531E38" : cur ? "#EFEDEB" : "rgba(239,237,235,.5)",
                border: done || cur ? "none" : "1px solid rgba(239,237,235,.25)",
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
      <div
        className="me-display"
        style={{ fontSize: 13, color: "rgba(239,237,235,.7)", marginTop: 10 }}
      >
        {waves} / 10 mesiacov
      </div>

      {/* Revenue + Profit */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(239,237,235,.12)",
        }}
      >
        <div>
          <div
            className="me-label"
            style={{ color: "rgba(239,237,235,.55)" }}
          >
            Obrat
          </div>
          <div
            className="me-display"
            style={{ fontSize: 26, color: "#FF7404" }}
          >
            {formatMoney(revenue)}
          </div>
        </div>
        <div>
          <div
            className="me-label"
            style={{ color: "rgba(239,237,235,.55)" }}
          >
            Zisk (EBITDA)
          </div>
          <div
            className="me-display"
            style={{
              fontSize: 26,
              color: positive ? "#FF9DC8" : "#E81A1E",
            }}
          >
            {sign}
            {formatMoney(Math.abs(profit))}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(239,237,235,.7)",
              marginTop: 2,
            }}
          >
            {profitCommentary}
          </div>
        </div>
      </div>

      {/* Team */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 18,
          borderTop: "1px solid rgba(239,237,235,.12)",
        }}
      >
        <div className="me-label" style={{ color: "rgba(239,237,235,.55)" }}>
          Tvoj tím ({teamMembers.length} ľudí)
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <div
            className="me-display"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#EFEDEB",
              color: "#531E38",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              border: "2px solid #EFEDEB",
            }}
          >
            CEO
          </div>
          {teamMembers.map((m, i) => {
            const [role, level] = m.split(":");
            const color = roleColorMap[role] || CSS_COLORS.general;
            const label =
              roleShortLabels[role] || role.substring(0, 3).toUpperCase();
            const size = level === "senior" ? 40 : 32;
            return (
              <div
                key={i}
                className="me-display"
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: color,
                  color: "#EFEDEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".03em",
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ratios */}
      {(grossMargin !== undefined || ebitdaRatio !== undefined) && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid rgba(239,237,235,.12)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {grossMargin !== undefined && (
            <div>
              <div
                className="me-label"
                style={{ color: "rgba(239,237,235,.55)" }}
              >
                Marža
              </div>
              <div
                className="me-display"
                style={{ fontSize: 18, color: "#EFEDEB" }}
              >
                {formatPercent(grossMargin)}
              </div>
            </div>
          )}
          {ebitdaRatio !== undefined && (
            <div>
              <div
                className="me-label"
                style={{ color: "rgba(239,237,235,.55)" }}
              >
                EBITDA %
              </div>
              <div
                className="me-display"
                style={{
                  fontSize: 18,
                  color: ebitdaRatio >= 0 ? "#FF9DC8" : "#E81A1E",
                }}
              >
                {formatPercent(ebitdaRatio)}
              </div>
            </div>
          )}
          <div>
            <div
              className="me-label"
              style={{ color: "rgba(239,237,235,.55)" }}
            >
              Score
            </div>
            <div className="me-display" style={{ fontSize: 18 }}>
              {score.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
