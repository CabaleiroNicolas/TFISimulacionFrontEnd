import { useNavigate } from 'react-router-dom';
import { Play, History, ArrowRight, Tag, Settings } from 'lucide-react';
import { useCenter } from '../hooks/useCenter';
import { useSimulations } from '../hooks/useSimulations';
import { formatMoneyM, formatTime } from '../utils/format';

const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatFecha(isoString) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(isoString)
    ? new Date(isoString + 'T00:00')
    : new Date(isoString);
  return `${d.getDate()} ${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatConfig(sim) {
  const { jornadasSimuladas, operarios, horasTurno } = sim.config ?? {};
  return `${jornadasSimuladas} j · ${operarios} op × ${horasTurno}h`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: centro } = useCenter();
  const { data: historial, loading } = useSimulations();

  const responsable = centro?.responsable ?? '';
  const recientes = historial?.slice(0, 5) ?? [];

  return (
    <div className="content page-enter">
      {/* Saludo */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="page">{saludo()}{responsable ? `, ${responsable}` : ''}</h1>
        <p className="lead">¿Qué querés hacer hoy?</p>
      </div>

      {/* Acciones principales */}
      <div className="grid g-4" style={{ marginBottom: 40, gap: 16 }}>
        <button
          className="card action-card"
          onClick={() => navigate('/simulaciones/nueva')}
        >
          <div className="iblock op" style={{ marginBottom: 12 }}>
            <Play size={20} />
          </div>
          <div className="action-card-title">Nueva simulación</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Configurá operarios, turno y jornadas para proyectar resultados
          </div>
        </button>

        <button
          className="card action-card"
          onClick={() => navigate('/historial')}
        >
          <div className="iblock" style={{ marginBottom: 12 }}>
            <History size={20} />
          </div>
          <div className="action-card-title">Ver historial</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Revisá y comparé simulaciones guardadas anteriormente
          </div>
        </button>

        <button
          className="card action-card"
          onClick={() => navigate('/precios')}
        >
          <div className="iblock econ" style={{ marginBottom: 12 }}>
            <Tag size={20} />
          </div>
          <div className="action-card-title">Precios de mercado</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Actualizá el precio de venta de cada material recuperado
          </div>
        </button>

        <button
          className="card action-card"
          onClick={() => navigate('/centro')}
        >
          <div className="iblock env" style={{ marginBottom: 12 }}>
            <Settings size={20} />
          </div>
          <div className="action-card-title">Datos del centro</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Configurá el nombre, responsable y parámetros operativos
          </div>
        </button>
      </div>

      {/* Simulaciones recientes */}
      <div className="row between" style={{ marginBottom: 12, alignItems: 'center' }}>
        <h2 className="sec" style={{ margin: 0 }}>Simulaciones recientes</h2>
        <button className="btn ghost sm" onClick={() => navigate('/historial')}>
          Ver todas <ArrowRight size={12} />
        </button>
      </div>

      <div className="card flat tight">
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 14, width: 200, margin: '0 auto 10px' }} />
            <div className="skeleton" style={{ height: 14, width: 160, margin: '0 auto' }} />
          </div>
        ) : recientes.length === 0 ? (
          <div className="muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: 14 }}>
            Todavía no hay simulaciones guardadas.
          </div>
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Configuración</th>
                <th className="right">Tiempo promedio</th>
                <th className="right">Ganancia neta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((sim, i) => (
                <tr
                  key={i}
                  className="row-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/historial/${i}`, { state: { sim } })}
                >
                  <td className="muted" style={{ fontSize: 13 }}>
                    {sim.fechaEjecucion ? formatFecha(sim.fechaEjecucion) : '–'}
                  </td>
                  <td>{formatConfig(sim)}</td>
                  <td className="right num">{formatTime(sim.resultadoOperativo?.tiempoPromedioMin)}</td>
                  <td className="right num">{formatMoneyM(sim.resultadoEconomico?.gananciaNetaAcumulada)}</td>
                  <td className="right">
                    <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
