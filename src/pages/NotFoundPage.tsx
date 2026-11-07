import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonClass } from '@/components/ui/buttonStyles';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/lib/routes';

export const NotFoundPage = () => {
  useDocumentTitle('Page not found');

  return (
    <EmptyState
      icon={<Compass size={32} aria-hidden="true" />}
      title="We could not find that page"
      description="The link may be out of date, or the page may have moved. Head back to your dashboard to keep going."
      action={
        <Link to={ROUTES.dashboard} className={buttonClass('primary', 'lg')}>
          Go to dashboard
        </Link>
      }
    />
  );
};
