import { useState } from 'react';
import { addCar } from '../api/cars';
import { useQueueContext } from '../context/QueueContext';

export function AddCarForm() {
  const { refresh } = useQueueContext();
  const [form, setForm]       = useState({ customerName: '', phoneNumber: '', serviceType: 'basic', licensePlate: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setMessage(null);
    
    // Validation
    if (!form.customerName.trim() || !form.phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'Customer name and phone number are required.' });
      return;
    }

    // --- Phone Number Normalization (E.164) ---
    let cleanPhone = form.phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+27' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('27')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      // Default fallback for Phalaborwa/South Africa if no code is provided
      cleanPhone = '+27' + cleanPhone;
    }

    setLoading(true);
    try {
      // Normalize data for the Backend:
      // 1. phoneNumber in +27... format
      // 2. serviceType in UPPERCASE to match Java Enum
      const submission = { 
        ...form, 
        phoneNumber: cleanPhone,
        serviceType: form.serviceType.toUpperCase() 
      };
      
      const car = await addCar(submission);
      await refresh();
      
      setForm({ customerName: '', phoneNumber: '', serviceType: 'basic', licensePlate: '' });
      setMessage({ type: 'success', text: `${car.customerName}'s car added! Notification sent. ✅` });
      
      setTimeout(() => setMessage(null), 3000);
    } catch{
      setMessage({ type: 'warning', text: "Failed to add car. Check if backend is running." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2>Add New Car</h2>
      <div className="form-grid">
        <div className="form-row">
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Full name"
            value={form.customerName}
            onChange={e => update('customerName', e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="0821234567"
            value={form.phoneNumber}
            onChange={e => update('phoneNumber', e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Service Type</label>
          <select value={form.serviceType} onChange={e => update('serviceType', e.target.value)}>
            <option value="basic">Basic — R100</option>
            <option value="deluxe">Deluxe — R200</option>
          </select>
        </div>
        <div className="form-row">
          <label>License Plate <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. ABC 123"
            value={form.licensePlate}
            onChange={e => update('licensePlate', e.target.value)}
          />
        </div>
      </div>
      <button
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Adding...' : '+ Add to Queue'}
      </button>
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginTop: '0.75rem' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}