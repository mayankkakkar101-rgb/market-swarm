import { useCallback, useRef, useState } from "react";
import { GameState } from "./game/Game.js";
import GameCanvas from "./components/GameCanvas.jsx";
import HUD from "./components/HUD.jsx";
import StartScreen from "./components/StartScreen.jsx";
import GameOverScreen from "./components/GameOverScreen.jsx";
import "./App.css";

const initialSnapshot = {
  state: GameState.START,
  timeRemaining: 60,
  killCount: 0,
  selectedPreset: null,
  player: null,
  gameOverResult: null,
};

export default function App() {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const gameRef = useRef(null);

  const onStateChange = useCallback((next) => {
    setSnapshot((prev) => ({ ...prev, ...next }));
  }, []);

  const handleSelect = (presetId) => {
    gameRef.current?.selectCharacter(presetId);
  };

  return (
    <div className="app">
      <div className="game-stage">
        <GameCanvas onStateChange={onStateChange} gameRef={gameRef} />
        <HUD snapshot={snapshot} />
        <StartScreen
          visible={snapshot.state === GameState.START}
          onSelect={handleSelect}
        />
        <GameOverScreen
          visible={snapshot.state === GameState.GAME_OVER}
          snapshot={snapshot}
        />
      </div>
    </div>
  );
}
