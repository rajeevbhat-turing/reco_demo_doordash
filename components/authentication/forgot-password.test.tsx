import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './forgot-password';
import { useUserByEmail } from '@/lib/hooks/use-user';
import { isValidEmail } from '@/lib/utils/helperFunctions';

// Mock dependencies
jest.mock('@/lib/hooks/use-user');
jest.mock('@/lib/utils/helperFunctions');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockOnBackToSignIn = jest.fn();
const mockOnSuccessStateChange = jest.fn();

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUserByEmail as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    (isValidEmail as jest.Mock).mockImplementation((email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });
  });

  it('should render forgot password form', () => {
    render(
      <ForgotPassword
        onBackToSignIn={mockOnBackToSignIn}
        onSuccessStateChange={mockOnSuccessStateChange}
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
  });

  describe('Email Validation', () => {
    it('should show error when email is empty on blur', async () => {
      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

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

  describe('Form Submission', () => {
    it('should trigger user fetch when email is valid', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
      };
      (useUserByEmail as jest.Mock).mockReturnValue({
        data: mockUser,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(useUserByEmail).toHaveBeenCalled();
      });
    });

    it('should not submit when email is invalid', async () => {
      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
      });
    });

    it('should show error when user is not found', async () => {
      (useUserByEmail as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: { message: 'User not found' },
      });

      render(
        <ForgotPassword
          onBackToSignIn={mockOnBackToSignIn}
          onSuccessStateChange={mockOnSuccessStateChange}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "We couldn't find an account with the email you entered. Try a different email or sign up."
          )
        ).toBeInTheDocument();
      });
    });
  });
});
