"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CAT = {
  mkt: { color: "#9F2D6D", tint: "rgba(159,45,109,.10)" },
  fin: { color: "#E81A1E", tint: "rgba(232,26,30,.08)" },
  ops: { color: "#FF7404", tint: "rgba(255,116,4,.10)" },
  gen: { color: "#A69E92", tint: "rgba(166,158,146,.15)" },
} as const;

type CatKey = keyof typeof CAT;
type Shape = "circle" | "triangle" | "diamond" | "star" | "hex" | "square";

const ROLE_LABELS: Record<string, string> = {
  va: "VA",
  marketing: "MKT",
  accountant: "ACC",
  operations: "OPS",
};
const ROLE_CAT: Record<string, CatKey> = {
  va: "gen",
  marketing: "mkt",
  accountant: "fin",
  operations: "ops",
};

function RoleToken({ role, size = 32 }: { role: string; size?: number }) {
  const cat = ROLE_CAT[role] || "gen";
  return (
    <div
      className="me-display"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: CAT[cat].color,
        color: "#EFEDEB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".03em",
        flexShrink: 0,
      }}
    >
      {ROLE_LABELS[role] ?? role.substring(0, 3).toUpperCase()}
    </div>
  );
}

function CeoDisc({ size = 32 }: { size?: number }) {
  return (
    <div
      className="me-display"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#EFEDEB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "#531E38",
        flexShrink: 0,
        border: "2px solid #531E38",
      }}
    >
      CEO
    </div>
  );
}

function OrbitTask({
  x,
  y,
  cat,
  shape,
  delay,
  size = 38,
}: {
  x: number;
  y: number;
  cat: CatKey;
  shape: Shape;
  delay: number;
  size?: number;
}) {
  const c = CAT[cat].color;
  let glyph;
  if (shape === "circle") glyph = <circle cx="16" cy="16" r="11" fill={c} />;
  else if (shape === "triangle") glyph = <path d="M16 4l13 23H3z" fill={c} />;
  else if (shape === "diamond")
    glyph = (
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        fill={c}
        transform="rotate(45 16 16)"
      />
    );
  else if (shape === "star")
    glyph = (
      <path
        d="M16 4l3.5 8 8.5.8-6.5 5.7 2 8.5L16 22.5 8.5 27l2-8.5L4 12.8 12.5 12z"
        fill={c}
      />
    );
  else if (shape === "hex")
    glyph = <path d="M16 3l11 6.5v13L16 29 5 22.5v-13z" fill={c} />;
  else glyph = <rect x="6" y="6" width="20" height="20" rx="4" fill={c} />;

  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%,-50%)",
        width: size,
        height: size,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #D4D4D1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 20px -10px rgba(27,28,30,.2)",
        animation: `me-float 6s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 32 32">
        {glyph}
      </svg>
    </div>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        setError("Niečo sa pokazilo. Skús to znova.");
        return;
      }

      sessionStorage.setItem("ceo-defense-email", email);
      router.push("/game");
    } catch {
      setError("Niečo sa pokazilo. Skús to znova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EFEDEB",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient plum glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "36%",
          width: 620,
          height: 620,
          background:
            "radial-gradient(circle,rgba(159,45,109,.22) 0%,rgba(159,45,109,0) 65%)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -100,
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle,rgba(255,116,4,.18) 0%,rgba(255,116,4,0) 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Top strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "22px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#531E38",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#FF7404",
              }}
            />
          </div>
          <div
            className="me-display"
            style={{ fontSize: 13, color: "#1B1C1E", letterSpacing: ".02em" }}
          >
            Miliónová Evolúcia
          </div>
        </div>
        <div className="me-label" style={{ margin: 0, color: "#A69E92" }}>
          v1.0 · single-player
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "90px 28px 120px",
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 48,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
        className="me-hero-grid"
      >
        {/* LEFT — copy + CTA */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px 6px 8px",
              background: "#fff",
              border: "1px solid #D4D4D1",
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#FF7404",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#EFEDEB",
                }}
              />
            </span>
            <span className="me-label" style={{ margin: 0, color: "#531E38" }}>
              New · Biznis simulátor
            </span>
          </div>

          <h1
            className="me-display"
            style={{
              fontSize: 82,
              color: "#531E38",
              lineHeight: 0.92,
              marginBottom: 18,
              letterSpacing: "-.03em",
            }}
          >
            CEO
            <br />
            DEFENSE<span style={{ color: "#FF7404" }}>.</span>
          </h1>

          <p
            style={{
              fontSize: 20,
              color: "#1B1C1E",
              lineHeight: 1.4,
              marginBottom: 10,
              maxWidth: 480,
            }}
          >
            Dokážeš vybudovať firmu, ktorá{" "}
            <em
              style={{ color: "#9F2D6D", fontStyle: "normal", fontWeight: 600 }}
            >
              funguje bez teba
            </em>
            ?
          </p>
          <p
            style={{
              fontSize: 15,
              color: "#6b635a",
              lineHeight: 1.55,
              marginBottom: 28,
              maxWidth: 440,
            }}
          >
            10 vĺn biznis problémov. Ty si CEO. Najmi správnych ľudí — alebo ťa
            to prevalcuje.
          </p>

          {/* Stats strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,auto)",
              gap: 0,
              marginBottom: 32,
              border: "1px solid #D4D4D1",
              borderRadius: 14,
              overflow: "hidden",
              background: "#fff",
              width: "fit-content",
            }}
          >
            {[
              { k: "Trvanie", v: "10–15 min" },
              { k: "Vlny", v: "10" },
              { k: "Rolí v tíme", v: "10" },
            ].map((s, i, a) => (
              <div
                key={s.k}
                style={{
                  padding: "12px 20px",
                  borderRight:
                    i < a.length - 1 ? "1px solid #D4D4D1" : "none",
                }}
              >
                <div className="me-label" style={{ margin: 0 }}>
                  {s.k}
                </div>
                <div
                  className="me-display"
                  style={{ fontSize: 18, color: "#1B1C1E", marginTop: 2 }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              maxWidth: 520,
            }}
          >
            <div>
              <div className="me-label">Meno</div>
              <input
                className="me-input"
                placeholder="Nepovinné"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div className="me-label">Email</div>
              <input
                className="me-input"
                type="email"
                required
                placeholder="tvoj@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p
                style={{
                  gridColumn: "1 / -1",
                  color: "#E81A1E",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="me-btn me-btn--primary"
              style={{ gridColumn: "1 / -1", marginTop: 6 }}
            >
              {loading ? "NAČÍTAVAM…" : "HRAŤ ZADARMO →"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex" }}>
              {["#531E38", "#9F2D6D", "#FF7404", "#A69E92"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c,
                    border: "2px solid #EFEDEB",
                    marginLeft: i ? -8 : 0,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#6b635a" }}>
              <span
                className="me-display"
                style={{ color: "#1B1C1E", fontSize: 13 }}
              >
                1,240+
              </span>{" "}
              CEO-ov už hralo tento týždeň
            </div>
          </div>
        </div>

        {/* RIGHT — orbit mock */}
        <div
          style={{ position: "relative", height: 560 }}
          className="me-hero-orbit"
        >
          {/* pulse rings */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              border: "1px dashed rgba(83,30,56,.25)",
              transform: "translate(-50%,-50%)",
              animation: "me-pulse-ring 5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 540,
              height: 540,
              borderRadius: "50%",
              border: "1px dashed rgba(83,30,56,.15)",
              transform: "translate(-50%,-50%)",
            }}
          />

          {/* center CEO card */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 220,
              padding: "20px 22px",
              background: "#531E38",
              borderRadius: 20,
              color: "#EFEDEB",
              boxShadow: "0 30px 60px -20px rgba(83,30,56,.6)",
            }}
          >
            <div
              className="me-label"
              style={{ color: "rgba(239,237,235,.55)", margin: 0 }}
            >
              Wave 04
            </div>
            <div
              className="me-display"
              style={{
                fontSize: 26,
                color: "#FF7404",
                marginTop: 6,
                letterSpacing: "-.02em",
              }}
            >
              €127k
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(239,237,235,.75)",
                marginTop: 2,
              }}
            >
              obrat · +€42k zisk
            </div>
            <div
              style={{
                height: 1,
                background: "rgba(239,237,235,.12)",
                margin: "14px 0",
              }}
            />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <CeoDisc size={32} />
              <RoleToken role="marketing" size={32} />
              <RoleToken role="accountant" size={32} />
              <RoleToken role="operations" size={32} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                <div
                  key={w}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 2,
                    background:
                      w <= 4 ? "#FF7404" : "rgba(239,237,235,.18)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* orbiting tasks */}
          <OrbitTask x={-200} y={-150} cat="mkt" shape="star" delay={0} />
          <OrbitTask x={210} y={-130} cat="fin" shape="diamond" delay={0.8} />
          <OrbitTask x={-220} y={80} cat="ops" shape="hex" delay={1.6} />
          <OrbitTask
            x={190}
            y={150}
            cat="gen"
            shape="circle"
            delay={2.4}
            size={34}
          />
          <OrbitTask
            x={-80}
            y={-220}
            cat="fin"
            shape="triangle"
            delay={0.4}
            size={32}
          />
          <OrbitTask
            x={80}
            y={220}
            cat="mkt"
            shape="circle"
            delay={1.2}
            size={30}
          />
          <OrbitTask
            x={250}
            y={20}
            cat="ops"
            shape="square"
            delay={2.0}
            size={30}
          />
          <OrbitTask
            x={-260}
            y={-40}
            cat="mkt"
            shape="diamond"
            delay={1.8}
            size={30}
          />
        </div>
      </div>

      {/* Bottom marquee */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "18px 0",
          background: "#531E38",
          color: "#EFEDEB",
          overflow: "hidden",
          borderTop: "1px solid rgba(239,237,235,.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            whiteSpace: "nowrap",
            animation: "me-marquee 28s linear infinite",
            width: "200%",
          }}
        >
          {Array.from({ length: 2 }).map((_, rep) => (
            <span
              key={rep}
              style={{ display: "inline-flex", gap: 48 }}
            >
              {[
                "Marketing",
                "Financie",
                "Operácie",
                "HR",
                "Predaj",
                "Logistika",
                "Cashflow",
                "Brand",
                "Procesy",
                "Zákazníci",
              ].map((w) => (
                <span
                  key={w + rep}
                  className="me-display"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 48,
                  }}
                >
                  {w}
                  <span style={{ color: "#FF7404" }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .me-hero-grid { grid-template-columns: 1fr !important; padding-top: 110px !important; }
          .me-hero-orbit { height: 360px !important; transform: scale(.7); }
        }
      `}</style>
    </main>
  );
}
