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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const profile = searchParams.get("profile") || "lone-wolf";
  const waves = searchParams.get("waves") || "1";
  const score = searchParams.get("score") || "0";

  const profileLabel = PROFILE_LABELS[profile] || "LONE WOLF";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            color: "#a3a3a3",
            letterSpacing: "4px",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          CEO DEFENSE
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
            <div
              key={w}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                backgroundColor: w <= parseInt(waves) ? "#22c55e" : "#1a1a1a",
                color: w <= parseInt(waves) ? "#0a0a0a" : "#444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "10px",
            display: "flex",
          }}
        >
          {profileLabel}
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "#e5e5e5",
            marginBottom: "40px",
            display: "flex",
          }}
        >
          Score: {parseInt(score).toLocaleString()}
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "#eab308",
            fontWeight: "bold",
            display: "flex",
          }}
        >
          A ty? Dokážeš to lepšie?
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
