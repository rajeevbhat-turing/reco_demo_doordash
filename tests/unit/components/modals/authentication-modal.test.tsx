import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthenticationModal from '@/components/modals/authentication-modal';

// Mock dependencies
const mockAddUser = vi.fn();

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: (state: any) => any) => {
    const mockState = {
      addUser: mockAddUser,
    };
    return selector(mockState);
  },
}));

vi.mock('@/components/modals/otp-verification-modal', () => ({
  default: ({
    isOpen,
    onClose,
    phoneNumber,
    countryCode,
  }: {
    isOpen: boolean;
    onClose: () => void;
    phoneNumber: string;
    countryCode: string;
  }) =>
    isOpen ? (
      <div data-testid="otp-verification-modal">
        <div>OTP Verification Modal</div>
        <div>
          Phone: {countryCode} {phoneNumber}
        </div>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('@/components/modals/country-code-dropdown', () => ({
  default: ({
    isOpen,
    onClose,
    selectedCountry: _selectedCountry,
    onSelect,
  }: {
    isOpen: boolean;
    onClose: () => void;
    selectedCountry: any;
    onSelect: (country: any) => void;
  }) =>
    isOpen ? (
      <div data-testid="country-code-dropdown">
        <div>Country Code Dropdown</div>
        <button onClick={onClose} data-testid="close-country-dropdown">
          <span>X</span>
        </button>
        <button onClick={() => onSelect({ code: 'US', dial_code: '+1', name: 'United States' })}>
          🇺🇸 United States +1
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/authentication/sign-in', () => ({
  default: ({
    onSuccess,
    setMode,
    initialEmail,
  }: {
    onSuccess: () => void;
    setMode: (mode: 'signin' | 'signup' | 'forgot-password', email?: string) => void;
    initialEmail?: string;
  }) => (
    <div data-testid="sign-in">
      <div>Sign In Component</div>
      {initialEmail && <div>Initial Email: {initialEmail}</div>}
      <button onClick={onSuccess} data-testid="sign-in-button">
        Sign In
      </button>
      <button onClick={() => setMode('signup')}>Create an account</button>
      <button onClick={() => setMode('forgot-password', 'test@example.com')}>Reset Password</button>
    </div>
  ),
}));

vi.mock('@/components/authentication/sign-up', () => ({
  default: ({
    onShowOTP,
    selectedCountry,
    setShowCountryDropdown,
  }: {
    onShowOTP: (user: any) => void;
    selectedCountry: any;
    setShowCountryDropdown: (show: boolean) => void;
  }) => (
    <div data-testid="sign-up">
      <div>Sign Up Component</div>
      <button onClick={() => setShowCountryDropdown(true)} data-testid="country-button">
        {selectedCountry?.emoji} {selectedCountry?.dial_code}
      </button>
      <button
        onClick={() =>
          onShowOTP({
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '1234567890',
            country: selectedCountry,
            password: 'Password123!',
          })
        }
      >
        Show OTP
      </button>
    </div>
  ),
}));

vi.mock('@/components/authentication/forgot-password', () => ({
  default: ({
    onBackToSignIn,
    email,
    setMode,
  }: {
    onBackToSignIn: () => void;
    email: string;
    setMode: (mode: 'signin' | 'signup' | 'forgot-password', email?: string) => void;
  }) => (
    <div data-testid="forgot-password">
      <div>Forgot Password Component</div>
      {email && <div data-testid="forgot-password-email">{email}</div>}
      <button onClick={onBackToSignIn}>Back to Sign In</button>
      <button onClick={() => setMode('signin')}>Switch to Sign In</button>
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

vi.mock('@/lib/utils/countryCode.json', () => ({
  default: [
    { code: 'US', dialCode: '+1', name: 'United States' },
    { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
    { code: 'CA', dialCode: '+1', name: 'Canada' },
  ],
}));

describe('AuthenticationModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    // Mock navigator for country detection
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
  });

  it('should not render when defaultMode is null', () => {
    const { container } = render(<AuthenticationModal onClose={mockOnClose} defaultMode={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when defaultMode is signin', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    expect(screen.getByText('Sign in or Sign up')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
  });

  it('should render when defaultMode is signup', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    expect(screen.getByText('Sign in or Sign up')).toBeInTheDocument();
    expect(screen.getByTestId('sign-up')).toBeInTheDocument();
  });

  it('should render when defaultMode is forgot-password', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="forgot-password" />);

    expect(screen.getByText('Sign in or Sign up')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
  });

  it('should pass initialEmail to SignIn component', () => {
    render(
      <AuthenticationModal
        onClose={mockOnClose}
        defaultMode="signin"
        initialEmail="test@example.com"
      />
    );

    expect(screen.getByText('Initial Email: test@example.com')).toBeInTheDocument();
  });

  it('should render ForgotPassword component when defaultMode is forgot-password', () => {
    render(
      <AuthenticationModal
        onClose={mockOnClose}
        defaultMode="forgot-password"
        initialEmail="test@example.com"
      />
    );

    // ForgotPassword component is rendered
    expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
  });

  it('should switch to signup mode when clicking create account button', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    const switchButton = screen.getByText('Create an account');
    fireEvent.click(switchButton);

    expect(screen.getByTestId('sign-up')).toBeInTheDocument();
    expect(screen.queryByTestId('sign-in')).not.toBeInTheDocument();
  });

  it('should switch to forgot-password mode and pass email when clicking reset password button', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    const resetPasswordButton = screen.getByText('Reset Password');
    fireEvent.click(resetPasswordButton);

    // handleSetMode is called with 'forgot-password' and email from SignIn
    expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
    expect(screen.queryByTestId('sign-in')).not.toBeInTheDocument();
    // Email is passed to ForgotPassword via forgotPasswordEmail state
    expect(screen.getByTestId('forgot-password-email')).toHaveTextContent('test@example.com');
  });

  it('should switch back to signin mode from forgot-password', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="forgot-password" />);

    const backButton = screen.getByText('Back to Sign In');
    fireEvent.click(backButton);

    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    expect(screen.queryByTestId('forgot-password')).not.toBeInTheDocument();
  });

  it('should show OTP modal when SignUp component calls onShowOTP', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    const showOtpButton = screen.getByText('Show OTP');
    fireEvent.click(showOtpButton);

    expect(screen.getByTestId('otp-verification-modal')).toBeInTheDocument();
  });

  it('should show country code dropdown when SignUp component requests it', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    const selectCountryButton = screen.getByTestId('country-button');
    fireEvent.click(selectCountryButton);

    expect(screen.getByTestId('country-code-dropdown')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    const backdrop = screen.getByTestId('authentication-modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close OTP modal when OTP modal close button is clicked', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    // Show OTP modal
    const showOtpButton = screen.getByText('Show OTP');
    fireEvent.click(showOtpButton);
    expect(screen.getByTestId('otp-verification-modal')).toBeInTheDocument();

    // Close OTP modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('otp-verification-modal')).not.toBeInTheDocument();
  });

  it('should close country dropdown when close button is clicked', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    // Show country dropdown
    const selectCountryButton = screen.getByTestId('country-button');
    fireEvent.click(selectCountryButton);
    expect(screen.getByTestId('country-code-dropdown')).toBeInTheDocument();

    // Close country dropdown
    const closeDropdownButton = screen.getByTestId('close-country-dropdown');
    fireEvent.click(closeDropdownButton);

    expect(screen.queryByTestId('country-code-dropdown')).not.toBeInTheDocument();
  });

  it('should update selected country when country is selected from dropdown', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signup" />);

    // Show country dropdown
    const selectCountryButton = screen.getByTestId('country-button');
    fireEvent.click(selectCountryButton);

    const selectUsButton = screen.getByText('🇺🇸 United States +1');
    fireEvent.click(selectUsButton);

    // Country should be updated in SignUp component
    // Verify that the selectedCountry prop passed to SignUp is updated
    const countryButton = screen.getByTestId('country-button');
    expect(countryButton).toHaveTextContent('+1');
  });

  it('should call onClose when SignIn component calls onSuccess', () => {
    render(<AuthenticationModal onClose={mockOnClose} defaultMode="signin" />);

    // SignIn component calls onSuccess when authentication is successful
    const signInButton = screen.getByTestId('sign-in-button');
    fireEvent.click(signInButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
