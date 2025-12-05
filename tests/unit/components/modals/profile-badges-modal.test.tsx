import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileBadgesModal from '@/components/modals/profile-badges-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon">Star</div>,
  Crown: () => <div data-testid="crown-icon">Crown</div>,
  Megaphone: () => <div data-testid="megaphone-icon">Megaphone</div>,
  Store: () => <div data-testid="store-icon">Store</div>,
}));

vi.mock('@/lib/utils/icons', () => ({
  LockIcon: () => <div data-testid="lock-icon">LockIcon</div>,
}));

describe('ProfileBadgesModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ProfileBadgesModal isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Profile badges')).toBeInTheDocument();
  });

  it('should display title', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Profile badges')).toBeInTheDocument();
  });

  it('should display introductory text', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(
        'Earn badges and gain influence on DashDoor. Your profile must be public to participate.'
      )
    ).toBeInTheDocument();
  });

  it('should display Emerging expert badge section', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Emerging expert')).toBeInTheDocument();
    expect(
      screen.getByText('Share high-quality reviews or photos for 3+ stores.')
    ).toBeInTheDocument();
  });

  it('should display Local expert badge section', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Local expert')).toBeInTheDocument();
    expect(
      screen.getByText('Share high-quality reviews or photos for 10+ stores.')
    ).toBeInTheDocument();
  });

  it('should display badge benefits with icons', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Gain more visibility for your contributions')).toBeInTheDocument();
    expect(screen.getByText('Be a reliable voice for other customers')).toBeInTheDocument();
    expect(screen.getByText('Gather support for local businesses')).toBeInTheDocument();
    expect(screen.getByText('Be top ranked and seen by the most people')).toBeInTheDocument();
    expect(screen.getByText('Represent the most trusted voices')).toBeInTheDocument();
    expect(screen.getByText('Make a real difference for local businesses')).toBeInTheDocument();
  });

  it('should call onClose when Close button is clicked', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<ProfileBadgesModal isOpen={true} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId('profile-badges-modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
