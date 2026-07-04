import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for polling data at a specified interval.
 * Simulates real-time updates by refetching data periodically.
 *
 * @param {Function} fetchFn - The function to call on each interval
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms)
 * @param {boolean} enabled - Whether polling is active
 */
export function usePolling(fetchFn, interval = 30000, enabled = true) {
  const savedCallback = useRef(fetchFn);
  const intervalRef = useRef(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}

export default usePolling;
