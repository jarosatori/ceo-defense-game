import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const PROFILE_LABELS: Record<string, string> = {
  "lone-wolf": "LONE WOLF",
  micromanager: "MICROMANAGER",
  "generalist-trap": "GENERALIST TRAP",
  delegator: "DELEGÁTOR",
  strategist: "STRATÉG",
};

async function loadFont(
  family: string,
  weight: number
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(
      /\s/g,
      "+"
    )}:wght@${weight}&display=swap`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        // Force TTF over woff2 so @vercel/og can parse it
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Safari/537.36",
      },
    });
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const profile = searchParams.get("profile") || "lone-wolf";
  const waves = searchParams.get("waves") || "1";
  const score = searchParams.get("score") || "0";
  const milestone = searchParams.get("milestone") || "";
  const wavesInt = parseInt(waves, 10);

  const profileLabel = PROFILE_LABELS[profile] || "LONE WOLF";

  const [plexMono, interTight] = await Promise.all([
    loadFont("IBM Plex Mono", 600),
    loadFont("Inter Tight", 500),
  ]);

  type OgFont = { name: string; data: ArrayBuffer; weight: 500 | 600 };
  const fonts: OgFont[] = [];
  if (plexMono)
    fonts.push({ name: "IBM Plex Mono", data: plexMono, weight: 600 });
  if (interTight)
    fonts.push({ name: "Inter Tight", data: interTight, weight: 500 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#531E38",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px",
          position: "relative",
          fontFamily: "Inter Tight",
          color: "#EFEDEB",
        }}
      >
        {/* Orange accent glow */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -80,
            width: 380,
            height: 380,
            background:
              "radial-gradient(circle,rgba(255,116,4,.25) 0%,rgba(255,116,4,0) 65%)",
            display: "flex",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: "18px",
            color: "#FF9DC8",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "18px",
            display: "flex",
            fontFamily: "IBM Plex Mono",
          }}
        >
          CEO Defense · výsledok
        </div>

        {/* Profile label */}
        <div
          style={{
            fontSize: "88px",
            color: "#EFEDEB",
            marginBottom: "16px",
            display: "flex",
            letterSpacing: "-2px",
            lineHeight: 0.95,
            fontFamily: "IBM Plex Mono",
          }}
        >
          {profileLabel}
          <span style={{ color: "#FF7404" }}>.</span>
        </div>

        {/* Milestone or tagline */}
        {milestone && (
          <div
            style={{
              fontSize: "26px",
              color: "rgba(239,237,235,.82)",
              marginBottom: "32px",
              display: "flex",
            }}
          >
            {milestone}
          </div>
        )}

        {/* Wave tracker */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "34px",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => {
            const done = w < wavesInt;
            const cur = w === wavesInt;
            return (
              <div
                key={w}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "10px",
                  backgroundColor: done
                    ? "#EFEDEB"
                    : cur
                      ? "#FF7404"
                      : "#3e1629",
                  color: done ? "#531E38" : "#EFEDEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {w}
              </div>
            );
          })}
        </div>

        {/* Score row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            alignItems: "flex-end",
            marginBottom: "34px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "16px",
                color: "rgba(239,237,235,.55)",
                letterSpacing: "3px",
                textTransform: "uppercase",
                display: "flex",
                fontFamily: "IBM Plex Mono",
              }}
            >
              Vlny
            </div>
            <div
              style={{
                fontSize: "42px",
                color: "#EFEDEB",
                display: "flex",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {wavesInt} / 10
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "16px",
                color: "rgba(239,237,235,.55)",
                letterSpacing: "3px",
                textTransform: "uppercase",
                display: "flex",
                fontFamily: "IBM Plex Mono",
              }}
            >
              Score
            </div>
            <div
              style={{
                fontSize: "42px",
                color: "#FF7404",
                display: "flex",
                fontFamily: "IBM Plex Mono",
              }}
            >
              {parseInt(score).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#FF7404",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "22px",
              color: "#FF7404",
              display: "flex",
              fontFamily: "IBM Plex Mono",
            }}
          >
            A ty? Dokážeš to lepšie?
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
