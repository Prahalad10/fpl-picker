// Upcoming matches as coloured chips; the CSS class fdr-1 ... fdr-5 sets the colour
export default function FixtureList({ fixtures }) {
  return (
    <div className="fixtures">
      {fixtures.map((f) => (
        <span key={f.gameweek + f.opponent} className={`fdr fdr-${f.difficulty}`}>
          GW{f.gameweek} {f.opponent} ({f.home ? "H" : "A"})
        </span>
      ))}
    </div>
  );
}
