"use client";

import type { GameEvent, EventChoice } from "@/game/types";

interface EventDecisionOverlayProps {
  event: GameEvent;
  month: number;
  onChoose: (choice: EventChoice) => void;
}

export default function EventDecisionOverlay({
  event,
  month,
  onChoose,
}: EventDecisionOverlayProps) {
  const isBoss = !!event.isBoss;
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-me-cream">
      <div
        className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 540,
          height: 540,
          background: isBoss
            ? "radial-gradient(circle, rgba(232,26,30,.22) 0%, rgba(232,26,30,0) 65%)"
            : "radial-gradient(circle, rgba(255,116,4,.18) 0%, rgba(255,116,4,0) 65%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-full max-w-2xl flex-col items-center px-5 py-10">
        <div className="mb-6 w-full text-center">
          <div
            className="me-eyebrow mb-2"
            style={{ color: isBoss ? "#E81A1E" : "#9F2D6D" }}
          >
            {isBoss ? `BOSS · Mesiac ${month}` : `Udalosť · Mesiac ${month}`}
          </div>
          <h1
            className="me-display text-me-ink"
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {event.headline}
          </h1>
          <div
            className="mx-auto my-4 h-[3px] w-12 rounded"
            style={{ background: isBoss ? "#E81A1E" : "#FF7404" }}
          />
          <p
            className="mx-auto max-w-lg text-me-ink/80"
            style={{ fontSize: 15, lineHeight: 1.55 }}
          >
            {event.flavor}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {event.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoose(c)}
              className="relative flex flex-col items-start rounded-2xl border border-me-mist bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(83,30,56,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-me-orange"
            >
              <div
                aria-hidden
                className="absolute bottom-0 left-0 top-0"
                style={{
                  width: 4,
                  background: "#FF7404",
                  borderRadius: "16px 0 0 16px",
                }}
              />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1B1C1E",
                  marginBottom: 4,
                }}
              >
                {c.label}
              </div>
              <div style={{ fontSize: 13, color: "#6b635a", lineHeight: 1.5 }}>
                {c.description}
              </div>
            </button>
          ))}
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}
