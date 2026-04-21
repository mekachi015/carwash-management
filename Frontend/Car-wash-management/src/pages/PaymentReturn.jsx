import { useEffect, useState } from 'react';
import { getPaymentStatus } from '../api/cars';

export function PaymentReturn({ onNavigate }) {
  // PayFast sends the token back in the URL as 'm_payment_id'
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    //const query = new URLSearchParams(window.location.search);
    const token =
      sessionStorage.getItem('paymentToken') ||
      localStorage.getItem('paymentToken');

    if (!token) {
      setStatus('error');
       setError('Missing payment reference. Please check your status page.');
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 45 seconds total — ITN can be slow in sandbox

    const checkStatus = async () => {
      try {
        const result = await getPaymentStatus(token);

        if (result.status === 'COMPLETE') {
          setStatus('success');
          sessionStorage.removeItem('pay_car');
          sessionStorage.removeItem('paymentToken');
          localStorage.removeItem('paymentToken');
        } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
          setStatus('failed');
          setError(`The transaction was ${result.status.toLowerCase()}.`);
        } else {
          if (attempts < MAX_ATTEMPTS) {
            attempts++;
            setTimeout(checkStatus, 3000);
          } else {
            setStatus('failed');
            setError('Payment is taking longer than expected. Please check the status page.');
          }
        }
      } catch {
        setStatus('error');
        setError('Connection lost. Please check your car status manually.');
      }
    };

    checkStatus();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center', width: '100%' }}>
        
        {status === 'checking' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <h2>Verifying Payment...</h2>
            <p style={{ color: 'var(--gray-500)' }}>Finalizing your transaction with PayFast.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon" style={{ background: 'var(--green)', color: 'white', fontSize: '2rem', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>✓</div>
            <h2 style={{ color: 'var(--green)' }}>Payment Received!</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Your car is now marked as paid in the system.</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => onNavigate?.('status')}>
              View Wash Status
            </button>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div style={{ color: 'var(--red)', fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
            <h2>Something went wrong</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => onNavigate?.('payment')}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}