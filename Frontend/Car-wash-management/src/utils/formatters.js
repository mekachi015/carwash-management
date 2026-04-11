export function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(ms) {
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function fmtDateTime(ms) {
  return new Date(ms).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtCurrency(amount) {
  return 'R' + amount.toFixed(0);
}

export function fmtCardNumber(value) {
  return value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export function fmtExpiry(value) {
  let v = value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
  return v;
}

export function uid() {
  return 'c' + Date.now() + Math.random().toString(36).slice(2, 6);
}