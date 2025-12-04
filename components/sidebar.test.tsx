import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './sidebar';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">🏠</div>,
  FileText: () => <div data-testid="filetext-icon">📄</div>,
  CircleUserRound: () => <div data-testid="user-icon">👤</div>,
}));

// Mock Next.js
const mockPathname = { current: '/' };

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.current,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock stores
const { mockIsAuthenticated, mockUserStoreSubscribe } = vi.hoisted(() => ({
  mockIsAuthenticated: vi.fn(() => false),
  mockUserStoreSubscribe: vi.fn(() => () => {}),
}));

vi.mock('@/store/user-store', () => ({
  useUserStore: Object.assign(() => ({}), {
    subscribe: mockUserStoreSubscribe,
    getState: () => ({
      isAuthenticated: mockIsAuthenticated,
    }),
  }),
}));

// Mock child components
vi.mock('./modals/authentication-modal', () => ({
  default: ({ onClose, defaultMode }: { onClose: () => void; defaultMode: string }) => (
    <div data-testid="auth-modal" data-mode={defaultMode}>
      <button onClick={onClose}>Close Auth</button>
    </div>
  ),
}));

vi.mock('./account-popup', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="account-popup">
        <button onClick={onClose}>Close Popup</button>
      </div>
    ) : null,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.current = '/';
    mockIsAuthenticated.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render Home link', () => {
      render(<Sidebar />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should link Home to /home', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/home');
    });
  });

  describe('Authentication State - Not Authenticated', () => {
    it('should show Sign up or Login when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Sidebar />);
      expect(screen.getByText('Sign up or Login')).toBeInTheDocument();
    });

    it('should not show Orders when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Sidebar />);
      expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    });

    it('should not show Account when not authenticated', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Sidebar />);
      expect(screen.queryByText('Account')).not.toBeInTheDocument();
    });

    it('should open auth modal when Sign up or Login is clicked', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Sidebar />);

      fireEvent.click(screen.getByText('Sign up or Login'));
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-mode', 'signup');
    });
  });

  describe('Authentication State - Authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated.mockReturnValue(true);
    });

    it('should show Orders when authenticated', () => {
      render(<Sidebar />);
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    it('should show Account when authenticated', () => {
      render(<Sidebar />);
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should not show Sign up or Login when authenticated', () => {
      render(<Sidebar />);
      expect(screen.queryByText('Sign up or Login')).not.toBeInTheDocument();
    });

    it('should link Orders to /orders', () => {
      render(<Sidebar />);
      expect(screen.getByRole('link', { name: /orders/i })).toHaveAttribute('href', '/orders');
    });

    it('should open account popup when Account is clicked', () => {
      render(<Sidebar />);

      fireEvent.click(screen.getByText('Account'));
      expect(screen.getByTestId('account-popup')).toBeInTheDocument();
    });

    it('should close account popup when clicked again', () => {
      render(<Sidebar />);

      fireEvent.click(screen.getByText('Account'));
      expect(screen.getByTestId('account-popup')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Account'));
      expect(screen.queryByTestId('account-popup')).not.toBeInTheDocument();
    });
  });

  describe('Close Handlers', () => {
    it('should close auth modal when onClose is called', () => {
      mockIsAuthenticated.mockReturnValue(false);
      render(<Sidebar />);

      fireEvent.click(screen.getByText('Sign up or Login'));
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Auth'));
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });

    it('should close account popup when onClose is called', () => {
      mockIsAuthenticated.mockReturnValue(true);
      render(<Sidebar />);

      fireEvent.click(screen.getByText('Account'));
      expect(screen.getByTestId('account-popup')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Popup'));
      expect(screen.queryByTestId('account-popup')).not.toBeInTheDocument();
    });
  });
});
