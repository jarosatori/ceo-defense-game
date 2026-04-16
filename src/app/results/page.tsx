import type { Metadata } from "next";
import type { CEOProfile } from "@/game/types";
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
    description: `Prezil som ${waves}/10 vln. Score: ${score}. A ty?`,
    openGraph: {
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prezil som ${waves}/10 vln. Score: ${score}. A ty?`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `CEO Defense — ${profile.toUpperCase()}`,
      description: `Prezil som ${waves}/10 vln. Score: ${score}. A ty?`,
      images: [ogUrl],
    },
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const profile = (params.profile || "lone-wolf") as CEOProfile;
  const waves = parseInt(params.waves || "1", 10);
  const score = parseInt(params.score || "0", 10);
  const revenue = parseInt(params.revenue || "0", 10);
  const profit = parseInt(params.profit || "0", 10);
  const team = params.team || "";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12 gap-8">
      <ResultsCard profile={profile} waves={waves} score={score} revenue={revenue} profit={profit} team={team} />

      <ShareButtons profile={profile} waves={waves} score={score} />

      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          Chces realne vybudovat firmu, ktora funguje bez teba?
        </h3>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          Milionova Evolucia — 5-fazovy system pre podnikatelov s obratom
          €100k-€1M+
        </p>
        <a
          href="https://milionovaevolucia.sk"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3 bg-[#eab308] hover:bg-[#ca9a06] text-[#0a0a0a] font-bold rounded-lg transition-colors"
        >
          Zisti viac
        </a>
      </div>

      <a
        href="/game"
        className="inline-block px-8 py-3 border border-[#444] hover:border-[#666] text-[#e5e5e5] font-semibold rounded-lg transition-colors text-sm"
      >
        Hrat znova
      </a>
    </main>
  );
}
