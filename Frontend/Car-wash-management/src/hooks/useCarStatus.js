import { useState } from 'react';
import { getCarByPhone, getQueue } from '../api/cars';

export function useCarStatus() {
  const [car, setCar]       = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(phone) {
    setError('');
    setCar(null);
    if (!phone.trim()) {
      setError('Please enter a phone number.');
      return;
    }

    setLoading(true);
    try {
      // Fetch the car and the current queue in parallel
      const [found, queueData] = await Promise.all([
        getCarByPhone(phone.trim()),
        getQueue(),
      ]);

      const queue    = queueData.queue ?? [];
      const position = queue.findIndex(c => c.id === found.id);

      setCar({ ...found, position });
    } catch (err) {
      // Spring Boot returns 404 with a message when phone not found
      setError(err.message || 'No car found with that phone number.');
    } finally {
      setLoading(false);
    }
  }

  return { car, error, loading, lookup };
}