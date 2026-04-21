import { useState, useEffect } from 'react';
import { getRevenueByDay } from '../api/cars';
import { apiFetch } from '../api/index';

export function useRevenue() {
  const [revenue, setRevenue] = useState(0);
  const [washed, setWashed] = useState(0);
  const [avgWait, setAvgWait] = useState(null);
  const [queueLength, setQueueLength] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('[useRevenue] Starting data fetch...');
        
        // Fetch revenue chart data for the last 7 days
        const chart = await getRevenueByDay(7);
        console.log('[useRevenue] Raw chart data from API:', chart);
        setChartData(chart);

        // Today's revenue is the last entry in the chart (most recent day)
        const todayEntry = chart[chart.length - 1];
        console.log('[useRevenue] Today entry:', todayEntry);
        const todayRevenue = todayEntry?.revenue ?? 0;
        setRevenue(todayRevenue);
        console.log('[useRevenue] Today\'s revenue set to:', todayRevenue);

        // Fetch additional today's stats (washed cars, average wait, queue length)
        const stats = await apiFetch('/api/stats/today');
        console.log('[useRevenue] Raw stats from /api/stats/today:', stats);
        
        const washedCount = stats.carsWashed ?? 0;
        const avgWaitMins = stats.avgWaitMins ?? null;
        const queueLen = stats.queueLength ?? 0;
        
        setWashed(washedCount);
        setAvgWait(avgWaitMins);
        setQueueLength(queueLen);
        
        console.log('[useRevenue] Stats extracted - washed:', washedCount, 
                    '| avgWaitMins:', avgWaitMins, '| queueLength:', queueLen);
        
      } catch (err) {
        console.error('[useRevenue] Failed to fetch data:', err);
      } finally {
        setLoading(false);
        console.log('[useRevenue] Loading complete, loading state set to false');
      }
    }

    loadData();
  }, []);

  // Optional: log whenever state changes (for debugging)
  useEffect(() => {
    console.log('[useRevenue] State updated - revenue:', revenue, 
                '| washed:', washed, '| avgWait:', avgWait, 
                '| queueLength:', queueLength, '| chartData length:', chartData.length);
  }, [revenue, washed, avgWait, queueLength, chartData]);

  return { revenue, washed, avgWait, queueLength, chartData, loading };
}