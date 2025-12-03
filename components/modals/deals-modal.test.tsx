import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DealsModal from './deals-modal';
import { Deal } from '@/types/deal-types';

// Mock dependencies
const { mockUseDealsByRestaurantId } = vi.hoisted(() => {
  return {
    mockUseDealsByRestaurantId: vi.fn(),
  };
});

vi.mock('@/lib/hooks/use-deals', () => ({
  useDealsByRestaurantId: () => mockUseDealsByRestaurantId(),
}));

vi.mock('./deal-modal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="deal-modal">
        <button onClick={onClose}>Close Deal Modal</button>
      </div>
    ) : null,
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
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

describe('DealsModal', () => {
  const mockOnClose = vi.fn();

  const mockRestaurantDeals: Deal[] = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: 'Free Item Deal',
      description: 'Get a free item',
      freeItems: [
        {
          id: '1',
          name: 'Free Pizza',
        },
      ],
    },
    {
      id: 'deal2',
      restaurantId: 'restaurant1',
      title: '20% Off',
      description: 'Get 20% off your order',
      discountType: 'percentage',
      discountValue: 20,
      buttonText: 'See items',
    },
    {
      id: 'deal3',
      restaurantId: 'restaurant1',
      title: 'External Deal',
      description: 'External link deal',
      buttonText: 'Learn more',
      buttonLink: 'https://example.com',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';

    mockUseDealsByRestaurantId.mockReturnValue({
      dashpassDeal: null,
      restaurantDeals: mockRestaurantDeals,
      isLoading: false,
    });
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <DealsModal isOpen={false} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    // Check for any deal title to confirm modal is rendered
    expect(screen.getByText('Free Item Deal')).toBeInTheDocument();
  });

  it('should display all restaurant deals', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    expect(screen.getByText('Free Item Deal')).toBeInTheDocument();
    expect(screen.getByText('20% Off')).toBeInTheDocument();
    expect(screen.getByText('External Deal')).toBeInTheDocument();
  });

  it('should open deal modal when deal card is clicked (no buttonText)', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    const dealCard = screen.getByTestId('deal-card-deal1');
    fireEvent.click(dealCard);

    expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
  });

  it('should open deal modal when "See items" button is clicked', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    const seeItemsButton = screen.getByText('See items');
    fireEvent.click(seeItemsButton);

    expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
  });

  it('should not open deal modal when deal has external link button', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    const externalDealCard = screen.getByTestId('deal-card-deal3');
    fireEvent.click(externalDealCard);

    expect(screen.queryByTestId('deal-modal')).not.toBeInTheDocument();
  });

  it('should close deal modal when close is clicked', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    // Click the "See items" button to open the modal (deal2 has buttonText)
    const seeItemsButton = screen.getByRole('button', { name: 'See items' });
    fireEvent.click(seeItemsButton);

    await waitFor(() => {
      expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close Deal Modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('deal-modal')).not.toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
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
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    const backdrop = screen.getByTestId('deals-modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display deal descriptions', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealsModal isOpen={true} onClose={mockOnClose} restaurantId="restaurant1" />
      </Wrapper>
    );

    expect(screen.getByText('Get a free item')).toBeInTheDocument();
    expect(screen.getByText('Get 20% off your order')).toBeInTheDocument();
  });
});
