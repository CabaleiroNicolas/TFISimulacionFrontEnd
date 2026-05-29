import { useState, useEffect, useCallback } from 'react';
import { getCentro, updateCentro } from '../api/centro';

const CENTRO_EVENT = 'centro:updated';

export function useCenter() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getCentro()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(CENTRO_EVENT, load);
    return () => window.removeEventListener(CENTRO_EVENT, load);
  }, [load]);

  return { data, loading, error };
}

export function useUpdateCenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const update = async (centro) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCentro(centro);
      window.dispatchEvent(new Event(CENTRO_EVENT));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
