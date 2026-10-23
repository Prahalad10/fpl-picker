import { useEffect, useState } from "react";
import { get, POSITIONS } from "../api";
import PlayerTable from "./PlayerTable";

// "Players" tab: filter controls on top, results table below
export default function Players(props) {
  const [filters, setFilters] = useState({ position: "", team: "", maxPrice: "", sort: "points" });
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  // Load the team names once, for the dropdown
  useEffect(() => {
    get("/teams").then(setTeams).catch((e) => setError(e.message));
  }, []);

  // Fetch players again every time a filter changes
  useEffect(() => {
    get("/players", filters).then(setPlayers).catch((e) => setError(e.message));
  }, [filters]);

  // One handler for all inputs: the input's "name" says which filter to change
  function update(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <>
      <div className="controls">
        <select name="position" value={filters.position} onChange={update}>
          <option value="">All positions</option>
          {POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </select>

        <select name="team" value={filters.team} onChange={update}>
          <option value="">All teams</option>
          {teams.map((t) => <option key={t}>{t}</option>)}
        </select>

        <input name="maxPrice" type="number" step="0.5" placeholder="Max price (£m)"
               value={filters.maxPrice} onChange={update} />

        <select name="sort" value={filters.sort} onChange={update}>
          <option value="points">Sort by points</option>
          <option value="form">Sort by form</option>
          <option value="price">Sort by price</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      <PlayerTable players={players} {...props} />
    </>
  );
}
