import { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { QueueIndicator } from '../components/QueueIndicator';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { getSuggestedArrival, calcEstimatedWait } from '../utils/waitTime';
//import { fmtTime } from '../utils/formatters';

export function PublicQueue() {
  const { queue } = useQueue(10000); // auto-refresh every 10s
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const waitMins = queue.length * 5;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h1>Queue Status</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Live view — refreshes every 10 seconds</p>
        </div>
        <QueueIndicator queueLength={queue.length} style={{ marginLeft: 'auto' }} />
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatsCard
          label="Cars Waiting"
          value={<span style={{ color: 'var(--blue)' }}>{queue.length}</span>}
          sub={queue.length === 0 ? 'No queue right now' : `${queue.length} car${queue.length !== 1 ? 's' : ''} ahead`}
        />
        <StatsCard
          label="Est. Wait Time"
          value={waitMins}
          sub="minutes"
        />
        <StatsCard
          label="Suggested Arrival"
          value={<span style={{ fontSize: '1.4rem' }}>{getSuggestedArrival(queue.length)}</span>}
          sub="for shortest wait"
        />
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Queue Legend</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem' }}>
          <QueueIndicator queueLength={0} showLabel />
          <QueueIndicator queueLength={4} showLabel />
          <QueueIndicator queueLength={8} showLabel />
        </div>
        <hr className="divider" />
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          🔄 Auto-refreshing. Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="card">
        <h2>Currently Active Cars</h2>
        {queue.length === 0 ? (
          <div className="empty-state">
            <p>No active cars</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Service</th><th>Status</th><th>Est. Wait</th></tr>
              </thead>
              <tbody>
                {queue.map((car, i) => (
                  <tr key={car.id}>
                    <td><strong>{i + 1}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{car.serviceType}</td>
                    <td><StatusBadge status={car.status} /></td>
                    <td>{calcEstimatedWait(i)} min</td>
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

export default PublicQueue;