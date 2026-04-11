import { useState } from 'react';
import { addCar } from '../api/cars';
import { useQueueContext } from '../context/QueueContext';

export function AddCarForm() {
  const { refresh } = useQueueContext();
  const [form, setForm]     = useState({ name: '', phone: '', service: 'basic', plate: '' });
  const [message, setMessage] = useState(null); // { type, text }

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    setMessage(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setMessage({ type: 'error', text: 'Customer name and phone number are required.' });
      return;
    }
    try {
      const car = addCar(form);
      refresh();
      setForm({ name: '', phone: '', service: 'basic', plate: '' });
      setMessage({ type: 'success', text: `${car.name}'s car added to the queue.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'warning', text: err.message });
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2>Add New Car</h2>
      <div className="form-grid">
        <div className="form-row">
          <label>Customer Name</label>
          <input type="text" placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Phone Number</label>
          <input type="tel" placeholder="0821234567" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Service Type</label>
          <select value={form.service} onChange={e => update('service', e.target.value)}>
            <option value="basic">Basic — R100</option>
            <option value="deluxe">Deluxe — R200</option>
          </select>
        </div>
        <div className="form-row">
          <label>License Plate <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <input type="text" placeholder="e.g. ABC 123 L" value={form.plate} onChange={e => update('plate', e.target.value)} />
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleSubmit}>
        + Add to Queue
      </button>
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginTop: '0.75rem' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}