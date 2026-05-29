// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE PRUEBA — reemplazar con respuestas reales de los endpoints
// cuando el backend de Spring Boot esté disponible.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/dashboard?periodo=mes-actual
export const mockDashboard = {
  usuario: { nombre: 'Juan', apellido: 'Pérez', rol: 'Responsable operativo' },
  fechaHoy: '2026-05-21',
  kpis: {
    monitoresProcesados:   { valor: 512,    unidad: 'u',   delta: '+12% vs. abril',  deltaDir: 'up' },
    gananciaNeta:          { valor: 2100000, unidad: 'M',  delta: '+8% vs. abril',   deltaDir: 'up' },
    plomoContenidoKg:      { valor: 186,    unidad: 'kg',  delta: '+22% vs. abril',  deltaDir: 'up' },
    utilizacionPromedio:   { valor: 68,     unidad: '%',   delta: 'turno de 8 hs',   deltaDir: null },
  },
  tendenciaGanancia: {
    pctCambio: '+8.2%',
    promediodiario: 142300,
    mejorJornada: { valor: 189200, fecha: '17/05' },
    margenPromedio: 0.63,
    // Puntos SVG: valores Y (0 = arriba, 50 = abajo en viewport 300×50)
    sparkPoints: [42, 38, 32, 34, 28, 30, 24, 20, 22, 18, 14, 18, 12, 16, 10, 8],
  },
};

// GET /api/simulations  (lista paginada)
export const mockSimulaciones = [
  {
    id: 143,
    fechaEjecucion: '2026-05-21T08:30:00Z',
    semilla: 4821,
    estado: 'BORRADOR',
    veredictoCapacidad: 'AJUSTADA',
    config: { operarios: 3, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 30 },
    resumen: { tiempoPromedio: 890, gananciaNeta: 4460000, plomoKg: 478 },
  },
  {
    id: 142,
    fechaEjecucion: '2026-05-20T07:10:00Z',
    semilla: 3810,
    estado: 'GUARDADA',
    veredictoCapacidad: 'HOLGADA',
    config: { operarios: 4, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 30 },
    resumen: { tiempoPromedio: 680, gananciaNeta: 4450000, plomoKg: 478 },
  },
  {
    id: 141,
    fechaEjecucion: '2026-05-19T06:32:00Z',
    semilla: 3127,
    estado: 'GUARDADA',
    veredictoCapacidad: 'AJUSTADA',
    config: { operarios: 3, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 20 },
    resumen: { tiempoPromedio: 940, gananciaNeta: 2640000, plomoKg: 312 },
  },
  {
    id: 140,
    fechaEjecucion: '2026-05-17T09:00:00Z',
    semilla: 9912,
    estado: 'GUARDADA',
    veredictoCapacidad: 'CUELLO',
    config: { operarios: 3, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 30 },
    resumen: { tiempoPromedio: 1350, gananciaNeta: 5680000, plomoKg: 624 },
  },
  {
    id: 139,
    fechaEjecucion: '2026-05-16T10:15:00Z',
    semilla: 7421,
    estado: 'GUARDADA',
    veredictoCapacidad: 'HOLGADA',
    config: { operarios: 4, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 30 },
    resumen: { tiempoPromedio: 1030, gananciaNeta: 4970000, plomoKg: 540 },
  },
  {
    id: 138,
    fechaEjecucion: '2026-05-15T08:00:00Z',
    semilla: 2218,
    estado: 'GUARDADA',
    veredictoCapacidad: 'HOLGADA',
    config: { operarios: 2, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 15 },
    resumen: { tiempoPromedio: 540, gananciaNeta: 1560000, plomoKg: 156 },
  },
  {
    id: 137,
    fechaEjecucion: '2026-05-14T07:30:00Z',
    semilla: 5541,
    estado: 'GUARDADA',
    veredictoCapacidad: 'AJUSTADA',
    config: { operarios: 3, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 30 },
    resumen: { tiempoPromedio: 900, gananciaNeta: 4760000, plomoKg: 510 },
  },
  {
    id: 136,
    fechaEjecucion: '2026-05-13T08:45:00Z',
    semilla: 1107,
    estado: 'GUARDADA',
    veredictoCapacidad: 'HOLGADA',
    config: { operarios: 3, horasTurno: 8, costoOperarioHora: 3200, jornadasSimuladas: 20 },
    resumen: { tiempoPromedio: 700, gananciaNeta: 2430000, plomoKg: 240 },
  },
];

// GET /api/simulations/143  (detalle completo — resultado recién ejecutado)
export const mockSimulacion143 = {
  id: 143,
  fechaEjecucion: '2026-05-21T08:30:00Z',
  semilla: 4821,
  estado: 'BORRADOR',
  veredictoCapacidad: 'AJUSTADA',
  config: {
    operarios: 3,
    horasTurno: 8,
    costoOperarioHora: 3200,
    jornadasSimuladas: 30,
  },
  resultadoOperativo: {
    tiempoPromedioMin: 890,
    tiempoMinMin: 560,
    tiempoMaxMin: 1570,
    utilizacionPromedio: 0.62,
    jornadasHolgadas: 8,
    jornadasAjustadas: 19,
    jornadasCuello: 3,
    monitoresIngresados: 1265,
    monitoresProcesados: 1247,
    monitoresNoProcesados: 18,
  },
  resultadoEconomico: {
    ingresoBrutoAcumulado: 6760000,
    costoOperativoAcumulado: 2300000,
    gananciaNetaAcumulada: 4460000,
    gananciaPromedioPorJornada: 148700,
    mejorJornada: 198000,
    peorJornada: 86000,
    margenPromedio: 0.65,
    ingresoPorMaterial: {
      cobre:    3718000,
      aluminio: 1690000,
      plastico:  878800,
      vidrio:    473200,
    },
  },
  resultadoAmbiental: {
    plomoContenidoKg:   478,
    plomoIngresadoKg:   485,
    mercurioContenidoMg: 2160,
    mercurioIngresadoMg: 2205,
    sueloProtegidoM3:   1430,
    aguaProtegidaL:     35900,
  },
  detallePorTipo: [
    {
      tipo: 'CRT',
      unidadesPromedioPorJornada: 8,
      unidadesDesvio: 2,
      unidadesTotal: 242,
      tiempoPromedioMin: 202,
      materiales: { cobre: 72.6, aluminio: 48.4, plastico: 363, vidrio: 726 },
      peligroso: { tipo: 'Pb', cantidad: 478, unidad: 'kg' },
    },
    {
      tipo: 'LCD',
      unidadesPromedioPorJornada: 18,
      unidadesDesvio: 4,
      unidadesTotal: 540,
      tiempoPromedioMin: 270,
      materiales: { cobre: 108, aluminio: 162, plastico: 432, vidrio: 270 },
      peligroso: { tipo: 'Hg', cantidad: 2160, unidad: 'mg' },
    },
    {
      tipo: 'LED',
      unidadesPromedioPorJornada: 16,
      unidadesDesvio: 3,
      unidadesTotal: 465,
      tiempoPromedioMin: 155,
      materiales: { cobre: 93, aluminio: 232, plastico: 279, vidrio: 140 },
      peligroso: null,
    },
  ],
};

// GET /api/simulations/141  (simulación guardada — vista detalle)
export const mockSimulacion141 = {
  id: 141,
  fechaEjecucion: '2026-05-19T06:32:00Z',
  semilla: 3127,
  estado: 'GUARDADA',
  veredictoCapacidad: 'AJUSTADA',
  config: {
    operarios: 3,
    horasTurno: 8,
    costoOperarioHora: 3200,
    jornadasSimuladas: 20,
  },
  resultadoOperativo: {
    tiempoPromedioMin: 940,
    tiempoMinMin: 600,
    tiempoMaxMin: 1420,
    utilizacionPromedio: 0.65,
    jornadasHolgadas: 6,
    jornadasAjustadas: 12,
    jornadasCuello: 2,
    monitoresIngresados: 845,
    monitoresProcesados: 832,
    monitoresNoProcesados: 13,
  },
  resultadoEconomico: {
    ingresoBrutoAcumulado: 4490000,
    costoOperativoAcumulado: 1540000,
    gananciaNetaAcumulada: 2640000,
    gananciaPromedioPorJornada: 132000,
    mejorJornada: 178000,
    peorJornada: 74000,
    margenPromedio: 0.59,
    ingresoPorMaterial: {
      cobre:    1820000,
      aluminio:  950000,
      plastico:  530000,
      vidrio:    330000,
    },
  },
  resultadoAmbiental: {
    plomoContenidoKg:    312,
    plomoIngresadoKg:    318,
    mercurioContenidoMg: 1404,
    mercurioIngresadoMg: 1440,
    sueloProtegidoM3:     936,
    aguaProtegidaL:      23400,
  },
  detallePorTipo: [
    {
      tipo: 'CRT',
      unidadesPromedioPorJornada: 8,
      unidadesDesvio: 2,
      unidadesTotal: 156,
      tiempoPromedioMin: 195,
      materiales: { cobre: 46.8, aluminio: 31.2, plastico: 234, vidrio: 468 },
      peligroso: { tipo: 'Pb', cantidad: 312, unidad: 'kg' },
    },
    {
      tipo: 'LCD',
      unidadesPromedioPorJornada: 18,
      unidadesDesvio: 4,
      unidadesTotal: 364,
      tiempoPromedioMin: 272,
      materiales: { cobre: 72.8, aluminio: 109.2, plastico: 291.2, vidrio: 182 },
      peligroso: { tipo: 'Hg', cantidad: 1404, unidad: 'mg' },
    },
    {
      tipo: 'LED',
      unidadesPromedioPorJornada: 16,
      unidadesDesvio: 3,
      unidadesTotal: 312,
      tiempoPromedioMin: 156,
      materiales: { cobre: 62.4, aluminio: 156, plastico: 187.2, vidrio: 93.6 },
      peligroso: null,
    },
  ],
};

// GET /api/prices
export const mockPrecios = {
  cobre:    8500,
  aluminio: 2300,
  plastico:  400,
  vidrio:    150,
  ultimaActualizacion: '2026-05-18',
};

// GET /api/prices/history
export const mockHistorialPrecios = [
  { fecha: '2026-05-18', material: 'Cobre',    valorAnterior: 8200, valorNuevo: 8500, modificadoPor: 'Juan Pérez' },
  { fecha: '2026-05-12', material: 'Aluminio',  valorAnterior: 2100, valorNuevo: 2300, modificadoPor: 'Juan Pérez' },
  { fecha: '2026-05-02', material: 'Plástico',  valorAnterior:  380, valorNuevo:  400, modificadoPor: 'Juan Pérez' },
];

// GET /api/center
export const mockCentro = {
  nombre:     'Centro Norte de Reciclaje RAEE',
  cuit:       '30-71234567-8',
  direccion:  'Av. Industrial 1200, Pacheco',
  responsable:'Juan Pérez',
  tiempos: { crt: 25, lcd: 15, led: 10 },
};
