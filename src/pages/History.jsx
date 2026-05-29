import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { useSimulations } from '../hooks/useSimulations';
import { formatDateLong, formatMoneyM, formatTime, formatNum, formatPct } from '../utils/format';
import { Note } from '../components/ui/Note';

const VEREDICTO_PILL = {
  HOLGADA:  'success',
  AJUSTADA: 'warn',
  CUELLO:   'danger',
};

const VEREDICTO_LABEL = {
  HOLGADA:  'Holgada',
  AJUSTADA: 'Ajustada',
  CUELLO:   'Cuello',
};

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.2 }} />;
  return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: 7 }).map((_, j) => (
        <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 80 : 70 }} /></td>
      ))}
    </tr>
  ));
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { data: simulaciones, loading, error } = useSimulations();

  const [sortField, setSortField] = useState('fecha');
  const [sortDir,   setSortDir]   = useState('desc');

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sorted = useMemo(() => {
    if (!simulaciones) return [];
    return [...simulaciones].sort((a, b) => {
      let va, vb;
      switch (sortField) {
        case 'fecha':
          va = new Date(a.fechaEjecucion).getTime();
          vb = new Date(b.fechaEjecucion).getTime();
          break;
        case 'ganancia':
          va = a.resultadoEconomico?.gananciaNetaAcumulada ?? 0;
          vb = b.resultadoEconomico?.gananciaNetaAcumulada ?? 0;
          break;
        case 'tiempo':
          va = a.resultadoOperativo?.tiempoPromedioMin ?? 0;
          vb = b.resultadoOperativo?.tiempoPromedioMin ?? 0;
          break;
        case 'monitores':
          va = a.resultadoOperativo?.monitoresProcesados ?? 0;
          vb = b.resultadoOperativo?.monitoresProcesados ?? 0;
          break;
        default:
          va = 0; vb = 0;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [simulaciones, sortField, sortDir]);

  function thProps(field) {
    return {
      style: { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
      onClick: () => toggleSort(field),
    };
  }

  return (
    <div className="content wide page-enter">
      <div className="row between" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <h1 className="page">Historial</h1>
          <p className="lead">
            {simulaciones ? `${simulaciones.length} simulación${simulaciones.length !== 1 ? 'es' : ''} guardada${simulaciones.length !== 1 ? 's' : ''}.` : ''}
            {' '}Hacé click en una fila para ver el detalle completo.
          </p>
        </div>
        <button className="btn brand" onClick={() => navigate('/simulaciones/nueva')}>
          <Play size={14} />Nueva simulación
        </button>
      </div>

      {error && (
        <Note icon={<AlertTriangle size={16} />} variant="danger" title="No se pudo cargar el historial">
          {error}
        </Note>
      )}

      <div className="card tight" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th {...thProps('fecha')}>
                  <span className="row" style={{ gap: 4, alignItems: 'center' }}>
                    Fecha <SortIcon field="fecha" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th>Capacidad</th>
                <th>Config</th>
                <th className="right" {...thProps('monitores')}>
                  <span className="row" style={{ gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                    Monitores <SortIcon field="monitores" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="right" {...thProps('tiempo')}>
                  <span className="row" style={{ gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                    Tiempo prom. <SortIcon field="tiempo" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="right" {...thProps('ganancia')}>
                  <span className="row" style={{ gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                    Ganancia <SortIcon field="ganancia" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="right">Plomo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <SkeletonRows />
                : sorted.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                        No hay simulaciones guardadas todavía.
                      </td>
                    </tr>
                  )
                  : sorted.map((sim, i) => {
                      const op  = sim.resultadoOperativo;
                      const ec  = sim.resultadoEconomico;
                      const env = sim.resultadoAmbiental;
                      const pillVariant = VEREDICTO_PILL[sim.veredictoCapacidad] ?? 'brand';
                      return (
                        <tr key={i} className="row-hover" style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/historial/${i}`, { state: { sim } })}
                        >
                          <td>
                            <b>{formatDateLong(sim.fechaEjecucion)}</b>
                          </td>
                          <td>
                            <span className={`pill ${pillVariant}`}>
                              <span className="dot" />
                              {VEREDICTO_LABEL[sim.veredictoCapacidad] ?? sim.veredictoCapacidad}
                            </span>
                          </td>
                          <td className="num" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                            {sim.config
                              ? `${sim.config.jornadasSimuladas}j · ${sim.config.operarios}op × ${sim.config.horasTurno}hs`
                              : '–'}
                          </td>
                          <td className="right num">{op ? formatNum(op.monitoresProcesados) : '–'}</td>
                          <td className="right num">{op ? formatTime(op.tiempoPromedioMin) : '–'}</td>
                          <td className="right num">{ec ? formatMoneyM(ec.gananciaNetaAcumulada) : '–'}</td>
                          <td className="right num">{env ? `${formatNum(env.plomoContenidoKg)} kg` : '–'}</td>
                          <td className="right">
                            <ChevronRight size={13} style={{ color: 'var(--muted)' }} />
                          </td>
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
