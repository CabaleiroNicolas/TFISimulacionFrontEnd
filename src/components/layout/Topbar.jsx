import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function useBreadcrumb() {
  const { pathname } = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNueva = searchParams.get('nueva') === 'true';

  if (pathname === '/') {
    return [{ label: 'Inicio' }];
  }
  if (pathname === '/simulaciones/nueva') {
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Nueva simulación' },
    ];
  }
  if (pathname.startsWith('/simulaciones/') && id) {
    if (isNueva) {
      return [
        { label: 'Inicio', to: '/' },
        { label: 'Nueva simulación', to: '/simulaciones/nueva' },
        { label: 'Resultados' },
      ];
    }
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Historial', to: '/historial' },
      { label: `Simulación #${id}` },
    ];
  }
  if (pathname === '/historial') {
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Historial' },
    ];
  }
  if (pathname === '/precios') {
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Precios de mercado' },
    ];
  }
  if (pathname === '/centro') {
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Datos del centro' },
    ];
  }
  return [{ label: 'Inicio', to: '/' }];
}

export function Topbar() {
  const crumbs = useBreadcrumb();

  return (
    <header className="topbar">
      <nav className="crumb">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && (
              <span className="sep">
                <ChevronRight size={13} />
              </span>
            )}
            {c.to ? (
              <Link to={c.to}>{c.label}</Link>
            ) : (
              <span className="now">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
