//import { getQueueColor } from '../utils/waitTime';

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
  const isGreen  = queueLength <= 2;
  const isYellow = queueLength > 2 && queueLength <= 5;
  const isRed    = queueLength > 5;

  const label = isGreen ? 'Short wait' : isYellow ? 'Moderate wait' : 'Long wait';
  const sub   = isGreen ? '0–2 cars'   : isYellow ? '3–5 cars'      : '6+ cars';

  const off = { red: '#3a1a1a', yellow: '#2a2200', green: '#0a1f0a' };

  const lights = {
    red:    { bg: isRed    ? '#ef4444' : off.red,    shadow: isRed    ? '0 0 12px 4px rgba(239,68,68,0.5)'  : 'none' },
    yellow: { bg: isYellow ? '#eab308' : off.yellow, shadow: isYellow ? '0 0 12px 4px rgba(234,179,8,0.5)'  : 'none' },
    green:  { bg: isGreen  ? '#22c55e' : off.green,  shadow: isGreen  ? '0 0 12px 4px rgba(34,197,94,0.5)'  : 'none' },
  };

  const labelColor = isGreen ? '#22c55e' : isYellow ? '#eab308' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ background: '#1a1a1a', borderRadius: 14, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, border: '2px solid #333' }}>
        {['red', 'yellow', 'green'].map(c => (
          <div key={c} style={{ width: 36, height: 36, borderRadius: '50%', background: lights[c].bg, boxShadow: lights[c].shadow, transition: 'background 0.4s, box-shadow 0.4s' }} />
        ))}
      </div>

      {showLabel && (
        <div>
          <p style={{ margin: 0, fontWeight: 500, color: labelColor }}>{label}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-500)' }}>{sub} in queue</p>
        </div>
      )}
    </div>
  );
}