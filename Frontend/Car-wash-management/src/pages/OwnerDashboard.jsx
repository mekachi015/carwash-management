import { useEffect, useRef } from 'react';
import { useRevenue } from '../hooks/useRevenue';
import { useQueueContext } from '../context/QueueContext';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { exportToCSV } from '../api/cars';
import { fmtTime } from '../utils/formatters';

export function OwnerDashboard() {
  const { revenue, washed, avgWait, queueLength, chartData } = useRevenue();
  const { todayCars } = useQueueContext();
  const chartRef  = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !window.Chart) return;
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new window.Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: chartData.map(d => d.label),
        datasets: [{
          label: 'Revenue ($)',
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
          y: { beginAtZero: true, ticks: { callback: v => '$' + v } },
          x: { grid: { display: false } },
        },
      },
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [chartData]);

  function handleExport() {
    const ok = exportToCSV();
    if (!ok) alert('No data to export.');
  }

  const sorted = [...todayCars].sort((a, b) => a.arrivalTime - b.arrivalTime);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>Owner Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Today's performance overview</p>
        </div>
        <button className="btn-outline" onClick={handleExport}>⬇ Export CSV</button>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatsCard label="Revenue Today"  value={`$${revenue}`}               sub="paid cars"        />
        <StatCard label="Cars Washed"    value={washed}                       sub="completed today"  />
        <StatCard label="Avg Wait Time"  value={avgWait ? `${avgWait}m` : '—'} sub="arrival to done" />
        <StatCard label="In Queue Now"   value={queueLength}                  sub="active"           />
      </div>

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
                    <td><strong>{c.name}</strong></td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.phone}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.plate || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.service}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.paid ? <span className="tag-paid">Paid</span> : <span className="tag-unpaid">Unpaid</span>}</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>{fmtTime(c.arrivalTime)}</td>
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