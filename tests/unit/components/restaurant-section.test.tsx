import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RestaurantSection from '@/components/restaurant-section';
import type { Restaurant } from '@/constants/restaurants';

// Mock Next.js
const mockPush = vi.fn();
const mockPrefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: mockPrefetch,
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onMouseEnter,
  }: {
    children: React.ReactNode;
    href: string;
    onMouseEnter?: () => void;
  }) => (
    <a href={href} onMouseEnter={onMouseEnter}>
      {children}
    </a>
  ),
}));

// Mock rating utils
vi.mock('@/lib/utils/rating-utils', () => ({
  getDefaultRating: vi.fn((rating: number) => rating.toFixed(1)),
}));

const mockRestaurant: Restaurant = {
  id: 'rest-1',
  name: 'Test Restaurant',
  logo: '/logo.jpg',
  banner: '/banner.jpg',
  rating: 4.5,
  reviews: '120',
  distance: '1.2 mi',
  time: '25-35 min',
  deliveryFee: '$2.99 delivery',
  isFreeDelivery: false,
  minDeliveryFee: 299,
  priceRange: '$$',
  cuisine: 'American',
  dashPass: true,
  isOpen: true,
  openingHours: '10:00 AM - 10:00 PM',
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  lat: 37.7749,
  lng: -122.4194,
  phone: '555-1234',
};

const mockRestaurantNoDashPass: Restaurant = {
  ...mockRestaurant,
  id: 'rest-2',
  name: 'Budget Restaurant',
  dashPass: false,
};

const mockRestaurantNoRating: Restaurant = {
  ...mockRestaurant,
  id: 'rest-3',
  name: 'New Restaurant',
  rating: null,
  reviews: null,
};

describe('RestaurantSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render section title', () => {
    render(<RestaurantSection title="Popular Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByRole('heading', { name: 'Popular Restaurants' })).toBeInTheDocument();
  });

  it('should not render title when empty', () => {
    render(<RestaurantSection title="" restaurants={[mockRestaurant]} />);
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('should render restaurant name', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('should render restaurant logo', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    const logo = screen.getByAltText('Test Restaurant');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.jpg');
  });

  it('should use placeholder logo when image fails to load', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    const logo = screen.getByAltText('Test Restaurant');
    fireEvent.error(logo);
    expect(logo).toHaveAttribute('src', '/placeholder-logo.svg');
  });

  it('should render DashPass badge when restaurant has dashPass', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByText('DashPass')).toBeInTheDocument();
  });

  it('should not render DashPass badge when restaurant does not have dashPass', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurantNoDashPass]} />);
    expect(screen.queryByText('DashPass')).not.toBeInTheDocument();
  });

  it('should render restaurant rating', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByText(/★ 4.5/)).toBeInTheDocument();
    expect(screen.getByText(/\(120\)/)).toBeInTheDocument();
  });

  it('should not render rating when restaurant has no rating', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurantNoRating]} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it('should not render rating when rating is 0', () => {
    const restaurantZeroRating = { ...mockRestaurant, rating: 0 };
    render(<RestaurantSection title="Restaurants" restaurants={[restaurantZeroRating]} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it('should render distance and time', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByText('1.2 mi')).toBeInTheDocument();
    expect(screen.getByText('25-35 min')).toBeInTheDocument();
  });

  it('should render delivery fee', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    expect(screen.getByText('$2.99 delivery')).toBeInTheDocument();
  });

  it('should link to store page', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/store/rest-1');
  });

  it('should prefetch store page on hover', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[mockRestaurant]} />);
    const link = screen.getByRole('link');
    fireEvent.mouseEnter(link);
    expect(mockPrefetch).toHaveBeenCalledWith('/store/rest-1');
  });

  it('should render multiple restaurants', () => {
    render(
      <RestaurantSection
        title="Restaurants"
        restaurants={[mockRestaurant, mockRestaurantNoDashPass, mockRestaurantNoRating]}
      />
    );
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Budget Restaurant')).toBeInTheDocument();
    expect(screen.getByText('New Restaurant')).toBeInTheDocument();
  });

  it('should render empty grid when no restaurants', () => {
    render(<RestaurantSection title="Restaurants" restaurants={[]} />);
    expect(screen.getByRole('heading', { name: 'Restaurants' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should handle restaurant without distance', () => {
    const restaurantNoDistance = { ...mockRestaurant, distance: '' };
    render(<RestaurantSection title="Restaurants" restaurants={[restaurantNoDistance]} />);
    expect(screen.getByText('25-35 min')).toBeInTheDocument();
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });
});
