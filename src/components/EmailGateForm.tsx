"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailGateForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <input
          type="text"
          placeholder="Meno (nepovinné)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#eab308] transition-colors"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Tvoj email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#eab308] transition-colors"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#eab308] hover:bg-[#ca9a06] text-[#0a0a0a] font-bold rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Načítavam..." : "HRAŤ →"}
      </button>
    </form>
  );
}
