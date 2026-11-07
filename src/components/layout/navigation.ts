import { Calendar, Compass, FolderOpen, LayoutDashboard, Kanban, Scale, UserRound, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.discover, label: 'Discover', icon: Compass },
  { to: ROUTES.tracker, label: 'Tracker', icon: Kanban },
  { to: ROUTES.documents, label: 'Documents', icon: FolderOpen },
  { to: ROUTES.calendar, label: 'Calendar', icon: Calendar },
  { to: ROUTES.compare, label: 'Compare', icon: Scale },
  { to: ROUTES.profile, label: 'Profile', icon: UserRound },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[4],
  NAV_ITEMS[6],
];
