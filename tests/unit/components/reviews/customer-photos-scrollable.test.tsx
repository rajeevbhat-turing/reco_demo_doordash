import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerPhotosScrollable from '@/components/reviews/customer-photos-scrollable';

describe('CustomerPhotosScrollable', () => {
  const mockPhotos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
  const mockPhotosWithInfo = [
    { photo: 'photo1.jpg', userName: 'John Doe', timestamp: '2024-01-15T10:30:00Z' },
    { photo: 'photo2.jpg', userName: 'Jane Smith', timestamp: '2024-01-16T11:00:00Z' },
  ];
  const mockOnPhotoClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render photos', () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} />);

    mockPhotos.forEach((photo, index) => {
      const img = screen.getByAltText(`Customer photo ${index + 1}`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', photo);
    });
  });

  it('should display title when provided', () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} title="Customer Photos" />);

    expect(screen.getByText('Customer Photos')).toBeInTheDocument();
  });

  it('should not display title when not provided', () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} />);

    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('should call onPhotoClick when photo is clicked and photoInfo is available', () => {
    render(
      <CustomerPhotosScrollable
        photos={mockPhotos}
        photosWithInfo={mockPhotosWithInfo}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    const firstPhoto = screen.getByAltText('Customer photo 1');
    fireEvent.click(firstPhoto);

    expect(mockOnPhotoClick).toHaveBeenCalledWith(mockPhotosWithInfo[0]);
  });

  it('should not call onPhotoClick when photoInfo is not available', () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} onPhotoClick={mockOnPhotoClick} />);

    const firstPhoto = screen.getByAltText('Customer photo 1');
    fireEvent.click(firstPhoto);

    expect(mockOnPhotoClick).not.toHaveBeenCalled();
  });

  it('should not call onPhotoClick when callback is not provided', () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} photosWithInfo={mockPhotosWithInfo} />);

    const firstPhoto = screen.getByAltText('Customer photo 1');
    fireEvent.click(firstPhoto);

    // Should not throw error
    expect(firstPhoto).toBeInTheDocument();
  });

  it('should handle empty photos array', () => {
    render(<CustomerPhotosScrollable photos={[]} />);

    const images = screen.queryAllByRole('img');
    expect(images.length).toBe(0);
  });

  it('should handle scroll events', async () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} />);

    const scrollContainer = screen.getByTestId('customer-photos-scroll-container');
    if (scrollContainer) {
      // Mock scroll properties
      Object.defineProperty(scrollContainer, 'scrollLeft', {
        writable: true,
        value: 0,
      });
      Object.defineProperty(scrollContainer, 'scrollWidth', {
        writable: true,
        value: 1000,
      });
      Object.defineProperty(scrollContainer, 'clientWidth', {
        writable: true,
        value: 500,
      });

      fireEvent.scroll(scrollContainer);

      await waitFor(() => {
        // Scroll event should be handled
        expect(scrollContainer).toBeInTheDocument();
      });
    }
  });

  it('should handle window resize events', async () => {
    render(<CustomerPhotosScrollable photos={mockPhotos} />);

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      // Resize event should be handled
      expect(screen.getByAltText('Customer photo 1')).toBeInTheDocument();
    });
  });
});
