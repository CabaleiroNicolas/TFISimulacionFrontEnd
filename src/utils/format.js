// Formatea número con separador de miles argentino: 2304000 → "$ 2.304.000"
export const formatMoney = (n) =>
  '$ ' + Math.round(n).toLocaleString('es-AR');

// Formatea en millones: 4460000 → "$ 4,46 M"
export const formatMoneyM = (n) => {
  const m = n / 1_000_000;
  return '$ ' + m.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' M';
};

// Formatea en K o M según el monto: 198000 → "$ 198k"
export const formatMoneyShort = (n) => {
  if (n >= 1_000_000) return '$ ' + (n / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' M';
  if (n >= 1_000)     return '$ ' + Math.round(n / 1_000) + 'k';
  return formatMoney(n);
};

// Formatea minutos como "14h 50"
export const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}`;
};

// Formatea número con separador de miles sin prefijo $: 1247 → "1.247"
export const formatNum = (n) =>
  Math.round(n).toLocaleString('es-AR');

// Formatea porcentaje: 0.62 → "62%"
export const formatPct = (n) =>
  Math.round(n * 100) + '%';

// Parsea fecha evitando el desfase UTC: "2026-05-28" → Date local (no UTC midnight)
function parseDate(iso) {
  // Si es solo fecha (YYYY-MM-DD), agregar T00:00 para que se interprete como hora local
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(iso + 'T00:00');
  return new Date(iso);
}

// Formatea fecha corta: "2026-05-21" → "21/05"
export const formatDateShort = (iso) => {
  const d = parseDate(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
};

// Formatea fecha larga: "2026-05-21" → "21/05/2026"
export const formatDateLong = (iso) => {
  const d = parseDate(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

// Nombres de días en español rioplatense
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
export const formatDayName = (iso) => {
  const d = new Date(iso);
  return DIAS[d.getDay()];
};
