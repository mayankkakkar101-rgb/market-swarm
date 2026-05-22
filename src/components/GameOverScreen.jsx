export default function GameOverScreen({ snapshot, visible }) {
  if (!visible) return null;

  const won = snapshot.gameOverResult === "win";

  return (
    <div className="overlay overlay--gameover">
      <h2 className={won ? "result-win" : "result-loss"}>
        {won ? "BAZAAR SECURED!" : "SWARMED!"}
      </h2>
      <p>
        {won
          ? "You held the market for a full minute."
          : "The cockroaches overran your stall."}
      </p>
      <p className="gameover-kills">Total Kills: {snapshot.killCount}</p>
      <p className="gameover-hint">Press Space or move to choose another hero</p>
    </div>
  );
}
