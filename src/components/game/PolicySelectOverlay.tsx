"use client";

import { useState } from "react";
import type { PolicyId } from "@/game/types";
import { POLICY_CONFIGS } from "@/game/data/policies";

interface PolicySelectOverlayProps {
  onConfirm: (picks: PolicyId[]) => void;
}

const REQUIRED = 3;

export default function PolicySelectOverlay({
  onConfirm,
}: PolicySelectOverlayProps) {
  const [picks, setPicks] = useState<PolicyId[]>([]);

  function toggle(id: PolicyId) {
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= REQUIRED) return prev;
      return [...prev, id];
    });
  }

  const ready = picks.length === REQUIRED;

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-me-cream">
      <div
        className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 620,
          height: 620,
          background:
            "radial-gradient(circle, rgba(159,45,109,.22) 0%, rgba(159,45,109,0) 65%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col items-center px-5 py-10">
        <div className="mb-6 text-center">
          <div className="me-eyebrow mb-2 text-me-magenta">
            Policies · vyber 3
          </div>
          <h1
            className="me-display text-me-plum"
            style={{ fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1 }}
          >
            Aký typ CEO chceš byť?
          </h1>
          <div
            className="mx-auto my-3 h-[3px] w-16 rounded"
            style={{ background: "#FF7404" }}
          />
          <p
            className="mx-auto max-w-md text-me-ink/80"
            style={{ fontSize: 14, lineHeight: 1.55 }}
          >
            3 policies platia počas celého run-u. Nemeníš ich. Kombinuj
            strategicky.
          </p>
          <div
            className="me-display mt-3 text-me-plum"
            style={{ fontSize: 16 }}
          >
            Vybrané: {picks.length} / {REQUIRED}
          </div>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POLICY_CONFIGS.map((p) => {
            const selected = picks.includes(p.id);
            const disabled = !selected && picks.length >= REQUIRED;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                disabled={disabled}
                className="relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all"
                style={{
                  background: selected ? "#531E38" : "#ffffff",
                  borderColor: selected ? "#531E38" : "#D4D4D1",
                  opacity: disabled ? 0.4 : 1,
                  boxShadow: selected
                    ? "0 10px 34px -14px rgba(83,30,56,0.55)"
                    : undefined,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                <div
                  aria-hidden
                  className="absolute bottom-0 left-0 top-0"
                  style={{
                    width: 4,
                    background: selected ? "#FF7404" : "#9F2D6D",
                    opacity: selected ? 1 : 0.4,
                    borderRadius: "16px 0 0 16px",
                  }}
                />
                <div
                  className="mb-1 flex items-center gap-2"
                  style={{ fontSize: 22 }}
                >
                  <span>{p.icon}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: selected ? "#EFEDEB" : "#1B1C1E",
                    }}
                  >
                    {p.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: selected ? "rgba(239,237,235,0.78)" : "#6b635a",
                  }}
                >
                  {p.description}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() => ready && onConfirm(picks)}
          className="me-btn me-btn--primary mt-8"
          style={{
            background: ready ? "#FF7404" : "#D4D4D1",
            color: ready ? "#EFEDEB" : "#7A736A",
            minWidth: 280,
          }}
        >
          {ready ? "ZAČAŤ RUN →" : `VYBER ĎALŠÍCH ${REQUIRED - picks.length}`}
        </button>
        <div className="h-8" />
      </div>
    </div>
  );
}
