import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupOrderDialog from './group-order-dialog';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
}));

// Mock useCartStore
const { mockStartGroupOrder } = vi.hoisted(() => {
  return {
    mockStartGroupOrder: vi.fn(() => 'test-group-order-id'),
  };
});

vi.mock('@/store/cart-store', () => ({
  useCartStore: (selector: any) => {
    return selector({
      startGroupOrder: mockStartGroupOrder,
    });
  },
}));

describe('GroupOrderDialog', () => {
  const mockOnClose = vi.fn();
  const mockOrigin = 'https://example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: mockOrigin,
      },
      writable: true,
    });
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: {
        overflow: '',
      },
      writable: true,
    });
  });

  it('should not render when isOpen is false', () => {
    render(<GroupOrderDialog isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Start Group Order')).not.toBeInTheDocument();
  });

  it('should render main view when isOpen is true', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId('group-order-title')).toBeInTheDocument();
    expect(screen.getByText("From McDonald's")).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking outside dialog', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.mouseDown(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should navigate to paying view when "I\'m paying" is clicked', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);
    expect(
      screen.getByRole('heading', { name: 'What is your per person order limit?' })
    ).toBeInTheDocument();
  });

  it('should navigate to delivery view when "Standard delivery" is clicked', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deliveryOption = screen.getByTestId('delivery-option');
    fireEvent.click(deliveryOption);
    expect(screen.getByText('Delivery time')).toBeInTheDocument();
  });

  it('should navigate to deadline view when deadline option is clicked', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);
    expect(screen.getByText('Order deadline')).toBeInTheDocument();
  });

  it('should select limit option in paying view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);

    const limitButton = screen.getByRole('button', { name: '$10' });
    fireEvent.click(limitButton);
    expect(limitButton).toBeInTheDocument();
  });

  it('should save limit and return to main view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    expect(screen.getByTestId('group-order-title')).toBeInTheDocument();
  });

  it('should go back to main view from paying view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);

    const backButton = screen.getByLabelText('Back');
    fireEvent.click(backButton);
    expect(screen.getByTestId('group-order-title')).toBeInTheDocument();
  });

  it('should select date in delivery view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deliveryOption = screen.getByTestId('delivery-option');
    fireEvent.click(deliveryOption);

    const tomorrowButton = screen.getByRole('button', { name: /Tomorrow/i });
    fireEvent.click(tomorrowButton);
    expect(tomorrowButton).toBeInTheDocument();
  });

  it('should select delivery time in delivery view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deliveryOption = screen.getByTestId('delivery-option');
    fireEvent.click(deliveryOption);

    const timeLabel = screen.getByText('2:20 AM - 2:40 AM');
    fireEvent.click(timeLabel);
    expect(timeLabel).toBeInTheDocument();
  });

  it('should save delivery and return to main view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deliveryOption = screen.getByTestId('delivery-option');
    fireEvent.click(deliveryOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    expect(screen.getByTestId('group-order-title')).toBeInTheDocument();
  });

  it('should select deadline time in deadline view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);

    const timeLabel = screen.getByText('1:30 AM');
    fireEvent.click(timeLabel);
    expect(timeLabel).toBeInTheDocument();
  });

  it('should select checkout option in deadline view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);

    const manuallyLabel = screen.getByText('Manually');
    fireEvent.click(manuallyLabel);
    expect(manuallyLabel).toBeInTheDocument();
  });

  it('should save deadline and return to main view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    expect(screen.getByTestId('group-order-title')).toBeInTheDocument();
  });

  it('should start group order and show success view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    expect(mockStartGroupOrder).toHaveBeenCalled();
    expect(screen.getByText('Group order started!')).toBeInTheDocument();
  });

  it('should display group order link in success view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    expect(screen.getByText(`${mockOrigin}/cart/group/test-group-order-id`)).toBeInTheDocument();
  });

  it('should copy link to clipboard when copy button is clicked', async () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    const copyButton = screen.getByLabelText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${mockOrigin}/cart/group/test-group-order-id`
      );
    });
  });

  it('should show copied state after copying link', async () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    const copyButton = screen.getByLabelText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Link copied to clipboard!')).toBeInTheDocument();
    });
  });

  it('should display selected limit in main view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);

    const limitButton = screen.getByRole('button', { name: '$15' });
    fireEvent.click(limitButton);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(screen.getByText('$15 per person')).toBeInTheDocument();
  });

  it('should display selected delivery time in main view', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deliveryOption = screen.getByTestId('delivery-option');
    fireEvent.click(deliveryOption);

    const timeLabel = screen.getByText('3:00 AM - 3:20 AM');
    fireEvent.click(timeLabel);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Today, 3:00 AM - 3:20 AM/)).toBeInTheDocument();
  });

  it('should display deadline info in main view when deadline is set', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(screen.getByText('Order deadline')).toBeInTheDocument();
  });

  it('should set body overflow to hidden when dialog opens', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should reset body overflow when dialog closes', () => {
    const { unmount } = render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should display limit info in success view when limit is set', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const payingOption = screen.getByTestId('paying-option');
    fireEvent.click(payingOption);

    const limitButton = screen.getByRole('button', { name: '$20' });
    fireEvent.click(limitButton);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    expect(screen.getByText(/You've set a \$20 limit per person/)).toBeInTheDocument();
  });

  it('should display deadline info in success view when deadline is set', () => {
    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const deadlineOption = screen.getByTestId('deadline-option');
    fireEvent.click(deadlineOption);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    expect(screen.getByText(/Order deadline:/)).toBeInTheDocument();
  });

  it('should handle clipboard copy error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));

    render(<GroupOrderDialog isOpen={true} onClose={mockOnClose} />);
    const startButton = screen.getByRole('button', { name: 'Start Group Order' });
    fireEvent.click(startButton);

    const copyButton = screen.getByLabelText('Copy link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
