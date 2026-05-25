import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyToClipboard({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch((err) => console.error("Copy failed:", err));
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors focus-visible:outline-none"
      style={
        copied
          ? {
              borderColor: "color-mix(in srgb, var(--color-success) 40%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-success) 10%, transparent)",
              color: "var(--color-success)",
            }
          : {
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }
      }
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
