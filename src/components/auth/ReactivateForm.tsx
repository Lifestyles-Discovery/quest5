import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import Alert from '../ui/alert/Alert';
import Checkbox from '../form/input/Checkbox';
import {
  useReactivateSubscription as useSimpleReactivate,
  useResumeSubscription,
  useSignIn,
  useGetBillingPortalUrl,
  useGetProductStatus,
} from '@hooks/api/useAuth';
import { useReactivateSubscription } from '@hooks/api/useSettings';

type Step = 'credentials' | 'checking' | 'confirm' | 'reactivating' | 'billing' | 'success';

interface LocationState {
  email?: string;
  password?: string;
}

export default function ReactivateForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Step tracking - start with 'checking' if we have credentials from sign-in
  const [step, setStep] = useState<Step>(
    locationState?.email && locationState?.password ? 'checking' : 'credentials'
  );

  // Credentials - pre-fill from location state if available
  const [email, setEmail] = useState(locationState?.email || '');
  const [password, setPassword] = useState(locationState?.password || '');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Credit card info
  const [firstNameOnCard, setFirstNameOnCard] = useState('');
  const [lastNameOnCard, setLastNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // User ID from authentication step
  const [userId, setUserId] = useState<string | null>(null);

  // Subscription status info for confirmation screen
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    nextCall: string;
    price: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const simpleReactivate = useSimpleReactivate();
  const resume = useResumeSubscription();
  const signIn = useSignIn();
  const getBillingUrl = useGetBillingPortalUrl();
  const reactivateWithCard = useReactivateSubscription();
  const getProductStatus = useGetProductStatus();

  const isPending =
    simpleReactivate.isPending ||
    resume.isPending ||
    signIn.isPending ||
    getBillingUrl.isPending ||
    reactivateWithCard.isPending ||
    getProductStatus.isPending;

  // Check subscription status when credentials are passed from sign-in page
  useEffect(() => {
    if (step !== 'checking' || !email || !password) return;

    const checkStatus = async () => {
      try {
        // Get subscription status to show appropriate confirmation
        const status = await getProductStatus.mutateAsync(email);

        // Get userId for later use
        const { userId: returnedUserId } = await getBillingUrl.mutateAsync({ email, password });
        setUserId(returnedUserId);

        // Store status for confirmation screen
        setSubscriptionStatus({
          nextCall: status.nextCall,
          price: status.price,
        });

        // Show confirmation screen
        setStep('confirm');
      } catch {
        // Credentials invalid or other error
        setError('Unable to verify your account. Please try signing in again.');
        setStep('credentials');
      }
    };

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Handle reactivation after user confirms
  useEffect(() => {
    if (step !== 'reactivating' || !email || !password) return;

    const attemptReactivation = async () => {
      // Try resume first (for on-hold subscriptions)
      if (subscriptionStatus?.nextCall === 'Resume') {
        try {
          await resume.mutateAsync({ email, password });
          setStep('success');
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
          // Resume failed, might need billing update
          setStep('billing');
          return;
        }
      }

      // Try simple reactivation (for cancelled subscriptions with valid card)
      try {
        await simpleReactivate.mutateAsync({ email, password });
        setStep('success');
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
        // Card needs updating - show billing form
        setStep('billing');
      }
    };

    attemptReactivation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  // Step 1: Verify credentials and show confirmation
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

    // Check subscription status and get userId
    try {
      const status = await getProductStatus.mutateAsync(email);
      const { userId: returnedUserId } = await getBillingUrl.mutateAsync({ email, password });

      setUserId(returnedUserId);
      setSubscriptionStatus({
        nextCall: status.nextCall,
        price: status.price,
      });

      // Show confirmation screen
      setStep('confirm');
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401 || error.response?.status === 404) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(
          'Unable to verify your account. Please contact support if the problem persists.'
        );
      }
    }
  };

  // Step 2: Submit credit card info for reactivation
  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstNameOnCard.trim() || !lastNameOnCard.trim()) {
      setError('Please enter the name on your card');
      return;
    }

    const cardDigits = cardNumber.replace(/\D/g, '');
    if (cardDigits.length < 15) {
      setError('Please enter a valid card number');
      return;
    }

    if (
      !cardExpMonth ||
      !cardExpYear ||
      parseInt(cardExpMonth) < 1 ||
      parseInt(cardExpMonth) > 12
    ) {
      setError('Please enter a valid expiration date');
      return;
    }

    if (cardCvv.length < 3) {
      setError('Please enter a valid CVV');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (!userId) {
      setError('Session expired. Please start over.');
      setStep('credentials');
      return;
    }

    try {
      await reactivateWithCard.mutateAsync({
        userId,
        firstNameOnCard,
        lastNameOnCard,
        cardNumber: cardDigits,
        cardExpMonth,
        cardExpYear,
        cardCvv,
      });

      setStep('success');
      setTimeout(() => {
        signIn.mutate(
          { email, password },
          {
            onSuccess: () => navigate('/'),
            onError: () => navigate('/signin'),
          }
        );
      }, 1500);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setError(
        error.response?.data ||
          'Unable to reactivate subscription. Please check your card details and try again.'
      );
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
        {step === 'success' ? (
          <div className="space-y-5">
            <Alert
              variant="success"
              title="Account Reactivated"
              message="Your subscription has been reactivated. Signing you in..."
            />
          </div>
        ) : step === 'checking' ? (
          <div className="space-y-5 text-center">
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                Checking Your Account
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we check your subscription status...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          </div>
        ) : step === 'confirm' ? (
          <div className="space-y-5">
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                {subscriptionStatus?.nextCall === 'Resume'
                  ? 'Resume Your Subscription'
                  : 'Reactivate Your Subscription'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subscriptionStatus?.nextCall === 'Resume'
                  ? 'Your subscription is currently on hold.'
                  : 'Your subscription is no longer active.'}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Quest Monthly</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscriptionStatus?.nextCall === 'Resume'
                      ? 'Your billing will resume'
                      : 'Billed monthly'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    ${subscriptionStatus?.price || 79}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">/month</p>
                </div>
              </div>
            </div>

            {subscriptionStatus?.nextCall !== 'Resume' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your card on file will be charged when you reactivate.
              </p>
            )}

            <Button
              className="w-full"
              onClick={() => setStep('reactivating')}
              disabled={isPending}
            >
              {subscriptionStatus?.nextCall === 'Resume'
                ? 'Resume Subscription'
                : 'Reactivate Subscription'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : step === 'reactivating' ? (
          <div className="space-y-5 text-center">
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                {subscriptionStatus?.nextCall === 'Resume'
                  ? 'Resuming Your Subscription'
                  : 'Reactivating Your Account'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we restore your subscription...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          </div>
        ) : step === 'billing' ? (
          // Billing step - need updated payment info
          <>
            <div className="mb-5 sm:mb-8">
              <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
                Update Payment Method
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your subscription is inactive. Enter new payment details to reactivate your account.
              </p>
            </div>

            {error && (
              <div className="mb-4">
                <Alert variant="error" title="Error" message={error} />
              </div>
            )}

            <form onSubmit={handleBillingSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      First Name on Card<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={firstNameOnCard}
                      onChange={(e) => setFirstNameOnCard(e.target.value)}
                      placeholder="First name"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Label>
                      Last Name on Card<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={lastNameOnCard}
                      onChange={(e) => setLastNameOnCard(e.target.value)}
                      placeholder="Last name"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    Card Number<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      if (formatted.length <= 19) {
                        setCardNumber(formatted);
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    disabled={isPending}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>
                      Month<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={cardExpMonth}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 2) {
                          setCardExpMonth(val);
                        }
                      }}
                      placeholder="MM"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Label>
                      Year<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={cardExpYear}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) {
                          setCardExpYear(val);
                        }
                      }}
                      placeholder="YYYY"
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <Label>
                      CVV<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) {
                          setCardCvv(val);
                        }
                      }}
                      placeholder="123"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={setAgreedToTerms}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-brand-500 hover:text-brand-600"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-brand-500 hover:text-brand-600"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                <div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Reactivating...' : 'Reactivate Subscription'}
                  </Button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          // Step 1: Credentials
          <>
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

            <form onSubmit={handleCredentialsSubmit}>
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
                    {isPending ? 'Verifying...' : 'Continue'}
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
