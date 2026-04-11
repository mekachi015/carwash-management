import { MINS_PER_CAR } from './constants';

export function calcEstimatedWait(position) {
  return position * MINS_PER_CAR;
}

export function getSuggestedArrival(queueLength) {
  if (queueLength === 0) return 'Now';
  const ms = Date.now() + queueLength * MINS_PER_CAR * 60000;
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getQueueColor(length) {
  if (length <= 2) return 'green';
  if (length <= 5) return 'yellow';
  return 'red';
}

export function calcAvgWaitMinutes(doneCars) {
  const withTimes = doneCars.filter(c => c.completionTime && c.arrivalTime);
  if (!withTimes.length) return null;
  const avg = withTimes.reduce((s, c) => s + (c.completionTime - c.arrivalTime), 0) / withTimes.length;
  return Math.round(avg / 60000);
}