import { adaptarRespuesta } from './simulacion';

const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:8080';

export async function getHistorial() {
  const res = await fetch(`${API_HOST}/api/simulacion/historial`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  // Cada item: { fecha, simulacion: { parametros, resultado } }
  return json.map(item => {
    const { parametros, resultado } = item.simulacion;
    const params = {
      operarios:         parametros.operarios,
      horasTurno:        parametros.horasTurno,
      costoOperarioHora: parametros.costoOperarioHora,
      jornadasASimular:  parametros.jornadasASimular,
    };
    const sim = adaptarRespuesta(resultado, params);
    return {
      ...sim,
      fechaEjecucion: item.fecha,
      estado:         'GUARDADA',
      _raw:           resultado,
      _params:        parametros,
    };
  });
}

export async function guardarSimulacion({ parametros, resultado }) {
  const res = await fetch(`${API_HOST}/api/simulacion/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parametros, resultado }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return true;
}
