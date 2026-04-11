import { useMemo } from 'react';
import { useQueueContext } from '../context/QueueContext';
import { getRevenueByDay } from '../api/cars';
import { SERVICE_PRICES } from '../utils/constants';
import { calcAvgWaitMinutes } from '../utils/waitTime';

export function useRevenue() {
  const { todayCars, queue } = useQueueContext();

  const stats = useMemo(() => {
    const done    = todayCars.filter(c => c.status === 'Done');
    const paid    = todayCars.filter(c => c.paid);
    const revenue = paid.reduce((s, c) => s + SERVICE_PRICES[c.service], 0);
    const avgWait = calcAvgWaitMinutes(done);
    const chartData = getRevenueByDay(7);
    // Seed non-zero mock values for days with no real data
    const seeds = [40, 75, 30, 90, 55, 20];
    chartData.forEach((d, i) => { if (d.revenue === 0 && i < 6) d.revenue = seeds[i]; });
    return { revenue, washed: done.length, avgWait, queueLength: queue.length, chartData };
  }, [todayCars, queue]);

  return stats;
}