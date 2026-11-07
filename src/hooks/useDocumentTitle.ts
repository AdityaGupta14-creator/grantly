import { useEffect } from 'react';
import { APP_NAME } from '@/lib/routes';

export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);
};
