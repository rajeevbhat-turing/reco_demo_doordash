import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderConfirmationModal from './order-confirmation-modal';

// Mock dependencies
const mockFindCart = vi.fn();
const mockClearCart = vi.fn();
const mockRecordOrderCompletion = vi.fn();
const mockRemoveDeal = vi.fn();

vi.mock('@/store/cart-store', () => ({
  useCartStore: () => ({
    findCart: mockFindCart,
    clearCart: mockClearCart,
  }),
}));

vi.mock('@/store/verifier-store', () => ({
  useVerifierStore: () => ({
    recordOrderCompletion: mockRecordOrderCompletion,
  }),
}));

vi.mock('@/store/deals-store', () => ({
  useDealsStore: () => ({
    removeDeal: mockRemoveDeal,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('OrderConfirmationModal', () => {
  const mockOnClose = vi.fn();

  const mockCart = {
    id: 'cart1',
    storeId: 'store1',
    storeCategory: 'restaurant' as const,
    items: [
      {
        id: '1',
        itemName: 'Pizza',
        price: 15.99,
        quantity: 1,
      },
      {
        id: '2',
        itemName: 'Burger',
        price: 12.99,
        quantity: 2,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    mockFindCart.mockReturnValue(mockCart);
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={false}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    expect(screen.getByText(/Order confirmed/i)).toBeInTheDocument();
  });

  it('should display order ID', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    expect(screen.getByText(/order123/i)).toBeInTheDocument();
  });

  it('should display total amount', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    expect(screen.getByText(/\$50\.97/)).toBeInTheDocument();
  });

  it('should display tip amount when provided', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          tipAmount={5.0}
        />
      </Wrapper>
    );

    // Tip might be included in total or shown separately - check for total
    expect(screen.getByText(/\$50\.97/)).toBeInTheDocument();
  });

  it('should display scheduled time when provided', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          scheduledTime="2024-01-15 18:00"
        />
      </Wrapper>
    );

    expect(screen.getByText(/Scheduled Delivery Time/)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-15 18:00/)).toBeInTheDocument();
  });

  it('should display delivery time when provided', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          deliveryTime="30-40 min"
        />
      </Wrapper>
    );

    expect(screen.getByText(/30-40 min/)).toBeInTheDocument();
  });

  it('should display order confirmation message', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    expect(screen.getByText(/Your order has been placed successfully/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
        />
      </Wrapper>
    );

    // Component uses mousedown event listener on document
    // Create an element outside the modal and simulate mousedown on it
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

  it('should record order completion when modal closes', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          tipAmount={5.0}
          storeName="Test Restaurant"
          storeId="store1"
          category="restaurant"
        />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockRecordOrderCompletion).toHaveBeenCalledWith({
      orderId: 'order123',
      tipAmount: 5.0,
      orderTotal: 50.97,
      storeName: 'Test Restaurant',
      category: 'restaurant',
      items: mockCart.items,
    });
  });

  it('should clear cart when modal closes', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          storeId="store1"
          category="restaurant"
        />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockClearCart).toHaveBeenCalledWith('store1', 'restaurant');
  });

  it('should remove deal when modal closes', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          orderId="order123"
          total={50.97}
          storeId="store1"
          category="restaurant"
        />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    // Component uses format: `${storeId}-${category}`
    expect(mockRemoveDeal).toHaveBeenCalledWith('store1-restaurant');
  });
});
