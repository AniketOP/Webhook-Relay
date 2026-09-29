import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function fmtTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function truncate(str, n = 8) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function statusConfig(status) {
  switch (status) {
    case 'SUCCESS':     return { label: 'Success',     cls: 'badge-success', dot: 'bg-emerald-400' };
    case 'FAILED':      return { label: 'Failed',      cls: 'badge-failed',  dot: 'bg-rose-400' };
    case 'DEAD_LETTER': return { label: 'Dead Letter',  cls: 'badge-dead',    dot: 'bg-text-faint' };
    case 'PENDING':     return { label: 'Pending',     cls: 'badge-pending', dot: 'bg-amber-400' };
    default:            return { label: status || '—', cls: 'badge-violet',  dot: 'bg-violet-400' };
  }
}

export function circuitConfig(state) {
  switch (state) {
    case 'CLOSED':    return { label: 'Closed',    cls: 'badge-success', color: '#10B981' };
    case 'OPEN':      return { label: 'Open',      cls: 'badge-failed',  color: '#F43F5E' };
    case 'HALF_OPEN': return { label: 'Half Open', cls: 'badge-pending', color: '#F59E0B' };
    default:          return { label: state || 'Unknown', cls: 'badge-violet', color: '#8B5CF6' };
  }
}
