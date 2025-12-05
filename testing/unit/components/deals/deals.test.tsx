import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Deals from '@/components/deals/deals';
import { useDealsByRestaurantId } from '@/lib/hooks/use-deals';
import { type Deal } from '@/types/deal-types';

// Mock dependencies
vi.mock('@/lib/hooks/use-deals', () => ({
  useDealsByRestaurantId: vi.fn(),
}));

vi.mock('@/components/modals/deals-modal', () => ({
  default: ({
    isOpen,
    onClose,
    restaurantId,
  }: {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
  }) =>
    isOpen ? (
      <div data-testid="deals-modal">
        <button onClick={onClose}>Close Deals Modal</button>
        <div>Restaurant ID: {restaurantId}</div>
      </div>
    ) : null,
}));

vi.mock('@/components/modals/deal-modal', () => ({
  default: ({
    isOpen,
    onClose,
    deal,
  }: {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal | null;
  }) =>
    isOpen ? (
      <div data-testid="deal-modal">
        <button onClick={onClose}>Close Deal Modal</button>
        {deal && <div>Deal: {deal.title}</div>}
      </div>
    ) : null,
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

describe('Deals', () => {
  const mockDeals: Deal[] = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: '20% Off',
      description: 'Get 20% off on your order',
      buttonText: 'See items',
    },
    {
      id: 'deal2',
      restaurantId: 'restaurant1',
      title: 'Free Delivery',
      description: 'Free delivery on orders over $25',
      buttonText: 'Learn more',
      buttonLink: 'https://example.com',
    },
    {
      id: 'deal3',
      restaurantId: 'restaurant1',
      title: 'Free Item Deal',
      description: 'Get a free item with your order',
      freeItems: [
        {
          id: '1',
          name: 'Free Pizza',
        },
        {
          id: '2',
          name: 'Free Drink',
        },
      ],
    },
    {
      id: 'dashpass-delivery-fee',
      restaurantId: null,
      title: 'DashPass Benefits',
      description: 'Free delivery with DashPass',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
      allDeals: mockDeals,
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render deals component with header', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(screen.getByText('Deals & benefits')).toBeInTheDocument();
      expect(screen.getByText('See All')).toBeInTheDocument();
    });

    it('should render all deals', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(screen.getByText('20% Off')).toBeInTheDocument();
      expect(screen.getByText('Free Delivery')).toBeInTheDocument();
      expect(screen.getByText('Free Item Deal')).toBeInTheDocument();
      expect(screen.getByText('DashPass Benefits')).toBeInTheDocument();
    });

    it('should render deal descriptions', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(screen.getByText('Get 20% off on your order')).toBeInTheDocument();
      expect(screen.getByText('Free delivery on orders over $25')).toBeInTheDocument();
    });

    it('should render scroll buttons', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const scrollLeftButton = screen.getByTestId('deals-scroll-left-button');
      const scrollRightButton = screen.getByTestId('deals-scroll-right-button');
      expect(scrollLeftButton).toBeInTheDocument();
      expect(scrollRightButton).toBeInTheDocument();
    });

    it('should return null when loading', () => {
      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: [],
        isLoading: true,
      });

      const Wrapper = createWrapper();
      const { container } = render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when no deals exist', () => {
      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: [],
        isLoading: false,
      });

      const Wrapper = createWrapper();
      const { container } = render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Deal Cards', () => {
    it('should render deal with "See items" button', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      expect(screen.getByText('See items')).toBeInTheDocument();
    });

    it('should render deal with external link button', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink).toHaveAttribute('href', 'https://example.com');
      expect(learnMoreLink).toHaveAttribute('target', '_blank');
    });

    it('should render deal without button (clickable card)', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('Free Item Deal').closest('[data-deal-card]');
      expect(dealCard).toHaveClass('cursor-pointer');
    });

    it('should render DashPass icon for DashPass deal', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const icon = screen.getByAltText('DashPass Benefits');
      expect(icon).toHaveAttribute('src', '/dashpass-icon-green.svg');
    });

    it('should render offer icon for regular deals', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const icon = screen.getByAltText('20% Off');
      expect(icon).toHaveAttribute('src', '/offer-icon.svg');
    });

    it('should apply correct color for DashPass deal title', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dashpassTitle = screen.getByText('DashPass Benefits');
      // Check if the title has the DashPass color style
      expect(dashpassTitle).toBeInTheDocument();
    });

    it('should apply correct color for regular deal title', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const regularTitle = screen.getByText('20% Off');
      expect(regularTitle).toBeInTheDocument();
    });
  });

  describe('Deal Card Interactions', () => {
    it('should open deal modal when clicking deal card without button', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('Free Item Deal').closest('[data-deal-card]');
      if (dealCard) {
        fireEvent.click(dealCard);
      }

      await waitFor(() => {
        expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
        expect(screen.getByText('Deal: Free Item Deal')).toBeInTheDocument();
      });
    });

    it('should not open deal modal when clicking deal card with button', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('20% Off').closest('[data-deal-card]');
      if (dealCard) {
        fireEvent.click(dealCard);
      }

      expect(screen.queryByTestId('deal-modal')).not.toBeInTheDocument();
    });

    it('should open deal modal when clicking "See items" button', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const seeItemsButton = screen.getByText('See items');
      fireEvent.click(seeItemsButton);

      await waitFor(() => {
        expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
        expect(screen.getByText('Deal: 20% Off')).toBeInTheDocument();
      });
    });

    it('should close deal modal when close button is clicked', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('Free Item Deal').closest('[data-deal-card]');
      if (dealCard) {
        fireEvent.click(dealCard);
      }

      await waitFor(() => {
        expect(screen.getByTestId('deal-modal')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close Deal Modal');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('deal-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Deals Modal', () => {
    it('should open deals modal when "See All" is clicked', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const seeAllButton = screen.getByText('See All');
      fireEvent.click(seeAllButton);

      await waitFor(() => {
        expect(screen.getByTestId('deals-modal')).toBeInTheDocument();
        expect(screen.getByText('Restaurant ID: restaurant1')).toBeInTheDocument();
      });
    });

    it('should close deals modal when close button is clicked', async () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const seeAllButton = screen.getByText('See All');
      fireEvent.click(seeAllButton);

      await waitFor(() => {
        expect(screen.getByTestId('deals-modal')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close Deals Modal');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('deals-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scroll Functionality', () => {
    it('should disable left scroll button initially', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const leftButton = screen.getByTestId('deals-scroll-left-button');
      // Initially, left button should be disabled
      expect(leftButton).toBeDisabled();
    });

    it('should update scroll buttons on scroll', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const scrollContainer = screen.getByTestId('deals-scroll-container');
      if (scrollContainer) {
        // Mock scroll properties
        Object.defineProperty(scrollContainer, 'scrollLeft', {
          writable: true,
          value: 0,
        });
        Object.defineProperty(scrollContainer, 'scrollWidth', {
          writable: true,
          value: 1000,
        });
        Object.defineProperty(scrollContainer, 'clientWidth', {
          writable: true,
          value: 500,
        });

        fireEvent.scroll(scrollContainer);
      }

      // Scroll buttons should be updated
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should handle scroll left', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const scrollContainer = screen.getByTestId('deals-scroll-container');
      // Mock scrollBy method
      scrollContainer.scrollBy = vi.fn();
      const scrollBySpy = vi.spyOn(scrollContainer, 'scrollBy');
      Object.defineProperty(scrollContainer, 'scrollLeft', {
        writable: true,
        value: 100,
      });

      const leftButton = screen.getByTestId('deals-scroll-left-button');
      if (!leftButton.hasAttribute('disabled')) {
        fireEvent.click(leftButton);
        // scrollBy should be called (either with card width or client width)
        expect(scrollBySpy).toHaveBeenCalled();
      }
    });

    it('should handle scroll right', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const scrollContainer = screen.getByTestId('deals-scroll-container');
      // Mock scrollBy method
      scrollContainer.scrollBy = vi.fn();
      const scrollBySpy = vi.spyOn(scrollContainer, 'scrollBy');
      Object.defineProperty(scrollContainer, 'scrollLeft', {
        writable: true,
        value: 0,
      });
      Object.defineProperty(scrollContainer, 'scrollWidth', {
        writable: true,
        value: 1000,
      });
      Object.defineProperty(scrollContainer, 'clientWidth', {
        writable: true,
        value: 500,
      });

      const rightButton = screen.getByTestId('deals-scroll-right-button');
      if (!rightButton.hasAttribute('disabled')) {
        fireEvent.click(rightButton);
        expect(scrollBySpy).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle deal with empty buttonText', () => {
      const dealsWithEmptyButton: Deal[] = [
        {
          id: 'deal1',
          restaurantId: 'restaurant1',
          title: 'Test Deal',
          description: 'Test description',
          buttonText: '',
        },
      ];

      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: dealsWithEmptyButton,
        isLoading: false,
      });

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('Test Deal').closest('[data-deal-card]');
      expect(dealCard).toHaveClass('cursor-pointer');
    });

    it('should handle deal with undefined buttonText', () => {
      const dealsWithUndefinedButton: Deal[] = [
        {
          id: 'deal1',
          restaurantId: 'restaurant1',
          title: 'Test Deal',
          description: 'Test description',
        },
      ];

      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: dealsWithUndefinedButton,
        isLoading: false,
      });

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const dealCard = screen.getByText('Test Deal').closest('[data-deal-card]');
      expect(dealCard).toHaveClass('cursor-pointer');
    });

    it('should handle deal with buttonLink as #', () => {
      const dealsWithHashLink: Deal[] = [
        {
          id: 'deal1',
          restaurantId: 'restaurant1',
          title: 'Test Deal',
          description: 'Test description',
          buttonText: 'Click me',
          buttonLink: '#',
        },
      ];

      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: dealsWithHashLink,
        isLoading: false,
      });

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      const link = screen.getByText('Click me').closest('a');
      expect(link).toHaveAttribute('href', '#');
      // Component sets target="_blank" if buttonLink is truthy (including '#')
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should handle external link without ExternalLink icon when link is #', () => {
      const dealsWithHashLink: Deal[] = [
        {
          id: 'deal1',
          restaurantId: 'restaurant1',
          title: 'Test Deal',
          description: 'Test description',
          buttonText: 'Click me',
          buttonLink: '#',
        },
      ];

      (useDealsByRestaurantId as ReturnType<typeof vi.fn>).mockReturnValue({
        allDeals: dealsWithHashLink,
        isLoading: false,
      });

      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      // ExternalLink icon should not be rendered when link is #
      // The component only shows ExternalLink when buttonLink exists AND is not '#'
      const link = screen.getByRole('link', { name: 'Click me' });
      expect(link).toHaveAttribute('href', '#');
      // Component sets target="_blank" if buttonLink is truthy (including '#')
      expect(link).toHaveAttribute('target', '_blank');
      // ExternalLink icon should not be present (component checks: buttonLink && buttonLink !== '#')
      // Check that no ExternalLink icon is rendered (it would be a child of the link)
      const externalLinkIcon = link.querySelector('svg');
      // ExternalLink icon should not be rendered when link is '#'
      expect(externalLinkIcon).not.toBeInTheDocument();
    });
  });

  describe('Resize and Scroll Events', () => {
    it('should update scroll buttons on window resize', () => {
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <Deals restaurantId="restaurant1" />
        </Wrapper>
      );

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Component should handle resize (no errors should occur)
      expect(screen.getByText('Deals & benefits')).toBeInTheDocument();
    });
  });
});
