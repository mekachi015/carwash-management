import { useEffect } from 'react';
import { useQueueContext } from '../context/QueueContext';

export function useQueue(pollInterval = null) {
  const { queue, refresh } = useQueueContext();

  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, refresh]);

  return { queue, refresh };
}