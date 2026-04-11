import { useState } from 'react';
import { updateCarStatus, deleteCar } from '../api/cars';
import { StatusBadge } from './StatusBadge';
import { WhatsAppNotification } from './WhatsAppNotification';

// Spring Boot uses uppercase enum values
const STATUSES = ['WAITING', 'WASHING', 'RINSING', 'DRYING', 'DONE'];

// Display labels for the dropdown
const STATUS_LABELS = {
  WAITING: 'Waiting',
  WASHING: 'Washing',
  RINSING: 'Rinsing',
  DRYING:  'Drying',
  DONE:    'Done',
};

const SERVICE_PRICES = { basic: 10, deluxe: 20 };

export function CarCard({ car, position, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(car.status);
  const [waMessage, setWaMessage]           = useState('');
  const [loading, setLoading]               = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      await updateCarStatus(car.id, selectedStatus);

      if (selectedStatus === 'WASHING') {
        setWaMessage(`Your car is now being washed, ${car.customerName}! Est. completion in 5 mins.`);
      } else if (selectedStatus === 'DONE') {
        setWaMessage(`Great news, ${car.customerName}! Your car is ready for collection. 🚗`);
      }

      await onUpdate();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Remove this car from the queue?')) return;
    setLoading(true);
    try {
      await deleteCar(car.id);
      await onUpdate();
    } catch (err) {
      alert('Failed to delete car: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-sm" style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="position-badge">{position}</span>
            <strong>{car.customerName}</strong>
            <span className={car.paid ? 'tag-paid' : 'tag-unpaid'}>
              {car.paid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            {car.phoneNumber}
            {car.licensePlate ? ` · ${car.licensePlate}` : ''}
            {' · '}
            <span style={{ textTransform: 'capitalize' }}>{car.serviceType}</span>
            {' — $'}{SERVICE_PRICES[car.serviceType] ?? '?'}
          </div>
        </div>
        <StatusBadge status={car.status} />
      </div>

      {waMessage && (
        <WhatsAppNotification
          phone={car.phoneNumber}
          message={waMessage}
          onDismiss={() => setWaMessage('')}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
          disabled={loading}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button className="btn-primary btn-sm" onClick={handleUpdate} disabled={loading}>
          {loading ? '...' : 'Update'}
        </button>
        <button className="btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
          Remove
        </button>
      </div>
    </div>
  );
}