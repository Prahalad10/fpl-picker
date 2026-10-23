import { useState } from "react";
import { get, POSITIONS, hideBrokenImage } from "../api";
import FixtureList from "./FixtureList";

// "Recommend" tab: choose a position and budget, get the top 5 picks
export default function Recommend({ watchlist, onToggleWatch, onSelect }) {
  const [position, setPosition] = useState("MID");
  const [budget, setBudget] = useState(8);
  const [picks, setPicks] = useState(null); // null = not searched yet
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    get("/recommend", { position, budget }).then(setPicks).catch((err) => setError(err.message));
  }

  return (
    <>
      <form className="controls" onSubmit={submit}>
        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          {POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input type="number" step="0.5" min="4" value={budget}
               onChange={(e) => setBudget(e.target.value)} />
        <button type="submit">Recommend</button>
      </form>

      {error && <p className="error">{error}</p>}
      {picks && picks.length === 0 && <p>No available players within that budget.</p>}

      {picks?.map((r, i) => (
        <div key={r.player.id} className="card" onClick={() => onSelect(r.player)}>
          <button className="star" onClick={(e) => { e.stopPropagation(); onToggleWatch(r.player); }}>
            {watchlist.some((w) => w.id === r.player.id) ? "★" : "☆"}
          </button>
          <span className="rank">{i + 1}</span>
          <img className="photo" src={r.player.photo} alt="" onError={hideBrokenImage} />
          <div>
            <h3>{r.player.name}</h3>
            <p className="meta">
              <img className="badge" src={r.player.badge} alt="" /> {r.player.team}, £{r.player.price.toFixed(1)}m
            </p>
            <p>Score <b>{r.score}</b>. {r.reason}</p>
            <FixtureList fixtures={r.nextFixtures} />
          </div>
        </div>
      ))}
    </>
  );
}
