import { useState, useEffect, useCallback } from 'react';
import { getHistorial } from '../api/historial';

export const HISTORIAL_EVENT = 'historial:updated';

export function useSimulations() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getHistorial()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(HISTORIAL_EVENT, load);
    return () => window.removeEventListener(HISTORIAL_EVENT, load);
  }, [load]);

  return { data, loading, error };
}
