"use client";

interface ShareButtonsProps {
  profile: string;
  waves: number;
  score: number;
}

export default function ShareButtons({
  profile,
  waves,
  score,
}: ShareButtonsProps) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = `Prežil som ${waves}/5 vĺn v CEO Defense. Som ${profile.toUpperCase()}. Score: ${score}. A ty?`;
  const shareUrl = `${url}?ref=share`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    alert("Odkaz skopírovaný!");
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank");
  };

  const handleDownloadImage = () => {
    const ogUrl = `${url}/api/og?profile=${profile}&waves=${waves}&score=${score}`;
    window.open(ogUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <button
        onClick={handleLinkedIn}
        className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-lg transition-colors"
      >
        Zdieľať na LinkedIn
      </button>
      <button
        onClick={handleCopyLink}
        className="w-full py-3 bg-[#1a1a1a] hover:bg-[#222] text-[#e5e5e5] font-bold rounded-lg border border-[#333] transition-colors"
      >
        Kopírovať odkaz
      </button>
      <button
        onClick={handleDownloadImage}
        className="w-full py-3 bg-[#1a1a1a] hover:bg-[#222] text-[#e5e5e5] font-bold rounded-lg border border-[#333] transition-colors"
      >
        Stiahnuť kartičku
      </button>
    </div>
  );
}
