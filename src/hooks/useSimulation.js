import { useState, useEffect } from 'react';
import { mockSimulacion141 } from '../data/mockData';
import { ejecutarSimulacion } from '../api/simulacion';
import { guardarSimulacion } from '../api/historial';
import { HISTORIAL_EVENT } from './useSimulations';

const SESSION_KEY = 'sim_borrador';

export function useSimulation(id) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    // Borrador recién ejecutado — está en sessionStorage
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (String(parsed.id) === String(id)) {
          setData(parsed);
          setLoading(false);
          return;
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    // TODO: GET /api/simulations/:id cuando el endpoint esté listo
    const t = setTimeout(() => {
      setData(mockSimulacion141);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [id]);

  return { data, loading, error };
}

export function useSaveSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const save = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) throw new Error('No hay simulación en borrador para guardar');
      const parsed = JSON.parse(stored);
      await guardarSimulacion({ parametros: parsed._params, resultado: parsed._raw });
      // Marcamos como guardada en sessionStorage
      parsed.estado = 'GUARDADA';
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
      // Notificamos al historial para que se actualice
      window.dispatchEvent(new Event(HISTORIAL_EVENT));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { save, loading, error };
}

export function useCreateSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const create = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const sim = await ejecutarSimulacion(params);
      sim._params = {
        operarios:         params.operarios,
        horasTurno:        parseFloat(params.horasTurno),
        costoOperarioHora: params.costoOperarioHora,
        jornadasASimular:  params.jornadasASimular,
      };
      // Persiste en sessionStorage para que useSimulation lo lea sin GET
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sim));
      return { id: sim.id };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
