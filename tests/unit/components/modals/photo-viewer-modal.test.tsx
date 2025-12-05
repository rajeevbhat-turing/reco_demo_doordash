import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhotoViewerModal from '@/components/modals/photo-viewer-modal';
import { format } from 'date-fns';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';

// Mock dependencies
vi.mock('@/lib/utils/helperFunctions', () => ({
  generateAvatarColor: vi.fn(),
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('PhotoViewerModal', () => {
  const mockOnClose = vi.fn();
  const mockPhoto = 'https://example.com/photo.jpg';
  const mockUserName = 'John Doe';
  const mockTimestamp = '2024-01-15T10:30:00Z';

  beforeEach(() => {
    vi.clearAllMocks();
    (generateAvatarColor as ReturnType<typeof vi.fn>).mockReturnValue('#f44336');
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <PhotoViewerModal
        isOpen={false}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByAltText(`Photo by ${mockUserName}`)).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText(mockUserName)).toBeInTheDocument();
    expect(screen.getByText(format(new Date(mockTimestamp), 'M/d/yy'))).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(generateAvatarColor).toHaveBeenCalledWith(mockUserName);
  });

  it('should display photo with correct src and alt', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    const img = screen.getByAltText(`Photo by ${mockUserName}`);
    expect(img).toHaveAttribute('src', mockPhoto);
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Done button is clicked', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    const backdrop = screen.getByTestId('photo-viewer-modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking inside modal', () => {
    render(
      <PhotoViewerModal
        isOpen={true}
        onClose={mockOnClose}
        photo={mockPhoto}
        userName={mockUserName}
        timestamp={mockTimestamp}
      />
    );

    const img = screen.getByAltText(`Photo by ${mockUserName}`);
    fireEvent.click(img);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
