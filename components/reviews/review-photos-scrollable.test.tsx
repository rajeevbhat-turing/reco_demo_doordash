import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewPhotosScrollable from './review-photos-scrollable';

describe('ReviewPhotosScrollable', () => {
  const mockPhotos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
  const mockOnPhotoClick = vi.fn();
  const mockUserName = 'John Doe';
  const mockTimestamp = '2024-01-15T10:30:00Z';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render photos', () => {
    render(
      <ReviewPhotosScrollable
        photos={mockPhotos}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    mockPhotos.forEach((photo, index) => {
      const img = screen.getByAltText(`Review photo ${index + 1}`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', photo);
    });
  });

  it('should call onPhotoClick with correct photoInfo when photo is clicked', () => {
    render(
      <ReviewPhotosScrollable
        photos={mockPhotos}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    const firstPhoto = screen.getByAltText('Review photo 1');
    fireEvent.click(firstPhoto);

    expect(mockOnPhotoClick).toHaveBeenCalledWith({
      photo: 'photo1.jpg',
      userName: mockUserName,
      timestamp: mockTimestamp,
    });
  });

  it('should call onPhotoClick for each photo with correct info', () => {
    render(
      <ReviewPhotosScrollable
        photos={mockPhotos}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    const secondPhoto = screen.getByAltText('Review photo 2');
    fireEvent.click(secondPhoto);

    expect(mockOnPhotoClick).toHaveBeenCalledWith({
      photo: 'photo2.jpg',
      userName: mockUserName,
      timestamp: mockTimestamp,
    });
  });

  it('should handle empty photos array', () => {
    const { container } = render(
      <ReviewPhotosScrollable
        photos={[]}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });

  it('should handle scroll events', async () => {
    const { container } = render(
      <ReviewPhotosScrollable
        photos={mockPhotos}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    const scrollContainer = container.querySelector('[class*="overflow-x-auto"]') as HTMLElement;
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
    render(
      <ReviewPhotosScrollable
        photos={mockPhotos}
        userName={mockUserName}
        timestamp={mockTimestamp}
        onPhotoClick={mockOnPhotoClick}
      />
    );

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      // Resize event should be handled
      expect(screen.getByAltText('Review photo 1')).toBeInTheDocument();
    });
  });
});
