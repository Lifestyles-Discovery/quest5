import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Checkbox from '../form/input/Checkbox';
import Alert from '../ui/alert/Alert';
import Button from '../ui/button/Button';
import { useCreateSubscription, useGetProductStatus } from '@hooks/api/useAuth';

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'account' | 'billing'>('account');

  // Account info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Billing info
  const [firstNameOnCard, setFirstNameOnCard] = useState('');
  const [lastNameOnCard, setLastNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const createSubscription = useCreateSubscription();
  const getProductStatus = useGetProductStatus();

  const validateAccountStep = () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return false;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Conditions');
      return false;
    }
    return true;
  };

  const handleContinueToBilling = async () => {
    setError(null);

    if (!validateAccountStep()) {
      return;
    }

    // Check subscription status to see if user can proceed with sign-up
    try {
      const status = await getProductStatus.mutateAsync(email);
      // If NextCall is not CreateSubscription, user already has account or needs different action
      if (status.NextCall !== 'CreateSubscription') {
        if (status.NextCall === 'SignIn') {
          setError(
            'This email is already registered. Please sign in or use a different email.'
          );
        } else if (status.NextCall === 'Reactivate') {
          setError(
            'Your subscription is cancelled. Please sign in to reactivate.'
          );
        } else if (status.NextCall === 'Resume') {
          setError('Your subscription is on hold. Please sign in to resume.');
        } else {
          setError('This email is already registered. Please sign in.');
        }
        return;
      }
    } catch {
      // If status check fails, continue anyway - the subscription creation will catch issues
    }

    // Pre-fill billing name from account name
    if (!firstNameOnCard) setFirstNameOnCard(firstName);
    if (!lastNameOnCard) setLastNameOnCard(lastName);

    setStep('billing');
  };

  const validateBillingStep = () => {
    if (!firstNameOnCard.trim()) {
      setError('First name on card is required');
      return false;
    }
    if (!lastNameOnCard.trim()) {
      setError('Last name on card is required');
      return false;
    }
    if (!cardNumber.trim() || cardNumber.length < 13) {
      setError('Valid card number is required');
      return false;
    }
    if (!cardExpMonth || parseInt(cardExpMonth) < 1 || parseInt(cardExpMonth) > 12) {
      setError('Valid expiration month (1-12) is required');
      return false;
    }
    if (!cardExpYear || cardExpYear.length < 2) {
      setError('Valid expiration year is required');
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setError('Valid CVV is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateBillingStep()) {
      return;
    }

    createSubscription.mutate(
      {
        firstName,
        lastName,
        email,
        password,
        firstNameOnCard,
        lastNameOnCard,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpMonth,
        cardExpYear,
        cardCvv,
      },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to create subscription. Please try again.';
          setError(message);
        },
      }
    );
  };

  const isPending = createSubscription.isPending || getProductStatus.isPending;

  return (
    <div className="flex w-full flex-1 flex-col overflow-y-auto no-scrollbar lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to sign in
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
              {step === 'account' ? 'Create Account' : 'Payment Details'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 'account'
                ? 'Enter your details to create your Quest account'
                : 'Enter your payment details to complete signup'}
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" title="Error" message={error} />
            </div>
          )}

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'account'
                  ? 'bg-brand-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {step === 'billing' ? '✓' : '1'}
            </div>
            <div className="h-0.5 w-8 bg-gray-200 dark:bg-gray-700" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === 'billing'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
              }`}
            >
              2
            </div>
          </div>

          <form onSubmit={step === 'billing' ? handleSubmit : (e) => e.preventDefault()}>
            {step === 'account' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      disabled={isPending}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      disabled={isPending}
                    />
                  </div>
                </div>

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
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center gap-3">
                  <Checkbox
                    className="h-5 w-5"
                    checked={agreedToTerms}
                    onChange={setAgreedToTerms}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    I agree to the{' '}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>

                <div>
                  <Button
                    className="w-full"
                    onClick={handleContinueToBilling}
                    disabled={isPending}
                  >
                    {getProductStatus.isPending ? 'Checking...' : 'Continue to Payment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
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
                  <div className="sm:col-span-1">
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
                    onChange={(e) => setCardNumber(e.target.value)}
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
                      onChange={(e) => setCardExpMonth(e.target.value)}
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
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="YY"
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
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('account')}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isPending}>
                    {createSubscription.isPending ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-5">
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
