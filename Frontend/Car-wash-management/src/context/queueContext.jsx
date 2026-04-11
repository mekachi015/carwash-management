import { createContext, useContext, useState, useCallback } from 'react';
import { getQueue, getAllCars, getTodayCars } from '../api/cars';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queue, setQueue]       = useState(() => getQueue());
  const [allCars, setAllCars]   = useState(() => getAllCars());
  const [todayCars, setTodayCars] = useState(() => getTodayCars());

  const refresh = useCallback(() => {
    setQueue(getQueue());
    setAllCars(getAllCars());
    setTodayCars(getTodayCars());
  }, []);

  return (
    <QueueContext.Provider value={{ queue, allCars, todayCars, refresh }}>
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