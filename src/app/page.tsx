import EmailGateForm from "@/components/EmailGateForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            CEO DEFENSE
          </h1>
          <p className="text-lg text-[#a3a3a3]">
            Dokážeš vybudovať firmu, ktorá funguje bez teba?
          </p>
        </div>

        <div className="space-y-2 text-[#e5e5e5] text-sm leading-relaxed">
          <p>
            5 vĺn biznis problémov. Ty si CEO.
            <br />
            Najmi správnych ľudí — alebo ťa to prevalcuje.
          </p>
          <p className="text-[#666]">Hra trvá 5-7 minút.</p>
        </div>

        <div className="flex justify-center gap-4 py-4">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-[#3b82f6]" />
          <div className="w-5 h-5 bg-[#ef4444] rotate-45" />
          <div className="w-5 h-5 bg-[#22c55e]" />
          <div className="w-5 h-5 bg-[#eab308] rounded-full" />
        </div>

        <EmailGateForm />

        <p className="text-xs text-[#444]">
          Miliónová Evolúcia — mentoring pre podnikateľov
        </p>
      </div>
    </main>
  );
}
