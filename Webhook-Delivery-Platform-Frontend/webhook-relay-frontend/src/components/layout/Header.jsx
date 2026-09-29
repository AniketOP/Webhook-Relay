import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ title, subtitle, onRefresh, refreshing }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-bg-surface/50 backdrop-blur sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-faint mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh} className="btn-ghost" title="Refresh">
            <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}>
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </button>
        )}
      </div>
    </header>
  );
}
