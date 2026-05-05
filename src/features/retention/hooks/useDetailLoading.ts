import { useEffect, useState } from "react";

/**
 * Brief loading state when switching accounts (simulates fetching the full
 * risk profile + signals + recommended action). Re-triggers on every key change.
 */
export function useDetailLoading(key: string | null, ms = 500) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!key) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return loading;
}
