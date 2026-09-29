import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { CircuitBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { api } from '../api/client';
import { circuitConfig } from '../lib/utils';
import toast from 'react-hot-toast';

function CircuitIcon({ state }) {
  switch (state) {
    case 'CLOSED':    return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case 'OPEN':      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    case 'HALF_OPEN': return <MinusCircle className="w-5 h-5 text-amber-400" />;
    default:          return <GitBranch className="w-5 h-5 text-violet-400" />;
  }
}

function CircuitMeter({ state }) {
  const pct = state === 'CLOSED' ? 100 : state === 'HALF_OPEN' ? 50 : 0;
  const color = state === 'CLOSED' ? 'bg-emerald-500' : state === 'HALF_OPEN' ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function CircuitBreakers() {
  const [breakers, setBreakers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [sRes, cbRes] = await Promise.all([
        api.subscribers.getAll(),
        api.circuitBreakers.getAll().catch(() => ({ data: null })),
      ]);
      setSubscribers(sRes.data);

      if (cbRes.data?.circuitBreakers) {
        const names = cbRes.data.circuitBreakers;
        const details = await Promise.allSettled(
          names.map(name => api.circuitBreakers.getOne(name))
        );
        const rows = names.map((name, i) => ({
          name,
          state: details[i].status === 'fulfilled'
            ? (details[i].value.data?.state || details[i].value.data?.details?.state || 'UNKNOWN')
            : 'UNKNOWN',
        }));
        setBreakers(rows);
      } else {
        // Derive from subscribers — show per-subscriber as UNKNOWN if actuator not available
        setBreakers(sRes.data.map(s => ({ name: s.subscriberId, state: 'UNKNOWN' })));
      }
    } catch (e) {
      toast.error('Failed to load circuit breaker data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => load(true), 10000);
    return () => clearInterval(id);
  }, [load]);

  function subName(id) {
    const s = subscribers.find(x => x.subscriberId === id);
    return s?.name || id;
  }

  if (loading) return <PageLoader />;

  const open     = breakers.filter(b => b.state === 'OPEN').length;
  const halfOpen = breakers.filter(b => b.state === 'HALF_OPEN').length;
  const closed   = breakers.filter(b => b.state === 'CLOSED').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Circuit Breakers"
        subtitle="Per-subscriber Resilience4j circuit breaker state"
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Closed (Healthy)', count: closed,   color: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400' },
            { label: 'Half Open',        count: halfOpen, color: 'border-amber-500/30 bg-amber-500/10',     text: 'text-amber-400'   },
            { label: 'Open (Tripped)',   count: open,     color: 'border-rose-500/30 bg-rose-500/10',       text: 'text-rose-400'    },
          ].map(({ label, count, color, text }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card p-4 border ${color}`}
            >
              <p className={`text-2xl font-bold tabular-nums ${text}`}>{count}</p>
              <p className="text-xs text-text-faint mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Cards */}
        {breakers.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={GitBranch}
              title="No circuit breaker data"
              description="Circuit breakers are created per subscriber after the first delivery attempt. Make sure the actuator endpoint is exposed."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {breakers.map((b, i) => {
              const { color } = circuitConfig(b.state);
              return (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="card p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-bg-hover border border-border flex items-center justify-center">
                        <CircuitIcon state={b.state} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{subName(b.name)}</p>
                        <p className="text-[10px] font-mono text-text-faint">{b.name.slice(0, 18)}&hellip;</p>
                      </div>
                    </div>
                    <CircuitBadge state={b.state} />
                  </div>
                  <CircuitMeter state={b.state} />
                  <p className="text-[10px] text-text-faint mt-2">
                    {b.state === 'CLOSED'    && 'All calls passing. Subscriber is healthy.'}
                    {b.state === 'OPEN'      && 'Too many failures. Calls bypassed for recovery window.'}
                    {b.state === 'HALF_OPEN' && 'Probing recovery. One trial call permitted.'}
                    {b.state === 'UNKNOWN'   && 'State unavailable. No deliveries attempted yet.'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Config Reference */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-5"
        >
          <p className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Circuit Breaker Config</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Sliding Window', '5 calls'],
              ['Min Calls', '5'],
              ['Failure Threshold', '50%'],
              ['Wait in Open', '30s'],
              ['Half-Open Calls', '1'],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg-hover rounded-lg px-3 py-2.5 border border-border">
                <p className="text-[10px] text-text-faint mb-1 uppercase tracking-wider">{k}</p>
                <p className="text-sm font-semibold text-violet-400 tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
