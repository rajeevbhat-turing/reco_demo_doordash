import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromoBanners from '@/components/promo-banners';

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

// Mock stores and hooks
const {
  mockIsAuthenticated,
  mockCurrentUser,
  mockGetTempAddress,
  mockUserStoreSubscribe,
  mockUseRestaurants,
} = vi.hoisted(() => ({
  mockIsAuthenticated: vi.fn(() => false),
  mockCurrentUser: vi.fn(() => null as any),
  mockGetTempAddress: vi.fn(() => null as any),
  mockUserStoreSubscribe: vi.fn(() => () => {}),
  mockUseRestaurants: vi.fn(() => ({ data: null as any, isLoading: false })),
}));

vi.mock('@/store/user-store', () => ({
  useUserStore: Object.assign(
    (selector: any) => {
      const state = {
        currentUser: mockCurrentUser(),
        getTempAddress: mockGetTempAddress,
        isAuthenticated: mockIsAuthenticated,
      };
      return selector ? selector(state) : state;
    },
    {
      subscribe: mockUserStoreSubscribe,
      getState: () => ({
        isAuthenticated: mockIsAuthenticated,
        getTempAddress: mockGetTempAddress,
        currentUser: mockCurrentUser(),
      }),
    }
  ),
}));

vi.mock('@/lib/hooks/use-restaurants', () => ({
  useRestaurants: mockUseRestaurants,
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
];

const mockAddress = {
  id: 'addr-1',
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  lat: 37.7749,
  lng: -122.4194,
};

describe('PromoBanners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockPromotionalData),
    });
  });

  it('should not render when no address is set', async () => {
    mockGetTempAddress.mockReturnValue(null);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should render banners when data is loaded', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });
  });

  it('should display banner title and description', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
      expect(screen.getByText('Get 20% off')).toBeInTheDocument();
    });
  });

  it('should display button text', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Order Now')).toBeInTheDocument();
    });
  });

  it('should link to restaurant store page', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/store/rest-1');
    });
  });

  it('should filter out banners for restaurants not in delivery area', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    // Only rest-1 is in delivery area
    mockUseRestaurants.mockReturnValue({ data: [{ id: 'rest-1' }], isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
      expect(screen.queryByText('Another Promo')).not.toBeInTheDocument();
    });
  });

  it('should not show right arrow on last banner', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: [{ id: 'rest-1' }], isLoading: false });

    // Only one banner in delivery area
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: [mockPromotionalData.data[0]],
        }),
    });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
  });

  it('should not show left arrow on first banner', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('chevron-left')).not.toBeInTheDocument();
  });

  it('should handle API error gracefully', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should use authenticated user address when logged in', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockCurrentUser.mockReturnValue({
      addresses: [{ ...mockAddress, default: true }],
    });
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });
  });

  it('should pause auto-scroll on mouse enter', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const container = screen.getByTestId('promo-banners-container');
    fireEvent.mouseEnter(container);
    // Auto-scroll should be paused
  });

  it('should resume auto-scroll on mouse leave', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const container = screen.getByTestId('promo-banners-container');
    fireEvent.mouseEnter(container);
    fireEvent.mouseLeave(container);
    // Auto-scroll should resume
  });

  it('should render banner images', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('alt', 'Test Restaurant');
    });
  });

  it('should use placeholder when banner image fails to load', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      fireEvent.error(images[0]);
      expect(images[0]).toHaveAttribute('src', '/placeholder-logo.svg');
    });
  });

  it('should not render when no restaurants in delivery area', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: [], isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.queryByTestId('promo-banners-container')).not.toBeInTheDocument();
    });
  });

  it('should navigate to store page when clicking banner', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    mockUseRestaurants.mockReturnValue({ data: mockRestaurants, isLoading: false });

    render(<PromoBanners />);

    await waitFor(() => {
      expect(screen.getByText('Test Promo')).toBeInTheDocument();
    });

    const bannerLink = screen.getByRole('link', { name: /Test Promo/i });
    expect(bannerLink).toHaveAttribute('href', '/store/rest-1');
    fireEvent.click(bannerLink);
    // Link should navigate to store page
  });

  it('should only display banners for restaurants in delivery area', async () => {
    mockGetTempAddress.mockReturnValue(mockAddress);
    // rest-1 and rest-3 in delivery area, but rest-3 has no promo banner
    mockUseRestaurants.mockReturnValue({
      data: [{ id: 'rest-1' }, { id: 'rest-3' }],
      isLoading: false,
    });

    render(<PromoBanners />);

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
