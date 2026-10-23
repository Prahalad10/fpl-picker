// Reusable table of players, used by the Players and Watchlist tabs
export default function PlayerTable({ players, watchlist, onToggleWatch, onSelect }) {
  if (players.length === 0) return <p>No players to show.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th></th><th>Name</th><th>Team</th><th>Pos</th><th>Price</th><th>Points</th><th>Form</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p) => (
          <tr key={p.id} onClick={() => onSelect(p)}>
            <td>
              {/* stopPropagation: clicking the star shouldn't also open the popup */}
              <button className="star" onClick={(e) => { e.stopPropagation(); onToggleWatch(p); }}>
                {watchlist.some((w) => w.id === p.id) ? "★" : "☆"}
              </button>
            </td>
            <td>
              {p.name} {p.status !== "a" && <span className="warn" title={p.news}>⚠</span>}
            </td>
            <td>{p.team}</td>
            <td>{p.position}</td>
            <td>£{p.price.toFixed(1)}m</td>
            <td>{p.totalPoints}</td>
            <td>{p.form}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
