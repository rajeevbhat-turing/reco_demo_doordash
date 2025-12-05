import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChooseLabelModal from '@/components/modals/choose-label-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('ChooseLabelModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ChooseLabelModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('Choose label')).toBeInTheDocument();
  });

  it('should display all label options', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should show "None" as selected by default when no currentLabel', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const noneButton = screen.getByText('None');
    expect(noneButton).toHaveClass('bg-gray-900', 'text-white');
  });

  it('should show current label as selected when provided', () => {
    render(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="home"
      />
    );

    const homeButton = screen.getByText('Home');
    expect(homeButton).toHaveClass('bg-gray-900', 'text-white');
  });

  it('should show Custom as selected when currentLabel is custom', () => {
    render(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="My Custom Label"
      />
    );

    const customButton = screen.getByText('Custom');
    expect(customButton).toHaveClass('bg-gray-900', 'text-white');
  });

  it('should display custom input when Custom is selected', () => {
    render(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="My Custom Label"
      />
    );

    const customInput = screen.getByPlaceholderText('Enter custom label');
    expect(customInput).toBeInTheDocument();
    expect(customInput).toHaveValue('My Custom Label');
  });

  it('should update custom label text when typing', () => {
    render(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="My Custom Label"
      />
    );

    const customInput = screen.getByPlaceholderText('Enter custom label') as HTMLInputElement;
    fireEvent.change(customInput, { target: { value: 'New Custom Label' } });

    expect(customInput.value).toBe('New Custom Label');
  });

  it('should show custom input when Custom button is clicked', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    expect(screen.getByPlaceholderText('Enter custom label')).toBeInTheDocument();
  });

  it('should call onSave with lowercase label when standard label is selected', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('home');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with custom text when Custom is selected', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    const customInput = screen.getByPlaceholderText('Enter custom label') as HTMLInputElement;
    fireEvent.change(customInput, { target: { value: 'My Custom Label' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('My Custom Label');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const backdrop = screen.getByTestId('choose-label-modal-backdrop');
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display privacy text', () => {
    render(<ChooseLabelModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('Only you can see this')).toBeInTheDocument();
  });

  it('should reset state when modal reopens with new currentLabel', () => {
    const { rerender } = render(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="home"
      />
    );

    rerender(
      <ChooseLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentLabel="work"
      />
    );

    const workButton = screen.getByText('Work');
    expect(workButton).toHaveClass('bg-gray-900', 'text-white');
  });
});
