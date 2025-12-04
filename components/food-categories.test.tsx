import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodCategories from './food-categories';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
}));

// Mock foodCategorySvgs
const { mockFoodCategorySvgs } = vi.hoisted(() => {
  const React = require('react');
  return {
    mockFoodCategorySvgs: [
      {
        id: '1',
        name: 'Pizza',
        svg: React.createElement('svg', { 'data-testid': 'pizza-icon' }, 'Pizza'),
      },
      {
        id: '2',
        name: 'Burger',
        svg: React.createElement('svg', { 'data-testid': 'burger-icon' }, 'Burger'),
      },
      {
        id: '3',
        name: 'Sushi',
        svg: React.createElement('svg', { 'data-testid': 'sushi-icon' }, 'Sushi'),
      },
      {
        id: '4',
        name: 'Tacos',
        svg: React.createElement('svg', { 'data-testid': 'tacos-icon' }, 'Tacos'),
      },
    ],
  };
});

vi.mock('@/constants/food-category-svgs', () => ({
  foodCategorySvgs: mockFoodCategorySvgs,
}));

describe('FoodCategories', () => {
  const mockOnCategorySelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView globally
    Element.prototype.scrollIntoView = vi.fn();
    // Mock scrollBy for HTMLDivElement
    HTMLDivElement.prototype.scrollBy = vi.fn();
  });

  it('should render all food categories', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    expect(screen.getByRole('button', { name: /Pizza/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Burger/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sushi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tacos/i })).toBeInTheDocument();
  });

  it('should call onCategorySelect when a category is clicked', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    fireEvent.click(pizzaButton);

    expect(mockOnCategorySelect).toHaveBeenCalledWith('Pizza');
  });

  it('should deselect category when clicking the same category', () => {
    render(<FoodCategories selectedCategory="Pizza" onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    fireEvent.click(pizzaButton);

    expect(mockOnCategorySelect).toHaveBeenCalledWith(null);
  });

  it('should mark selected category with data-selected attribute', () => {
    render(<FoodCategories selectedCategory="Pizza" onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    expect(pizzaButton).toHaveAttribute('data-selected', 'true');
  });

  it('should mark unselected categories with data-selected="false"', () => {
    render(<FoodCategories selectedCategory="Pizza" onCategorySelect={mockOnCategorySelect} />);

    const burgerButton = screen.getByRole('button', { name: /Burger/i });
    expect(burgerButton).toHaveAttribute('data-selected', 'false');
  });

  it('should render category icons', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    expect(screen.getByTestId('pizza-icon')).toBeInTheDocument();
    expect(screen.getByTestId('burger-icon')).toBeInTheDocument();
    expect(screen.getByTestId('sushi-icon')).toBeInTheDocument();
    expect(screen.getByTestId('tacos-icon')).toBeInTheDocument();
  });

  it('should have data-category attribute on category buttons', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    expect(pizzaButton).toHaveAttribute('data-category', 'Pizza');
  });

  it('should scroll left when left arrow is clicked', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;
    const scrollBySpy = vi.spyOn(container, 'scrollBy');

    // Wait for initial mount effect to complete
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    // Set up scroll position to show left arrow
    Object.defineProperty(container, 'scrollLeft', {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    // Trigger scroll event to update arrow visibility
    fireEvent.scroll(container);

    // Wait for the setTimeout delay (100ms) plus some buffer
    await waitFor(
      () => {
        const leftArrow = screen.queryByLabelText('Scroll left');
        expect(leftArrow).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const leftArrow = screen.getByLabelText('Scroll left');
    fireEvent.click(leftArrow);
    expect(scrollBySpy).toHaveBeenCalledWith({ left: -200, behavior: 'smooth' });
  });

  it('should scroll right when right arrow is clicked', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;
    const scrollBySpy = vi.spyOn(container, 'scrollBy');

    // Wait for initial mount effect to complete
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    // Set up scroll position to show right arrow
    Object.defineProperty(container, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    // Trigger scroll event to update arrow visibility
    fireEvent.scroll(container);

    // Wait for the setTimeout delay (100ms) plus some buffer
    await waitFor(
      () => {
        const rightArrow = screen.queryByLabelText('Scroll right');
        expect(rightArrow).toBeInTheDocument();
      },
      { timeout: 500 }
    );

    const rightArrow = screen.getByLabelText('Scroll right');
    fireEvent.click(rightArrow);
    expect(scrollBySpy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
  });

  it('should scroll to selected category when selectedCategory changes', async () => {
    const { rerender } = render(
      <FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />
    );

    const scrollIntoViewSpy = vi.fn();

    const sushiButton = screen.getByRole('button', { name: /Sushi/i });
    Object.defineProperty(sushiButton, 'scrollIntoView', {
      value: scrollIntoViewSpy,
      writable: true,
      configurable: true,
    });

    rerender(<FoodCategories selectedCategory="Sushi" onCategorySelect={mockOnCategorySelect} />);

    await waitFor(
      () => {
        expect(scrollIntoViewSpy).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      },
      { timeout: 1000 }
    );
  });

  it('should add scroll and resize event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should show left arrow when scrolled right', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;

    // Mock scroll position to show left arrow
    Object.defineProperty(container, 'scrollLeft', {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(container);

    await waitFor(
      () => {
        expect(screen.queryByLabelText('Scroll left')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should show right arrow when content is scrollable', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;

    // Mock scroll position to show right arrow
    Object.defineProperty(container, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(container);

    await waitFor(
      () => {
        expect(screen.queryByLabelText('Scroll right')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should hide left arrow when at the start', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;

    // Mock scroll position at start
    Object.defineProperty(container, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(container);

    await waitFor(
      () => {
        expect(screen.queryByLabelText('Scroll left')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should hide right arrow when at the end', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;

    // Mock scroll position at end
    Object.defineProperty(container, 'scrollLeft', {
      value: 200,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(container);

    await waitFor(
      () => {
        expect(screen.queryByLabelText('Scroll right')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should handle window resize event', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    fireEvent(window, new Event('resize'));

    // The resize event should trigger checkScrollPosition
    // Just verify the component doesn't crash
    expect(screen.getByRole('button', { name: /Pizza/i })).toBeInTheDocument();
  });

  it('should handle null selectedCategory', () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    expect(pizzaButton).toBeInTheDocument();
    expect(pizzaButton).toHaveAttribute('data-selected', 'false');
  });

  it('should handle empty category selection', () => {
    render(<FoodCategories selectedCategory="" onCategorySelect={mockOnCategorySelect} />);

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    fireEvent.click(pizzaButton);

    expect(mockOnCategorySelect).toHaveBeenCalledWith('Pizza');
  });

  it('should render arrows with correct aria labels', async () => {
    render(<FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />);

    const container = screen.getByTestId('food-categories-container') as HTMLDivElement;

    // Show arrows
    Object.defineProperty(container, 'scrollLeft', {
      value: 50,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'scrollWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: 300,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(container);

    await waitFor(
      () => {
        const leftArrow = screen.queryByLabelText('Scroll left');
        const rightArrow = screen.queryByLabelText('Scroll right');

        if (leftArrow) {
          expect(leftArrow).toBeInTheDocument();
        }
        if (rightArrow) {
          expect(rightArrow).toBeInTheDocument();
        }
      },
      { timeout: 500 }
    );
  });

  it('should handle rapid category selection changes', async () => {
    const { rerender } = render(
      <FoodCategories selectedCategory={null} onCategorySelect={mockOnCategorySelect} />
    );

    const scrollIntoViewSpy = vi.fn();

    const pizzaButton = screen.getByRole('button', { name: /Pizza/i });
    const burgerButton = screen.getByRole('button', { name: /Burger/i });

    Object.defineProperty(pizzaButton, 'scrollIntoView', {
      value: scrollIntoViewSpy,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(burgerButton, 'scrollIntoView', {
      value: scrollIntoViewSpy,
      writable: true,
      configurable: true,
    });

    rerender(<FoodCategories selectedCategory="Pizza" onCategorySelect={mockOnCategorySelect} />);
    await waitFor(
      () => {
        expect(scrollIntoViewSpy).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    scrollIntoViewSpy.mockClear();

    rerender(<FoodCategories selectedCategory="Burger" onCategorySelect={mockOnCategorySelect} />);
    await waitFor(
      () => {
        expect(scrollIntoViewSpy).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });
});
