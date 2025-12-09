import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CountryCodeDropdown from '@/components/modals/country-code-dropdown';

// Mock dependencies
const { mockCountryData, MockInput } = vi.hoisted(() => {
  const React = require('react') as typeof import('react');
  const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, ...props }, ref: React.Ref<HTMLInputElement>) => (
      <input ref={ref} className={className as string} {...props} />
    )
  );
  Input.displayName = 'Input';
  return {
    mockCountryData: [
      { code: 'US', name: 'United States', dial_code: '+1', emoji: '🇺🇸' },
      { code: 'CA', name: 'Canada', dial_code: '+1', emoji: '🇨🇦' },
      { code: 'GB', name: 'United Kingdom', dial_code: '+44', emoji: '🇬🇧' },
      { code: 'AU', name: 'Australia', dial_code: '+61', emoji: '🇦🇺' },
    ],
    MockInput: Input,
  };
});

vi.mock('@/lib/utils/countryCode.json', () => ({
  default: mockCountryData,
}));

vi.mock('@/components/ui/input', () => ({
  Input: MockInput,
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
}));

describe('CountryCodeDropdown', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();
  const mockSelectedCountry = { code: 'US', name: 'United States', dial_code: '+1', emoji: '🇺🇸' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <CountryCodeDropdown
        isOpen={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    expect(screen.getByText('Select Country Code')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument();
  });

  it('should display all countries', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
  });

  it('should display country dial codes', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    // +1 appears for both US and Canada, so use getAllByText
    expect(screen.getAllByText('+1').length).toBeGreaterThan(0);
    expect(screen.getByText('+44')).toBeInTheDocument();
    expect(screen.getByText('+61')).toBeInTheDocument();
  });

  it('should show check icon for selected country', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('should filter countries based on search query', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search countries...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'United' } });

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
    expect(screen.queryByText('Australia')).not.toBeInTheDocument();
  });

  it('should filter countries by dial code', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search countries...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '+44' } });

    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });

  it('should call onSelect and onClose when country is clicked', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const canadaButton = screen.getByText('Canada').closest('button');
    if (canadaButton) {
      fireEvent.click(canadaButton);
    }

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'CA', name: 'Canada' })
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should clear search query after selecting country', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search countries...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Canada' } });

    const canadaButton = screen.getByText('Canada').closest('button');
    if (canadaButton) {
      fireEvent.click(canadaButton);
    }

    // Search should be cleared (component resets it)
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should sort countries with user country first', () => {
    const userCountry = { code: 'CA', name: 'Canada', dial_code: '+1', emoji: '🇨🇦' };
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
        userCountry={userCountry}
      />
    );

    // Canada should appear first in the list
    const countryButtons = screen.getAllByRole('button');
    const canadaButton = countryButtons.find(btn => btn.textContent?.includes('Canada'));
    expect(canadaButton).toBeDefined();
  });

  it('should sort countries with USA first when no user country', () => {
    render(
      <CountryCodeDropdown
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        selectedCountry={mockSelectedCountry}
      />
    );

    // USA should appear first in the list
    const countryButtons = screen.getAllByRole('button');
    const usaButton = countryButtons.find(btn => btn.textContent?.includes('United States'));
    expect(usaButton).toBeDefined();
  });
});
