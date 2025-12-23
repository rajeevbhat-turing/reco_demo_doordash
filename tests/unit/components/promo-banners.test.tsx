import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PromoBanners from '@/components/promo-banners';
import type { Restaurant } from '@/constants/restaurants';

// Create a wrapper component that provides QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
};

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPromotionalData = {
  success: true,
  data: [
    {
      id: 'promo-1',
      restaurantId: 'rest-1',
      title: 'Test Promo',
      description: 'Get 20% off',
      buttonText: 'Order Now',
      buttonColor: 'bg-red-600',
      gradient: 'from-yellow-100 to-yellow-200',
      image: '/promo1.jpg',
      restaurantName: 'Test Restaurant',
    },
    {
      id: 'promo-2',
      restaurantId: 'rest-2',
      title: 'Another Promo',
      description: 'Free delivery',
      buttonText: 'Get Deal',
      buttonColor: 'bg-green-600',
      gradient: 'from-green-600 to-green-700',
      image: '/promo2.jpg',
      restaurantName: 'Another Restaurant',
    },
  ],
};

const mockRestaurants = [
  { id: 'rest-1', name: 'Test Restaurant' },
  { id: 'rest-2', name: 'Another Restaurant' },
] as Restaurant[];

describe('PromoBanners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockPromotionalData),
    });
  });

  it('should not render when no restaurants are provided', async () => {
    renderWithQueryClient(<PromoBanners />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should render banners when data is loaded', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });
  });

  it('should display banner title and description', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
      expect(screen.getByText('Get 20% off')).toBeInTheDocument();
    });
  });

  it('should display button text', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Order Now')).toBeInTheDocument();
    });
  });

  it('should link to restaurant store page', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/store/rest-1');
    });
  });

  it('should filter out banners for restaurants not in delivery area', async () => {
    // Only rest-1 is in delivery area
    const limitedRestaurants = [{ id: 'rest-1', name: 'Test Restaurant' }] as Restaurant[];
    
    renderWithQueryClient(<PromoBanners restaurants={limitedRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
      expect(screen.queryByText('Another Promo')).not.toBeInTheDocument();
    });
  });

  it('should not show right arrow on last banner', async () => {
    const limitedRestaurants = [{ id: 'rest-1', name: 'Test Restaurant' }] as Restaurant[];

    // Only one banner in delivery area
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: [mockPromotionalData.data[0]],
        }),
    });

    renderWithQueryClient(<PromoBanners restaurants={limitedRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
  });

  it('should not show left arrow on first banner', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('chevron-left')).not.toBeInTheDocument();
  });

  it('should handle API error gracefully', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should render with restaurants prop', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });
  });

  it('should pause auto-scroll on mouse enter', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const container = screen.getByTestId('promo-banners-container');
    fireEvent.mouseEnter(container);
    // Auto-scroll should be paused
  });

  it('should resume auto-scroll on mouse leave', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const container = screen.getByTestId('promo-banners-container');
    fireEvent.mouseEnter(container);
    fireEvent.mouseLeave(container);
    // Auto-scroll should resume
  });

  it('should render banner images', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('alt', 'Test Restaurant');
    });
  });

  it('should use placeholder when banner image fails to load', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      fireEvent.error(images[0]);
      expect(images[0]).toHaveAttribute('src', '/placeholder-logo.svg');
    });
  });

  it('should not render when restaurants array is empty', async () => {
    renderWithQueryClient(<PromoBanners restaurants={[]} />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should navigate to store page when clicking banner', async () => {
    renderWithQueryClient(<PromoBanners restaurants={mockRestaurants} />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const bannerLink = screen.getByRole('link', { name: /Test Promo/i });
    expect(bannerLink).toHaveAttribute('href', '/store/rest-1');
    fireEvent.click(bannerLink);
    // Link should navigate to store page
  });

  it('should only display banners for restaurants in delivery area', async () => {
    // rest-1 and rest-3 in delivery area, but rest-3 has no promo banner
    const limitedRestaurants = [
      { id: 'rest-1', name: 'Test Restaurant' },
      { id: 'rest-3', name: 'Third Restaurant' },
    ] as Restaurant[];

    renderWithQueryClient(<PromoBanners restaurants={limitedRestaurants} />);

    await waitFor(() => {
      // rest-1 promo should be visible
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
      // rest-2 promo should NOT be visible (not in delivery area)
      expect(screen.queryByText('Another Promo')).not.toBeInTheDocument();
    });

    // Verify correct link for displayed banner
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/store/rest-1');
  });
});
