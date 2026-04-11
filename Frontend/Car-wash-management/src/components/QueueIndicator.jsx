import { getQueueColor } from '../utils/waitTime';

const COLOR_CLASS = {
  green:  'indicator indicator-green',
  yellow: 'indicator indicator-yellow',
  red:    'indicator indicator-red',
};

const LABEL = {
  green:  '0–2 cars — Short wait',
  yellow: '3–5 cars — Moderate wait',
  red:    '6+ cars — Long wait',
};

export function QueueIndicator({ queueLength, showLabel = false }) {
  const color = getQueueColor(queueLength);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className={COLOR_CLASS[color]} />
      {showLabel && <span style={{ fontSize: '0.875rem' }}>{LABEL[color]}</span>}
    </span>
  );
}