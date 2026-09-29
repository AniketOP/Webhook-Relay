import { statusConfig, circuitConfig } from '../../lib/utils';

export function StatusBadge({ status }) {
  const { label, cls, dot } = statusConfig(status);
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function CircuitBadge({ state }) {
  const { label, cls } = circuitConfig(state);
  return <span className={cls}>{label}</span>;
}
