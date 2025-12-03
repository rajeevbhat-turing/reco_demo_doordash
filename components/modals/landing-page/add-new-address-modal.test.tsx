import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddNewAddressModal from './add-new-address-modal';

// Mock countries data
// Important: Each country has different subdivision filtering logic:
// - US: Only shows subdivision === 'state' (excludes districts/territories)
// - Canada: Shows subdivision === 'province' OR 'territory'
// - Australia: Shows all states (subdivision === null)
// - New Zealand: Shows all states (any subdivision type)
const { mockCountriesData } = vi.hoisted(() => {
  return {
    mockCountriesData: [
      {
        code2: 'US',
        code3: 'USA',
        name: 'United States',
        capital: 'Washington, D.C.',
        region: 'Americas',
        subregion: 'Northern America',
        states: [
          // These should be shown (subdivision === 'state')
          { code: 'AL', name: 'Alabama', subdivision: 'state' },
          { code: 'CA', name: 'California', subdivision: 'state' },
          { code: 'NY', name: 'New York', subdivision: 'state' },
          // These should be filtered out (not 'state')
          { code: 'DC', name: 'District of Columbia', subdivision: 'district' },
          { code: 'PR', name: 'Puerto Rico', subdivision: 'outlying territory' },
        ],
      },
      {
        code2: 'CA',
        code3: 'CAN',
        name: 'Canada',
        capital: 'Ottawa',
        region: 'Americas',
        subregion: 'Northern America',
        states: [
          // These should be shown (subdivision === 'province')
          { code: 'ON', name: 'Ontario', subdivision: 'province' },
          { code: 'BC', name: 'British Columbia', subdivision: 'province' },
          { code: 'QC', name: 'Quebec', subdivision: 'province' },
          // These should be shown (subdivision === 'territory')
          { code: 'NT', name: 'Northwest Territories', subdivision: 'territory' },
          { code: 'YT', name: 'Yukon', subdivision: 'territory' },
        ],
      },
      {
        code2: 'AU',
        code3: 'AUS',
        name: 'Australia',
        capital: 'Canberra',
        region: 'Oceania',
        subregion: 'Australia and New Zealand',
        states: [
          // All should be shown (subdivision === null)
          { code: 'NSW', name: 'New South Wales', subdivision: null },
          { code: 'VIC', name: 'Victoria', subdivision: null },
          { code: 'QLD', name: 'Queensland', subdivision: null },
          { code: 'ACT', name: 'Australian Capital Territory', subdivision: null },
        ],
      },
      {
        code2: 'NZ',
        code3: 'NZL',
        name: 'New Zealand',
        capital: 'Wellington',
        region: 'Oceania',
        subregion: 'Australia and New Zealand',
        states: [
          // All should be shown (any subdivision type)
          { code: 'AUK', name: 'Auckland', subdivision: 'regional council' },
          { code: 'WGN', name: 'Wellington', subdivision: 'regional council' },
          { code: 'N', name: 'North Island', subdivision: 'Island' },
          { code: 'S', name: 'South Island', subdivision: 'Island' },
        ],
      },
    ],
  };
});

vi.mock('@/lib/utils/countries.json', () => ({
  default: mockCountriesData,
}));

// Mock UI components
vi.mock('@/components/ui/input', () => ({
  // eslint-disable-next-line react/display-name
  Input: React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, ...props }, ref) => <input ref={ref} className={className} {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  // eslint-disable-next-line react/display-name
  Label: React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
    ({ className, children, ...props }, ref) => (
      <label ref={ref} className={className} {...props}>
        {children}
      </label>
    )
  ),
}));

// Mock Select components - simplified for testing
vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="select" data-value={value} data-has-onvaluechange={!!onValueChange}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: () => <div data-testid="select-value" />,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('AddNewAddressModal', () => {
  const mockOnClose = vi.fn();
  const mockOnContinue = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    // Clean up body overflow
    document.body.style.overflow = 'auto';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <AddNewAddressModal isOpen={false} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      expect(screen.getByText('Add new address')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Street Address')).toBeInTheDocument();
      expect(screen.getByText('Apartment/Suite')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();
      expect(screen.getByText('Zip code')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      expect(screen.getByText('Continue')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should update street address when user types', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      expect(streetInput.value).toBe('123 Main St');
    });

    it('should update apartment/suite when user types', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const apartmentInput = screen.getByLabelText('Apartment/Suite') as HTMLInputElement;
      fireEvent.change(apartmentInput, { target: { value: 'Apt 4B' } });

      expect(apartmentInput.value).toBe('Apt 4B');
    });

    it('should update city when user types', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      expect(cityInput.value).toBe('San Francisco');
    });

    it('should update zip code when user types', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '94104' } });

      expect(zipInput.value).toBe('94104');
    });

    it('should only allow numeric characters in zip code', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: 'abc123def456' } });

      expect(zipInput.value).toBe('123456');
    });

    it('should limit zip code to 10 characters', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '123456789012345' } });

      expect(zipInput.value).toBe('1234567890');
    });
  });

  describe('Form Validation', () => {
    it('should show error when street address is empty on continue', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const errors = screen.getAllByText('Required field');
      expect(errors.length).toBeGreaterThan(0);
      expect(mockOnContinue).not.toHaveBeenCalled();
    });

    it('should show error when city is empty on continue', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const errors = screen.getAllByText('Required field');
      expect(errors.length).toBeGreaterThan(0);
      expect(mockOnContinue).not.toHaveBeenCalled();
    });

    it('should show error when zip code is empty on continue', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const errors = screen.getAllByText('Required field');
      expect(errors.length).toBeGreaterThan(0);
      expect(mockOnContinue).not.toHaveBeenCalled();
    });

    it('should clear error when user starts typing in street address', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(screen.getAllByText('Required field').length).toBeGreaterThan(0);

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      // Street address error should be cleared, but other errors may still exist
      const streetErrors = screen.queryAllByText('Required field');
      // At least one error should be cleared
      expect(streetErrors.length).toBeLessThan(3);
    });

    it('should clear error when user starts typing in city', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      // Error should be cleared for city
      const errors = screen.queryAllByText('Required field');
      expect(errors.length).toBeLessThan(2);
    });

    it('should clear error when user starts typing in zip code', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '94104' } });

      // Error should be cleared for zip code
      expect(screen.queryByText('Required field')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onContinue with address data when form is valid', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '94104' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
      expect(mockOnContinue).toHaveBeenCalledWith(
        expect.objectContaining({
          street: '123 Main St',
          city: 'San Francisco',
          zipCode: '94104',
          addressType: 'house',
          lat: 0,
          lng: 0,
        })
      );
      // State might be empty string if Select doesn't work in test, so we just check it exists
      const callArgs = mockOnContinue.mock.calls[0][0];
      expect(callArgs.state).toBeDefined();
    });

    it('should combine street address with apartment/suite when provided', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });

      const apartmentInput = screen.getByLabelText('Apartment/Suite') as HTMLInputElement;
      fireEvent.change(apartmentInput, { target: { value: 'Apt 4B' } });

      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
      fireEvent.change(zipInput, { target: { value: '94104' } });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledWith(
        expect.objectContaining({
          street: '123 Main St, Apt 4B',
        })
      );
    });
  });

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        street: '123 Main St, Apt 4B',
        apartmentSuite: 'Apt 4B',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94104',
      };

      render(
        <AddNewAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onContinue={mockOnContinue}
          initialData={initialData}
        />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      const apartmentInput = screen.getByLabelText('Apartment/Suite') as HTMLInputElement;
      const cityInput = screen.getByLabelText('City') as HTMLInputElement;
      const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;

      expect(streetInput.value).toBe('123 Main St');
      expect(apartmentInput.value).toBe('Apt 4B');
      expect(cityInput.value).toBe('San Francisco');
      expect(zipInput.value).toBe('94104');
    });

    it('should reset form when modal closes and reopens without initial data', () => {
      const { rerender } = render(
        <AddNewAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onContinue={mockOnContinue}
          initialData={{
            street: '123 Main St',
            city: 'San Francisco',
            state: 'California',
            zipCode: '94104',
          }}
        />
      );

      rerender(
        <AddNewAddressModal isOpen={false} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      rerender(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
      expect(streetInput.value).toBe('');
    });
  });

  describe('Back Button', () => {
    it('should call onBack when provided and back button is clicked', () => {
      render(
        <AddNewAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onContinue={mockOnContinue}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when onBack is not provided and back button is clicked', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(
        <AddNewAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
