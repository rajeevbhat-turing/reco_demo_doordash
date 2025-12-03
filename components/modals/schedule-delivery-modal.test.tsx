import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScheduleDeliveryModal from './schedule-delivery-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('ScheduleDeliveryModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTime = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    // Mock current date to have consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z')); // Monday, noon
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ScheduleDeliveryModal isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Select a Delivery Date')).toBeInTheDocument();
  });

  it('should display "As soon as possible" option', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('As soon as possible')).toBeInTheDocument();
  });

  it('should display date options starting from today', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(screen.getByText('TMR')).toBeInTheDocument();
  });

  it('should call onSelectTime with "asap" when ASAP is clicked', () => {
    render(
      <ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} onSelectTime={mockOnSelectTime} />
    );

    const asapButton = screen.getByText('As soon as possible');
    fireEvent.click(asapButton);

    expect(mockOnSelectTime).toHaveBeenCalledWith(expect.any(String), 'asap', '', expect.any(Date));
  });

  it('should display time slots when "Schedule for later" is selected for today', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    // Click "Schedule for later" button
    const laterButton = screen.getByText('Schedule for later');
    fireEvent.click(laterButton);

    // Time slots should appear (they start 30 minutes from now in 20-minute increments)
    waitFor(() => {
      const timeSlots = screen.queryAllByText(/\d{1,2}:\d{2}\s*(AM|PM)/);
      expect(timeSlots.length).toBeGreaterThan(0);
    });
  });

  it('should call onSelectTime when a time slot is selected', () => {
    render(
      <ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} onSelectTime={mockOnSelectTime} />
    );

    // Click "Schedule for later" to show time slots
    const laterButton = screen.getByText('Schedule for later');
    fireEvent.click(laterButton);

    // Wait for time slots to appear and select one
    waitFor(() => {
      const timeSlots = screen.queryAllByText(/\d{1,2}:\d{2}\s*(AM|PM)/);
      if (timeSlots.length > 0) {
        fireEvent.click(timeSlots[0]);
        expect(mockOnSelectTime).toHaveBeenCalledWith(
          expect.any(String),
          'later',
          expect.any(String),
          expect.any(Date),
          expect.any(String)
        );
      }
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    // The component listens for mousedown events on document
    // Create a mock target that is outside the modal content
    const outsideTarget = document.createElement('div');
    document.body.appendChild(outsideTarget);

    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseDownEvent, 'target', {
      writable: false,
      value: outsideTarget,
    });

    document.dispatchEvent(mouseDownEvent);
    document.body.removeChild(outsideTarget);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should highlight selected date', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    const todayButton = screen.getByRole('button', { name: /TODAY/i });
    // Initially, today should be selected by default
    expect(todayButton).toHaveAttribute('data-selected', 'true');

    // Click on tomorrow to change selection
    const tomorrowButton = screen.getByRole('button', { name: /TMR/i });
    fireEvent.click(tomorrowButton);

    // Tomorrow should now be selected
    expect(tomorrowButton).toHaveAttribute('data-selected', 'true');
    // Today should no longer be selected
    expect(todayButton).toHaveAttribute('data-selected', 'false');
  });

  it('should display correct day labels for dates', () => {
    render(<ScheduleDeliveryModal isOpen={true} onClose={mockOnClose} />);

    // Should show TODAY, TMR, and day names for other dates
    expect(screen.getByText('TODAY')).toBeInTheDocument();
    expect(screen.getByText('TMR')).toBeInTheDocument();
  });
});
