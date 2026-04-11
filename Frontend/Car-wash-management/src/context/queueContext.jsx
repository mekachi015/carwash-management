import { createContext, useContext, useState, useCallback } from 'react';
import { getQueue, getAllCars } from '../api/cars';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queue, setQueue]         = useState([]);
  const [allCars, setAllCars]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  /**
   * Re-fetches queue and all cars from the Spring Boot API.
   * Call this after any mutation (add, update, delete, pay).
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both in parallel
      const [queueData, carsData] = await Promise.all([
        getQueue(),
        getAllCars(),
      ]);
      // Spring Boot returns { queue: [...], totalWaiting, ... } for /api/queue
      setQueue(queueData.queue ?? []);
      setAllCars(carsData);
    } catch (err) {
      console.error('[QueueContext] refresh failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <QueueContext.Provider value={{ queue, allCars, loading, error, refresh }}>
      {children}
    </QueueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQueueContext() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueueContext must be used within QueueProvider');
  return ctx;
}