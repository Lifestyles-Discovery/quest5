import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';
import {
  useReactivateSubscription,
  useResumeSubscription,
  useSignIn,
} from '@hooks/api/useAuth';

export default function ReactivateForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reactivate = useReactivateSubscription();
  const resume = useResumeSubscription();
  const signIn = useSignIn();

  const isPending = reactivate.isPending || resume.isPending || signIn.isPending;

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

    // Try to reactivate first (for cancelled subscriptions)
    try {
      await reactivate.mutateAsync({ email, password });
      setSuccess(true);
      // After reactivation, sign in automatically
      setTimeout(() => {
        signIn.mutate(
          { email, password },
          {
            onSuccess: () => navigate('/'),
            onError: () => navigate('/signin'),
          }
        );
      }, 1500);
      return;
    } catch (reactivateError) {
      // If reactivation fails, try resume (for on-hold subscriptions)
      try {
        await resume.mutateAsync({ email, password });
        setSuccess(true);
        setTimeout(() => {
          signIn.mutate(
            { email, password },
            {
              onSuccess: () => navigate('/'),
              onError: () => navigate('/signin'),
            }
          );
        }, 1500);
        return;
      } catch {
        // Both failed
        const err = reactivateError as { response?: { status?: number } };
        if (err.response?.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(
            'Unable to reactivate subscription. Please contact support if the problem persists.'
          );
        }
      }
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
        <div className="mb-5 sm:mb-8">
          <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Reactivate Your Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your credentials to reactivate your Quest subscription.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error" title="Error" message={error} />
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <Alert
              variant="success"
              title="Account Reactivated"
              message="Your subscription has been reactivated. Signing you in..."
            />
          </div>
        ) : (
          <div>
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
                    disabled={isPending}
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
                      disabled={isPending}
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
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Reactivating...' : 'Reactivate Account'}
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
          </div>
        )}
      </div>
    </div>
  );
}
