import { useEffect, useRef, useState } from "react";

/**
 * Brief, fake loading pulse when `deps` change (e.g. campaign or date range
 * switch) — skipped on first mount so the initial page load stays instant.
 */
export function useSimulatedLoading(deps: unknown[], duration = 450): boolean {
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), duration);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
