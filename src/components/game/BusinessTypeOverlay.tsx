"use client";

import type { BusinessType } from "@/game/types";
import { BUSINESS_TYPE_CONFIGS } from "@/game/constants";
import { formatMoney, formatPercent } from "@/game/utils/pnlCalculator";

interface BusinessTypeOverlayProps {
  onSelect: (type: BusinessType) => void;
}

export default function BusinessTypeOverlay({
  onSelect,
}: BusinessTypeOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-me-cream">
      {/* Ambient plum + orange glows (matches landing) */}
      <div
        className="pointer-events-none absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 620,
          height: 620,
          background:
            "radial-gradient(circle, rgba(159,45,109,.22) 0%, rgba(159,45,109,0) 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-[120px] -top-[100px]"
        style={{
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle, rgba(255,116,4,.18) 0%, rgba(255,116,4,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col items-center px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="me-eyebrow mb-3 text-me-magenta">
            Štart · CEO Defense
          </div>
          <h1
            className="me-display text-me-plum"
            style={{ fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1 }}
          >
            Aký biznis vedieš?
          </h1>
          <div
            className="mx-auto my-4 h-[3px] w-16 rounded"
            style={{ background: "#FF7404" }}
          />
          <p
            className="mx-auto max-w-md text-me-ink/80"
            style={{ fontSize: 15, lineHeight: 1.55 }}
          >
            Výber ovplyvní tvoju štartovú ekonomiku —{" "}
            <span className="text-me-plum font-semibold">maržu</span>,{" "}
            <span className="text-me-magenta font-semibold">marketing</span> aj
            obrat.
          </p>
        </div>

        {/* Cards */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <BusinessCard type="eshop" onSelect={onSelect} />
          <BusinessCard type="services" onSelect={onSelect} />
        </div>

        {/* Footer hint */}
        <p
          className="mt-10 text-center text-me-stone"
          style={{ fontSize: 13, letterSpacing: "0.02em" }}
        >
          Klikni na kartu a začni hru.
        </p>
      </div>
    </div>
  );
}

function BusinessCard({
  type,
  onSelect,
}: {
  type: BusinessType;
  onSelect: (type: BusinessType) => void;
}) {
  const cfg = BUSINESS_TYPE_CONFIGS[type];
  const accent = cfg.characterColor;
  const isEshop = type === "eshop";
  const pillLabel = isEshop ? "E-COMMERCE" : "SLUŽBY";
  const iconGlyph = isEshop ? CartIcon : BriefcaseIcon;

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-me-mist bg-white p-7 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_56px_-22px_rgba(83,30,56,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-me-orange"
      style={{ minHeight: 380 }}
    >
      {/* Left accent strip */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-[5px] rounded-l-[22px]"
        style={{ background: accent }}
      />
      {/* Corner pill */}
      <div
        className="me-display absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em]"
        style={{
          background: `${accent}1f`,
          color: accent,
        }}
      >
        {pillLabel}
      </div>

      {/* Icon */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: `${accent}14`, color: accent }}
      >
        {iconGlyph()}
      </div>

      {/* Title */}
      <h2
        className="me-display mb-2 text-me-plum"
        style={{ fontSize: 28, letterSpacing: "-0.02em" }}
      >
        {cfg.label}
      </h2>

      {/* Description */}
      <p
        className="mb-6 text-me-ink/75"
        style={{ fontSize: 14, lineHeight: 1.5 }}
      >
        {cfg.description}
      </p>

      {/* Ratios */}
      <div className="mt-auto flex flex-col gap-3 border-t border-me-mist/80 pt-5">
        <RatioRow
          label="Štartovný obrat"
          value={`${formatMoney(cfg.startingRevenue)}/mes`}
          valueColor="#1B1C1E"
        />
        <RatioRow
          label="Hrubá marža"
          value={formatPercent(cfg.startingGrossMargin)}
          valueColor="#FF7404"
        />
        <RatioRow
          label="Marketing ratio"
          value={formatPercent(cfg.startingMarketingRatio)}
          valueColor="#9F2D6D"
        />
      </div>

      {/* CTA hint */}
      <div
        className="me-eyebrow mt-6 flex items-center gap-2 text-me-plum transition-opacity group-hover:text-me-orange"
        style={{ letterSpacing: "0.18em" }}
      >
        Zvoliť <span aria-hidden>→</span>
      </div>
    </button>
  );
}

function RatioRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-me-fg-dim" style={{ fontSize: 12 }}>
        {label}
      </span>
      <span
        className="me-display"
        style={{ fontSize: 16, fontWeight: 600, color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h2.5l2.3 12.1a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.5L22 7H5.4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}
