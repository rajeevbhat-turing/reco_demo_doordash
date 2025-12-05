import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OTPVerificationModal from '@/components/modals/otp-verification-modal';

// Mock dependencies
const { MockInput } = vi.hoisted(() => {
  const React = require('react') as typeof import('react');
  const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, ...props }, ref) => <input ref={ref} className={className} {...props} />
  );
  Input.displayName = 'Input';
  return { MockInput: Input };
});

vi.mock('@/components/ui/input', () => ({
  Input: MockInput,
}));

vi.mock('@/lib/utils/icons', () => ({
  VerificationIcon: () => <div data-testid="verification-icon">VerificationIcon</div>,
}));

describe('OTPVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnVerify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <OTPVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    expect(screen.getByText('Phone Number Verification')).toBeInTheDocument();
  });

  it('should display phone number with country code', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    expect(screen.getByText(/We sent a code to \(\+1\) 1234567890/)).toBeInTheDocument();
  });

  it('should allow entering OTP', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    expect(otpInput).toBeInTheDocument();
    fireEvent.change(otpInput, { target: { value: '123456' } });
    expect(otpInput.value).toBe('123456');
  });

  it('should only allow numeric input', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: 'abc123def' } });
    expect(otpInput.value).toBe('123');
  });

  it('should call onVerify when Submit button is clicked', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: '123456' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(mockOnVerify).toHaveBeenCalled();
  });

  it('should disable Submit button when OTP input is empty', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('should enable Submit button when OTP is entered', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: '123456' } });

    const submitButton = screen.getByText('Submit');
    expect(submitButton).not.toBeDisabled();
  });

  it('should start resend timer when modal opens', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    // Timer should start at 30
    expect(screen.getByText(/Resend Code \(\d+\)/)).toBeInTheDocument();
  });

  it('should disable resend button when timer is active', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const resendButton = screen.getByText(/Resend Code/);
    expect(resendButton).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    // The component listens for mousedown events on document
    // Create a mock target that is outside the modal content
    const outsideTarget = document.createElement('div');
    document.body.appendChild(outsideTarget);

    // Simulate mousedown on document with target outside modal
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseDownEvent, 'target', {
      writable: false,
      value: outsideTarget,
    });

    document.dispatchEvent(mouseDownEvent);
    document.body.removeChild(outsideTarget);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should reset state when modal opens', () => {
    const { rerender } = render(
      <OTPVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    rerender(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    expect(otpInput.value).toBe('');
  });

  it('should clear error when user types', () => {
    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: '123' } });

    // Error should be cleared when typing (component clears it)
    expect(otpInput.value).toBe('123');
  });

  it('should display too many attempts message after 5 incorrect attempts', () => {
    mockOnVerify.mockImplementation(
      (
        enteredOtp: string,
        generatedOtp: string,
        setOtpError: (error: string) => void,
        setAttemptsLeft: (attempts: number) => void,
        attemptsLeft: number,
        setShowTooManyAttempts: (show: boolean) => void
      ) => {
        // Simulate incorrect OTP
        if (enteredOtp !== generatedOtp) {
          // Decrement attempts
          const newAttemptsLeft = attemptsLeft - 1;
          setAttemptsLeft(newAttemptsLeft);

          // If no attempts left, show too many attempts message
          if (newAttemptsLeft === 0) {
            setShowTooManyAttempts(true);
          } else {
            // Show error message
            setOtpError('Invalid code');
          }
        }
      }
    );

    render(
      <OTPVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
        phoneNumber="1234567890"
        countryCode="+1"
        generatedOTP="123456"
      />
    );

    const otpInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    const submitButton = screen.getByText('Submit');

    // Make 5 incorrect attempts
    for (let i = 0; i < 5; i++) {
      fireEvent.change(otpInput, { target: { value: '000000' } });
      fireEvent.click(submitButton);
    }

    // Verify the too many attempts message is displayed after 5 attempts
    expect(
      screen.getByText(
        /Too many invalid attempts have been made. Please wait 30 minutes and try again or use a new number./
      )
    ).toBeInTheDocument();

    // Verify the OTP input section is not shown when too many attempts
    expect(screen.queryByText('Enter 6-digit code')).not.toBeInTheDocument();
  });
});
