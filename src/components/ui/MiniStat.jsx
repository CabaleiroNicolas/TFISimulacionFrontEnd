export function MiniStat({ label, value, valueStyle, last = false }) {
  return (
    <div className="ministat" style={last ? { borderBottom: 'none' } : {}}>
      <span className="l">{label}</span>
      <span className="v num" style={valueStyle}>{value}</span>
    </div>
  );
}
