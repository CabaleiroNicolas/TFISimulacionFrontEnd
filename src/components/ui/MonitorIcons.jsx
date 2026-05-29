// Iconos de monitor custom (no disponibles en lucide-react)

export function MonitorOld({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2"/>
      <path d="M7 17v4M17 17v4M7 21h10"/>
      <circle cx="12" cy="10.5" r="2.5"/>
    </svg>
  );
}

export function MonitorThin({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="11" rx="1.5"/>
      <path d="M5 19h14"/>
      <path d="M12 15v4"/>
    </svg>
  );
}
