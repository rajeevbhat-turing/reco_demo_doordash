import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import LayoutWrapper from './layout-wrapper';

// Mock Next.js navigation
const { mockPathnameRef } = vi.hoisted(() => {
  return {
    mockPathnameRef: { current: '/home' },
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathnameRef.current,
}));

// Mock Sidebar component
vi.mock('@/components/sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock stores
const { mockIsAuthenticated, mockGetAddresses, mockGetTempAddress } = vi.hoisted(() => {
  return {
    mockIsAuthenticated: vi.fn(() => false),
    mockGetAddresses: vi.fn(() => []),
    mockGetTempAddress: vi.fn(() => null as any),
  };
});

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: any) => {
    const state = {
      isAuthenticated: mockIsAuthenticated,
      getAddresses: mockGetAddresses,
      getTempAddress: mockGetTempAddress,
    };
    return selector ? selector(state) : state;
  },
}));

describe('LayoutWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathnameRef.current = '/home';
    mockIsAuthenticated.mockReturnValue(false);
    mockGetAddresses.mockReturnValue([]);
    mockGetTempAddress.mockReturnValue(null);
  });

  describe('Sidebar visibility', () => {
    it('should render Sidebar on home page', () => {
      mockPathnameRef.current = '/home';
      mockGetTempAddress.mockReturnValue({
        id: 'temp-1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
      });

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should not render Sidebar on checkout page', () => {
      mockPathnameRef.current = '/checkout';
      mockGetTempAddress.mockReturnValue({
        id: 'temp-1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
      });

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should not render Sidebar on auth page', () => {
      mockPathnameRef.current = '/auth/signin';

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should not render Sidebar on password reset page', () => {
      mockPathnameRef.current = '/password_reset';

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should not render Sidebar on order detail page', () => {
      mockPathnameRef.current = '/orders/123';
      mockGetTempAddress.mockReturnValue({
        id: 'temp-1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
      });

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should render Sidebar on orders list page', () => {
      mockPathnameRef.current = '/orders';
      mockGetTempAddress.mockReturnValue({
        id: 'temp-1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
      });

      render(
        <LayoutWrapper>
          <div>Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  describe('Content visibility for authenticated users', () => {
    it('should show content when authenticated user has addresses', () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetAddresses.mockReturnValue([
        {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          lat: 40.7128,
          lng: -74.006,
          addressType: 'house',
          default: true,
        },
      ] as any);

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should hide content when authenticated user has no addresses', () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockGetAddresses.mockReturnValue([]);

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('Content visibility for non-authenticated users', () => {
    it('should show content when non-authenticated user has temp address', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetTempAddress.mockReturnValue({
        id: 'temp-1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
      });

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should hide content when non-authenticated user has no temp address', () => {
      mockIsAuthenticated.mockReturnValue(false);
      mockGetTempAddress.mockReturnValue(null);

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });

    it('should show content on auth page even without temp address', () => {
      mockPathnameRef.current = '/auth/signin';
      mockIsAuthenticated.mockReturnValue(false);
      mockGetTempAddress.mockReturnValue(null);

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should show content on password reset page even without temp address', () => {
      mockPathnameRef.current = '/password_reset/token123';
      mockIsAuthenticated.mockReturnValue(false);
      mockGetTempAddress.mockReturnValue(null);

      render(
        <LayoutWrapper>
          <div data-testid="child-content">Content</div>
        </LayoutWrapper>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });
});
