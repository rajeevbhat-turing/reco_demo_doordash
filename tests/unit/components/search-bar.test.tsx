import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/components/search-bar';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">🔍</div>,
  X: () => <div data-testid="close-icon">X</div>,
  ArrowLeft: () => <div data-testid="arrow-left">←</div>,
  Clock: () => <div data-testid="clock-icon">🕐</div>,
}));

// Mock Next.js
const mockPush = vi.fn();
const mockPathname = { current: '/' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname.current,
}));

// Mock stores and hooks
const {
  mockIsAuthenticated,
  mockCurrentUser,
  mockTempAddress,
  mockUpdateSearchResults,
  mockClearSearchResults,
  mockRecordSearch,
  mockUseRestaurants,
} = vi.hoisted(() => ({
  mockIsAuthenticated: vi.fn(() => false),
  mockCurrentUser: vi.fn(() => null as any),
  mockTempAddress: vi.fn(() => ({ lat: 37.7749, lng: -122.4194 })),
  mockUpdateSearchResults: vi.fn(),
  mockClearSearchResults: vi.fn(),
  mockRecordSearch: vi.fn(),
  mockUseRestaurants: vi.fn(() => ({ data: null as any })),
}));

vi.mock('@/store/user-store', () => ({
  useUserStore: Object.assign(
    (selector: any) => {
      const state = {
        currentUser: mockCurrentUser(),
        getTempAddress: () => mockTempAddress(),
      };
      return selector ? selector(state) : state;
    },
    {
      subscribe: vi.fn(() => () => {}),
      getState: () => ({
        isAuthenticated: mockIsAuthenticated,
      }),
    }
  ),
}));

vi.mock('@/store/app-store', () => ({
  useAppStore: () => ({
    updateSearchResults: mockUpdateSearchResults,
    clearSearchResults: mockClearSearchResults,
  }),
}));

vi.mock('@/store/verifier-store', () => ({
  useVerifierStore: () => ({
    recordSearch: mockRecordSearch,
  }),
}));

vi.mock('@/lib/hooks/use-restaurants', () => ({
  useRestaurants: mockUseRestaurants,
}));

// Mock fetch for menu items
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockRestaurants = [
  {
    id: 'rest-1',
    name: 'Pizza Palace',
    logo: '/pizza.jpg',
    cuisine: 'Italian',
    priceRange: '$$',
    time: '25-35 min',
    dashPass: true,
    categories: ['Pizza', 'Italian'],
  },
  {
    id: 'rest-2',
    name: 'Burger Joint',
    logo: '/burger.jpg',
    cuisine: 'American',
    priceRange: '$',
    time: '15-25 min',
    dashPass: false,
    categories: ['Burgers', 'American'],
  },
];

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.current = '/';
    localStorageMock.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { menuItems: [] } }),
    });
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<SearchBar />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render search icon when not active', () => {
      render(<SearchBar />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('should update search term when typing', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'pizza' } });
      expect(input).toHaveValue('pizza');
    });

    it('should clear search when clear button is clicked', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'pizza' } });
      fireEvent.click(screen.getByTestId('close-icon'));
      expect(input).toHaveValue('');
    });
  });

  describe('Search Results', () => {
    it('should display restaurant results when searching', async () => {
      mockUseRestaurants.mockReturnValue({ data: mockRestaurants });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Pizza' } });

      await waitFor(() => {
        expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      });
    });

    it('should search by cuisine', async () => {
      mockUseRestaurants.mockReturnValue({ data: mockRestaurants });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Italian' } });

      await waitFor(() => {
        expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      });
    });

    it('should navigate to store when result is clicked', async () => {
      mockUseRestaurants.mockReturnValue({ data: mockRestaurants });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Pizza' } });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Pizza Palace'));
      });

      expect(mockPush).toHaveBeenCalledWith('/store/rest-1');
    });

    it('should show no results message when no matches', async () => {
      mockUseRestaurants.mockReturnValue({ data: mockRestaurants });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'NonExistentRestaurant' } });

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Submission', () => {
    it('should navigate to search page on form submit', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'pizza' } });
      fireEvent.submit(input.closest('form')!);

      expect(mockPush).toHaveBeenCalledWith('/search?q=pizza');
    });

    it('should save search to recent searches', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'pizza' } });
      fireEvent.submit(input.closest('form')!);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should record search in verifier store', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'pizza' } });
      fireEvent.submit(input.closest('form')!);

      expect(mockRecordSearch).toHaveBeenCalledWith('pizza');
    });
  });

  describe('Recent Searches', () => {
    it('should display recent searches', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['Pizza', 'Burger']));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);

      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    it('should navigate when clicking recent search', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['Pizza']));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.click(screen.getByText('Pizza'));

      expect(mockPush).toHaveBeenCalledWith('/search?q=Pizza');
    });

    it('should remove recent search when X is clicked', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['Pizza', 'Burger']));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);

      const removeButton = screen.getByLabelText('Remove Pizza from recent searches');
      fireEvent.click(removeButton);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Back Navigation', () => {
    it('should show back arrow when search is active', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);

      expect(screen.getByTestId('arrow-left')).toBeInTheDocument();
    });

    it('should navigate to home when on search page and back is clicked', () => {
      mockPathname.current = '/search';

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.click(screen.getByTestId('arrow-left').parentElement!);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to /home for authenticated users', () => {
      mockPathname.current = '/search';
      mockIsAuthenticated.mockReturnValue(true);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      fireEvent.click(screen.getByTestId('arrow-left').parentElement!);

      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  describe('Click Outside', () => {
    it('should close dropdown when clicking outside', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.focus(input);
      expect(screen.getByTestId('arrow-left')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId('arrow-left')).not.toBeInTheDocument();
    });
  });
});
