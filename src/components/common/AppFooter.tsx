import { Link } from 'react-router';
import { useApiVersion } from '../../hooks/useApiVersion';

/**
 * Application footer with version info, copyright, and legal links
 * Only used in the main app layout (not auth pages)
 */
export default function AppFooter() {
  const apiVersion = useApiVersion();
  const appVersion = __APP_VERSION__;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          APP v{appVersion} | API v{apiVersion || '...'} | &copy; {currentYear} Lifestyles Discovery LLC. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use of this site and software constitutes acceptance of our{' '}
          <Link
            to="/privacy"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link
            to="/terms"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
