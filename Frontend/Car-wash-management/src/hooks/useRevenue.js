import { useState, useEffect } from 'react';
import { getTodayStats, getRevenueByDay } from '../api/cars';

/**
 * Fetches owner dashboard stats from the Spring Boot API.
 * Returns { revenue, washed, avgWait, queueLength, chartData, loading, error }
 */
export function useRevenue() {
  const [stats, setStats]     = useState({
    revenue: 0,
    washed: 0,
    avgWait: null,
    queueLength: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const [today, chart] = await Promise.all([
          getTodayStats(),
          getRevenueByDay(7),
        ]);
        setStats({
          revenue:     today.todayRevenue,
          washed:      today.carsWashed,
          avgWait:     today.avgWaitMins,
          queueLength: today.queueLength,
          chartData:   chart,
        });
      } catch (err) {
        console.error('[useRevenue] failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { ...stats, loading, error };
}