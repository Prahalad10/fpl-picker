import { useEffect, useState } from "react";
import { get, hideBrokenImage } from "../api";
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
        {/* Purple top section with the player's photo and club badge */}
        <div className="modal-top">
          <img className="photo" src={player.photo} alt="" onError={hideBrokenImage} />
          <div>
            <h2>{player.name}</h2>
            <p><img className="badge" src={player.badge} alt="" /> {player.team}, {player.position}</p>
          </div>
        </div>
        <div className="modal-body">
          <div className="stats">
            <div><b>£{player.price.toFixed(1)}m</b>Price</div>
            <div><b>{player.totalPoints}</b>Points</div>
            <div><b>{player.form}</b>Form</div>
          </div>
          {player.news && <p className="warn">{player.news}</p>}
          <h3>Next 5 fixtures</h3>
          <FixtureList fixtures={fixtures} />
        </div>
      </div>
    </div>
  );
}
