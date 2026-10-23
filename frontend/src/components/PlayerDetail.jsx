import { useEffect, useState } from "react";
import { get } from "../api";
import FixtureList from "./FixtureList";

// Popup with one player's details and their next 5 fixtures
export default function PlayerDetail({ player, onClose }) {
  const [fixtures, setFixtures] = useState([]);

  // Fetch fixtures whenever a different player is opened
  useEffect(() => {
    get(`/players/${player.id}/fixtures`).then(setFixtures).catch(() => setFixtures([]));
  }, [player.id]);

  return (
    // Clicking the dark background closes the popup; clicks inside the box don't
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>{player.name}</h2>
        <p>{player.team} · {player.position} · £{player.price.toFixed(1)}m</p>
        <p>Total points: <b>{player.totalPoints}</b> · Form: <b>{player.form}</b></p>
        {player.news && <p className="warn">{player.news}</p>}
        <h3>Next 5 fixtures</h3>
        <FixtureList fixtures={fixtures} />
      </div>
    </div>
  );
}
