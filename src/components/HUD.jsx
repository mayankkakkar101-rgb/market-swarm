function formatTime(seconds) {
  const s = Math.ceil(Math.max(0, seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

function StatBar({ label, portrait, health, stamina, active }) {
  return (
    <div className={`hud-stat ${active ? "hud-stat--active" : ""}`}>
      <div className="hud-portrait" data-char={portrait}>
        <span className="hud-portrait-label">{label}</span>
      </div>
      <div className="hud-bars">
        <div className="hud-bar hud-bar--health">
          <div className="hud-bar-fill" style={{ width: `${health}%` }} />
        </div>
        <div className="hud-bar hud-bar--stamina">
          <div className="hud-bar-fill" style={{ width: `${stamina}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function HUD({ snapshot }) {
  const { timeRemaining, killCount, selectedPreset, player, state } = snapshot;
  const playing = state === "PLAYING" || state === "GAME_OVER";

  if (!playing) return null;

  const health = player ? (player.health / player.maxHealth) * 100 : 100;
  const stamina = player ? (player.stamina / player.maxStamina) * 100 : 100;
  const activeId = selectedPreset?.id ?? "pm";
  const label = selectedPreset?.label ?? selectedPreset?.name ?? "HERO";

  return (
    <div className="hud">
      <div className="hud-left">
        <StatBar
          label={label}
          portrait={activeId}
          health={health}
          stamina={stamina}
          active
        />
      </div>

      <div className="hud-center">
        <div className={`hud-timer ${timeRemaining <= 10 ? "hud-timer--urgent" : ""}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="hud-timer-label">TIME REMAINING</div>
      </div>

      <div className="hud-right">
        <div className="hud-kills">
          <span className="hud-kills-label">KILLS:</span>
          <span className="hud-kills-value">{killCount}</span>
          <span className="hud-kills-icon" aria-hidden>
            🪳
          </span>
        </div>
      </div>
    </div>
  );
}
