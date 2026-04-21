import { useEffect, useRef, useState } from 'react';
import { useRevenue } from '../hooks/useRevenue';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { getAllCars, exportToCSV } from '../api/cars';
import { fmtTime } from '../utils/formatters';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function OwnerDashboard() {
  const { revenue, washed, avgWait, queueLength, chartData, loading } = useRevenue();
  const [todayCars, setTodayCars] = useState([]);

  const chartRef  = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => {
    getAllCars()
      .then(cars => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const today = cars.filter(c => new Date(c.arrivalTime) >= startOfDay);
        setTodayCars(today);
      })
      .catch(err => console.error('[OwnerDashboard] failed to load cars:', err));
  }, []);

  // ← Only change: window.Chart → Chart, and removed the !window.Chart guard
  useEffect(() => {
    if (!chartRef.current || !chartData.length) return;
    if (chartInst.current) chartInst.current.destroy();

    chartInst.current = new Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: chartData.map(d => d.label),
        datasets: [{
          label: 'Revenue (R)',
          data: chartData.map(d => d.revenue),
          backgroundColor: 'rgba(37,99,235,0.7)',
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => 'R' + v } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [chartData]);

  async function handleExport() {
    try {
      const ok = await exportToCSV();
      if (!ok) alert('No data to export.');
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  }

  const sorted = [...todayCars].sort(
    (a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime)
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>Owner Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Today's performance overview</p>
        </div>
        <button className="btn-outline" onClick={handleExport}>⬇ Export CSV</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Loading stats...</p>
      ) : (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatsCard label="Revenue Today"  value={`R${revenue}`}                sub="paid cars"       />
          <StatsCard label="Cars Washed"    value={washed}                        sub="completed today" />
          <StatsCard label="Avg Wait Time"  value={avgWait ? `${avgWait}m` : '—'} sub="arrival to done" />
          <StatsCard label="In Queue Now"   value={queueLength}                   sub="active"          />
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Last 7 Days Revenue</h2>
        <div className="chart-wrap">
          <canvas ref={chartRef} />
        </div>
      </div>

      <div className="card">
        <h2>All Cars Today</h2>
        {sorted.length === 0 ? (
          <div className="empty-state"><p>No cars today</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Plate</th>
                  <th>Service</th><th>Status</th><th>Payment</th><th>Arrival</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.customerName}</strong></td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.phoneNumber}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.licensePlate || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.serviceType}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.paid
                        ? <span className="tag-paid">Paid</span>
                        : <span className="tag-unpaid">Unpaid</span>}
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                      {c.arrivalTime ? fmtTime(new Date(c.arrivalTime).getTime()) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;