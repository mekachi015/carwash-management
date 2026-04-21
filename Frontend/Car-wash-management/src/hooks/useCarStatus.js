import { useState, useEffect, useRef } from 'react';
import { getCarByPhone, getCarById, getQueue } from '../api/cars';

export function useCarStatus() {
  const [car, setCar]         = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef               = useRef(null);

  // Clear polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  function startPolling(id) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const [found, queueData] = await Promise.all([
          getCarById(id),
          getQueue(),
        ]);
        const queue    = queueData.queue ?? [];
        const position = queue.findIndex(c => c.id === found.id);
        setCar({ ...found, position });

        // Stop polling once done and paid — nothing left to update
        if (found.status === 'DONE' && found.paid) {
          clearInterval(pollRef.current);
        }
      } catch {
        // Silent fail on poll — don't clear the existing car data
      }
    }, 8000); // refresh every 8 seconds
  }

  async function lookup(phone) {
    setError('');
    setCar(null);
    if (!phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }
    setLoading(true);
    try {
      const [found, queueData] = await Promise.all([
        getCarByPhone(phone.trim()),
        getQueue(),
      ]);
      const queue    = queueData.queue ?? [];
      const position = queue.findIndex(c => c.id === found.id);
      setCar({ ...found, position });
      startPolling(found.id); // ← start polling by id
    } catch (err) {
      setError(err.message || 'No car found with that phone number.');
    } finally {
      setLoading(false);
    }
  }

  async function lookupById(id) {
    setError('');
    setCar(null);
    setLoading(true);
    try {
      const [found, queueData] = await Promise.all([
        getCarById(id),
        getQueue(),
      ]);
      const queue    = queueData.queue ?? [];
      const position = queue.findIndex(c => c.id === found.id);
      setCar({ ...found, position });
      startPolling(id); // ← start polling
    } catch (err) {
      setError(err.message || 'Could not load car details.');
    } finally {
      setLoading(false);
    }
  }

  return { car, error, loading, lookup, lookupById };
}