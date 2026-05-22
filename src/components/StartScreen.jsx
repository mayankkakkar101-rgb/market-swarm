import { CHARACTER_PRESETS } from "../game/characters.js";
import { assetUrl } from "../game/assets.js";
import PortraitImage from "./PortraitImage.jsx";

function HeroCard({ preset, onSelect, bg }) {
  const portrait =
    preset.id === "pm"
      ? assetUrl("/assets/pm-portrait.png")
      : assetUrl("/assets/pappu-portrait.png");
  const portraitFallback =
    preset.id === "pm"
      ? assetUrl("/assets/pm-directional.png")
      : assetUrl("/assets/pappu-directional.png");

  return (
    <button
      type="button"
      className={`hero-card hero-card--${preset.id}`}
      onClick={() => onSelect(preset.id)}
    >
      <div
        className="hero-card-bg"
        style={{ backgroundImage: `url(${assetUrl(`/assets/bg-${bg}.png`)})` }}
      />
      <div className="hero-portrait-wrap">
        <PortraitImage
          src={portrait}
          fallback={portraitFallback}
          alt={preset.label}
          className="hero-portrait"
        />
      </div>
      <h2>{preset.label}</h2>
      <p>{preset.subtitle}</p>
      <span className="hero-card-weapon">
        {preset.id === "pm" ? "Lotus AoE" : "Big Hand Slap"}
      </span>
    </button>
  );
}

export default function StartScreen({ onSelect, visible }) {
  if (!visible) return null;

  return (
    <div className="overlay overlay--start">
      <div className="start-header">
        <h1>MARKET SWARM</h1>
        <p>Isometric survival — PM holds the bazaar, PAPPU braves the wastes</p>
      </div>
      <div className="hero-select">
        <HeroCard preset={CHARACTER_PRESETS.pm} onSelect={onSelect} bg="market" />
        <HeroCard preset={CHARACTER_PRESETS.pappu} onSelect={onSelect} bg="barren" />
      </div>
      <p className="start-controls">WASD / Arrows · Space to attack · Survive 60s</p>
    </div>
  );
}
