import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="flex gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed pt-1">{description}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting…' : 'Delete'}</button>
      </div>
    </Modal>
  );
}
