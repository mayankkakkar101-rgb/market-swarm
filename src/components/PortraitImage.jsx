import { useEffect, useRef } from "react";
import { processImageTransparency } from "../game/imageProcessor.js";

/** Portrait — face only, transparent backdrop */
export default function PortraitImage({ src, fallback, alt, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawPortrait = (img) => {
      const processed = processImageTransparency(img);
      const size = Math.min(processed.width, processed.height);
      const sx = (processed.width - size * 0.7) / 2;
      const sy = processed.height * 0.02;
      const sw = size * 0.7;
      const sh = size * 0.75;

      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 256, 256);
      ctx.drawImage(processed, sx, sy, sw, sh, 0, 0, 256, 256);
    };

    const img = new Image();
    img.onload = () => drawPortrait(img);
    img.onerror = () => {
      if (!fallback) return;
      const fb = new Image();
      fb.onload = () => drawPortrait(fb);
      fb.src = fallback;
    };
    img.src = src;
  }, [src, fallback]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={alt} />;
}
