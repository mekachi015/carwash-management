import { useState, useEffect } from "react";
import { useQueue } from "../hooks/useQueue";
import { QueueIndicator } from "../components/QueueIndicator";
import { StatusBadge } from "../components/StatusBadge";
import { StatsCard } from "../components/StatsCard";
import { getSuggestedArrival, calcEstimatedWait } from "../utils/waitTime";

export function PublicQueue() {
  const { queue } = useQueue(10000);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const waitMins = queue.length * 5;
  const isGreen = queue.length <= 2;
  const isYellow = queue.length > 2 && queue.length <= 5;
  const statusText = isGreen
    ? "Short wait"
    : isYellow
      ? "Moderate wait"
      : "Long wait";
  const statusColor = isGreen
    ? "var(--green)"
    : isYellow
      ? "var(--yellow)"
      : "var(--red)";

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1>Queue Status</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
          Live view — refreshes every 10 seconds
        </p>
      </div>

      {/* ── Two stat cards — always side by side ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <StatsCard
          label="Cars Waiting"
          value={<span style={{ color: "var(--blue)" }}>{queue.length}</span>}
          sub={
            queue.length === 0
              ? "No queue right now"
              : `${queue.length} car${queue.length !== 1 ? "s" : ""} ahead`
          }
        />
        <StatsCard label="Est. Wait Time" value={waitMins} sub="minutes" />
      </div>

      {/* ── Suggested arrival — always full width ── */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "8rem",
          padding: "1.25rem 1.5rem",
        }}
      >
        <QueueIndicator queueLength={queue.length} />
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--gray-500)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 0.25rem",
              
            }}
          >
            Suggested Arrival
          </p>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--gray-900)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {getSuggestedArrival(queue.length)}
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: statusColor,
              margin: "4px 0 0",
            }}
          >
            {statusText}
          </p>
        </div>
      </div>

      {/* ── Active cars table ── */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Currently Active Cars</h2>
          <p
            style={{ fontSize: "0.8rem", color: "var(--gray-400)", margin: 0 }}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <hr className="divider" />
        {queue.length === 0 ? (
          <div className="empty-state">
            <p>No active cars</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Est. Wait</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((car, i) => (
                  <tr key={car.id}>
                    <td>
                      <strong>{i + 1}</strong>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {car.serviceType}
                    </td>
                    <td>
                      <StatusBadge status={car.status} />
                    </td>
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
