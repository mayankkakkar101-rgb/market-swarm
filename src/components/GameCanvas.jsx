import { useEffect, useRef } from "react";
import { Game } from "../game/Game.js";

const BASE_W = 1280;
const BASE_H = 720;

export default function GameCanvas({ onStateChange, gameRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fit = () => {
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const scale = Math.min(w / BASE_W, h / BASE_H);
      canvas.style.width = `${BASE_W * scale}px`;
      canvas.style.height = `${BASE_H * scale}px`;
      canvas.width = BASE_W;
      canvas.height = BASE_H;
    };

    fit();
    const game = new Game(canvas, onStateChange);
    gameRef.current = game;

    const ro = new ResizeObserver(fit);
    ro.observe(canvas.parentElement);

    return () => {
      ro.disconnect();
      game.destroy();
      gameRef.current = null;
    };
  }, [onStateChange, gameRef]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
