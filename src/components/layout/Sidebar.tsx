import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { BrandMark } from '@/components/layout/BrandMark';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { APP_NAME, ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => (
  <aside
    aria-label="Main navigation"
    className={cn(
      'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line/60 bg-surface transition-[width] duration-300 lg:flex',
      collapsed ? 'w-20' : 'w-64',
    )}
  >
    <div className={cn('flex h-16 items-center gap-2 px-4', collapsed && 'justify-center')}>
      <Link to={ROUTES.landing} className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
        <BrandMark className="h-10 w-10 rounded-[0.9rem]" iconSize={20} />
        {!collapsed && <span className="font-heading text-xl font-bold tracking-tight text-fg">{APP_NAME}</span>}
      </Link>
    </div>
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={item.label}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              collapsed && 'justify-center',
              isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-raised hover:text-fg',
            )
          }
        >
          <item.icon size={20} aria-hidden="true" className="shrink-0" />
          <span className={cn(collapsed && 'sr-only')}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="m-3 flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted transition hover:bg-raised hover:text-fg"
    >
      {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
      {!collapsed && 'Collapse'}
    </button>
  </aside>
);
