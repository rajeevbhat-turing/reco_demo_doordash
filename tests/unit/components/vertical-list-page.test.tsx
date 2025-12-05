import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VerticalListPage from '@/components/vertical-list-page';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Heart: ({ className }: { className?: string }) => (
    <div data-testid="heart-icon" className={className}>
      ♥
    </div>
  ),
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  Star: () => <div data-testid="star-icon">★</div>,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockItems = [
  {
    id: 'item-1',
    name: 'Pizza Palace',
    image: '/pizza.jpg',
    banner: '/banner.jpg',
    rating: 4.5,
    reviews: '120',
    distance: '1.2 mi',
    time: '25-35 min',
    deliveryFee: '$2.99 delivery',
    priceRange: '$$',
    cuisine: 'Italian',
    dashPass: true,
    isOpen: true,
  },
  {
    id: 'item-2',
    name: 'Burger Joint',
    image: '/burger.jpg',
    rating: 4.2,
    reviews: '85',
    distance: '0.8 mi',
    time: '15-25 min',
    deliveryFee: 'Free delivery',
    discount: '20% off',
    new: true,
  },
];

const defaultProps = {
  title: 'Nearby Restaurants',
  items: mockItems,
  onBackClick: vi.fn(),
  categoryType: 'restaurant' as const,
};

describe('VerticalListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Nearby Restaurants' })).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<VerticalListPage {...defaultProps} description="Find the best food near you" />);
      expect(screen.getByText('Find the best food near you')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('should call onBackClick when back button clicked', () => {
      const onBackClick = vi.fn();
      render(<VerticalListPage {...defaultProps} onBackClick={onBackClick} />);

      fireEvent.click(screen.getByLabelText('Go back'));
      expect(onBackClick).toHaveBeenCalled();
    });
  });

  describe('Items Display', () => {
    it('should render all items', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.getByText('Burger Joint')).toBeInTheDocument();
    });

    it('should render item images', () => {
      render(<VerticalListPage {...defaultProps} />);
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3); // 2 item images + 1 dashpass icon
    });

    it('should render rating', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should render review count', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('(120)')).toBeInTheDocument();
    });

    it('should render distance', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('1.2 mi')).toBeInTheDocument();
    });

    it('should render delivery time', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('25-35 min')).toBeInTheDocument();
    });

    it('should render delivery fee', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('$2.99 delivery')).toBeInTheDocument();
    });

    it('should render price range', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('$$')).toBeInTheDocument();
    });

    it('should render cuisine', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('Italian')).toBeInTheDocument();
    });

    it('should render DashPass badge', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('DashPass')).toBeInTheDocument();
    });

    it('should render discount', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('20% off')).toBeInTheDocument();
    });

    it('should render New badge', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render Open badge when store is open', () => {
      render(<VerticalListPage {...defaultProps} />);
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should link to store page with category', () => {
      render(<VerticalListPage {...defaultProps} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/store/item-1?category=restaurant');
    });

    it('should use custom urlPrefix', () => {
      render(<VerticalListPage {...defaultProps} urlPrefix="/grocery" />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/grocery/item-1?category=restaurant');
    });
  });

  describe('Favorites', () => {
    it('should toggle favorite when heart is clicked', () => {
      render(<VerticalListPage {...defaultProps} />);

      const favoriteButton = screen.getAllByLabelText('Add to favorites')[0];
      fireEvent.click(favoriteButton);

      expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
    });

    it('should remove favorite when clicked again', () => {
      render(<VerticalListPage {...defaultProps} />);

      const favoriteButton = screen.getAllByLabelText('Add to favorites')[0];
      fireEvent.click(favoriteButton);
      fireEvent.click(screen.getByLabelText('Remove from favorites'));

      expect(screen.getAllByLabelText('Add to favorites')).toHaveLength(2);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no items', () => {
      render(<VerticalListPage {...defaultProps} items={[]} />);
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search criteria')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render Closed badge when store is closed', () => {
      const closedItem = [{ ...mockItems[0], isOpen: false }];
      render(<VerticalListPage {...defaultProps} items={closedItem} />);
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('should render SNAP EBT badge', () => {
      const snapItem = [{ ...mockItems[0], isSnapEligible: true }];
      render(<VerticalListPage {...defaultProps} items={snapItem} />);
      expect(screen.getByText('SNAP EBT')).toBeInTheDocument();
    });

    it('should render In-store prices', () => {
      const inStoreItem = [{ ...mockItems[0], inStorePrice: true }];
      render(<VerticalListPage {...defaultProps} items={inStoreItem} />);
      expect(screen.getByText('In-store prices')).toBeInTheDocument();
    });

    it('should render tags', () => {
      const taggedItem = [{ ...mockItems[0], tags: ['Fast', 'Popular'] }];
      render(<VerticalListPage {...defaultProps} items={taggedItem} />);
      expect(screen.getByText('Fast')).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();
    });

    it('should render category', () => {
      const categoryItem = [{ ...mockItems[0], category: 'Fast Food' }];
      render(<VerticalListPage {...defaultProps} items={categoryItem} />);
      expect(screen.getByText('Fast Food')).toBeInTheDocument();
    });
  });
});
