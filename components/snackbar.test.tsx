import { vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Snackbar from './snackbar';

// Mock global context
const { mockSnackbar, mockSetSnackbar } = vi.hoisted(() => ({
  mockSnackbar: vi.fn(() => null as { message: string; autoHideDuration: number } | null),
  mockSetSnackbar: vi.fn(),
}));

vi.mock('@/app/global-context', () => ({
  useGlobalContext: () => ({
    snackbar: mockSnackbar(),
    setSnackbar: mockSetSnackbar,
  }),
}));

describe('Snackbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when snackbar is null', () => {
      mockSnackbar.mockReturnValue(null);
      const { container } = render(<Snackbar />);
      expect(container.firstChild).toBeNull();
    });

    it('should render snackbar message when snackbar exists', () => {
      mockSnackbar.mockReturnValue({
        message: 'Item added to cart',
        autoHideDuration: 3000,
      });

      render(<Snackbar />);
      expect(screen.getByText('Item added to cart')).toBeInTheDocument();
    });
  });

  describe('Auto Hide', () => {
    it('should hide snackbar after autoHideDuration', () => {
      mockSnackbar.mockReturnValue({
        message: 'Test message',
        autoHideDuration: 3000,
      });

      render(<Snackbar />);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockSetSnackbar).toHaveBeenCalledWith(null);
    });

    it('should not hide snackbar before autoHideDuration', () => {
      mockSnackbar.mockReturnValue({
        message: 'Test message',
        autoHideDuration: 3000,
      });

      render(<Snackbar />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockSetSnackbar).not.toHaveBeenCalled();
    });

    it('should clear timeout on unmount', () => {
      mockSnackbar.mockReturnValue({
        message: 'Test message',
        autoHideDuration: 3000,
      });

      const { unmount } = render(<Snackbar />);
      unmount();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockSetSnackbar).not.toHaveBeenCalled();
    });
  });

  describe('Different Messages', () => {
    it('should display order placed message', () => {
      mockSnackbar.mockReturnValue({
        message: 'Order placed successfully!',
        autoHideDuration: 5000,
      });

      render(<Snackbar />);
      expect(screen.getByText('Order placed successfully!')).toBeInTheDocument();
    });

    it('should display error message', () => {
      mockSnackbar.mockReturnValue({
        message: 'Something went wrong. Please try again.',
        autoHideDuration: 4000,
      });

      render(<Snackbar />);
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});
