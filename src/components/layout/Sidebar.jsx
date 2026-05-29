import { NavLink, useLocation } from 'react-router-dom';
import { Home, Play, History, Tag, Settings, Recycle } from 'lucide-react';
import { useCenter } from '../../hooks/useCenter';

const NAV_ITEMS = [
  { to: '/',                  icon: <Home size={16} />,    label: 'Inicio',           key: 'home' },
  { to: '/simulaciones/nueva',icon: <Play size={16} />,    label: 'Nueva simulación', key: 'new' },
  { to: '/historial',         icon: <History size={16} />, label: 'Historial',        key: 'history' },
];

const CONFIG_ITEMS = [
  { to: '/precios', icon: <Tag size={16} />,      label: 'Precios de mercado' },
  { to: '/centro',  icon: <Settings size={16} />, label: 'Datos del centro' },
];

// El item "Historial" se considera activo también en rutas de simulación guardada
function useActiveKey() {
  const { pathname } = useLocation();
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/simulaciones/nueva')) return 'new';
  if (pathname.startsWith('/simulaciones/')) return 'new';
  if (pathname.startsWith('/historial')) return 'history';
  return null;
}

export function Sidebar() {
  const activeKey = useActiveKey();
  const { data: centro } = useCenter();

  const nombreCentro  = centro?.nombre      ?? '–';
  const responsable   = centro?.responsable ?? '–';
  const inicialesResp = responsable !== '–'
    ? responsable.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className="nav">
      {/* Logo + nombre */}
      <div className="brand">
        <div className="logo"><Recycle size={18} /></div>
        <div className="name">
          RAEE
          <small>Simulador · {nombreCentro}</small>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="nav-group">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => {
              // Lógica manual para rutas de simulación
              const manualActive = activeKey === item.key;
              return `nav-item${manualActive ? ' active' : ''}`;
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Configuración */}
      <div className="nav-group">
        <div className="nav-label">Configuración</div>
        {CONFIG_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Footer de usuario */}
      <div className="nav-footer">
        <div className="nav-user">
          <div className="avatar">{inicialesResp}</div>
          <div className="who">
            {responsable}
            <small>Responsable operativo</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
