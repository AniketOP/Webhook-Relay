import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Pencil, Trash2, Globe, Mail, Key } from 'lucide-react';
import Header from '../components/layout/Header';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { api } from '../api/client';
import { fmtDate, truncate } from '../lib/utils';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', url: '' };

export default function Subscribers() {
  const [subs, setSubs] = useState([]);
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
      const res = await api.subscribers.getAll();
      setSubs(res.data);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(s) {
    setEditTarget(s);
    setForm({ name: s.name, email: s.email, url: s.url });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.subscribers.create(form);
      toast.success('Subscriber created');
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create subscriber';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.subscribers.update(editTarget.subscriberId, form);
      toast.success('Updated');
      setEditTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.subscribers.delete(deleteTarget.subscriberId);
      toast.success('Deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Subscribers"
        subtitle="Registered endpoints that receive your webhook events"
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 p-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-text-faint">{subs.length} subscriber{subs.length !== 1 ? 's' : ''} registered</span>
          <button className="btn-primary" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> Add Subscriber
          </button>
        </div>

        {/* Grid */}
        {subs.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title="No subscribers yet"
              description="Add a subscriber to start receiving webhook events at their endpoint."
              action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" />Add Subscriber</button>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {subs.map((s, i) => (
                <motion.div
                  key={s.subscriberId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="card p-5 group hover:shadow-card-hover transition-all"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-sky-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-violet-400">
                          {s.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${s.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-text-faint/15 text-text-faint'}`}>
                          {s.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(s)} className="btn-ghost py-1 px-2" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="btn-ghost py-1 px-2 text-rose-400 hover:text-rose-300" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-text-faint">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
                      <span className="truncate text-text-secondary">{s.url}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2 text-xs text-text-faint">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-faint">
                      <Key className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span className="font-mono">{truncate(s.secret, 16) || 'No secret'}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-text-faint font-mono">{truncate(s.subscriberId, 12)}</span>
                    <span className="text-[10px] text-text-faint">{fmtDate(s.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Subscriber">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="My Service" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="ops@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Endpoint URL</label>
            <input className="input" type="url" placeholder="https://example.com/webhook" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required />
          </div>
          <p className="text-xs text-text-faint bg-bg-hover rounded-lg px-3 py-2.5 border border-border">
            🔐 A HMAC secret will be auto-generated. Local / private IPs are rejected for security.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Add Subscriber'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Subscriber">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Endpoint URL</label>
            <input className="input" type="url" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required />
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
        title="Delete Subscriber"
        description={`Delete "${deleteTarget?.name}"? All associated delivery history will remain but no new events will be dispatched.`}
        loading={deleting}
      />
    </div>
  );
}
