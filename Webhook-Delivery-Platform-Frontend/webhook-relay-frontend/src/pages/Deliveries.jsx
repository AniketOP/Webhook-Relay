import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Filter, Eye, RotateCcw, Plus, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { api } from '../api/client';
import { fmtDate, fmtTime, truncate } from '../lib/utils';
import toast from 'react-hot-toast';

const FILTERS = ['ALL', 'SUCCESS', 'FAILED', 'DEAD_LETTER', 'PENDING'];

const FILTER_LABELS = {
  ALL: 'All', SUCCESS: 'Success', FAILED: 'Failed', DEAD_LETTER: 'Dead Letter', PENDING: 'Pending',
};

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [detail, setDetail] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [replaying, setReplaying] = useState(null);

  // Create form state
  const [form, setForm] = useState({ eventId: '', subscriberId: '', status: 'PENDING', retryNo: 0 });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [dRes, sRes, eRes] = await Promise.all([
        api.deliveries.getAll(),
        api.subscribers.getAll(),
        api.events.getAll(),
      ]);
      setDeliveries(dRes.data);
      setSubscribers(sRes.data);
      setEvents(eRes.data);
    } catch {
      toast.error('Failed to load deliveries');
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

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter(d => d.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.deliveries.create({ ...form, retryNo: Number(form.retryNo) });
      toast.success('Delivery attempt created');
      setCreateOpen(false);
      setForm({ eventId: '', subscriberId: '', status: 'PENDING', retryNo: 0 });
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create delivery');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deliveries.delete(deleteTarget.deliveryId);
      toast.success('Deleted');
      setDeleteTarget(null);
      load(true);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  async function handleReplay(id) {
    setReplaying(id);
    try {
      await api.deliveries.replay(id);
      toast.success('Replay triggered — delivery re-queued');
      setTimeout(() => load(true), 1000);
    } catch {
      toast.error('Replay failed');
    } finally {
      setReplaying(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Deliveries"
        subtitle="All webhook delivery attempts and their retry history"
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-text-faint" />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  filter === f
                    ? 'bg-violet-600 text-white shadow-glow-sm'
                    : 'bg-bg-hover text-text-secondary hover:text-text-primary border border-border hover:border-border-bright'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-faint">{sorted.length} shown</span>
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> New Attempt
            </button>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="card overflow-hidden"
        >
          {sorted.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No deliveries found"
              description={filter !== 'ALL' ? `No ${FILTER_LABELS[filter].toLowerCase()} deliveries.` : 'Create a delivery attempt to get started.'}
              action={filter === 'ALL' && <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" /> Create Attempt</button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface/50">
                  <tr>
                    {['ID', 'Event', 'Subscriber', 'Status', 'Retries', 'Attempted At', 'Actions'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {sorted.map((d, i) => (
                      <motion.tr
                        key={d.deliveryId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="table-row"
                      >
                        <td className="table-td">
                          <span className="font-mono text-xs text-text-faint" title={d.deliveryId}>
                            {truncate(d.deliveryId, 12)}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className="badge-violet">{d.event?.eventType || '—'}</span>
                        </td>
                        <td className="table-td text-text-primary font-medium">
                          {d.subscriber?.name || '—'}
                        </td>
                        <td className="table-td"><StatusBadge status={d.status} /></td>
                        <td className="table-td tabular-nums">{d.retryNo ?? 0}</td>
                        <td className="table-td text-text-faint text-xs">{fmtTime(d.attemptedAt)}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDetail(d)}
                              className="btn-ghost py-1 px-2 text-xs"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReplay(d.deliveryId)}
                              disabled={replaying === d.deliveryId}
                              className="btn-ghost py-1 px-2 text-xs disabled:opacity-40"
                              title="Replay"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${replaying === d.deliveryId ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(d)}
                              className="btn-ghost py-1 px-2 text-xs text-rose-400 hover:text-rose-300"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Delivery Details" width="max-w-xl">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Delivery ID', <span className="font-mono text-xs">{detail.deliveryId}</span>],
                ['Status',      <StatusBadge status={detail.status} />],
                ['Retry Count', detail.retryNo ?? 0],
                ['Next Retry',  detail.nextRetryAt ? fmtDate(detail.nextRetryAt) : '—'],
                ['Subscriber',  detail.subscriber?.name || '—'],
                ['Event Type',  detail.event?.eventType || '—'],
                ['Attempted',   fmtDate(detail.attemptedAt)],
              ].map(([k, v]) => (
                <div key={k} className="bg-bg-hover rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-text-faint uppercase tracking-wider mb-1">{k}</p>
                  <div className="text-sm text-text-primary">{v}</div>
                </div>
              ))}
            </div>
            {detail.errorReason && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                <p className="text-[10px] text-rose-400 uppercase tracking-wider mb-1">Error Reason</p>
                <p className="text-sm text-rose-300 break-all">{detail.errorReason}</p>
              </div>
            )}
            {detail.event?.data && (
              <div>
                <p className="text-[10px] text-text-faint uppercase tracking-wider mb-2">Payload</p>
                <pre className="bg-bg-base border border-border rounded-lg px-4 py-3 text-xs text-text-secondary font-mono overflow-auto max-h-40">
                  {(() => { try { return JSON.stringify(JSON.parse(detail.event.data), null, 2); } catch { return detail.event.data; } })()}
                </pre>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
              <button className="btn-primary" onClick={() => { handleReplay(detail.deliveryId); setDetail(null); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Delivery Attempt">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Event</label>
            <select className="input" value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} required>
              <option value="">Select an event…</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.eventType} — {truncate(ev.id, 8)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subscriber</label>
            <select className="input" value={form.subscriberId} onChange={e => setForm(f => ({ ...f, subscriberId: e.target.value }))} required>
              <option value="">Select a subscriber…</option>
              {subscribers.map(s => <option key={s.subscriberId} value={s.subscriberId}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Initial Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['PENDING', 'FAILED', 'SUCCESS'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Retry #</label>
              <input type="number" min="0" max="5" className="input" value={form.retryNo}
                onChange={e => setForm(f => ({ ...f, retryNo: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create Attempt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Delivery Attempt"
        description={`Are you sure you want to delete delivery ${truncate(deleteTarget?.deliveryId, 12)}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
