import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Pencil, Trash2, Calendar, Code2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { api } from '../api/client';
import { fmtDate, fmtTime, truncate } from '../lib/utils';
import toast from 'react-hot-toast';

const emptyForm = { eventType: '', data: '' };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.events.getAll();
      setEvents(res.data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(ev) {
    setEditTarget(ev);
    setForm({ eventType: ev.eventType, data: ev.data || '' });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.events.create(form);
      toast.success('Event created');
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.events.update(editTarget.id, form);
      toast.success('Event updated');
      setEditTarget(null);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.events.delete(deleteTarget.id);
      toast.success('Event deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  const sorted = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Events"
        subtitle="Manage the event types dispatched to your subscribers"
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-text-faint">{events.length} event{events.length !== 1 ? 's' : ''}</span>
          <button className="btn-primary" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> New Event
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Activity}
              title="No events yet"
              description="Create your first event to start dispatching webhooks to subscribers."
              action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" />New Event</button>}
            />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-surface/50">
                  <tr>
                    {['ID', 'Event Type', 'Payload Preview', 'Created', 'Actions'].map(h => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {sorted.map((ev, i) => (
                      <motion.tr
                        key={ev.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="table-row group"
                      >
                        <td className="table-td">
                          <span className="font-mono text-xs text-text-faint" title={ev.id}>
                            {truncate(ev.id, 12)}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className="badge-violet flex items-center gap-1 w-fit">
                            <Activity className="w-3 h-3" />
                            {ev.eventType}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className="text-xs text-text-faint font-mono truncate max-w-[200px] block">
                            {ev.data ? truncate(ev.data, 40) : '—'}
                          </span>
                        </td>
                        <td className="table-td text-xs text-text-faint">{fmtTime(ev.createdAt)}</td>
                        <td className="table-td">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(ev)} className="btn-ghost py-1 px-2" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget(ev)} className="btn-ghost py-1 px-2 text-rose-400 hover:text-rose-300" title="Delete">
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
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Event">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Event Type</label>
            <input className="input" placeholder="user.signup, order.completed, payment.failed…"
              value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Payload (JSON)</label>
            <textarea
              className="input font-mono resize-none"
              rows={6}
              placeholder={'{\n  "userId": "abc123",\n  "plan": "pro"\n}'}
              value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Event'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Event">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">Event Type</label>
            <input className="input" value={form.eventType}
              onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Payload (JSON)</label>
            <textarea className="input font-mono resize-none" rows={6} value={form.data}
              onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Delete event "${deleteTarget?.eventType}"? Existing delivery attempts referencing this event will remain in the database.`}
        loading={deleting}
      />
    </div>
  );
}
