// components/referral/QrCodeBlock.tsx
//
// A real, scannable QR (react-qr-code → SVG, spec-compliant, scales crisp for
// print / ads / video). Downloads as PNG (hi-res raster) or SVG (vector). The
// QR sits on a white plate with padding to preserve the quiet zone.

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrCodeBlock({ value, size = 200 }: { value: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function svgEl(): SVGSVGElement | null {
    return ref.current?.querySelector("svg") ?? null;
  }

  function triggerDownload(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  }

  function downloadSvg() {
    const svg = svgEl();
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(URL.createObjectURL(blob), "syndicate-referral-qr.svg");
  }

  function downloadPng() {
    const svg = svgEl();
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(data)))}`;
    const img = new Image();
    img.onload = () => {
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = size * scale;
      canvas.height = size * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) triggerDownload(URL.createObjectURL(blob), "syndicate-referral-qr.png");
      });
    };
    img.src = svgUrl;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={ref} className="rounded-md bg-white p-3">
        <QRCode value={value} size={size} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={downloadPng}>
          <Download className="h-4 w-4 mr-1.5" />
          PNG
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSvg}>
          <Download className="h-4 w-4 mr-1.5" />
          SVG
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Use it on a card, a poster, or on-screen in a video — it scans straight to your referral link.
      </p>
    </div>
  );
}
