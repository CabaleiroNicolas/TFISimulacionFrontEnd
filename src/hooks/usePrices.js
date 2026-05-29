import { useState, useEffect, useCallback } from 'react';
import { getPrecios, updatePrecios } from '../api/precios';

export function usePrices() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const precios = await getPrecios();
      setData(precios);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}


export function useUpdatePrices() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Devuelve el DTO actualizado para que la página lo use directamente
  const update = async (precios) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updatePrecios(precios);
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
