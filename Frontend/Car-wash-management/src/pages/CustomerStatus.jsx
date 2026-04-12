import { useState } from 'react';
import { useCarStatus } from '../hooks/useCarStatus';
import { WashProgressSteps } from '../components/WashProgressSteps';
import { StatusBadge } from '../components/StatusBadge';
import { calcEstimatedWait } from '../utils/waitTime';
import { SERVICE_PRICES } from '../utils/constants';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook

export function CustomerStatus() {
  const [phone, setPhone] = useState('');
  const { car, error, lookup } = useCarStatus();
  const navigate = useNavigate()

  // --- Helper to normalize phone number ---
  const handleLookup = () => {
  // 1. Remove all non-numeric characters (spaces, dashes, parens)
  let cleanPhone = phone.replace(/\D/g, ''); 

  // 2. Handle numbers starting with '0' (Local SA format)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+27' + cleanPhone.substring(1);
  } 
  // 3. Handle numbers starting with '27' but missing the '+'
  else if (cleanPhone.startsWith('27')) {
    cleanPhone = '+' + cleanPhone;
  }
  // 4. If it's already +27... (User typed it perfectly)
  else if (phone.startsWith('+27')) {
    cleanPhone = '+' + cleanPhone;
  }
  // 5. Fallback: If they enter 9 digits without a leading 0
  else if (cleanPhone.length === 9) {
    cleanPhone = '+27' + cleanPhone;
  }

  console.log("Searching for normalized number:", cleanPhone);
  lookup(cleanPhone);
};

  function handleOpenPay() {
    if (car) {
      sessionStorage.setItem('pay_car', car.id);
      navigate(`/payment/${car.id}`); 
    }
  }

  return (
    <div>
      <h1>Check Your Car Status</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        Enter the phone number you registered with.
      </p>

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="form-row">
          <label htmlFor="status-phone">Phone Number</label>
          <input
            id="status-phone"
            type="tel"
            placeholder="e.g. 0821234567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            // Use handleLookup here for the Enter key
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
          />
        </div>
        {/* Use handleLookup here for the button click */}
        <button className="btn-primary btn-lg" style={{ width: '100%' }} onClick={handleLookup}>
          Check Status
        </button>
        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {car && (
        <div className="card" style={{ maxWidth: 480, marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem' }}>{car.customerName}</h2> {/* Note: Changed car.name to car.customerName to match your Backend Entity */}
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {car.licensePlate ? `${car.licensePlate} · ` : ''}
                {car.serviceType === 'BASIC' ? 'Basic Wash' : 'Deluxe Wash'}
              </p>
            </div>
            <StatusBadge status={car.status} />
          </div>

          <WashProgressSteps currentStatus={car.status} />

          {car.status !== 'DONE' ? (
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
              Amount: <strong>R{SERVICE_PRICES[car.serviceType.toLowerCase()]}</strong> ·{' '}
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