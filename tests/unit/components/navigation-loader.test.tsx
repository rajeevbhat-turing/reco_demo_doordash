import { vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import NavigationLoader from '@/components/navigation-loader';

// Mock Next.js navigation
const { mockPathnameRef } = vi.hoisted(() => ({
  mockPathnameRef: { current: '/home' },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathnameRef.current,
}));

describe('NavigationLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockPathnameRef.current = '/home';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render on initial mount', () => {
    render(<NavigationLoader />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should show loader when pathname changes', () => {
    const { rerender } = render(<NavigationLoader />);

    // Change pathname
    mockPathnameRef.current = '/store/123';
    rerender(<NavigationLoader />);

    expect(screen.getByTestId('navigation-loader')).toBeInTheDocument();
  });

  it('should hide loader after timeout', () => {
    const { rerender } = render(<NavigationLoader />);

    // Change pathname
    mockPathnameRef.current = '/store/123';
    rerender(<NavigationLoader />);

    expect(screen.getByTestId('navigation-loader')).toBeInTheDocument();

    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByTestId('navigation-loader')).not.toBeInTheDocument();
  });

  it('should not show loader when pathname stays the same', () => {
    const { rerender } = render(<NavigationLoader />);

    // Rerender with same pathname
    rerender(<NavigationLoader />);

    expect(screen.queryByTestId('navigation-loader')).not.toBeInTheDocument();
  });

  it('should show loader for multiple navigation changes', () => {
    const { rerender } = render(<NavigationLoader />);

    // First navigation
    mockPathnameRef.current = '/store/123';
    rerender(<NavigationLoader />);
    expect(screen.getByTestId('navigation-loader')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByTestId('navigation-loader')).not.toBeInTheDocument();

    // Second navigation
    mockPathnameRef.current = '/checkout';
    rerender(<NavigationLoader />);
    expect(screen.getByTestId('navigation-loader')).toBeInTheDocument();
  });

  it('should clear timer on unmount', () => {
    const { rerender, unmount } = render(<NavigationLoader />);

    mockPathnameRef.current = '/store/123';
    rerender(<NavigationLoader />);

    expect(screen.getByTestId('navigation-loader')).toBeInTheDocument();

    // Unmount before timer completes
    unmount();

    // Should not throw and loader should be removed
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByTestId('navigation-loader')).not.toBeInTheDocument();
  });
});
