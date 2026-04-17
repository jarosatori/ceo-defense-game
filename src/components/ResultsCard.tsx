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
  const positive = profit >= 0;
  const sign = positive ? "+" : "-";

  const profitCommentary = positive
    ? `EBITDA ${formatPercent(ebitdaRatio ?? 0)} · v pluse`
    : "v strate";

  return (
    <div
      style={{
        background: "#531E38",
        borderRadius: 22,
        padding: "32px 30px",
        maxWidth: 460,
        width: "100%",
        color: "#EFEDEB",
        boxShadow: "0 20px 60px -24px rgba(83,30,56,.5)",
      }}
    >
      <div
        className="me-eyebrow"
        style={{ color: "#FF9DC8", marginBottom: 10 }}
      >
        CEO Defense · výsledok
      </div>

      <div
        className="me-display"
        style={{ fontSize: 44, lineHeight: 0.95, marginBottom: 8 }}
      >
        {data.label}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "rgba(239,237,235,.8)",
          lineHeight: 1.55,
          marginBottom: 26,
        }}
      >
        {data.description}
      </p>

      {bizCfg && (
        <p
          style={{
            fontSize: 13,
            color: "rgba(239,237,235,.7)",
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 16 }}>{bizCfg.emoji}</span> {bizCfg.label}
        </p>
      )}

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
                width: 32,
                height: 32,
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
        style={{
          fontSize: 13,
          color: "rgba(239,237,235,.7)",
          marginTop: 10,
        }}
      >
        {waves} / 10 vĺn
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 28,
          paddingTop: 22,
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
            style={{ fontSize: 28, color: "#FF7404" }}
          >
            {formatMoney(revenue)}
          </div>
          {milestone && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(239,237,235,.7)",
                marginTop: 2,
              }}
            >
              {milestone}
            </div>
          )}
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
              fontSize: 28,
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

      {grossMargin !== undefined && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(239,237,235,.12)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          <div>
            <div
              className="me-label"
              style={{ color: "rgba(239,237,235,.55)" }}
            >
              Hrubá marža
            </div>
            <div
              className="me-display"
              style={{ fontSize: 20, color: "#EFEDEB" }}
            >
              {formatPercent(grossMargin)}
            </div>
          </div>
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
                  fontSize: 20,
                  color: ebitdaRatio >= 0 ? "#FF9DC8" : "#E81A1E",
                }}
              >
                {formatPercent(ebitdaRatio)}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid rgba(239,237,235,.12)",
        }}
      >
        <div className="me-label" style={{ color: "rgba(239,237,235,.55)" }}>
          Score
        </div>
        <div className="me-display" style={{ fontSize: 22 }}>
          {score.toLocaleString()}
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid rgba(239,237,235,.12)",
        }}
      >
        <div className="me-label" style={{ color: "rgba(239,237,235,.55)" }}>
          Tvoj tím
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
    </div>
  );
}
