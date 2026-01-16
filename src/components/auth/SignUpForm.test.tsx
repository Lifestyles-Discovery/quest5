import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import { subscriptionService } from '@services/subscription.service';
import { authService } from '@services/auth.service';
import {
  mockProductStatusResponses,
  mockSession,
  mockUserId,
} from '@/test/mocks/auth.mocks';

// Mock the services
vi.mock('@services/subscription.service', () => ({
  subscriptionService: {
    getProductStatus: vi.fn(),
    createSubscription: vi.fn(),
  },
}));

vi.mock('@services/auth.service', () => ({
  authService: {
    signIn: vi.fn(),
  },
}));

// Mock react-router navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock activity tracking
vi.mock('@services/activity.service', () => ({
  trackActivity: vi.fn(),
}));

describe('SignUpForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  /**
   * Helper to fill in the account step fields
   */
  async function fillAccountStep(options?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    agreeToTerms?: boolean;
  }) {
    const {
      firstName = 'Paul',
      lastName = 'Johnson',
      email = 'test@example.com',
      password = 'password123',
      agreeToTerms = true,
    } = options || {};

    // Only type if value is non-empty (userEvent.type doesn't handle empty strings)
    if (firstName) {
      await user.type(screen.getByPlaceholderText('Enter your first name'), firstName);
    }
    if (lastName) {
      await user.type(screen.getByPlaceholderText('Enter your last name'), lastName);
    }
    if (email) {
      await user.type(screen.getByPlaceholderText('Enter your email'), email);
    }
    if (password) {
      await user.type(screen.getByPlaceholderText('Enter your password'), password);
    }

    if (agreeToTerms) {
      await user.click(screen.getByRole('checkbox'));
    }
  }

  /**
   * Helper to fill in the billing step fields
   */
  async function fillBillingStep(options?: {
    firstNameOnCard?: string;
    lastNameOnCard?: string;
    cardNumber?: string;
    expMonth?: string;
    expYear?: string;
    cvv?: string;
  }) {
    const {
      firstNameOnCard = 'Paul',
      lastNameOnCard = 'Johnson',
      cardNumber = '4111111111111111',
      expMonth = '12',
      expYear = '25',
      cvv = '123',
    } = options || {};

    // Only fill if the fields are empty (they may be pre-filled)
    const firstNameInput = screen.getByPlaceholderText('First name');
    if ((firstNameInput as HTMLInputElement).value === '') {
      await user.type(firstNameInput, firstNameOnCard);
    }

    const lastNameInput = screen.getByPlaceholderText('Last name');
    if ((lastNameInput as HTMLInputElement).value === '') {
      await user.type(lastNameInput, lastNameOnCard);
    }

    await user.type(screen.getByPlaceholderText('1234 5678 9012 3456'), cardNumber);
    await user.type(screen.getByPlaceholderText('MM'), expMonth);
    await user.type(screen.getByPlaceholderText('YY'), expYear);
    await user.type(screen.getByPlaceholderText('123'), cvv);
  }

  describe('Account Step Validation', () => {
    it('shows error when first name is empty', async () => {
      render(<SignUpForm />);

      await fillAccountStep({ firstName: '' });
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });

    it('shows error when last name is empty', async () => {
      render(<SignUpForm />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'Paul');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });

    it('shows error when email is invalid', async () => {
      render(<SignUpForm />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'Paul');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Johnson');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      expect(screen.getByText('Valid email is required')).toBeInTheDocument();
    });

    it('shows error when password is too short', async () => {
      render(<SignUpForm />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'Paul');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Johnson');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), '123');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      expect(screen.getByText('Password must be at least 4 characters')).toBeInTheDocument();
    });

    it('shows error when terms not agreed to', async () => {
      render(<SignUpForm />);

      await fillAccountStep({ agreeToTerms: false });
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      expect(screen.getByText('You must agree to the Terms and Conditions')).toBeInTheDocument();
    });
  });

  describe('Product Status Check - New User (CreateSubscription)', () => {
    it('allows new user to proceed to billing step', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      // Should proceed to billing step
      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Should see card number input
      expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    });
  });

  describe('Product Status Check - Existing Active User (SignIn)', () => {
    it('shows error for user with active subscription', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.signIn
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(
          screen.getByText('This email is already registered. Please sign in or use a different email.')
        ).toBeInTheDocument();
      });

      // Should NOT proceed to billing step
      expect(screen.queryByText('Payment Details')).not.toBeInTheDocument();
    });
  });

  describe('Product Status Check - Cancelled User (Reactivate)', () => {
    it('shows reactivation message for cancelled subscription', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.reactivate
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Your subscription is cancelled. Please sign in to reactivate.')
        ).toBeInTheDocument();
      });

      // Should NOT proceed to billing step
      expect(screen.queryByText('Payment Details')).not.toBeInTheDocument();
    });
  });

  describe('Product Status Check - On Hold User (Resume)', () => {
    it('shows resume message for subscription on hold', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.resume
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Your subscription is on hold. Please sign in to resume.')
        ).toBeInTheDocument();
      });

      // Should NOT proceed to billing step
      expect(screen.queryByText('Payment Details')).not.toBeInTheDocument();
    });
  });

  describe('Product Status Check - Other Status (Generic Error)', () => {
    it('shows generic error for other statuses like BillingPortal', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.billingPortal
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(
          screen.getByText('This email is already registered. Please sign in.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Product Status Check - API Failure', () => {
    it('continues to billing step when status check fails', async () => {
      (subscriptionService.getProductStatus as Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      // Should proceed to billing step despite API error
      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });
    });
  });

  describe('Billing Step Validation', () => {
    beforeEach(async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );
    });

    it('shows error when card number is invalid', async () => {
      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '1234');
      await user.type(screen.getByPlaceholderText('MM'), '12');
      await user.type(screen.getByPlaceholderText('YY'), '25');
      await user.type(screen.getByPlaceholderText('123'), '123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Valid card number is required')).toBeInTheDocument();
    });

    it('shows error when CVV is invalid', async () => {
      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '4111111111111111');
      await user.type(screen.getByPlaceholderText('MM'), '12');
      await user.type(screen.getByPlaceholderText('YY'), '25');
      await user.type(screen.getByPlaceholderText('123'), '12');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText('Valid CVV is required')).toBeInTheDocument();
    });
  });

  describe('Successful Subscription Creation and Sign-In', () => {
    it('creates subscription and signs in user on success', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );
      (subscriptionService.createSubscription as Mock).mockResolvedValue(mockUserId);
      (authService.signIn as Mock).mockResolvedValue(mockSession);

      render(<SignUpForm />);

      // Fill account step
      await fillAccountStep({ email: 'newuser@example.com' });
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Fill billing step
      await fillBillingStep();
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Wait for subscription creation
      await waitFor(() => {
        expect(subscriptionService.createSubscription).toHaveBeenCalledWith({
          firstName: 'Paul',
          lastName: 'Johnson',
          email: 'newuser@example.com',
          password: 'password123',
          firstNameOnCard: 'Paul',
          lastNameOnCard: 'Johnson',
          cardNumber: '4111111111111111',
          cardExpMonth: '12',
          cardExpYear: '25',
          cardCvv: '123',
        });
      });

      // Wait for sign-in
      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      // Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('redirects to sign-in page when post-signup sign-in fails', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );
      (subscriptionService.createSubscription as Mock).mockResolvedValue(mockUserId);
      (authService.signIn as Mock).mockRejectedValue(new Error('Sign-in failed'));

      render(<SignUpForm />);

      // Fill account step
      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Fill billing step
      await fillBillingStep();
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Should redirect to sign-in page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin');
      });
    });
  });

  describe('Subscription Creation Failure', () => {
    it('shows error message when subscription creation fails', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );
      (subscriptionService.createSubscription as Mock).mockRejectedValue({
        response: {
          data: {
            message: 'Card declined',
          },
        },
      });

      render(<SignUpForm />);

      // Fill account step
      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Fill billing step
      await fillBillingStep();
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Card declined')).toBeInTheDocument();
      });

      // Should NOT call sign-in
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('shows generic error when API returns no message', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );
      (subscriptionService.createSubscription as Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<SignUpForm />);

      // Fill account step
      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Fill billing step
      await fillBillingStep();
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Should show generic error message
      await waitFor(() => {
        expect(screen.getByText('Failed to create subscription. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('can go back from billing step to account step', async () => {
      (subscriptionService.getProductStatus as Mock).mockResolvedValue(
        mockProductStatusResponses.createSubscription
      );

      render(<SignUpForm />);

      await fillAccountStep();
      await user.click(screen.getByRole('button', { name: /continue to payment/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Details')).toBeInTheDocument();
      });

      // Click back button
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Should be back on account step
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    });
  });
});
