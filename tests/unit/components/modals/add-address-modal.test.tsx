import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddAddressModal from '@/components/modals/add-address-modal';

// Mock countries data
const { mockCountriesData } = vi.hoisted(() => {
  return {
    mockCountriesData: [
      {
        code2: 'US',
        code3: 'USA',
        name: 'United States',
        states: [
          { code: 'AL', name: 'Alabama', subdivision: 'state' },
          { code: 'CA', name: 'California', subdivision: 'state' },
        ],
      },
      {
        code2: 'CA',
        code3: 'CAN',
        name: 'Canada',
        states: [
          { code: 'ON', name: 'Ontario', subdivision: 'province' },
          { code: 'BC', name: 'British Columbia', subdivision: 'province' },
        ],
      },
      {
        code2: 'AU',
        code3: 'AUS',
        name: 'Australia',
        states: [
          { code: 'NSW', name: 'New South Wales', subdivision: null },
          { code: 'VIC', name: 'Victoria', subdivision: null },
        ],
      },
      {
        code2: 'NZ',
        code3: 'NZL',
        name: 'New Zealand',
        states: [{ code: 'AUK', name: 'Auckland', subdivision: 'regional council' }],
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
    <div data-testid="select" data-value={value}>
      {children}
      <button data-testid="select-change" onClick={() => onValueChange && onValueChange('Canada')}>
        Change
      </button>
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

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('AddAddressModal', () => {
  const mockOnClose = vi.fn();
  const mockOnContinue = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddAddressModal isOpen={false} onClose={mockOnClose} onContinue={mockOnContinue} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    expect(screen.getByText('Add new address')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Street Address')).toBeInTheDocument();
    expect(screen.getByText('Apartment/Suite')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Zip code')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();
  });

  it('should update street address when user types', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });

    expect(streetInput.value).toBe('123 Main St');
  });

  it('should update apartment/suite when user types', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const apartmentInput = screen.getByLabelText('Apartment/Suite') as HTMLInputElement;
    fireEvent.change(apartmentInput, { target: { value: 'Apt 4B' } });

    expect(apartmentInput.value).toBe('Apt 4B');
  });

  it('should update city when user types', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const cityInput = screen.getByLabelText('City') as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

    expect(cityInput.value).toBe('San Francisco');
  });

  it('should update zip code when user types', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: '94104' } });

    expect(zipInput.value).toBe('94104');
  });

  it('should only allow numeric characters in zip code', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: 'abc123def456' } });

    expect(zipInput.value).toBe('123456');
  });

  it('should limit zip code to 10 characters', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: '123456789012345' } });

    expect(zipInput.value).toBe('1234567890');
  });

  it('should show error when street address is empty on continue', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    const errors = screen.getAllByText('Required field');
    expect(errors.length).toBeGreaterThan(0);
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('should show error when city is empty on continue', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    const errors = screen.getAllByText('Required field');
    expect(errors.length).toBeGreaterThan(0);
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('should show error when zip code is empty on continue', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    const cityInput = screen.getByLabelText('City') as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('should clear error when user starts typing in street address', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    const errorsBefore = screen.getAllByText('Required field');
    expect(errorsBefore.length).toBeGreaterThan(0);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });

    // Street address error should be cleared, but city and zip errors may still exist
    // Check that at least one error is cleared (errors count should decrease)
    const errorsAfter = screen.queryAllByText('Required field');
    // After typing in street, street error should be cleared
    expect(errorsAfter.length).toBeLessThan(errorsBefore.length);
  });

  it('should call onContinue with address data when form is valid', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    const cityInput = screen.getByLabelText('City') as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });
    const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: '94104' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledWith({
      street: '123 Main St',
      city: 'San Francisco',
      state: 'Alabama',
      zipCode: '94104',
      addressType: 'house',
      lat: 0,
      lng: 0,
    });
  });

  it('should combine street address with apartment/suite when provided', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const streetInput = screen.getByLabelText('Street Address') as HTMLInputElement;
    fireEvent.change(streetInput, { target: { value: '123 Main St' } });
    const apartmentInput = screen.getByLabelText('Apartment/Suite') as HTMLInputElement;
    fireEvent.change(apartmentInput, { target: { value: 'Apt 4B' } });
    const cityInput = screen.getByLabelText('City') as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } });
    const zipInput = screen.getByLabelText('Zip code') as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: '94104' } });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledWith({
      street: '123 Main St, Apt 4B',
      city: 'San Francisco',
      state: 'Alabama',
      zipCode: '94104',
      addressType: 'house',
      lat: 0,
      lng: 0,
    });
  });

  it('should initialize form with initialData when provided', () => {
    const initialData = {
      street: '123 Main St, Apt 4B',
      apartmentSuite: 'Apt 4B',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94104',
    };

    render(
      <AddAddressModal
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

  it('should call onClose when close button is clicked', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onBack when Back button is clicked and onBack is provided', () => {
    render(
      <AddAddressModal
        isOpen={true}
        onClose={mockOnClose}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Back button is clicked and onBack is not provided', () => {
    render(<AddAddressModal isOpen={true} onClose={mockOnClose} onContinue={mockOnContinue} />);

    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
