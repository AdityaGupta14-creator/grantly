import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/layout/BrandMark';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { APP_NAME, ROUTES } from '@/lib/routes';
import { useProfileStore } from '@/store/profileStore';

export const Header = ({ showNotifications }: { showNotifications: boolean }) => {
  const hasProfile = useProfileStore((state) => state.profile !== null);
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={ROUTES.landing} className={`flex items-center gap-2 rounded-lg ${showNotifications ? 'lg:hidden' : ''}`} aria-label={`${APP_NAME} home`}>
          <BrandMark className="h-10 w-10 rounded-[0.9rem]" iconSize={20} />
          <span className="font-heading text-xl font-bold tracking-tight text-fg">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-2">
          {showNotifications && hasProfile && <NotificationBell />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
