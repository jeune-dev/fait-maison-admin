import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export default function usePageData(fetcher, errorMessage = 'Erreur lors du chargement') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetcher, errorMessage]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
