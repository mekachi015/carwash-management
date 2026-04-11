const CLASSES = {
  Waiting: 'badge badge-waiting',
  Washing: 'badge badge-washing',
  Rinsing: 'badge badge-rinsing',
  Drying:  'badge badge-drying',
  Done:    'badge badge-done',
};

export function StatusBadge({ status }) {
  return <span className={CLASSES[status] || 'badge'}>{status}</span>;
}