import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverallRating from './overall-rating';
import { getDefaultRating } from '@/lib/utils/rating-utils';

// Mock the rating utils
vi.mock('@/lib/utils/rating-utils', () => ({
  getDefaultRating: vi.fn(),
}));

describe('OverallRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render overall rating component', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(4.5);
    render(<OverallRating averageRating={4.5} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('of 5 stars')).toBeInTheDocument();
  });

  it('should display rating with one decimal place when decimal is not zero', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(4.5);
    render(<OverallRating averageRating={4.5} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should display rating without decimal when rating is whole number', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(5);
    render(<OverallRating averageRating={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should call getDefaultRating with averageRating', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(4.2);
    render(<OverallRating averageRating={4.2} />);

    expect(getDefaultRating).toHaveBeenCalledWith(4.2);
  });

  it('should handle zero rating', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(0);
    render(<OverallRating averageRating={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('of 5 stars')).toBeInTheDocument();
  });

  it('should handle low rating', () => {
    (getDefaultRating as ReturnType<typeof vi.fn>).mockReturnValue(2.3);
    render(<OverallRating averageRating={2.3} />);

    expect(screen.getByText('2.3')).toBeInTheDocument();
  });
});
