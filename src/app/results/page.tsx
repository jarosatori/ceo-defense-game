import type { Metadata } from "next";
import type { BusinessType, CEOProfile } from "@/game/types";
import ResultsCard from "@/components/ResultsCard";
import ShareButtons from "@/components/ShareButtons";

interface ResultsPageProps {
  searchParams: Promise<{
    profile?: string;
    waves?: string;
    score?: string;
    revenue?: string;
    profit?: string;
    team?: string;
    businessType?: string;
    milestone?: string;
    grossMargin?: string;
    ebitdaRatio?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const profile = params.profile || "lone-wolf";
  const waves = params.waves || "1";
  const score = params.score || "0";

  const ogUrl = `/api/og?profile=${profile}&waves=${waves}&score=${score}`;

  return {
    title: `CEO Defense — ${profile.toUpperCase()}`,
    description: `Prežil som ${waves}/10 vĺn. Score: ${score}. A ty?`,
    openGraph: {
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prežil som ${waves}/10 vĺn. Score: ${score}. A ty?`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prežil som ${waves}/10 vĺn. Score: ${score}. A ty?`,
      images: [ogUrl],
    },
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const profile = (params.profile || "lone-wolf") as CEOProfile;
  const waves = parseInt(params.waves || "1", 10);
  const score = parseInt(params.score || "0", 10);
  const revenue = parseFloat(params.revenue || "0");
  const profit = parseFloat(params.profit || "0");
  const team = params.team || "";
  const businessType =
    params.businessType === "eshop" || params.businessType === "services"
      ? (params.businessType as BusinessType)
      : undefined;
  const milestone = params.milestone;
  const grossMargin = params.grossMargin
    ? parseFloat(params.grossMargin)
    : undefined;
  const ebitdaRatio = params.ebitdaRatio
    ? parseFloat(params.ebitdaRatio)
    : undefined;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EFEDEB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px",
        gap: 24,
      }}
    >
      <ResultsCard
        profile={profile}
        waves={waves}
        score={score}
        revenue={revenue}
        profit={profit}
        team={team}
        businessType={businessType}
        milestone={milestone}
        grossMargin={grossMargin}
        ebitdaRatio={ebitdaRatio}
      />

      <ShareButtons profile={profile} waves={waves} score={score} />

      {/* CTA */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #D4D4D1",
          borderRadius: 22,
          padding: "28px 26px",
          maxWidth: 460,
          width: "100%",
        }}
      >
        <div className="me-eyebrow" style={{ color: "#9F2D6D" }}>
          Ďalší krok
        </div>
        <h3
          className="me-display"
          style={{
            fontSize: 22,
            color: "#1B1C1E",
            marginBottom: 10,
            marginTop: 6,
            lineHeight: 1.2,
          }}
        >
          Chceš reálne vybudovať firmu, ktorá funguje bez teba?
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "#6b635a",
            lineHeight: 1.55,
            marginBottom: 18,
          }}
        >
          Miliónová Evolúcia — 5-fázový systém pre podnikateľov s obratom
          €100k–€1M+.
        </p>
        <a
          href="https://milionovaevolucia.sk"
          target="_blank"
          rel="noopener noreferrer"
          className="me-btn me-btn--primary"
          style={{
            display: "inline-block",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Zisti viac →
        </a>
      </div>

      <a
        href="/game"
        className="me-btn me-btn--ghost"
        style={{ textDecoration: "none", textAlign: "center" }}
      >
        Hrať znova
      </a>
    </main>
  );
}
