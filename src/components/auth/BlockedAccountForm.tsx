import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';
import { useGetBillingPortalUrl } from '@hooks/api/useAuth';

export default function BlockedAccountForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingUrl, setBillingUrl] = useState<string | null>(null);

  const getBillingUrl = useGetBillingPortalUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Please enter your password');
      return;
    }

    getBillingUrl.mutate(
      { email, password },
      {
        onSuccess: (url) => {
          setBillingUrl(url);
        },
        onError: (err) => {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setError('Invalid email or password. Please try again.');
          } else if (axiosError.response?.status === 404) {
            setError('No account found with this email address.');
          } else {
            setError('Unable to access billing portal. Please contact support.');
          }
        },
      }
    );
  };

  const handleOpenBilling = () => {
    if (billingUrl) {
      window.open(billingUrl, '_blank');
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto w-full max-w-md pt-10">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to sign in
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        {billingUrl ? (
          // Success state - show billing portal link
          <div className="space-y-5">
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                Billing Portal Access
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your identity has been verified.
              </p>
            </div>

            <Alert
              variant="success"
              title="Verified"
              message="Click the button below to open the billing portal where you can update your payment method."
            />

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                In the billing portal, you can:
              </p>
              <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>Update your payment method</li>
                <li>View your billing history</li>
                <li>Manage your subscription</li>
              </ul>
              <Button onClick={handleOpenBilling} className="w-full">
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
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              After updating your payment information, return here and{' '}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                sign in again
              </Link>
              .
            </p>
          </div>
        ) : (
          // Credential entry state
          <>
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                Subscription Inactive
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your Quest subscription is currently inactive. This may be due to
                an expired payment method or a cancelled subscription.
              </p>
            </div>

            {error && (
              <div className="mb-4">
                <Alert variant="error" title="Error" message={error} />
              </div>
            )}

            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                To update your payment information and reactivate your account,
                please verify your identity below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={getBillingUrl.isPending}
                  />
                </div>

                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={getBillingUrl.isPending}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={getBillingUrl.isPending}
                  >
                    {getBillingUrl.isPending
                      ? 'Verifying...'
                      : 'Access Billing Portal'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 space-y-2">
              <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
                Need a new account?{' '}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
              <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
                Forgot your password?{' '}
                <Link
                  to="/reset-password"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Reset Password
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
