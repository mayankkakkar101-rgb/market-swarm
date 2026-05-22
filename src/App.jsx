import { useCallback, useEffect, useRef, useState } from "react";
import { GameState } from "./game/Game.js";
import BabylonGameCanvas from "./components/BabylonGameCanvas.jsx";
import HUD from "./components/HUD.jsx";
import StartScreen from "./components/StartScreen.jsx";
import GameOverScreen from "./components/GameOverScreen.jsx";
import { assetUrl } from "./game/assets.js";
import "./App.css";

const initialSnapshot = {
  state: GameState.START,
  timeRemaining: 60,
  killCount: 0,
  selectedPreset: null,
  player: null,
  gameOverResult: null,
};

function MobileControls({ visible, gameRef }) {
  if (!visible) return null;

  const move = (dx, dz) => {
    gameRef.current?.setVirtualMovement(dx, dz);
  };

  const stop = () => {
    gameRef.current?.setVirtualMovement(0, 0);
  };

  return (
    <div className="mobile-controls" aria-label="Mobile game controls">
      <div className="mobile-dpad">
        <button
          type="button"
          className="mobile-control mobile-control--up"
          aria-label="Move up"
          onPointerDown={() => move(0, 1)}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        >
          ▲
        </button>
        <button
          type="button"
          className="mobile-control mobile-control--left"
          aria-label="Move left"
          onPointerDown={() => move(-1, 0)}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        >
          ◀
        </button>
        <button
          type="button"
          className="mobile-control mobile-control--right"
          aria-label="Move right"
          onPointerDown={() => move(1, 0)}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        >
          ▶
        </button>
        <button
          type="button"
          className="mobile-control mobile-control--down"
          aria-label="Move down"
          onPointerDown={() => move(0, -1)}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        >
          ▼
        </button>
      </div>
      <button
        type="button"
        className="mobile-attack"
        aria-label="Attack"
        onPointerDown={() => gameRef.current?.pressVirtualAttack()}
      >
        ATTACK
      </button>
    </div>
  );
}

function RotateNotice() {
  return (
    <div className="rotate-notice" role="status" aria-live="polite">
      <div className="rotate-card">
        <div className="rotate-icon" aria-hidden>
          ↻
        </div>
        <h2>Rotate Your Phone</h2>
        <p>Internet Swarm works best in landscape mode.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const gameRef = useRef(null);
  const mitroooAudioRef = useRef(null);
  const pappuAudioRef = useRef(null);
  const selectingRef = useRef(false);

  const onStateChange = useCallback((next) => {
    setSnapshot((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    mitroooAudioRef.current = new Audio(assetUrl("/assets/mitrooo-start.mp3"));
    pappuAudioRef.current = new Audio(assetUrl("/assets/pappu-start.mp3"));
    mitroooAudioRef.current.preload = "auto";
    pappuAudioRef.current.preload = "auto";
    mitroooAudioRef.current.load();
    pappuAudioRef.current.load();
  }, []);

  useEffect(() => {
    if (snapshot.state === GameState.START) {
      selectingRef.current = false;
    }
  }, [snapshot.state]);

  const handleSelect = (presetId) => {
    if (selectingRef.current) return;
    selectingRef.current = true;

    if (presetId === "pm" || presetId === "pappu") {
      const audioRef = presetId === "pm" ? mitroooAudioRef : pappuAudioRef;
      const audioPath =
        presetId === "pm"
          ? "/assets/mitrooo-start.mp3"
          : "/assets/pappu-start.mp3";
      const audio = audioRef.current ?? new Audio(assetUrl(audioPath));
      audioRef.current = audio;
      audio.volume = 1;
      audio.currentTime = 0;
      audio.muted = false;
      audio.play().catch(() => {});
    }
    gameRef.current?.selectCharacter(presetId);
  };

  return (
    <div className="app">
      <div className="game-stage">
        <BabylonGameCanvas onStateChange={onStateChange} gameRef={gameRef} />
        <HUD snapshot={snapshot} />
        <StartScreen
          visible={snapshot.state === GameState.START}
          onSelect={handleSelect}
        />
        <GameOverScreen
          visible={snapshot.state === GameState.GAME_OVER}
          snapshot={snapshot}
        />
        <MobileControls
          visible={snapshot.state === GameState.PLAYING}
          gameRef={gameRef}
        />
        <RotateNotice />
      </div>
    </div>
  );
}
