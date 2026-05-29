// Barra dividida en segmentos coloreados. segments: [{ pct, color, title }]
export function SegmentedBar({ segments = [], height = 8 }) {
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-3)' }}>
      {segments.map((seg, i) => (
        <span
          key={i}
          title={seg.title}
          style={{
            display: 'block',
            width: `${seg.pct}%`,
            height: '100%',
            background: seg.color,
            borderRadius:
              i === 0
                ? '999px 0 0 999px'
                : i === segments.length - 1
                ? '0 999px 999px 0'
                : 0,
          }}
        />
      ))}
    </div>
  );
}
