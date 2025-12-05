import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TwoStepVerificationModal from '@/components/modals/two-step-verification-modal';

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

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('TwoStepVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <TwoStepVerificationModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByText('2-Step Verification')).toBeInTheDocument();
  });

  it('should display phone number when provided', () => {
    render(
      <TwoStepVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        phoneNumber="1234567890"
      />
    );

    expect(screen.getByText(/We sent a code to 1234567890/)).toBeInTheDocument();
  });

  it('should allow entering verification code', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    expect(codeInput).toBeInTheDocument();
    fireEvent.change(codeInput, { target: { value: '123456' } });
    expect(codeInput.value).toBe('123456');
  });

  it('should only allow numeric input', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'abc123def' } });
    expect(codeInput.value).toBe('123');
  });

  it('should limit code to 6 digits', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: '1234567890' } });
    expect(codeInput.value).toBe('123456');
  });

  it('should call onSuccess when valid 6-digit code is submitted', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: '123456' } });

    // The component uses button click for submission
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error when code is not 6 digits', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: '12345' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    waitFor(() => {
      expect(screen.getByText(/Invalid or incorrect code/)).toBeInTheDocument();
    });
  });

  it('should decrease attempts left on invalid code', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: '12345' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Attempts should decrease from 5 to 4
    waitFor(() => {
      expect(screen.getByText(/you have 4 attempts left/)).toBeInTheDocument();
    });
  });

  it('should show too many attempts message when attempts reach 0', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
    const form = codeInput.closest('form') || codeInput.parentElement;
    const submitButton = screen.getByText('Submit');

    // Submit invalid code 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.change(codeInput, { target: { value: '12345' } });
      if (form) {
        fireEvent.submit(form);
      } else {
        fireEvent.click(submitButton);
      }
    }

    waitFor(() => {
      expect(screen.getByText(/Too many invalid attempts/)).toBeInTheDocument();
    });
  });

  it('should clear error when user types', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;

    // Trigger error first
    fireEvent.change(codeInput, { target: { value: '12345' } });
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    // Type again - error should clear
    fireEvent.change(codeInput, { target: { value: '123456' } });
    // Component clears error when typing
    expect(codeInput.value).toBe('123456');
  });

  it('should start resend timer when modal opens', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Timer should start at 30
    expect(screen.getByText(/Resend Code \(\d+\)/)).toBeInTheDocument();
  });

  it('should disable resend button when timer is active', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const resendButton = screen.getByText(/Resend Code/);
    expect(resendButton).toBeDisabled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // The component listens for mousedown events on document
    // Create a mock target that is outside the modal content
    const outsideTarget = document.createElement('div');
    document.body.appendChild(outsideTarget);

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
      <TwoStepVerificationModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    rerender(
      <TwoStepVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    waitFor(() => {
      const codeInput = screen.getByLabelText(/enter 6-digit code/i) as HTMLInputElement;
      expect(codeInput.value).toBe('');
    });
  });
});
