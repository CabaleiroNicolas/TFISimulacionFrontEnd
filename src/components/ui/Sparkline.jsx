// Sparkline SVG generado desde un array de valores Y (0=min … 50=max vertical invertido)
// Los puntos están normalizados al viewport 300×50
export function Sparkline({ points = [] }) {
  if (!points || points.length < 2) return null;

  const w = 300;
  const h = 50;
  const step = w / (points.length - 1);

  const coords = points.map((y, i) => `${i * step},${y}`);
  const linePath = `M${coords.join(' L')}`;
  const areaPath = `M${coords.join(' L')} L${w},${h} L0,${h} Z`;

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="area" d={areaPath} />
      <path className="line" d={linePath} />
    </svg>
  );
}
