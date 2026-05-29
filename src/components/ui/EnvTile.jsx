export function EnvTile({ label, value, sub }) {
  return (
    <div className="env-tile">
      <div className="l">{label}</div>
      <div className="v num">{value}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}
