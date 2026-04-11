import { useEffect } from 'react';
import { useQueueContext } from '../context/QueueContext';

/**
 * Returns the live queue array and a refresh function.
 *
 * @param {number|null} pollInterval - if set, re-fetches every N milliseconds.
 *                                     Pass 10000 on the public page for auto-refresh.
 */
export function useQueue(pollInterval = null) {
  const { queue, loading, error, refresh } = useQueueContext();

  // Fetch on first mount
  useEffect(() => {
    refresh();
  }, []);

  // Optional polling
  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, refresh]);

  return { queue, loading, error, refresh };
}