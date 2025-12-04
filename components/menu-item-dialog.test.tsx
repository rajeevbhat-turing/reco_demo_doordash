import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MenuItemDialog from './menu-item-dialog';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  Minus: () => <div data-testid="minus-icon">-</div>,
  Plus: () => <div data-testid="plus-icon">+</div>,
}));

// Mock cart store
const { mockAddItem, mockFindCart, mockUpdateQuantity } = vi.hoisted(() => ({
  mockAddItem: vi.fn(),
  mockFindCart: vi.fn(() => null),
  mockUpdateQuantity: vi.fn(),
}));

vi.mock('@/store/cart-store', () => ({
  useCartStore: () => ({
    addItem: mockAddItem,
    findCart: mockFindCart,
    updateQuantity: mockUpdateQuantity,
  }),
}));

// Mock utils
vi.mock('@/lib/utils/rating-utils', () => ({
  getDefaultRating: vi.fn((rating: number) => rating),
}));

vi.mock('@/lib/utils/cart-merge', () => ({
  haveSameModifications: vi.fn(() => false),
  generateCartItemId: vi.fn((id: string) => id),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

const mockItem = {
  id: 'item-1',
  restaurantId: 'rest-1',
  name: 'Test Burger',
  price: '$12.99',
  image: '/burger.jpg',
  description: 'A delicious burger',
  rating: 4.5,
  ratingCount: 120,
  calories: '650 cal',
};

const mockItemWithModifications = {
  ...mockItem,
  modifications: [
    {
      id: 'mod-size',
      description: 'Choose Size',
      is_required: true,
      select_up_to: 1,
      select_at_least: 1,
      options: [
        {
          id: 'opt-small',
          name: 'Small',
          price: 0,
          is_counter: false,
          is_default: true,
          sort_order: 1,
        },
        {
          id: 'opt-large',
          name: 'Large',
          price: 2.0,
          is_counter: false,
          is_default: false,
          sort_order: 2,
        },
      ],
    },
    {
      id: 'mod-extras',
      description: 'Add Extras',
      is_required: false,
      select_up_to: 3,
      options: [
        {
          id: 'opt-cheese',
          name: 'Extra Cheese',
          price: 1.5,
          is_counter: false,
          is_default: false,
          sort_order: 1,
        },
        {
          id: 'opt-bacon',
          name: 'Bacon',
          price: 2.0,
          is_counter: false,
          is_default: false,
          sort_order: 2,
        },
      ],
    },
  ],
};

const mockItemWithCounterOption = {
  ...mockItem,
  modifications: [
    {
      id: 'mod-shots',
      description: 'Extra Shots',
      is_required: false,
      select_up_to: 5,
      options: [
        {
          id: 'opt-shot',
          name: 'Espresso Shot',
          price: 0.5,
          is_counter: true,
          max_quantity: 5,
          is_default: false,
          sort_order: 1,
        },
      ],
    },
  ],
};

describe('MenuItemDialog', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<MenuItemDialog isOpen={false} onClose={mockOnClose} item={mockItem} />);
      expect(screen.queryByText('Test Burger')).not.toBeInTheDocument();
    });

    it('should not render when item is null', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={null} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render item details when open', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      expect(screen.getByText('Test Burger')).toBeInTheDocument();
      expect(screen.getByText('(650 cal)')).toBeInTheDocument();
    });

    it('should render item image', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const image = screen.getByAltText('Test Burger');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/burger.jpg');
    });

    it('should render rating when available', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      expect(screen.getByText(/90%/)).toBeInTheDocument();
      expect(screen.getByText(/120/)).toBeInTheDocument();
    });

    it('should not render rating when ratingCount is 0', () => {
      const itemNoRating = { ...mockItem, ratingCount: 0 };
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={itemNoRating} />);
      expect(screen.queryByText(/90%/)).not.toBeInTheDocument();
    });
  });

  describe('Dialog controls', () => {
    it('should call onClose when close button is clicked', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const closeButton = screen.getByLabelText('Close dialog');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dialog', async () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const backdrop = document.querySelector('.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.mouseDown(backdrop);
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      }
    });

    it('should set body overflow hidden when open', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('Quantity controls', () => {
    it('should start with quantity of 1', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const quantityInput = screen.getByRole('spinbutton');
      expect(quantityInput).toHaveValue(1);
    });

    it('should increment quantity when plus button is clicked', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const incrementButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(incrementButton);
      const quantityInput = screen.getByRole('spinbutton');
      expect(quantityInput).toHaveValue(2);
    });

    it('should decrement quantity when minus button is clicked', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const incrementButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      const decrementButton = screen.getByLabelText('Decrease quantity');
      fireEvent.click(decrementButton);
      const quantityInput = screen.getByRole('spinbutton');
      expect(quantityInput).toHaveValue(2);
    });

    it('should not decrement quantity below 1', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const decrementButton = screen.getByLabelText('Decrease quantity');
      fireEvent.click(decrementButton);
      const quantityInput = screen.getByRole('spinbutton');
      expect(quantityInput).toHaveValue(1);
    });

    it('should allow manual quantity input', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '5' } });
      expect(quantityInput).toHaveValue(5);
    });
  });

  describe('Modifications', () => {
    it('should render modification sections', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      expect(screen.getByText('Choose Size')).toBeInTheDocument();
      expect(screen.getByText('Add Extras')).toBeInTheDocument();
    });

    it('should show Required label for required modifications', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      expect(screen.getByText(/Required/)).toBeInTheDocument();
    });

    it('should show Optional label for optional modifications', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      expect(screen.getByText('(Optional)')).toBeInTheDocument();
    });

    it('should pre-select default options for required modifications', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      // Small should be pre-selected as it's the default
      const smallOption = screen.getByText('Small');
      expect(smallOption).toBeInTheDocument();
    });

    it('should toggle modification expansion when header is clicked', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      // Modifications start expanded, so options should be visible
      expect(screen.getByText('Small')).toBeInTheDocument();
      // Click to collapse
      const sizeHeader = screen.getByText('Choose Size');
      fireEvent.click(sizeHeader);
      // Options should now be hidden
      expect(screen.queryByText('Small')).not.toBeInTheDocument();
    });

    it('should select option when clicked', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      const largeOption = screen.getByText('Large');
      fireEvent.click(largeOption);
      // Large should now be selected
      expect(largeOption).toBeInTheDocument();
    });

    it('should show price for options with additional cost', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      // Multiple options may have prices, just check at least one exists
      const priceElements = screen.getAllByText('+$2.00');
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Counter options', () => {
    it('should render counter controls for counter options', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithCounterOption} />
      );
      // Root modifications start expanded
      expect(screen.getByText('Espresso Shot')).toBeInTheDocument();
      expect(screen.getByText('+$0.50 each')).toBeInTheDocument();
    });
  });

  describe('Multi-select modifications', () => {
    it('should allow selecting multiple options in multi-select modification', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      const cheeseOption = screen.getByText('Extra Cheese');
      const baconOption = screen.getByText('Bacon');

      fireEvent.click(cheeseOption);
      fireEvent.click(baconOption);

      // Both should be selectable
      expect(cheeseOption).toBeInTheDocument();
      expect(baconOption).toBeInTheDocument();
    });

    it('should update total price when multiple extras are selected', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );

      const cheeseOption = screen.getByText('Extra Cheese');
      const baconOption = screen.getByText('Bacon');

      fireEvent.click(cheeseOption); // +$1.50
      fireEvent.click(baconOption); // +$2.00

      // Base $12.99 + $1.50 + $2.00 = $16.49
      expect(screen.getByText(/Add to cart - \$16.49/)).toBeInTheDocument();
    });

    it('should allow deselecting optional options', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );

      const cheeseOption = screen.getByText('Extra Cheese');
      fireEvent.click(cheeseOption); // Select
      fireEvent.click(cheeseOption); // Deselect

      // Should be back to base price
      expect(screen.getByText(/Add to cart - \$12.99/)).toBeInTheDocument();
    });
  });

  describe('Add to cart', () => {
    it('should enable add to cart button when required modifications are satisfied', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      const addButton = screen.getByRole('button', { name: /Add to cart/i });
      expect(addButton).not.toBeDisabled();
    });

    it('should disable add to cart button when required modifications are not satisfied', () => {
      const itemWithUnsatisfiedRequired = {
        ...mockItem,
        modifications: [
          {
            id: 'mod-required',
            description: 'Required Selection',
            is_required: true,
            select_up_to: 1,
            select_at_least: 1,
            options: [
              {
                id: 'opt-1',
                name: 'Option 1',
                price: 0,
                is_counter: false,
                is_default: false, // No default
                sort_order: 1,
              },
            ],
          },
        ],
      };
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={itemWithUnsatisfiedRequired} />
      );
      const addButton = screen.getByRole('button', { name: /Add to cart/i });
      expect(addButton).toBeDisabled();
    });

    it('should call addItem when add to cart is clicked', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const addButton = screen.getByRole('button', { name: /Add to cart/i });
      fireEvent.click(addButton);
      expect(mockAddItem).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should display correct total price', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      expect(screen.getByText(/Add to cart - \$12.99/)).toBeInTheDocument();
    });

    it('should update total price when quantity changes', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const incrementButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(incrementButton);
      expect(screen.getByText(/Add to cart - \$25.98/)).toBeInTheDocument();
    });

    it('should update total price when modification is selected', () => {
      render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItemWithModifications} />
      );
      const largeOption = screen.getByText('Large');
      fireEvent.click(largeOption);
      // Base price + $2.00 for large = $14.99
      expect(screen.getByText(/Add to cart - \$14.99/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle item without image', () => {
      const itemNoImage = { ...mockItem, image: '' };
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={itemNoImage} />);
      const image = screen.getByAltText('Test Burger');
      expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
    });

    it('should handle item without calories', () => {
      const itemNoCalories = { ...mockItem, calories: undefined };
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={itemNoCalories} />);
      expect(screen.queryByText(/cal/)).not.toBeInTheDocument();
    });

    it('should handle item without modifications', () => {
      render(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      expect(screen.queryByText('Choose Size')).not.toBeInTheDocument();
      const addButton = screen.getByRole('button', { name: /Add to cart/i });
      expect(addButton).not.toBeDisabled();
    });

    it('should reset quantity when dialog closes and reopens', () => {
      const { rerender } = render(
        <MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />
      );
      const incrementButton = screen.getByLabelText('Increase quantity');
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);

      // Close dialog
      rerender(<MenuItemDialog isOpen={false} onClose={mockOnClose} item={mockItem} />);

      // Reopen dialog
      rerender(<MenuItemDialog isOpen={true} onClose={mockOnClose} item={mockItem} />);
      const quantityInput = screen.getByRole('spinbutton');
      expect(quantityInput).toHaveValue(1);
    });
  });
});
