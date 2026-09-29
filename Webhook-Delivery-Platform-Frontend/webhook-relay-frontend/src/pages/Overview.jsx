import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Users, CheckCircle2, Skull, TrendingUp, Clock, ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Header from '../components/layout/Header';
import { StatusBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { api } from '../api/client';
import { fmtTime } from '../lib/utils';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#10B981', '#8B5CF6', '#F59E0B', '#F43F5E'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

function StatCard({ icon: Icon, label, value, sub, color, index }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-text-faint" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary tabular-nums">{value ?? '—'}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
      </div>
      {sub != null && (
        <p className="text-xs text-text-faint">{sub}</p>
      )}
      {/* Subtle glow orb */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl ${color.replace('bg-', 'bg-')}`} />
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-secondary">{payload[0].name}</p>
      <p className="text-text-primary font-semibold">{payload[0].value}</p>
    </div>
  );
};

export default function Overview() {
  const [data, setData] = useState({ deliveries: [], subscribers: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [dRes, sRes] = await Promise.all([
        api.deliveries.getAll(),
        api.subscribers.getAll(),
      ]);
      setData({ deliveries: dRes.data, subscribers: sRes.data });
    } catch (e) {
      toast.error('Failed to load data. Check your connection & API key in Settings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => load(true), 8000);
    return () => clearInterval(id);
  }, [load]);

  const { deliveries, subscribers } = data;
  const success = deliveries.filter(d => d.status === 'SUCCESS').length;
  const failed  = deliveries.filter(d => d.status === 'FAILED').length;
  const dead    = deliveries.filter(d => d.status === 'DEAD_LETTER').length;
  const pending = deliveries.filter(d => d.status === 'PENDING').length;
  const resolved = success + failed + dead;
  const rate = resolved ? Math.round((success / resolved) * 100) : null;

  const pieData = [
    { name: 'Success',     value: success },
    { name: 'Pending',     value: pending },
    { name: 'Failed',      value: failed  },
    { name: 'Dead Letter', value: dead    },
  ].filter(d => d.value > 0);

  const recent = [...deliveries]
    .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
    .slice(0, 8);

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Overview"
        subtitle="Live view of every delivery and subscriber in the system"
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Hero glow */}
        <div className="absolute top-0 left-60 right-0 h-72 bg-hero-glow pointer-events-none" />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <StatCard index={0} icon={Zap}          label="Total Deliveries" value={deliveries.length} color="bg-violet-600/20 text-violet-400" />
          <StatCard index={1} icon={TrendingUp}   label="Success Rate"     value={rate !== null ? `${rate}%` : '—'} color="bg-emerald-500/20 text-emerald-400" sub={`${success} of ${resolved} resolved`} />
          <StatCard index={2} icon={Clock}        label="Failed / Retrying" value={failed} color="bg-amber-500/20 text-amber-400" sub="Queued for retry" />
          <StatCard index={3} icon={Skull}        label="Dead Letters"     value={dead}  color="bg-rose-500/20 text-rose-400" sub="Max retries reached" />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            className="card p-6"
          >
            <p className="text-sm font-semibold text-text-primary mb-4">Delivery Outcomes</p>
            {pieData.length > 0 ? (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-text-secondary">{d.name}</span>
                      </div>
                      <span className="text-text-primary font-medium tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-44 flex items-center justify-center">
                <p className="text-xs text-text-faint">No delivery data yet</p>
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}
            className="card p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text-primary">Recent Deliveries</p>
              <span className="text-xs text-text-faint">Auto-refreshes every 8s</span>
            </div>
            {recent.length > 0 ? (
              <div className="space-y-2">
                {recent.map((d, i) => (
                  <motion.div
                    key={d.deliveryId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {d.event?.eventType || 'Unknown event'} → {d.subscriber?.name || 'Subscriber'}
                        </p>
                        <p className="text-[10px] text-text-faint">{fmtTime(d.attemptedAt)}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-center">
                <Zap className="w-5 h-5 text-text-faint mb-2" strokeWidth={1.5} />
                <p className="text-xs text-text-faint">No deliveries yet. Create an event to get started.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Subscribers snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-primary">Active Subscribers</p>
            <span className="badge-violet">{subscribers.length} total</span>
          </div>
          {subscribers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subscribers.slice(0, 6).map((s, i) => (
                <motion.div
                  key={s.subscriberId}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.52 + i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover border border-border hover:border-border-bright transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary truncate">{s.name}</p>
                    <p className="text-[10px] text-text-faint truncate">{s.url}</p>
                  </div>
                  <span className={s.active ? 'badge-success' : 'badge-dead'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-emerald-400' : 'bg-text-faint'}`} />
                    {s.active ? 'Active' : 'Off'}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-xs text-text-faint">No subscribers yet. Go to Subscribers to add one.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
