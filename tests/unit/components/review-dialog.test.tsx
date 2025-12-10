import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewDialog from '@/components/review-dialog';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
  Star: ({ onClick, onMouseEnter, onMouseLeave, className }: any) => (
    <button
      data-testid="star"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      ★
    </button>
  ),
  ThumbsUp: () => <div data-testid="thumbs-up">👍</div>,
  ThumbsDown: () => <div data-testid="thumbs-down">👎</div>,
}));

// Mock icons
vi.mock('@/lib/utils/icons', () => ({
  FilledLightbulbIcon: () => <div data-testid="lightbulb-icon">💡</div>,
}));

// Mock stores
const { mockCurrentUser, mockAddReview } = vi.hoisted(() => ({
  mockCurrentUser: vi.fn(() => ({
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '555-1234',
    password: 'HashedPassword123!',
    country: { dialCode: '+1', code: 'US', name: 'United States' },
    userCountry: 'US',
    avatar: '/avatar.jpg' as string | null,
    paymentMethods: [],
    addresses: [],
  })),
  mockAddReview: vi.fn(),
}));

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: any) => {
    const state = { currentUser: mockCurrentUser() };
    return selector ? selector(state) : state;
  },
}));

vi.mock('@/store/review-store', () => ({
  useReviewStore: () => ({ addReview: mockAddReview }),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  restaurantName: 'Test Restaurant',
  vendorId: 'vendor-1',
  vendorLogo: '/logo.jpg',
};

describe('ReviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ReviewDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Add a Public Review')).not.toBeInTheDocument();
    });

    it('should render dialog when isOpen is true', () => {
      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('Add a Public Review')).toBeInTheDocument();
    });

    it('should display restaurant name', () => {
      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    it('should display user name', () => {
      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
    });

    it('should display 5 rating stars', () => {
      render(<ReviewDialog {...defaultProps} />);
      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(5);
    });
  });

  describe('Rating Selection', () => {
    it('should select rating when star is clicked', () => {
      render(<ReviewDialog {...defaultProps} />);
      const stars = screen.getAllByTestId('star');
      fireEvent.click(stars[3]); // Click 4th star
      expect(stars[3]).toBeInTheDocument();
    });

    it('should show error when submitting without rating', () => {
      render(<ReviewDialog {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      expect(screen.getByText('Rating required')).toBeInTheDocument();
    });
  });

  describe('Review Text', () => {
    it('should show min characters message initially', () => {
      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('Min characters: 10')).toBeInTheDocument();
    });

    it('should show error when submitting with less than 10 characters', () => {
      render(<ReviewDialog {...defaultProps} />);
      const stars = screen.getAllByTestId('star');
      fireEvent.click(stars[4]);

      const textarea = screen.getByPlaceholderText(/write a review/i);
      fireEvent.change(textarea, { target: { value: 'Short' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      expect(screen.getByText('Min characters: 10')).toBeInTheDocument();
    });

    it('should show helpful tip when text is 10+ characters', () => {
      render(<ReviewDialog {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/write a review/i);
      fireEvent.change(textarea, { target: { value: 'This is a good review text' } });

      expect(
        screen.getByText('Adding more details helps out fellow customers')
      ).toBeInTheDocument();
    });

    it('should show max character error when exceeding 2000 characters', () => {
      render(<ReviewDialog {...defaultProps} />);
      const textarea = screen.getByPlaceholderText(/write a review/i);
      const longText = 'a'.repeat(2001);
      fireEvent.change(textarea, { target: { value: longText } });

      expect(screen.getByText('Max character limit')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should show success message after valid submission', async () => {
      render(<ReviewDialog {...defaultProps} />);

      const stars = screen.getAllByTestId('star');
      fireEvent.click(stars[4]);

      const textarea = screen.getByPlaceholderText(/write a review/i);
      fireEvent.change(textarea, { target: { value: 'This is a great restaurant!' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Thanks for leaving a review!')).toBeInTheDocument();
      });
    });

    it('should call onSubmit callback when Done is clicked after submission', async () => {
      const onSubmit = vi.fn();
      render(<ReviewDialog {...defaultProps} onSubmit={onSubmit} />);

      const stars = screen.getAllByTestId('star');
      fireEvent.click(stars[4]);

      const textarea = screen.getByPlaceholderText(/write a review/i);
      fireEvent.change(textarea, { target: { value: 'This is a great restaurant!' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Thanks for leaving a review!')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /done/i }));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should add review to store when no onSubmit callback', async () => {
      render(<ReviewDialog {...defaultProps} onSubmit={undefined} />);

      const stars = screen.getAllByTestId('star');
      fireEvent.click(stars[4]);

      const textarea = screen.getByPlaceholderText(/write a review/i);
      fireEvent.change(textarea, { target: { value: 'This is a great restaurant!' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockAddReview).toHaveBeenCalled();
      });
    });
  });

  describe('Dialog Close', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<ReviewDialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<ReviewDialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Order Items Review', () => {
    const orderItems = [
      { id: 'item-1', name: 'Burger', price: 12.99, image: '/burger.jpg', restaurantId: 'rest-1' },
      { id: 'item-2', name: 'Fries', price: 4.99, image: '/fries.jpg', restaurantId: 'rest-1' },
    ];

    it('should display order items when provided', () => {
      render(<ReviewDialog {...defaultProps} orderItems={orderItems} orderDate="Oct 29, 2025" />);

      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
      expect(screen.getByText('Do you recommend these dishes?')).toBeInTheDocument();
    });

    it('should display order date when provided', () => {
      render(<ReviewDialog {...defaultProps} orderItems={orderItems} orderDate="Oct 29, 2025" />);
      expect(screen.getByText('Oct 29, 2025')).toBeInTheDocument();
    });

    it('should show different title when orderItems provided', () => {
      render(<ReviewDialog {...defaultProps} orderItems={orderItems} />);
      expect(screen.getByText('Review this store')).toBeInTheDocument();
    });

    it('should display item prices', () => {
      render(<ReviewDialog {...defaultProps} orderItems={orderItems} />);
      expect(screen.getByText('$12.99')).toBeInTheDocument();
      expect(screen.getByText('$4.99')).toBeInTheDocument();
    });
  });

  describe('User Display Name', () => {
    it('should show first name and last initial', () => {
      mockCurrentUser.mockReturnValue({
        id: 'user-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '555-1234',
        password: 'HashedPassword123!',
        country: { dialCode: '+1', code: 'US', name: 'United States' },
        userCountry: 'US',
        avatar: '/avatar.jpg' as string | null,
        paymentMethods: [],
        addresses: [],
      });

      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('Jane S.')).toBeInTheDocument();
    });

    it('should show just first name if no last name', () => {
      mockCurrentUser.mockReturnValue({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        phoneNumber: '555-1234',
        password: 'HashedPassword123!',
        country: { dialCode: '+1', code: 'US', name: 'United States' },
        userCountry: 'US',
        avatar: null,
        paymentMethods: [],
        addresses: [],
      });

      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should show User if no name', () => {
      mockCurrentUser.mockReturnValue({
        id: 'user-1',
        name: '',
        email: 'user@example.com',
        phoneNumber: '555-1234',
        password: 'HashedPassword123!',
        country: { dialCode: '+1', code: 'US', name: 'United States' },
        userCountry: 'US',
        avatar: null,
        paymentMethods: [],
        addresses: [],
      });

      render(<ReviewDialog {...defaultProps} />);
      expect(screen.getAllByText('User')).toHaveLength(1);
    });
  });
});
