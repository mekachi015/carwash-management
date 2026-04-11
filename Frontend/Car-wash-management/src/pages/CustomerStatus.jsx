import { useState } from 'react';
import { useCarStatus } from '../hooks/useCarStatus';
import { WashProgressSteps } from '../components/WashProgressSteps';
import { StatusBadge } from '../components/StatusBadge';
import { calcEstimatedWait } from '../utils/waitTime';
import { SERVICE_PRICES } from '../utils/constants';

export function CustomerStatus({ onNavigate }) {
  const [phone, setPhone]       = useState('');
  const { car, error, lookup }  = useCarStatus();

  function handleOpenPay() {
    sessionStorage.setItem('pay_car', car.id);
    onNavigate('pay');
  }

  return (
    <div>
      <h1>Check Your Car Status</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Enter the phone number you registered with.</p>

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="form-row">
          <label htmlFor="status-phone">Phone Number</label>
          <input
            id="status-phone"
            type="tel"
            placeholder="e.g. 0821234567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup(phone)}
          />
        </div>
        <button className="btn-primary btn-lg" style={{ width: '100%' }} onClick={() => lookup(phone)}>
          Check Status
        </button>
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {car && (
        <div className="card" style={{ maxWidth: 480, marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem' }}>{car.name}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {car.plate ? `${car.plate} · ` : ''}{car.service === 'basic' ? 'Basic Wash' : 'Deluxe Wash'}
              </p>
            </div>
            <StatusBadge status={car.status} />
          </div>

          <WashProgressSteps currentStatus={car.status} />

          {car.status !== 'Done' ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div className="stat" style={{ flex: 1, minWidth: 120 }}>
                <div className="stat-label">Position</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {car.position >= 0 ? `#${car.position + 1}` : '—'}
                </div>
              </div>
              <div className="stat" style={{ flex: 1, minWidth: 120 }}>
                <div className="stat-label">Est. Time Left</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {calcEstimatedWait(car.position >= 0 ? car.position : 0)} min
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-success" style={{ marginTop: '1rem' }}>
              ✓ Your car is ready! Please collect it.
            </div>
          )}

          <hr className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Amount: <strong>${SERVICE_PRICES[car.service]}</strong> ·{' '}
              {car.paid
                ? <span className="tag-paid">Paid</span>
                : <span className="tag-unpaid">Unpaid</span>}
            </span>
            {!car.paid && (
              <button className="btn-primary btn-sm" onClick={handleOpenPay}>Pay Now →</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerStatus;