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
  const text = `Prezil som ${waves}/10 vln v CEO Defense. Som ${profile.toUpperCase()}. Score: ${score}. A ty?`;
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 460,
        width: "100%",
      }}
    >
      <button onClick={handleLinkedIn} className="me-btn me-btn--primary">
        Zdieľať na LinkedIn
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <button onClick={handleCopyLink} className="me-btn me-btn--ghost">
          Kopírovať odkaz
        </button>
        <button
          onClick={handleDownloadImage}
          className="me-btn me-btn--ghost"
        >
          Stiahnuť kartičku
        </button>
      </div>
    </div>
  );
}
