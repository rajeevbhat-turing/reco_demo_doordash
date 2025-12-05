import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OtherCarts from '@/components/other-carts';
import type { Cart } from '@/store/cart-store';

// Mock Next.js navigation
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
}));

const mockCart: Cart = {
  storeId: 'store-1',
  storeName: 'Test Restaurant',
  storeCategory: 'restaurant',
  items: [
    {
      id: 'item-1',
      itemName: 'Burger',
      price: '12.99',
      image: '/burger.jpg',
      quantity: 2,
    },
    {
      id: 'item-2',
      itemName: 'Fries',
      price: '4.99',
      image: '/fries.jpg',
      quantity: 1,
    },
  ],
};

const mockGroceryCart: Cart = {
  storeId: 'grocery-1',
  storeName: 'Test Grocery',
  storeCategory: 'grocery',
  items: [
    {
      id: 'item-1',
      itemName: 'Milk',
      price: '3.99',
      image: '/milk.jpg',
      quantity: 1,
    },
  ],
};

const mockRestaurants = [
  { id: 'store-1', name: 'Test Restaurant' },
  { id: 'store-2', name: 'Another Restaurant' },
];

describe('OtherCarts', () => {
  const mockOnRemoveCart = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when carts array is empty', () => {
    render(
      <OtherCarts
        carts={[]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.queryByText('Other carts')).not.toBeInTheDocument();
  });

  it('should render cart with store name', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText('Other carts')).toBeInTheDocument();
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('should display DashPass badge for restaurant carts', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText('DashPass')).toBeInTheDocument();
  });

  it('should not display DashPass badge for non-restaurant carts', () => {
    render(
      <OtherCarts
        carts={[mockGroceryCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.queryByText('DashPass')).not.toBeInTheDocument();
  });

  it('should display item names', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText(/Burger.*Fries/)).toBeInTheDocument();
  });

  it('should display item images', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0]).toHaveAttribute('alt', 'Burger');
    expect(images[1]).toHaveAttribute('alt', 'Fries');
  });

  it('should show +N for items beyond 3', () => {
    const cartWithManyItems: Cart = {
      ...mockCart,
      items: [
        { id: '1', itemName: 'Item 1', price: '1.00', image: '/1.jpg', quantity: 1 },
        { id: '2', itemName: 'Item 2', price: '2.00', image: '/2.jpg', quantity: 1 },
        { id: '3', itemName: 'Item 3', price: '3.00', image: '/3.jpg', quantity: 1 },
        { id: '4', itemName: 'Item 4', price: '4.00', image: '/4.jpg', quantity: 1 },
        { id: '5', itemName: 'Item 5', price: '5.00', image: '/5.jpg', quantity: 1 },
      ],
    };

    render(
      <OtherCarts
        carts={[cartWithManyItems]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should call onRemoveCart when remove button is clicked', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const removeButton = screen.getByLabelText('Remove cart');
    fireEvent.click(removeButton);
    expect(mockOnRemoveCart).toHaveBeenCalledWith('store-1', 'restaurant');
  });

  it('should navigate to checkout when Checkout button is clicked', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const checkoutButton = screen.getByRole('button', { name: 'Checkout' });
    fireEvent.click(checkoutButton);
    expect(mockPush).toHaveBeenCalledWith('/checkout?category=restaurant&storeId=store-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate to store page when Add more items is clicked for restaurant', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const addMoreButton = screen.getByRole('button', { name: 'Add more items' });
    fireEvent.click(addMoreButton);
    expect(mockPush).toHaveBeenCalledWith('/store/store-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate to grocery store page when Add more items is clicked for grocery', () => {
    render(
      <OtherCarts
        carts={[mockGroceryCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const addMoreButton = screen.getByRole('button', { name: 'Add more items' });
    fireEvent.click(addMoreButton);
    expect(mockPush).toHaveBeenCalledWith('/grocery/store/grocery-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate to correct path for different store categories', () => {
    const categories = [
      { category: 'retail', expectedPath: '/retail/store/test-store' },
      { category: 'pets', expectedPath: '/pets/store/test-store' },
      { category: 'convenience', expectedPath: '/convenience/store/test-store' },
    ];

    categories.forEach(({ category, expectedPath }) => {
      mockPush.mockClear();
      mockOnClose.mockClear();

      const cart: Cart = {
        storeId: 'test-store',
        storeName: 'Test Store',
        storeCategory: category as any,
        items: [{ id: '1', itemName: 'Item', price: '1.00', image: '/item.jpg', quantity: 1 }],
      };

      const { unmount } = render(
        <OtherCarts
          carts={[cart]}
          onRemoveCart={mockOnRemoveCart}
          onClose={mockOnClose}
          restaurants={[]}
        />
      );

      const addMoreButton = screen.getByRole('button', { name: 'Add more items' });
      fireEvent.click(addMoreButton);
      expect(mockPush).toHaveBeenCalledWith(expectedPath);

      unmount();
    });
  });

  it('should show outside delivery area warning when restaurant is not in list', () => {
    const outsideCart: Cart = {
      storeId: 'outside-store',
      storeName: 'Outside Restaurant',
      storeCategory: 'restaurant',
      items: [{ id: '1', itemName: 'Item', price: '1.00', image: '/item.jpg', quantity: 1 }],
    };

    render(
      <OtherCarts
        carts={[outsideCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText('Outside your current delivery area')).toBeInTheDocument();
  });

  it('should not show outside delivery area warning when restaurant is in list', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.queryByText('Outside your current delivery area')).not.toBeInTheDocument();
  });

  it('should not show outside delivery area warning for non-restaurant carts', () => {
    const groceryOutsideCart: Cart = {
      storeId: 'outside-grocery',
      storeName: 'Outside Grocery',
      storeCategory: 'grocery',
      items: [{ id: '1', itemName: 'Item', price: '1.00', image: '/item.jpg', quantity: 1 }],
    };

    render(
      <OtherCarts
        carts={[groceryOutsideCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.queryByText('Outside your current delivery area')).not.toBeInTheDocument();
  });

  it('should render multiple carts', () => {
    render(
      <OtherCarts
        carts={[mockCart, mockGroceryCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Test Grocery')).toBeInTheDocument();
  });

  it('should handle empty restaurants array', () => {
    render(
      <OtherCarts
        carts={[mockCart]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={[]}
      />
    );
    // Should not show warning when restaurants list is empty (assume in radius)
    expect(screen.queryByText('Outside your current delivery area')).not.toBeInTheDocument();
  });

  it('should use placeholder image when item image is missing', () => {
    const cartNoImage: Cart = {
      ...mockCart,
      items: [{ id: '1', itemName: 'No Image Item', price: '1.00', image: '', quantity: 1 }],
    };

    render(
      <OtherCarts
        carts={[cartNoImage]}
        onRemoveCart={mockOnRemoveCart}
        onClose={mockOnClose}
        restaurants={mockRestaurants}
      />
    );
    const image = screen.getByAltText('No Image Item');
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });
});
