import { useState } from 'react';
import { getCarByPhone, getQueue } from '../api/cars';

export function useCarStatus() {
  const [car, setCar]     = useState(null);
  const [error, setError] = useState('');

  function lookup(phone) {
    setError('');
    setCar(null);
    if (!phone.trim()) { setError('Please enter a phone number.'); return; }
    const found = getCarByPhone(phone);
    if (!found) { setError('No car found with that phone number.'); return; }
    const queue = getQueue();
    const position = queue.findIndex(c => c.id === found.id);
    setCar({ ...found, position });
  }

  return { car, error, lookup };
}