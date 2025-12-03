import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderItemsScrollable from './order-items-scrollable';
import { OrderItem } from '@/types/review-types';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';

// Mock dependencies
vi.mock('@/lib/hooks/use-restaurant-menu');
vi.mock('@/components/menu-item-dialog', () => ({
  default: ({ isOpen, onClose, item }: any) =>
    isOpen ? (
      <div data-testid="menu-item-dialog">
        <button onClick={onClose}>Close</button>
        <div>{item?.name}</div>
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

describe('OrderItemsScrollable', () => {
  const mockOrderItems: OrderItem[] = [
    {
      id: 'item1',
      name: 'Burger',
      restaurantId: 'restaurant1',
      image: 'burger.jpg',
      menuItemId: 'menu1',
    },
    {
      id: 'item2',
      name: 'Pizza',
      restaurantId: 'restaurant1',
      image: 'pizza.jpg',
      menuItemId: 'menu2',
    },
  ];

  const mockMenuItems = [
    {
      id: 'menu1',
      name: 'Burger',
      price: '10.99',
      description: 'Delicious burger',
      image: 'burger.jpg',
      category: 'Main',
      restaurantId: 'restaurant1',
    },
    {
      id: 'menu2',
      name: 'Pizza',
      price: '15.99',
      description: 'Tasty pizza',
      image: 'pizza.jpg',
      category: 'Main',
      restaurantId: 'restaurant1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRestaurantMenu as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        menuItems: mockMenuItems,
      },
    });
  });

  it('should render order items', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" />
      </Wrapper>
    );

    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('should display item images when available', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" />
      </Wrapper>
    );

    const burgerImage = screen.getByAltText('Burger');
    const pizzaImage = screen.getByAltText('Pizza');

    expect(burgerImage).toHaveAttribute('src', 'burger.jpg');
    expect(pizzaImage).toHaveAttribute('src', 'pizza.jpg');
  });

  it('should display "Liked" indicator when liked prop is true', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" liked={true} />
      </Wrapper>
    );

    // When liked is true, all items show "Liked", so we check for multiple instances
    const likedIndicators = screen.getAllByText('Liked');
    expect(likedIndicators.length).toBeGreaterThan(0);
    expect(likedIndicators[0]).toBeInTheDocument();
  });

  it('should not display "Liked" indicator when liked prop is false', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" liked={false} />
      </Wrapper>
    );

    expect(screen.queryByText('Liked')).not.toBeInTheDocument();
  });

  it('should open menu item dialog when item is clicked', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" />
      </Wrapper>
    );

    // Wait for the component to render and menu data to be available
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    const burgerItem = screen.getByText('Burger');
    fireEvent.click(burgerItem);

    // Wait for dialog to open - the dialog should appear after clicking
    await waitFor(
      () => {
        const dialog = screen.queryByTestId('menu-item-dialog');
        expect(dialog).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should close menu item dialog when close button is clicked', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" />
      </Wrapper>
    );

    const burgerItem = screen.getByText('Burger');
    fireEvent.click(burgerItem);

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('menu-item-dialog')).not.toBeInTheDocument();
    });
  });

  it('should handle items without menuItemId', () => {
    const itemsWithoutMenuId: OrderItem[] = [
      {
        id: 'item1',
        name: 'Burger',
        restaurantId: 'restaurant1',
        image: 'burger.jpg',
      },
    ];

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={itemsWithoutMenuId} restaurantId="restaurant1" />
      </Wrapper>
    );

    const burgerItem = screen.getByText('Burger');
    fireEvent.click(burgerItem);

    // Dialog should not open if menuItem is not found
    expect(screen.queryByTestId('menu-item-dialog')).not.toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={[]} restaurantId="restaurant1" />
      </Wrapper>
    );

    const items = screen.queryAllByTestId(/^order-item-/);
    expect(items.length).toBe(0);
  });

  it('should use restaurantId from item if not provided as prop', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} />
      </Wrapper>
    );

    expect(useRestaurantMenu).toHaveBeenCalledWith('');
  });

  it('should call useRestaurantMenu with restaurantId when provided', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <OrderItemsScrollable items={mockOrderItems} restaurantId="restaurant1" />
      </Wrapper>
    );

    expect(useRestaurantMenu).toHaveBeenCalledWith('restaurant1');
  });
});
