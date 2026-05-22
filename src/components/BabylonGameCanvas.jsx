import { useEffect, useRef, useState } from "react";
import { BabylonMarketSwarm } from "../babylon/BabylonMarketSwarm.js";

export default function BabylonGameCanvas({ onStateChange, gameRef }) {
  const canvasRef = useRef(null);
  const [arenaUrl, setArenaUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new BabylonMarketSwarm(canvas, onStateChange, setArenaUrl);
    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [onStateChange, gameRef]);

  return (
    <div
      className="babylon-scene-wrap"
      style={arenaUrl ? { "--arena-bg": `url("${arenaUrl}")` } : undefined}
    >
      <canvas ref={canvasRef} className="game-canvas babylon-canvas" />
    </div>
  );
}
