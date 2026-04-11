import { STATUSES } from '../utils/constants';

export function WashProgressSteps({ currentStatus }) {
  const currentIdx = STATUSES.indexOf(currentStatus);

  return (
    <div className="steps">
      {STATUSES.map((s, i) => {
        const isDone   = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={s} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
            <div className="step-dot">{isDone ? '✓' : i + 1}</div>
            <div className="step-label">{s}</div>
          </div>
        );
      })}
    </div>
  );
}