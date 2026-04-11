import { useState } from 'react';
import { STATUSES, SERVICE_PRICES } from '../utils/constants';
import { StatusBadge } from './StatusBadge';
import { updateCarStatus, deleteCar } from '../api/cars';
import { WhatsAppNotification } from './WhatsAppNotification';

export function CarCard({ car, position, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(car.status);
  const [waMessage, setWaMessage]           = useState('');

  function handleUpdate() {
    updateCarStatus(car.id, selectedStatus);
    if (selectedStatus === 'Washing') {
      setWaMessage(`Your car is now being washed, ${car.name}! Est. completion in 5 mins.`);
    } else if (selectedStatus === 'Done') {
      setWaMessage(`Great news, ${car.name}! Your car is ready for collection. 🚗`);
    } else {
      setWaMessage('');
    }
    onUpdate();
  }

  function handleDelete() {
    if (!window.confirm('Remove this car from the queue?')) return;
    deleteCar(car.id);
    onUpdate();
  }

  return (
    <div className="card card-sm" style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="position-badge">{position}</span>
            <strong>{car.name}</strong>
            <span className={car.paid ? 'tag-paid' : 'tag-unpaid'}>{car.paid ? 'Paid' : 'Unpaid'}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            {car.phone}{car.plate ? ` · ${car.plate}` : ''} · <span style={{ textTransform: 'capitalize' }}>{car.service}</span> — ${SERVICE_PRICES[car.service]}
          </div>
        </div>
        <StatusBadge status={car.status} />
      </div>

      {waMessage && (
        <WhatsAppNotification phone={car.phone} message={waMessage} onDismiss={() => setWaMessage('')} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary btn-sm" onClick={handleUpdate}>Update</button>
        <button className="btn-danger btn-sm"  onClick={handleDelete}>Remove</button>
      </div>
    </div>
  );
}