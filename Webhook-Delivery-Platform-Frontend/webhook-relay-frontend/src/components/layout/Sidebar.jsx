import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, Users, Activity, GitBranch, Settings, Webhook } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/',                 icon: LayoutDashboard, label: 'Overview'   },
  { to: '/deliveries',       icon: Zap,             label: 'Deliveries' },
  { to: '/subscribers',      icon: Users,           label: 'Subscribers'},
  { to: '/events',           icon: Activity,        label: 'Events'     },
  { to: '/circuit-breakers', icon: GitBranch,       label: 'Circuits'   },
  { to: '/settings',         icon: Settings,        label: 'Settings'   },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col bg-bg-surface border-r border-border z-40">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 flex items-center justify-center shadow-violet flex-shrink-0">
          <Webhook className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">WebhookRelay</p>
          <p className="text-[10px] text-text-faint leading-tight">Delivery Platform</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => cn('sidebar-item group', isActive && 'active')}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-violet-400' : 'text-text-faint group-hover:text-text-secondary')} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {isActive && <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-violet-400" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2.5 rounded-lg bg-bg-card border border-border">
          <p className="text-[10px] text-text-faint mb-0.5 uppercase tracking-wider">API Status</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-text-secondary">Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
