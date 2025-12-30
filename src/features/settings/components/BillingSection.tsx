import { useState } from 'react';
import Button from '@components/ui/button/Button';
import Alert from '@components/ui/alert/Alert';
import { useGetChargifyUrl } from '@hooks/api/useSettings';
import { useAuth } from '@context/AuthContext';

export function BillingSection() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const getChargifyUrl = useGetChargifyUrl();

  const handleOpenBilling = () => {
    setError(null);

    getChargifyUrl.mutate(
      { userId: user!.id },
      {
        onSuccess: (url) => {
          window.open(url, '_blank');
        },
        onError: () => {
          setError('Unable to open billing portal. Please try again.');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Billing & Subscription
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
            <svg
              className="h-6 w-6 text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 dark:text-white/90">
              Billing Portal
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View invoices, update payment methods, and manage your subscription
              through our secure billing portal.
            </p>
            <div className="mt-4">
              <Button
                onClick={handleOpenBilling}
                disabled={getChargifyUrl.isPending}
              >
                {getChargifyUrl.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Opening...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open Billing Portal
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
