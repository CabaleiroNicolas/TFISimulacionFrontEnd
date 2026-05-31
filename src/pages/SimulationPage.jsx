import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Edit, Check, Clock, Coins, Leaf, AlertTriangle, Info, Monitor, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulation, useSaveSimulation } from '../hooks/useSimulation';
import { MiniStat } from '../components/ui/MiniStat';
import { EnvTile } from '../components/ui/EnvTile';
import { SegmentedBar } from '../components/ui/SegmentedBar';
import { BarList } from '../components/ui/BarList';
import { Note } from '../components/ui/Note';
import { MonitorOld, MonitorThin } from '../components/ui/MonitorIcons';
import { formatMoney, formatMoneyM, formatMoneyShort, formatTime, formatNum, formatPct, formatDateLong } from '../utils/format';

function veredictoLabel(v) {
  if (v === 'HOLGADA') return 'Holgada';
  if (v === 'AJUSTADA') return 'Ajustada';
  if (v === 'CUELLO')   return 'Cuello';
  return v;
}

function configLabel(c) {
  return `${c.jornadasSimuladas} j · ${c.operarios} op × ${c.horasTurno} hs`;
}

// ────────────────────────────────────────────────────────
// VISTA: RESULTADOS (recién ejecutada, estado BORRADOR)
// ────────────────────────────────────────────────────────
// ── Fila expandible de materiales ──────────────────────────────────────────
function FilaMateriales({ mat }) {
  if (!mat) return null;

  const kg = (v) => v != null ? `${Number(v).toLocaleString('es-AR', { maximumFractionDigits: 2 })} kg` : '–';
  const gr = (v) => v != null ? `${Number(v).toLocaleString('es-AR', { maximumFractionDigits: 1 })} g` : '–';
  const mg = (v) => v != null ? `${Number(v).toLocaleString('es-AR', { maximumFractionDigits: 1 })} mg` : '–';

  const recuperables = [
    { label: 'Cobre',        valor: kg(mat.cobre) },
    { label: 'Aluminio',     valor: kg(mat.aluminio) },
    { label: 'Plástico ABS', valor: kg(mat.plasticoABS) },
    { label: 'Plástico PC',  valor: kg(mat.plasticoPC) },
    { label: 'Vidrio panel', valor: kg(mat.vidrio) },
    { label: 'Acero',        valor: kg(mat.acero) },
    { label: 'Placas PCB',   valor: kg(mat.placasPCB) },
  ].filter(r => r.valor !== '–');

  const preciosos = [
    { label: 'Oro',      valor: gr(mat.oro) },
    { label: 'Plata',    valor: gr(mat.plata) },
    { label: 'Paladio',  valor: gr(mat.paladio) },
    { label: 'Níquel',   valor: gr(mat.niquel) },
    { label: 'Estaño',   valor: gr(mat.estanio) },
    { label: 'Indio',    valor: gr(mat.indio) },
    { label: 'LC',       valor: gr(mat.lc) },
    { label: 'Tiras LED',valor: gr(mat.tirasLed) },
  ].filter(r => r.valor !== '–');

  const peligrosos = [
    { label: 'Plomo (Pb)',   valor: gr(mat.plomo),   danger: true },
    { label: 'Mercurio (Hg)',valor: mg(mat.mercurio), danger: true },
    { label: 'Cadmio (Cd)',  valor: gr(mat.cadmio),  danger: true },
    { label: 'BFR',          valor: gr(mat.bfr),     danger: true },
  ].filter(r => r.valor !== '–');

  return (
    <tr>
      <td colSpan={8} style={{ padding: '0 0 0 44px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '14px 20px 14px 0', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {recuperables.length > 0 && (
            <div>
              <div className="muted xs" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Recuperables</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {recuperables.map(r => (
                  <div key={r.label} className="ministat" style={{ minWidth: 180 }}>
                    <span className="l">{r.label}</span>
                    <span className="v">{r.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {preciosos.length > 0 && (
            <div>
              <div className="muted xs" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Metales preciosos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {preciosos.map(r => (
                  <div key={r.label} className="ministat" style={{ minWidth: 180 }}>
                    <span className="l">{r.label}</span>
                    <span className="v">{r.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {peligrosos.length > 0 && (
            <div>
              <div style={{ marginBottom: 6, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: 'var(--danger)' }}>Peligrosos (no comercializables)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {peligrosos.map(r => (
                  <div key={r.label} className="ministat" style={{ minWidth: 180 }}>
                    <span className="l">{r.label}</span>
                    <span className="v" style={{ color: 'var(--danger)' }}>{r.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ResultsView({ sim, onSave, saving, guardada = false, saveError = null, readOnly = false }) {
  const navigate = useNavigate();
  const [expandido, setExpandido]           = useState(null);
  const [verGanancias, setVerGanancias]     = useState(false);
  const { config, resultadoOperativo: op, resultadoEconomico: ec, resultadoAmbiental: env, detallePorTipo } = sim;

  const totalJornadas = config.jornadasSimuladas;
  const bannerVariant = sim.veredictoCapacidad === 'HOLGADA' ? 'success'
                      : sim.veredictoCapacidad === 'CUELLO'  ? 'danger'
                      : 'warn';

  // Lista completa de materiales con su ganancia — base para barra y modal
  const gm = ec.gananciasMateriales ?? {};
  const todosMateriales = [
    { label: 'Oro',            valor: gm.gananciaGrOro },
    { label: 'Indio',          valor: gm.gananciaGrIndio },
    { label: 'Paladio',        valor: gm.gananciaGrPaladio },
    { label: 'Plata',          valor: gm.gananciaGrPlata },
    { label: 'Cobre',          valor: gm.gananciaKgCobre },
    { label: 'Placas PCB',     valor: gm.gananciaKgPlacasPCB },
    { label: 'Aluminio',       valor: gm.gananciaKgAluminio },
    { label: 'Estaño',         valor: gm.gananciaGrEstanio },
    { label: 'Vidrio CRT',     valor: gm.gananciaKgVidrioPanelCRT },
    { label: 'Vidrio LCD/LED', valor: gm.gananciaKgVidrioPanelLCDLED },
    { label: 'Plástico ABS',   valor: gm.gananciaKgPlastABS },
    { label: 'Plástico PC',    valor: gm.gananciaKgPlastPC },
    { label: 'Acero',          valor: gm.gananciaKgAcero },
    { label: 'Níquel',         valor: gm.gananciaGrNiquel },
    { label: 'LC',             valor: gm.gananciaGrLC },
    { label: 'Tiras LED',      valor: gm.gananciaGrTirasLed },
  ].filter(r => r.valor != null && r.valor > 0)
   .sort((a, b) => b.valor - a.valor);

  const ingresoTotal = ec.ingresoBrutoAcumulado || todosMateriales.reduce((s, r) => s + r.valor, 0) || 1;

  // Paleta de colores para la barra — se asigna por posición en el ranking
  const BARRA_COLORES = [
    'var(--econ)', 'var(--accent)', 'var(--op)', 'var(--env)',
    'var(--brand)', 'var(--warn)', 'var(--muted-2)',
  ];

  // Top N materiales para la barra; el resto se agrupa en "Otros"
  const TOP_N = 5;
  const topMateriales = todosMateriales.slice(0, TOP_N);
  const otrosValor    = todosMateriales.slice(TOP_N).reduce((s, r) => s + r.valor, 0);
  const segmentosBarra = [
    ...topMateriales.map((r, i) => ({
      pct:   Math.round(r.valor / ingresoTotal * 100),
      color: BARRA_COLORES[i],
      title: `${r.label} ${Math.round(r.valor / ingresoTotal * 100)}%`,
    })),
    ...(otrosValor > 0 ? [{ pct: Math.round(otrosValor / ingresoTotal * 100), color: 'var(--surface-3)', title: 'Otros' }] : []),
  ];

  const holgPct  = Math.round(op.jornadasHolgadas  / totalJornadas * 100);
  const ajusPct  = Math.round(op.jornadasAjustadas / totalJornadas * 100);
  const cuelloPct = Math.round(op.jornadasCuello   / totalJornadas * 100);

  const bannerTitle =
    bannerVariant === 'success' ? 'Capacidad holgada — hay margen'
    : bannerVariant === 'warn'  ? 'Capacidad ajustada — al límite'
    : 'Cuello de botella detectado';

  const bannerDesc =
    bannerVariant === 'success'
      ? 'Con esta configuración la capacidad supera la demanda en la mayoría de las jornadas. Hay margen para aumentar el volumen de procesamiento.'
      : bannerVariant === 'warn'
      ? `Con esta configuración, la capacidad alcanza la mayoría de las jornadas pero por poco margen. ${op.jornadasCuello} de ${totalJornadas} jornadas generaron cuello de botella. Considerá sumar un operario o extender el turno.`
      : `${op.jornadasCuello} de ${totalJornadas} jornadas excedieron la capacidad del turno. Se perdieron unidades sin procesar. Ajustá los recursos.`;

  return (
    <div className="content wide page-enter">
      {/* Header */}
      <div className="row between" style={{ marginBottom: 6, alignItems: 'flex-end' }}>
        <div>
          <h1 className="page">{readOnly ? 'Simulación guardada' : `Resultados · Simulación #${sim.id}`}</h1>
          <p className="lead">
            {totalJornadas} jornadas simuladas · {config.operarios} operarios × {config.horasTurno} hs ·
            costo $ {config.costoOperarioHora.toLocaleString('es-AR')}/h
            {sim.fechaEjecucion ? ` · ejecutada el ${formatDateLong(sim.fechaEjecucion)}` : ''}
          </p>
        </div>
        {readOnly ? (
          <button className="btn secondary" onClick={() => navigate('/historial')}>
            Volver al historial
          </button>
        ) : (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn secondary" onClick={() => navigate('/simulaciones/nueva')}>
              <Edit size={14} />Editar parámetros
            </button>
            {guardada ? (
              <button className="btn secondary" disabled>
                <Check size={14} />Simulación guardada
              </button>
            ) : (
              <button className="btn brand" onClick={onSave} disabled={saving}>
                <Check size={14} />{saving ? 'Guardando…' : 'Guardar simulación'}
              </button>
            )}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="row" style={{ gap: 8, marginBottom: saveError ? 8 : 20 }}>
          <span className={`pill ${guardada ? 'success' : ''}`}>
            <span className="dot" />{guardada ? 'Guardada' : 'Borrador'}
          </span>
          {!guardada && <span className="muted xs">Generada hace unos segundos · no guardada aún</span>}
        </div>
      )}

      {saveError && (
        <div className="note danger" style={{ marginBottom: 20 }}>
          <div className="icon-wrap"><AlertTriangle size={16} /></div>
          <div>{saveError}</div>
        </div>
      )}

      {/* Banner de capacidad */}
      <div className={`note ${bannerVariant}`} style={{ marginBottom: 24 }}>
        <div className="icon-wrap">
          {bannerVariant === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
        </div>
        <div style={{ flex: 1 }}>
          <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{bannerTitle}</div>
              <div className="xs ink-3" style={{ marginTop: 4, maxWidth: 680 }}>{bannerDesc}</div>
            </div>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span className="pill success"><span className="dot" />Holgadas <b style={{ marginLeft: 2 }}>{op.jornadasHolgadas}</b></span>
              <span className="pill warn"><span className="dot" />Ajustadas <b style={{ marginLeft: 2 }}>{op.jornadasAjustadas}</b></span>
              <span className="pill danger"><span className="dot" />Cuello <b style={{ marginLeft: 2 }}>{op.jornadasCuello}</b></span>
              {op.jornadasCuello > 0 && (
                <span className="pill warn"><span className="dot" />Sin procesar <b style={{ marginLeft: 2 }}>{op.monitoresNoProcesados} u</b></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 bloques de resultado */}
      <div className="grid g-3" style={{ marginBottom: 24 }}>
        {/* Operativo */}
        <div className="result-block op">
          <div className="top">
            <div className="label-row">
              <div className="iblock op"><Clock size={16} /></div>
              <span className="pill op"><span className="dot" />Operativo</span>
            </div>
          </div>
          <div className="body">
            <div>
              <div className="big num">
                {formatTime(op.tiempoPromedioMin)}
                <span className="unit">tiempo prom. / jornada</span>
              </div>
              <div className="muted xs" style={{ marginTop: 6 }}>
                Turno disponible {config.operarios * config.horasTurno}h · {config.operarios} op × {config.horasTurno}h
              </div>
            </div>
            <div>
              {(() => {
                const capacidadMin = config.operarios * config.horasTurno * 60;
                const holguraMin   = capacidadMin - op.tiempoPromedioMin;
                const holguraPositiva = holguraMin > 0;
                return (
                  <>
                    <MiniStat label="Utilización promedio"   value={formatPct(op.utilizacionPromedio)} />
                    <MiniStat
                      label="Holgura promedio / jornada"
                      value={holguraPositiva ? formatTime(holguraMin) : '–'}
                      valueStyle={holguraPositiva ? { color: 'var(--success)' } : { color: 'var(--danger)' }}
                    />
                    <MiniStat label="Jornadas con cuello"    value={`${op.jornadasCuello} / ${totalJornadas} · ${cuelloPct}%`} />
                    <MiniStat label="Monitores procesados"   value={`${formatNum(op.monitoresProcesados)} / ${formatNum(op.monitoresIngresados)}`} />
                    <MiniStat
                      label="Sin procesar (acumulado)"
                      value={`${op.monitoresNoProcesados} unidades`}
                      valueStyle={op.monitoresNoProcesados > 0 ? { color: 'var(--warn)' } : {}}
                      last
                    />
                  </>
                );
              })()}
            </div>
            <div>
              <div className="muted xs" style={{ marginBottom: 6 }}>
                Distribución de utilización ({totalJornadas} jornadas)
              </div>
              <SegmentedBar
                height={8}
                segments={[
                  { pct: holgPct,  color: 'var(--success)', title: 'Holgadas' },
                  { pct: ajusPct,  color: 'var(--warn)',    title: 'Ajustadas' },
                  { pct: cuelloPct,color: 'var(--danger)',  title: 'Cuello' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Económico */}
        <div className="result-block econ">
          <div className="top">
            <div className="label-row">
              <div className="iblock econ"><Coins size={16} /></div>
              <span className="pill econ"><span className="dot" />Económico</span>
            </div>
          </div>
          <div className="body">
            <div>
              <div className="big num">
                {formatMoneyM(ec.gananciaNetaAcumulada)}
                <span className="unit">acumulado · {totalJornadas} jornadas</span>
              </div>
              <div className="muted xs" style={{ marginTop: 6 }}>
                Ganancia neta promedio {formatMoney(ec.gananciaPromedioPorJornada)} / jornada
              </div>
            </div>
            <div>
              <MiniStat label="Ingresos por materiales" value={formatMoneyM(ec.ingresoBrutoAcumulado)} />
              <MiniStat label="Costo operativo total"   value={formatMoneyM(ec.costoOperativoAcumulado)} />
              <MiniStat label="Margen promedio"         value={formatPct(ec.margenPromedio)} last />
            </div>
            <div>
              <div className="muted xs" style={{ marginBottom: 6 }}>Composición de ingresos</div>
              <SegmentedBar height={6} segments={segmentosBarra} />
              <div className="row" style={{ gap: 10, marginTop: 8, fontSize: 11.5, color: 'var(--muted)', flexWrap: 'wrap' }}>
                {topMateriales.map((r, i) => (
                  <span key={r.label}>
                    <span className="sdot" style={{ background: BARRA_COLORES[i], marginRight: 4 }} />
                    {r.label} {Math.round(r.valor / ingresoTotal * 100)}%
                  </span>
                ))}
                {otrosValor > 0 && (
                  <span>
                    <span className="sdot" style={{ background: 'var(--muted-2)', marginRight: 4 }} />
                    Otros {Math.round(otrosValor / ingresoTotal * 100)}%
                  </span>
                )}
              </div>
            </div>
            <button
              className="btn ghost sm"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setVerGanancias(true)}
            >
              <Coins size={13} />Ver ganancia por material
            </button>
          </div>
        </div>

        {/* Ambiental */}
        <div className="result-block env">
          <div className="top">
            <div className="label-row">
              <div className="iblock env"><Leaf size={16} /></div>
              <span className="pill env"><span className="dot" />Ambiental</span>
            </div>
          </div>
          <div className="body">
            <div>
              <div className="big num">
                {formatNum(env.plomoContenidoKg)} kg
                <span className="unit">plomo contenido · acumulado</span>
              </div>
              <div className="muted xs" style={{ marginTop: 6 }}>
                + {formatNum(env.mercurioContenidoMg)} mg de mercurio · ~{Math.round(env.plomoContenidoKg / totalJornadas)} kg Pb por jornada
              </div>
            </div>
            <div className="grid g-2" style={{ gap: 8 }}>
              <EnvTile
                label="Suelo protegido"
                value={`${formatNum(env.sueloProtegidoM3)} m³`}
                sub="vs. relleno común"
              />
              <EnvTile
                label="Agua protegida"
                value={`${formatNum(env.aguaProtegidaL)} m³`}
                sub="napas subterráneas"
              />
            </div>
            {op.jornadasCuello > 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--danger)', background: 'var(--danger-soft)', borderRadius: 'var(--r-2)', padding: '10px 14px', lineHeight: 1.5 }}>
                <b>Riesgo ambiental:</b> las {op.monitoresNoProcesados} unidades sin procesar por el cuello de botella contienen plomo y mercurio que pueden contaminar suelo y agua si no se gestionan correctamente. Ajustá las variables del turno para eliminar este riesgo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla detalle por tipo */}
      <div className="sec-row">
        <h2 className="sec">Detalle por tipo de monitor</h2>
        <div className="row"><span className="muted xs">Promedio por jornada y acumulado en las {totalJornadas} jornadas</span></div>
      </div>

      <div className="card tight" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>Tipo</th>
              <th className="right">Total {totalJornadas} j</th>
              <th className="right">Tiempo / jornada</th>
              <th className="right">Cobre</th>
              <th className="right">Aluminio</th>
              <th className="right">Plástico</th>
              <th className="right">Vidrio</th>
              <th>Peligroso</th>
            </tr>
          </thead>
          <tbody>
            {detallePorTipo.map((row) => {
              const abierto = expandido === row.tipo;
              return (
                <>
                  <tr
                    key={row.tipo}
                    className="row-hover"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandido(abierto ? null : row.tipo)}
                  >
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <div style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                          {abierto ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </div>
                        <div className="iblock" style={{ width: 28, height: 28 }}>
                          {row.tipo === 'CRT' ? <MonitorOld size={14} />
                           : row.tipo === 'LED' ? <MonitorThin size={14} />
                           : <Monitor size={14} />}
                        </div>
                        <b>{row.tipo}</b>
                      </div>
                    </td>
                    <td className="right num">{formatNum(row.unidadesTotal)}</td>
                    <td className="right num">{row.tiempoPromedioMin > 0 ? formatTime(row.tiempoPromedioMin) : '–'}</td>
                    <td className="right num">{Number(row.materiales.cobre).toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg</td>
                    <td className="right num">{Number(row.materiales.aluminio).toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg</td>
                    <td className="right num">{Number(row.materiales.plastico).toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg</td>
                    <td className="right num">{Number(row.materiales.vidrio).toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg</td>
                    <td>
                      {row.peligroso
                        ? <span className="pill warn">{row.peligroso.cantidad.toLocaleString('es-AR')} {row.peligroso.unidad} {row.peligroso.tipo}</span>
                        : <span className="pill success">sin peligroso</span>}
                    </td>
                  </tr>
                  {abierto && <FilaMateriales key={`${row.tipo}-det`} mat={row.materialesCompletos} />}
                </>
              );
            })}
            {/* Fila de totales */}
            <tr style={{ background: 'var(--surface-2)', fontWeight: 600 }}>
              <td>Total</td>
              <td className="right num">{formatNum(op.monitoresProcesados)}</td>
              <td className="right num">{formatTime(op.tiempoPromedioMin)}</td>
              <td className="right num">{formatNum(detallePorTipo.reduce((s, r) => s + r.materiales.cobre, 0))} kg</td>
              <td className="right num">{formatNum(detallePorTipo.reduce((s, r) => s + r.materiales.aluminio, 0))} kg</td>
              <td className="right num">{formatNum(detallePorTipo.reduce((s, r) => s + r.materiales.plastico, 0))} kg</td>
              <td className="right num">{formatNum(detallePorTipo.reduce((s, r) => s + r.materiales.vidrio, 0))} kg</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
      <div className="muted xs" style={{ marginTop: 8 }}>
        Hacé click en una fila para ver el desglose completo de materiales de ese tipo de monitor.
      </div>

      {/* Modal ganancia por material */}
      {verGanancias && (
        <div className="modal-backdrop" onClick={() => setVerGanancias(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Ganancia por material</h3>
                <div className="sub">
                  {totalJornadas} jornadas · ingreso bruto {formatMoneyM(ec.ingresoBrutoAcumulado)}
                </div>
              </div>
              <button className="modal-close" onClick={() => setVerGanancias(false)}>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
            <div className="modal-body">
              {todosMateriales.length > 0 ? (
                <table className="t" style={{ marginTop: 4 }}>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th className="right">Ganancia</th>
                      <th className="right">% del total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosMateriales.map((r, i) => (
                      <tr key={r.label}>
                        <td>
                          <div className="row" style={{ gap: 8 }}>
                            <span className="sdot" style={{ background: BARRA_COLORES[i] ?? 'var(--muted-2)', flexShrink: 0 }} />
                            {r.label}
                          </div>
                        </td>
                        <td className="right num">{formatMoney(r.valor)}</td>
                        <td className="right num" style={{ color: 'var(--muted)' }}>
                          {Math.round(r.valor / ingresoTotal * 100)}%
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--surface-2)', fontWeight: 600 }}>
                      <td>Total</td>
                      <td className="right num" style={{ color: 'var(--brand)' }}>
                        {formatMoneyM(ec.ingresoBrutoAcumulado)}
                      </td>
                      <td className="right num">100%</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="muted xs" style={{ padding: '24px 0', textAlign: 'center' }}>
                  Datos de ganancia por material no disponibles
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn secondary sm" onClick={() => setVerGanancias(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// VISTA: DETALLE (simulación guardada, read-only)
// ────────────────────────────────────────────────────────
export function DetailView({ sim }) {
  const navigate = useNavigate();
  const { config, resultadoOperativo: op, resultadoEconomico: ec, resultadoAmbiental: env, detallePorTipo } = sim;

  const totalJornadas = config.jornadasSimuladas;
  const pillVariant   = sim.veredictoCapacidad === 'HOLGADA' ? 'success'
                      : sim.veredictoCapacidad === 'CUELLO'  ? 'danger'
                      : 'warn';

  const maxUnidades = Math.max(...detallePorTipo.map(r => r.unidadesTotal));

  return (
    <div className="content wide page-enter">
      {/* Header */}
      <div className="row between" style={{ marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <h1 className="page">Simulación #{sim.id}</h1>
          <p className="lead">
            {totalJornadas} jornadas simuladas · {config.operarios} operarios × {config.horasTurno} hs ·
            $ {config.costoOperarioHora.toLocaleString('es-AR')}/h · ejecutada el {formatDateLong(sim.fechaEjecucion)} por Juan Pérez
          </p>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 24 }}>
        <span className={`pill ${pillVariant}`}>
          <span className="dot" />{veredictoLabel(sim.veredictoCapacidad)}
        </span>
        <span className="muted xs">
          Ejecutada {formatDateLong(sim.fechaEjecucion)} · semilla {sim.semilla} · sin cambios
        </span>
      </div>

      {/* 4 mini-cards */}
      <div className="grid g-4" style={{ marginBottom: 24 }}>
        <div className="card tight">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="pill op"><span className="dot" />Operativo</span>
          </div>
          <div className="stat">
            <div className="label">Tiempo prom. / jornada</div>
            <div className="value num">{formatTime(op.tiempoPromedioMin)}</div>
            <div className="delta">{op.jornadasCuello} de {totalJornadas} con cuello</div>
          </div>
        </div>
        <div className="card tight">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="pill econ"><span className="dot" />Económico</span>
          </div>
          <div className="stat">
            <div className="label">Ganancia acumulada</div>
            <div className="value num">
              {(ec.gananciaNetaAcumulada / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              <span className="unit">M</span>
            </div>
            <div className="delta">prom. {formatMoneyShort(ec.gananciaPromedioPorJornada)} / jornada</div>
          </div>
        </div>
        <div className="card tight">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="pill env"><span className="dot" />Ambiental · Pb</span>
          </div>
          <div className="stat">
            <div className="label">Plomo contenido</div>
            <div className="value num">{formatNum(env.plomoContenidoKg)}<span className="unit">kg</span></div>
            <div className="delta">{formatNum(env.sueloProtegidoM3)} m³ suelo protegido</div>
          </div>
        </div>
        <div className="card tight">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="pill env"><span className="dot" />Ambiental · Hg</span>
          </div>
          <div className="stat">
            <div className="label">Mercurio contenido</div>
            <div className="value num">{formatNum(env.mercurioContenidoMg)}<span className="unit">mg</span></div>
            <div className="delta">{formatNum(env.aguaProtegidaL)} m³ agua protegida</div>
          </div>
        </div>
      </div>

      <div className="sec-row">
        <h2 className="sec">Composición agregada de las {totalJornadas} jornadas</h2>
      </div>

      <div className="grid g-2" style={{ gap: 24 }}>
        {/* Distribución por tipo */}
        <div className="card tight">
          <h3 className="card" style={{ marginBottom: 14 }}>Distribución por tipo de monitor</h3>
          <BarList
            items={detallePorTipo.map(r => ({
              label: `${r.tipo} · ${formatNum(r.unidadesTotal)} unid.`,
              pct:   Math.round(r.unidadesTotal / maxUnidades * 100),
              value: `${formatTime(r.tiempoPromedioMin)} / j`,
            }))}
          />
          <hr className="div" />
          <MiniStat
            label="Total monitores procesados"
            value={`${formatNum(op.monitoresProcesados)} / ${formatNum(op.monitoresIngresados)}`}
          />
          <MiniStat
            label="Promedio por jornada"
            value={`${Math.round(op.monitoresProcesados / totalJornadas)} unidades`}
          />
          <MiniStat
            label="Sin procesar (acumulado)"
            value={`${op.monitoresNoProcesados} unidades`}
            valueStyle={op.monitoresNoProcesados > 0 ? { color: 'var(--warn)' } : {}}
            last
          />
        </div>

        {/* Materiales recuperables */}
        <div className="card tight">
          <h3 className="card" style={{ marginBottom: 14 }}>Materiales recuperables ({totalJornadas} j)</h3>
          <table className="t" style={{ fontSize: 13 }}>
            <tbody>
              {detallePorTipo.length > 0 && (() => {
                const totCobre    = detallePorTipo.reduce((s,r) => s + r.materiales.cobre, 0);
                const totAluminio = detallePorTipo.reduce((s,r) => s + r.materiales.aluminio, 0);
                const totPlastico = detallePorTipo.reduce((s,r) => s + r.materiales.plastico, 0);
                const totVidrio   = detallePorTipo.reduce((s,r) => s + r.materiales.vidrio, 0);
                // TODO: precios reales desde /api/prices
                const precios = { cobre: 8500, aluminio: 2300, plastico: 400, vidrio: 150 };
                const ingCobre    = totCobre    * precios.cobre;
                const ingAluminio = totAluminio * precios.aluminio;
                const ingPlastico = totPlastico * precios.plastico;
                const ingVidrio   = totVidrio   * precios.vidrio;
                const ingBruto    = ingCobre + ingAluminio + ingPlastico + ingVidrio;
                return (
                  <>
                    <tr><td>Cobre</td>     <td className="right num">{formatNum(totCobre)} kg</td>    <td className="right num muted">{formatMoneyShort(ingCobre)}</td></tr>
                    <tr><td>Aluminio</td>  <td className="right num">{formatNum(totAluminio)} kg</td> <td className="right num muted">{formatMoneyShort(ingAluminio)}</td></tr>
                    <tr><td>Plástico</td>  <td className="right num">{formatNum(totPlastico)} kg</td> <td className="right num muted">{formatMoneyShort(ingPlastico)}</td></tr>
                    <tr><td>Vidrio</td>    <td className="right num">{formatNum(totVidrio)} kg</td>   <td className="right num muted">{formatMoneyShort(ingVidrio)}</td></tr>
                    <tr style={{ fontWeight: 600 }}>
                      <td>Ingreso bruto</td><td></td>
                      <td className="right num">{formatMoneyM(ingBruto)}</td>
                    </tr>
                    <tr>
                      <td className="muted">Costo operativo</td><td></td>
                      <td className="right num muted">– {formatMoneyM(ec.costoOperativoAcumulado)}</td>
                    </tr>
                    <tr style={{ fontWeight: 600, background: 'var(--surface-2)' }}>
                      <td>Ganancia neta</td><td></td>
                      <td className="right num" style={{ color: 'var(--brand)' }}>{formatMoneyM(ec.gananciaNetaAcumulada)}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// COMPONENTE RAÍZ — elige qué vista mostrar
// ────────────────────────────────────────────────────────
export function SimulationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNueva = searchParams.get('nueva') === 'true';

  const { data: sim, loading } = useSimulation(id);
  const { save, loading: saving } = useSaveSimulation();
  const [guardada, setGuardada] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function handleSave() {
    setSaveError(null);
    try {
      await save(id);
      setGuardada(true);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="content wide" style={{ paddingTop: 48 }}>
        <div className="skeleton" style={{ height: 32, width: 280, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: 480, marginBottom: 32 }} />
        <div className="grid g-3" style={{ gap: 24 }}>
          {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 14 }} />)}
        </div>
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h1 className="page" style={{ textAlign: 'center' }}>Simulación no encontrada</h1>
        <p className="lead" style={{ textAlign: 'center' }}>No existe una simulación con ese ID.</p>
        <button className="btn secondary" onClick={() => navigate('/historial')}>
          Volver al historial
        </button>
      </div>
    );
  }

  if (isNueva || sim.estado === 'BORRADOR') {
    return <ResultsView sim={sim} onSave={handleSave} saving={saving} guardada={guardada} saveError={saveError} />;
  }

  return <DetailView sim={sim} />;
}
