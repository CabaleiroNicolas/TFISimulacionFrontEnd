// barColor: CSS variable string, ej: "var(--brand)" o "var(--ink-2)"
export function BarList({ items = [], barColor = 'var(--ink-2)' }) {
  return (
    <div className="barlist">
      {items.map((item, i) => (
        <div className="row" key={i}>
          <span className="lbl">{item.label}</span>
          <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${item.pct}%`,
                background: barColor,
                borderRadius: 999,
              }}
            />
          </div>
          <span className="val">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
