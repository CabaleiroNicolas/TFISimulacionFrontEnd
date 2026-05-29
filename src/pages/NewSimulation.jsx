import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Info, AlertTriangle, Monitor } from 'lucide-react';
import { useCreateSimulation } from '../hooks/useSimulation';
import { Note } from '../components/ui/Note';
import { MiniStat } from '../components/ui/MiniStat';

function formatMoney(n) {
  return '$ ' + Math.round(n).toLocaleString('es-AR');
}

const FRASES = [
  'Generando llegada de monitores…',
  'Calculando tiempos de procesamiento…',
  'Evaluando capacidad operativa…',
  'Computando ganancia por material…',
  'Estimando impacto ambiental…',
  'Consolidando resultados…',
];

function MonitorCRT({ size = 36 }) {
  return <Monitor size={size} />;
}

function MonitorLCD({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* marco delgado */}
      <rect x="2" y="5" width="28" height="19" rx="2" fill="currentColor" opacity="0.12"/>
      <rect x="2" y="5" width="28" height="19" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      {/* pantalla */}
      <rect x="5" y="8" width="22" height="13" rx="1" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1"/>
      {/* pie */}
      <path d="M14 24 L13 29 L19 29 L18 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="29" x2="22" y2="29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* botón inferior */}
      <circle cx="16" cy="26.5" r="0.9" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function MonitorLED({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* marco ultra fino */}
      <rect x="1" y="6" width="30" height="18" rx="2" fill="currentColor" opacity="0.12"/>
      <rect x="1" y="6" width="30" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      {/* pantalla casi sin bisel */}
      <rect x="3" y="8" width="26" height="14" rx="1" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="0.8"/>
      {/* tiras LED en el borde inferior de pantalla */}
      <line x1="6" y1="21.5" x2="10" y2="21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="12" y1="21.5" x2="16" y2="21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="18" y1="21.5" x2="22" y2="21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      {/* base muy delgada */}
      <path d="M14 24 L13.5 29 L18.5 29 L18 24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="11" y1="29" x2="21" y2="29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const SIM_MONITORS = [MonitorCRT, MonitorLCD, MonitorLED, MonitorLCD, MonitorCRT];

function SimulandoScreen({ jornadas }) {
  const [frase, setFrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrase(f => (f + 1) % FRASES.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="simulating-screen">
      <div className="simulating-monitors">
        {SIM_MONITORS.map((Icono, i) => (
          <div key={i} className="sim-monitor" style={{ animationDelay: `${i * 0.18}s` }}>
            <Icono size={36} />
          </div>
        ))}
      </div>
      <h2 className="simulating-title">Simulando {jornadas} jornadas</h2>
      <p className="simulating-frase">{FRASES[frase]}</p>
      <div className="simulating-bar">
        <div className="simulating-bar-fill" />
      </div>
    </div>
  );
}

// Recalcula las métricas del panel derecho a partir de los 4 inputs
function calcEstim(operarios, horasTurno, costoHora, jornadas) {
  const op  = parseFloat(operarios)  || 0;
  const hs  = parseFloat(horasTurno) || 0;
  const c   = parseFloat(costoHora)  || 0;
  const j   = parseFloat(jornadas)   || 0;
  const hhJornada    = op * hs;
  const hhTotal      = hhJornada * j;
  const costoJornada = hhJornada * c;
  const costoTotal   = costoJornada * j;
  return { hhJornada, hhTotal, costoJornada, costoTotal };
}

export function NewSimulationPage() {
  const navigate = useNavigate();
  const { create, loading, error: apiError } = useCreateSimulation();

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('sim_form');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return { operarios: 3, horasTurno: 8, costoHora: 3200, jornadas: 30 };
  });
  const [errors, setErrors] = useState({});

  const est = calcEstim(form.operarios, form.horasTurno, form.costoHora, form.jornadas);

  const set = (field) => (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setForm(prev => {
      const next = { ...prev, [field]: raw };
      localStorage.setItem('sim_form', JSON.stringify(next));
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  function validate() {
    const errs = {};
    const op = parseFloat(form.operarios);
    const hs = parseFloat(form.horasTurno);
    const c  = parseFloat(form.costoHora);
    const j  = parseFloat(form.jornadas);
    if (!op || op < 1) errs.operarios  = 'Mínimo 1 operario';
    if (!hs || hs < 1) errs.horasTurno = 'Mínimo 1 hora';
    if (isNaN(c) || c < 0) errs.costoHora = 'Ingresá un valor';
    if (!j  || j  < 1) errs.jornadas   = 'Mínimo 1 jornada';
    return errs;
  }

  const [simulando, setSimulando] = useState(false);

  async function handleSimular() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSimulando(true);
      const [result] = await Promise.all([
        create({
          operarios:         parseFloat(form.operarios),
          horasTurno:        parseFloat(form.horasTurno),
          costoOperarioHora: parseFloat(form.costoHora),
          jornadasASimular:  parseFloat(form.jornadas),
        }),
        new Promise(res => setTimeout(res, 3000)),
      ]);
      navigate(`/simulaciones/${result.id}?nueva=true`);
    } catch {
      setSimulando(false);
    }
  }

  if (simulando) {
    return <SimulandoScreen jornadas={parseFloat(form.jornadas) || 0} />;
  }

  return (
    <div className="content wide page-enter">
      {/* Header */}
      <div className="row between" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <h1 className="page">Nueva simulación</h1>
          <p className="lead">
            Configurá los recursos del centro y la cantidad de jornadas a simular.
            La llegada de monitores (cantidad y mix de tecnología) es aleatoria — eso es lo que el modelo predice.
          </p>
        </div>
        <button className="btn ghost" onClick={() => navigate('/')}>Cancelar</button>
      </div>

      <div className="grid g-12" style={{ gap: 24 }}>
        {/* Formulario */}
        <div className="col-8">
          <div className="card">
            <div className="row between" style={{ marginBottom: 18 }}>
              <h3 className="card">Configuración de la jornada</h3>
              <span className="muted xs">Recursos disponibles</span>
            </div>

            <div className="grid g-2" style={{ gap: 16 }}>
              {/* Operarios */}
              <div className="field">
                <label htmlFor="operarios">Operarios asignados</label>
                <div className="input-wrap">
                  <input
                    id="operarios"
                    className={`input with-suffix num${errors.operarios ? ' error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.operarios}
                    onChange={set('operarios')}
                  />
                  <span className="suffix">personas</span>
                </div>
                {errors.operarios
                  ? <div className="error">{errors.operarios}</div>
                  : <div className="hint">Cuántos técnicos trabajan en esta jornada</div>}
              </div>

              {/* Duración turno */}
              <div className="field">
                <label htmlFor="horasTurno">Duración del turno</label>
                <div className="input-wrap">
                  <input
                    id="horasTurno"
                    className={`input with-suffix num${errors.horasTurno ? ' error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.horasTurno}
                    onChange={set('horasTurno')}
                  />
                  <span className="suffix">horas</span>
                </div>
                {errors.horasTurno
                  ? <div className="error">{errors.horasTurno}</div>
                  : <div className="hint">Horas disponibles por operario</div>}
              </div>

              {/* Costo/hora */}
              <div className="field">
                <label htmlFor="costoHora">Costo por operario/hora</label>
                <div className="input-wrap">
                  <span className="prefix">$</span>
                  <input
                    id="costoHora"
                    className={`input with-prefix num${errors.costoHora ? ' error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.costoHora}
                    onChange={set('costoHora')}
                  />
                </div>
                {errors.costoHora
                  ? <div className="error">{errors.costoHora}</div>
                  : <div className="hint">Salario por hora (incluye cargas)</div>}
              </div>

              {/* Jornadas */}
              <div className="field">
                <label htmlFor="jornadas">Jornadas a simular</label>
                <div className="input-wrap">
                  <input
                    id="jornadas"
                    className={`input with-suffix num${errors.jornadas ? ' error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.jornadas}
                    onChange={set('jornadas')}
                  />
                  <span className="suffix">jornadas</span>
                </div>
                {errors.jornadas
                  ? <div className="error">{errors.jornadas}</div>
                  : <div className="hint">Cuanto mayor, más confiable la predicción</div>}
              </div>
            </div>

            <hr className="div" style={{ margin: '24px 0' }} />

            {apiError && (
              <Note icon={<AlertTriangle size={16} />} variant="danger" title="Error al ejecutar la simulación">
                {apiError}
              </Note>
            )}

            <Note icon={<Info size={16} />} title="Variables aleatorias del modelo">
              La cantidad de monitores que llegan al centro cada día y el mix entre CRT, LCD y LED son{' '}
              <b>variables probabilísticas</b> generadas por el simulador en cada jornada. Los precios de los materiales se toman automáticamente de{' '}
              <Link to="/precios" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                Precios de mercado
              </Link>.
            </Note>

            {/* Sticky bar */}
            <div className="sticky-bar">
              <div className="summary">
                <div>
                  <span className="muted">Capacidad por jornada</span>{' '}
                  <b>{(parseFloat(form.operarios) || 0) * (parseFloat(form.horasTurno) || 0)}h</b>
                </div>
                <div>
                  <span className="muted">Jornadas</span>{' '}
                  <b>{parseFloat(form.jornadas) || 0}</b>
                </div>
                <div>
                  <span className="muted">Costo operativo total</span>{' '}
                  <b>{formatMoney(est.costoTotal)}</b>
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn brand lg" onClick={handleSimular} disabled={loading}>
                  <Zap size={14} />
                  {loading ? 'Simulando…' : 'Simular'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de estimación en vivo */}
        <div className="col-4">
          <div className="estim">
            <span className="pill brand" style={{ alignSelf: 'flex-start' }}>
              <Zap size={12} />
              Estimación en vivo
            </span>

            <div style={{ marginTop: 4 }}>
              <div className="muted xs" style={{ marginBottom: 4 }}>Costo operativo de las jornadas</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }} className="num">
                {formatMoney(est.costoTotal)}
              </div>
              <div className="muted xs" style={{ marginTop: 6 }}>
                {parseFloat(form.operarios) || 0} operario{parseFloat(form.operarios) !== 1 ? 's' : ''} × {parseFloat(form.horasTurno) || 0} hs ×{' '}
                $ {(parseFloat(form.costoHora) || 0).toLocaleString('es-AR')}/h × {parseFloat(form.jornadas) || 0} jornada{parseFloat(form.jornadas) !== 1 ? 's' : ''}
              </div>
            </div>

            <hr className="div" style={{ margin: '6px 0' }} />

            <MiniStat label="Costo por jornada"         value={formatMoney(est.costoJornada)} />
            <MiniStat label="Horas-hombre por jornada"  value={`${est.hhJornada} h`} />
            <MiniStat label="Horas-hombre totales"      value={`${est.hhTotal.toLocaleString('es-AR')} h`} last />

            <hr className="div" style={{ margin: '6px 0' }} />

            <Note icon={<Info size={16} />} title="Por qué solo costo operativo">
              Tiempo, ganancia e impacto ambiental dependen de la llegada de monitores,
              que es aleatoria. Se calculan al ejecutar la simulación.
            </Note>
          </div>
        </div>
      </div>
    </div>
  );
}
