import { NavLink } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '@/components/layout/navigation';
import { cn } from '@/lib/cn';

export const BottomNav = () => (
  <nav
    aria-label="Mobile navigation"
    className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
  >
    <ul className="mx-auto grid max-w-md grid-cols-5">
      {MOBILE_NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition',
                isActive ? 'text-primary' : 'text-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('rounded-full px-4 py-1 transition', isActive && 'bg-pale')}>
                  <item.icon size={20} aria-hidden="true" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
