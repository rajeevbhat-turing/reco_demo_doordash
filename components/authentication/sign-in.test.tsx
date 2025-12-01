import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from './sign-in';
import { useAuth } from '@/lib/hooks/use-auth';
import { isValidEmail } from '@/lib/utils/helperFunctions';

// Mock dependencies
jest.mock('@/lib/hooks/use-auth');
jest.mock('@/lib/utils/helperFunctions');
jest.mock('@/store/user-store', () => ({
  useUserStore: jest.fn((selector?: any) => {
    if (selector) {
      return selector({
        getTempAddress: jest.fn(() => null),
        users: [],
        currentUser: null,
        changePasswordPhoneVerified: false,
      });
    }
    return {
      getTempAddress: jest.fn(() => null),
      users: [],
      currentUser: null,
      changePasswordPhoneVerified: false,
    };
  }),
}));
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

const mockOnSuccess = jest.fn();
const mockSetMode = jest.fn();

describe('SignIn Component', () => {
  const mockLogin = jest.fn();
  const mockGenerateOTP = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      generateOTP: mockGenerateOTP,
      isLoading: false,
      isGeneratingOTP: false,
      error: null,
      isSuccess: false,
    });
    (isValidEmail as jest.Mock).mockImplementation((email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });
  });

  it('should render email input form initially', () => {
    render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to sign in/i })).toBeInTheDocument();
  });

  describe('Email Validation', () => {
    it('should show error when email is empty on blur', async () => {
      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Email Form Submission', () => {
    it('should call generateOTP when email is valid', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        country: {
          dialCode: '+1',
          code: 'US',
          name: 'United States',
        },
      };
      mockGenerateOTP.mockResolvedValue({
        otp: '123456',
        user: mockUser,
      });

      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByRole('button', { name: /continue to sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGenerateOTP).toHaveBeenCalledWith({
          email: 'john@example.com',
        });
      });
    });

    it('should not submit when email is invalid', async () => {
      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });

      const submitButton = screen.getByRole('button', { name: /continue to sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockGenerateOTP).not.toHaveBeenCalled();
      });
    });

    it('should show error when generateOTP fails', async () => {
      mockGenerateOTP.mockRejectedValue(new Error('User not found'));

      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });

      const submitButton = screen.getByRole('button', { name: /continue to sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check for either the error message or the generic error fallback
        const errorElement =
          screen.queryByText('User not found') ||
          screen.queryByText('Something went wrong. Please try again.') ||
          screen.queryByText('Incorrect email');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Clear Email Button', () => {
    it('should clear email when clear button is clicked', async () => {
      render(<SignIn onSuccess={mockOnSuccess} setMode={mockSetMode} />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');

      const clearButton = screen.getByTestId('x-icon').closest('button');
      if (clearButton) {
        fireEvent.click(clearButton);
      }

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });
});
