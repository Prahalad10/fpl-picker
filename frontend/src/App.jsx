import { useEffect, useState } from "react";
import Players from "./components/Players";
import Recommend from "./components/Recommend";
import PlayerTable from "./components/PlayerTable";
import PlayerDetail from "./components/PlayerDetail";

const TABS = ["Players", "Recommend", "Watchlist"];

export default function App() {
  const [tab, setTab] = useState("Players");
  const [selected, setSelected] = useState(null); // player shown in the popup

  // Watchlist is saved in the browser's localStorage so it survives a refresh
  const [watchlist, setWatchlist] = useState(
    () => JSON.parse(localStorage.getItem("watchlist")) || []
  );
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Add the player if missing, remove them if already there
  function toggleWatch(player) {
    setWatchlist((list) =>
      list.some((p) => p.id === player.id)
        ? list.filter((p) => p.id !== player.id)
        : [...list, player]
    );
  }

  // Props every list of players needs
  const shared = { watchlist, onToggleWatch: toggleWatch, onSelect: setSelected };

  return (
    <div className="app">
      <h1>⚽ FPL Picker</h1>

      <nav>
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t === "Watchlist" ? `Watchlist (${watchlist.length})` : t}
          </button>
        ))}
      </nav>

      {tab === "Players" && <Players {...shared} />}
      {tab === "Recommend" && <Recommend {...shared} />}
      {tab === "Watchlist" && <PlayerTable players={watchlist} {...shared} />}

      {selected && <PlayerDetail player={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
