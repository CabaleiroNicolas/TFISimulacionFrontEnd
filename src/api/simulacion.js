const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:8080';

// Convierte horas double → minutos enteros para que los formatters existentes funcionen igual
function horasAMinutos(horas) {
  return Math.round(horas * 60);
}

// Determina veredicto de capacidad a partir de los conteos de jornadas
function calcVeredicto(cuello, ajustadas, holgadas) {
  if (cuello > 0 && cuello >= holgadas) return 'CUELLO';
  if (ajustadas >= holgadas)            return 'AJUSTADA';
  return 'HOLGADA';
}

// Suma de todos los materiales recuperables de un tipo (sin peligrosos)
function materialesRecuperables(mat) {
  return {
    cobre:    mat.kgCobreTotalCRT    ?? mat.kgCobreTotalLCD    ?? mat.kgCobreTotalLED    ?? 0,
    aluminio: mat.kgAluminioTotalCRT ?? mat.kgAluminioTotalLCD ?? mat.kgAluminioTotalLED ?? 0,
    plastico: (mat.kgPlastABSTotalCRT ?? mat.kgPlastABSTotalLCD ?? mat.kgPlastABSTotalLED ?? 0)
            + (mat.kgPlastPCTotalCRT  ?? mat.kgPlastPCTotalLCD  ?? mat.kgPlastPCTotalLED  ?? 0),
    vidrio:   mat.kgVidrioPanelTotalCRT ?? mat.kgVidrioPanelTotalLCD ?? mat.kgVidrioPanelTotalLED ?? 0,
    acero:    mat.kgAceroTotalCRT    ?? mat.kgAceroTotalLCD    ?? mat.kgAceroTotalLED    ?? 0,
    placasPCB:mat.kgPlacasPCBTotalCRT ?? mat.kgPlacasPCBTotalLCD ?? mat.kgPlacasPCBTotalLED ?? 0,
    oro:      (mat.grOroTotalCRT     ?? mat.grOroTotalLCD     ?? mat.grOroTotalLED     ?? 0) / 1000,  // gr → kg
    plata:    (mat.grPlataTotalCRT   ?? mat.grPlataTotalLCD   ?? mat.grPlataTotalLED   ?? 0) / 1000,
    paladio:  (mat.grPaladioTotalCRT ?? mat.grPaladioTotalLCD ?? mat.grPaladioTotalLED ?? 0) / 1000,
    estanio:  (mat.grEstanioTotalCRT ?? mat.grEstanioTotalLCD ?? mat.grEstanioTotalLED ?? 0) / 1000,
  };
}

// Construye el objeto de materiales de cada tipo con sus campos específicos
function buildMaterialesCRT(m) {
  return {
    // recuperables (kg)
    cobre:     m.kgCobreTotalCRT,
    aluminio:  m.kgAluminioTotalCRT,
    plasticoABS: m.kgPlastABSTotalCRT,
    plasticoPC:  m.kgPlastPCTotalCRT,
    vidrio:    m.kgVidrioPanelTotalCRT,
    acero:     m.kgAceroTotalCRT,
    placasPCB: m.kgPlacasPCBTotalCRT,
    // metales preciosos (gr)
    oro:       m.grOroTotalCRT,
    plata:     m.grPlataTotalCRT,
    paladio:   m.grPaladioTotalCRT,
    niquel:    m.grNiquelTotalCRT,
    estanio:   m.grEstanioTotalCRT,
    // peligrosos
    plomo:     m.grsPlomoTotalCRT,      // gr
    mercurio:  m.mgsMercurioTotalCRT,   // mg
    cadmio:    m.grsCadmioTotalCRT,     // gr
    bfr:       m.grsBFRTotalCRT,        // gr
  };
}

function buildMaterialesLCD(m) {
  return {
    cobre:     m.kgCobreTotalLCD,
    aluminio:  m.kgAluminioTotalLCD,
    plasticoABS: m.kgPlastABSTotalLCD,
    plasticoPC:  m.kgPlastPCTotalLCD,
    vidrio:    m.kgVidrioPanelTotalLCD,
    acero:     m.kgAceroTotalLCD,
    placasPCB: m.kgPlacasPCBTotalLCD,
    oro:       m.grOroTotalLCD,
    plata:     m.grPlataTotalLCD,
    paladio:   m.grPaladioTotalLCD,
    estanio:   m.grEstanioTotalLCD,
    lc:        m.grLCTotalLCD,          // gr
    indio:     m.grIndioTotalLCD,       // gr
    // peligrosos
    plomo:     m.grsPlomoTotalLCD,
    mercurio:  m.mgsMercurioTotalLCD,
    cadmio:    m.grsCadmioTotalLCD,
    bfr:       m.grsBFRTotalLCD,
  };
}

function buildMaterialesLED(m) {
  return {
    cobre:     m.kgCobreTotalLED,
    aluminio:  m.kgAluminioTotalLED,
    plasticoABS: m.kgPlastABSTotalLED,
    plasticoPC:  m.kgPlastPCTotalLED,
    vidrio:    m.kgVidrioPanelTotalLED,
    acero:     m.kgAceroTotalLED,
    placasPCB: m.kgPlacasPCBTotalLED,
    oro:       m.grOroTotalLED,
    plata:     m.grPlataTotalLED,
    paladio:   m.grPaladioTotalLED,
    estanio:   m.grEstanioTotalLED,
    lc:        m.grLCTotalLED,
    indio:     m.grIndioTotalLED,
    tirasLed:  m.grTirasLedTotalLED,   // gr
    // peligrosos (LED no tiene Hg ni Pb significativo pero sí puede venir del backend)
    plomo:     m.grsPlomoTotalLED ?? 0,
    bfr:       m.grsBFRTotalLED,
  };
}

// Adapta la respuesta plana del backend al formato que consumen los componentes
export function adaptarRespuesta(raw, params) {
  const { operarios, horasTurno, costoOperarioHora, jornadasASimular } = params;

  const tiempoTotalMin       = horasAMinutos(raw.tiempoTotal);
  const tiempoPromedioMin    = Math.round(tiempoTotalMin / jornadasASimular);
  const capacidadTurnoMin    = operarios * horasTurno * 60;
  const utilizacionPromedio  = Math.min(tiempoPromedioMin / capacidadTurnoMin, 1);

  const monitoresProcesados  = raw.cantFinalCRT + raw.cantFinalLCD + raw.cantFinalLED;
  const monitoresIngresados  = monitoresProcesados + raw.cantMonitoresSinProcesar;

  const gananciaNet = raw.gananicaMaterialesTotal - raw.costoOperativoTotal;
  const veredicto   = calcVeredicto(raw.cantJornadasCuello, raw.cantJornadasAjustadas, raw.cantJornadasHolgadas);

  // Plomo: CRT tiene en gr, LED también — sumamos y convertimos a kg
  const plomoTotalGr = (raw.materialesCRT?.grsPlomoTotalCRT ?? 0)
                     + (raw.materialesLCD?.grsPlomoTotalLCD ?? 0)
                     + (raw.materialesLED?.grsPlomoTotalLED ?? 0);
  const plomoKg      = plomoTotalGr / 1000;

  // Mercurio total en mg
  const mercurioTotalMg = (raw.materialesCRT?.mgsMercurioTotalCRT ?? 0)
                        + (raw.materialesLCD?.mgsMercurioTotalLCD ?? 0);

  // Ingreso por material principal (para SegmentedBar)
  const g = raw.gananciasMateriales ?? {};
  const ingresoVidrio  = (g.gananciaKgVidrioPanelCRT ?? 0) + (g.gananciaKgVidrioPanelLCDLED ?? 0);
  const ingresoPlastico= (g.gananciaKgPlastABS ?? 0) + (g.gananciaKgPlastPC ?? 0);
  const ingresoCobre   = g.gananciaKgCobre   ?? 0;
  const ingresoAluminio= g.gananciaKgAluminio ?? 0;

  // detallePorTipo — una fila por tipo de monitor
  const detallePorTipo = [
    {
      tipo: 'CRT',
      unidadesTotal: raw.cantFinalCRT,
      unidadesPromedioPorJornada: Math.round(raw.cantFinalCRT / jornadasASimular),
      unidadesDesvio: 0,
      tiempoPromedioMin: 0,   // backend no desglosado por tipo por ahora
      materiales: {
        cobre:    raw.materialesCRT?.kgCobreTotalCRT    ?? 0,
        aluminio: raw.materialesCRT?.kgAluminioTotalCRT ?? 0,
        plastico: (raw.materialesCRT?.kgPlastABSTotalCRT ?? 0) + (raw.materialesCRT?.kgPlastPCTotalCRT ?? 0),
        vidrio:   raw.materialesCRT?.kgVidrioPanelTotalCRT ?? 0,
      },
      peligroso: (() => {
        const m = raw.materialesCRT ?? {};
        const candidatos = [
          { tipo: 'Pb',  gramos: m.grsPlomoTotalCRT   ?? 0, cantidad: Math.round(((m.grsPlomoTotalCRT ?? 0)) / 1000 * 100) / 100, unidad: 'kg' },
          { tipo: 'Hg',  gramos: (m.mgsMercurioTotalCRT ?? 0) / 1000,    cantidad: Math.round((m.mgsMercurioTotalCRT ?? 0) * 10) / 10,                    unidad: 'mg' },
          { tipo: 'Cd',  gramos: m.grsCadmioTotalCRT    ?? 0,             cantidad: Math.round((m.grsCadmioTotalCRT ?? 0) * 100) / 100,                    unidad: 'gr' },
          { tipo: 'BFR', gramos: m.grsBFRTotalCRT       ?? 0,             cantidad: Math.round((m.grsBFRTotalCRT ?? 0) * 100) / 100,                       unidad: 'gr' },
        ].filter(c => c.gramos > 0);
        if (!candidatos.length) return null;
        const max = candidatos.reduce((a, b) => a.gramos >= b.gramos ? a : b);
        return { tipo: max.tipo, cantidad: max.cantidad, unidad: max.unidad };
      })(),
      materialesCompletos: raw.materialesCRT ? buildMaterialesCRT(raw.materialesCRT) : null,
    },
    {
      tipo: 'LCD',
      unidadesTotal: raw.cantFinalLCD,
      unidadesPromedioPorJornada: Math.round(raw.cantFinalLCD / jornadasASimular),
      unidadesDesvio: 0,
      tiempoPromedioMin: 0,
      materiales: {
        cobre:    raw.materialesLCD?.kgCobreTotalLCD    ?? 0,
        aluminio: raw.materialesLCD?.kgAluminioTotalLCD ?? 0,
        plastico: (raw.materialesLCD?.kgPlastABSTotalLCD ?? 0) + (raw.materialesLCD?.kgPlastPCTotalLCD ?? 0),
        vidrio:   raw.materialesLCD?.kgVidrioPanelTotalLCD ?? 0,
      },
      peligroso: (() => {
        const m = raw.materialesLCD ?? {};
        const candidatos = [
          { tipo: 'Pb',  gramos: m.grsPlomoTotalLCD   ?? 0, cantidad: Math.round((m.grsPlomoTotalLCD ?? 0) / 1000 * 100) / 100, unidad: 'kg' },
          { tipo: 'Hg',  gramos: (m.mgsMercurioTotalLCD ?? 0) / 1000,    cantidad: Math.round((m.mgsMercurioTotalLCD ?? 0) * 10) / 10,                    unidad: 'mg' },
          { tipo: 'Cd',  gramos: m.grsCadmioTotalLCD    ?? 0,             cantidad: Math.round((m.grsCadmioTotalLCD ?? 0) * 100) / 100,                    unidad: 'gr' },
          { tipo: 'BFR', gramos: m.grsBFRTotalLCD       ?? 0,             cantidad: Math.round((m.grsBFRTotalLCD ?? 0) * 100) / 100,                       unidad: 'gr' },
        ].filter(c => c.gramos > 0);
        if (!candidatos.length) return null;
        const max = candidatos.reduce((a, b) => a.gramos >= b.gramos ? a : b);
        return { tipo: max.tipo, cantidad: max.cantidad, unidad: max.unidad };
      })(),
      materialesCompletos: raw.materialesLCD ? buildMaterialesLCD(raw.materialesLCD) : null,
    },
    {
      tipo: 'LED',
      unidadesTotal: raw.cantFinalLED,
      unidadesPromedioPorJornada: Math.round(raw.cantFinalLED / jornadasASimular),
      unidadesDesvio: 0,
      tiempoPromedioMin: 0,
      materiales: {
        cobre:    raw.materialesLED?.kgCobreTotalLED    ?? 0,
        aluminio: raw.materialesLED?.kgAluminioTotalLED ?? 0,
        plastico: (raw.materialesLED?.kgPlastABSTotalLED ?? 0) + (raw.materialesLED?.kgPlastPCTotalLED ?? 0),
        vidrio:   raw.materialesLED?.kgVidrioPanelTotalLED ?? 0,
      },
      peligroso: (() => {
        const m = raw.materialesLED ?? {};
        const candidatos = [
          { tipo: 'Pb',  gramos: m.grsPlomoTotalLED ?? 0, cantidad: Math.round((m.grsPlomoTotalLED ?? 0) / 1000 * 100) / 100, unidad: 'kg' },
          { tipo: 'BFR', gramos: m.grsBFRTotalLED ?? 0,                 cantidad: Math.round((m.grsBFRTotalLED ?? 0) * 100) / 100,                       unidad: 'gr' },
        ].filter(c => c.gramos > 0);
        if (!candidatos.length) return null;
        const max = candidatos.reduce((a, b) => a.gramos >= b.gramos ? a : b);
        return { tipo: max.tipo, cantidad: max.cantidad, unidad: max.unidad };
      })(),
      materialesCompletos: raw.materialesLED ? buildMaterialesLED(raw.materialesLED) : null,
    },
  ];

  return {
    id: Date.now(),           // el backend no devuelve id todavía
    fechaEjecucion: new Date().toISOString(),
    semilla: null,
    estado: 'BORRADOR',
    veredictoCapacidad: veredicto,
    config: {
      operarios,
      horasTurno,
      costoOperarioHora,
      jornadasSimuladas: jornadasASimular,
    },
    resultadoOperativo: {
      tiempoPromedioMin,
      tiempoMinMin: 0,
      tiempoMaxMin: 0,
      utilizacionPromedio,
      jornadasHolgadas:  raw.cantJornadasHolgadas,
      jornadasAjustadas: raw.cantJornadasAjustadas,
      jornadasCuello:    raw.cantJornadasCuello,
      monitoresIngresados,
      monitoresProcesados,
      monitoresNoProcesados: raw.cantMonitoresSinProcesar,
    },
    resultadoEconomico: {
      ingresoBrutoAcumulado:      raw.gananicaMaterialesTotal,
      costoOperativoAcumulado:    raw.costoOperativoTotal,
      gananciaNetaAcumulada:      gananciaNet,
      gananciaPromedioPorJornada: gananciaNet / jornadasASimular,
      mejorJornada: 0,
      peorJornada:  0,
      margenPromedio: raw.gananicaMaterialesTotal > 0
        ? gananciaNet / raw.gananicaMaterialesTotal
        : 0,
      ingresoPorMaterial: {
        cobre:    ingresoCobre,
        aluminio: ingresoAluminio,
        plastico: ingresoPlastico,
        vidrio:   ingresoVidrio,
      },
      gananciasMateriales: raw.gananciasMateriales ?? {},
    },
    resultadoAmbiental: {
      plomoContenidoKg:    plomoKg,
      plomoIngresadoKg:    plomoKg,   // backend no separa ingresado vs. contenido todavía
      mercurioContenidoMg: mercurioTotalMg,
      mercurioIngresadoMg: mercurioTotalMg,
      sueloProtegidoM3:    Math.round(plomoKg * 2.9),   // estimación: 1 kg Pb contamina ~2.9 m³
      aguaProtegidaL:      Math.round(mercurioTotalMg * 16.6), // estimación: 1 mg Hg contamina ~16.6 L
    },
    detallePorTipo,
    // datos crudos del backend disponibles para vistas futuras
    _raw: raw,
  };
}

export async function ejecutarSimulacion(params) {
  const body = {
    operarios:         params.operarios,
    horasTurno:        parseFloat(params.horasTurno),
    costoOperarioHora: params.costoOperarioHora,
    jornadasASimular:  params.jornadasASimular,
  };

  const res = await fetch(`${API_HOST}/api/simulacion/ejecutar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${text}`);
  }

  const raw = await res.json();
  return adaptarRespuesta(raw, params);
}
