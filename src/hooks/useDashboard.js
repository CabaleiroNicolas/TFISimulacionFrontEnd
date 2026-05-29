import { useState, useEffect } from 'react';
import { mockDashboard } from '../data/mockData';

// TODO: reemplazar con → GET /api/dashboard?periodo=mes-actual
// usando TanStack Query: useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard') })
export function useDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula latencia de red
    const t = setTimeout(() => {
      setData(mockDashboard);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return { data, loading };
}
