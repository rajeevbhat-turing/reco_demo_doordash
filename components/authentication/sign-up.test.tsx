import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './sign-up';
import { isValidEmail, isValidName } from '@/lib/utils/helperFunctions';

// Mock dependencies
jest.mock('@/store/user-store', () => ({
  useUserStore: jest.fn((selector?: any) => {
    if (selector) {
      return selector({
        users: [],
      });
    }
    return {
      users: [],
    };
  }),
}));
jest.mock('@/lib/utils/helperFunctions');
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
}));

const mockOnShowOTP = jest.fn();
const mockSetShowCountryDropdown = jest.fn();
const mockSelectedCountry = {
  dial_code: '+1',
  code: 'US',
  name: 'United States',
  emoji: '🇺🇸',
};

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUserStore } = require('@/store/user-store');
    (useUserStore as jest.Mock).mockImplementation((selector?: any) => {
      if (selector) {
        return selector({
          users: [],
        });
      }
      return {
        users: [],
      };
    });
    (isValidEmail as jest.Mock).mockImplementation((email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    });
    (isValidName as jest.Mock).mockImplementation((name: string) => {
      return /^[a-zA-Z0-9\s\-'.,]+$/.test(name) && name.length <= 119;
    });
  });

  it('should render sign up form', () => {
    render(
      <SignUp
        onShowOTP={mockOnShowOTP}
        selectedCountry={mockSelectedCountry}
        setShowCountryDropdown={mockSetShowCountryDropdown}
      />
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  describe('Field Validation', () => {
    describe('First Name', () => {
      it('should show error when first name is empty on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.blur(firstNameInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('First name is required')).toBeInTheDocument();
        });
      });

      it('should show error when first name contains invalid characters', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.change(firstNameInput, { target: { value: 'John@Doe' } });
        fireEvent.blur(firstNameInput);

        await waitFor(() => {
          expect(
            screen.getByText(
              'First name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas'
            )
          ).toBeInTheDocument();
        });
      });

      it('should clear error when user starts typing valid name', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.blur(firstNameInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('First name is required')).toBeInTheDocument();
        });

        fireEvent.change(firstNameInput, { target: { value: 'John' } });

        await waitFor(() => {
          expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
        });
      });
    });

    describe('Last Name', () => {
      it('should show error when last name is empty on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const lastNameInput = screen.getByLabelText(/last name/i);
        fireEvent.blur(lastNameInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('Last name is required')).toBeInTheDocument();
        });
      });

      it('should show error when last name contains invalid characters', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const lastNameInput = screen.getByLabelText(/last name/i);
        fireEvent.change(lastNameInput, { target: { value: 'Doe#123' } });
        fireEvent.blur(lastNameInput);

        await waitFor(() => {
          expect(
            screen.getByText(
              'Last name must only contain letters, numbers, spaces, hyphens, apostrophes, periods, and commas'
            )
          ).toBeInTheDocument();
        });
      });
    });

    describe('Email', () => {
      it('should show error when email is empty on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.blur(emailInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('Email is required')).toBeInTheDocument();
        });
      });

      it('should show error when email format is invalid on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
        });
      });

      it('should clear error when user enters valid email', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
        });

        fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

        await waitFor(() => {
          expect(screen.queryByText('Email format is invalid')).not.toBeInTheDocument();
        });
      });
    });

    describe('Phone Number', () => {
      it('should show error when phone number is empty', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        // First enter a valid value
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        // Then clear it
        fireEvent.change(phoneInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        });
      });

      it('should show error when phone number contains non-numeric characters', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        fireEvent.change(phoneInput, { target: { value: '123abc456' } });

        await waitFor(() => {
          expect(screen.getByText('Phone number is required')).toBeInTheDocument();
        });
      });

      it('should show error when phone number is too short (7 digits)', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        fireEvent.change(phoneInput, { target: { value: '1234567' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
          expect(screen.getByText('Phone number is invalid')).toBeInTheDocument();
        });
      });

      it('should show error when phone number is too long (12 digits)', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        fireEvent.change(phoneInput, { target: { value: '123456789012' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
          expect(screen.getByText('Phone number is invalid')).toBeInTheDocument();
        });
      });

      it('should accept valid phone number length of 8 digits', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        fireEvent.change(phoneInput, { target: { value: '12345678' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
          expect(screen.queryByText('Phone number is invalid')).not.toBeInTheDocument();
          expect(screen.queryByText('Phone number is required')).not.toBeInTheDocument();
        });
      });

      it('should accept valid phone number length of 10 digits', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const phoneInput = screen.getByLabelText(/mobile number/i);
        fireEvent.change(phoneInput, { target: { value: '1234567890' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
          expect(screen.queryByText('Phone number is invalid')).not.toBeInTheDocument();
          expect(screen.queryByText('Phone number is required')).not.toBeInTheDocument();
        });
      });
    });

    describe('Password', () => {
      it('should show error when password is empty on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.blur(passwordInput, { target: { value: '' } });

        await waitFor(() => {
          expect(screen.getByText('Password is required')).toBeInTheDocument();
        });
      });

      it('should show error when password is too short on blur', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
          expect(
            screen.getByText('Password must contain at least 10 characters')
          ).toBeInTheDocument();
        });
      });

      it('should accept password with exactly 10 characters', async () => {
        render(
          <SignUp
            onShowOTP={mockOnShowOTP}
            selectedCountry={mockSelectedCountry}
            setShowCountryDropdown={mockSetShowCountryDropdown}
          />
        );

        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: '1234567890' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
          expect(
            screen.queryByText('Password must contain at least 10 characters')
          ).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission when form is invalid', async () => {
      render(
        <SignUp
          onShowOTP={mockOnShowOTP}
          selectedCountry={mockSelectedCountry}
          setShowCountryDropdown={mockSetShowCountryDropdown}
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnShowOTP).not.toHaveBeenCalled();
      });
    });

    it('should call onShowOTP when form is valid', async () => {
      render(
        <SignUp
          onShowOTP={mockOnShowOTP}
          selectedCountry={mockSelectedCountry}
          setShowCountryDropdown={mockSetShowCountryDropdown}
        />
      );

      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mobile number/i), {
        target: { value: '1234567890' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnShowOTP).toHaveBeenCalled();
      });
    });

    it('should show error when email already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'existing@example.com',
        phoneNumber: '+11234567890',
      };
      const { useUserStore } = require('@/store/user-store');
      (useUserStore as jest.Mock).mockImplementation((selector?: any) => {
        if (selector) {
          return selector({
            users: [existingUser],
          });
        }
        return {
          users: [existingUser],
        };
      });

      render(
        <SignUp
          onShowOTP={mockOnShowOTP}
          selectedCountry={mockSelectedCountry}
          setShowCountryDropdown={mockSetShowCountryDropdown}
        />
      );

      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mobile number/i), {
        target: { value: '1234567890' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'The email address you entered is already associated with an account. Sign in to your account or enter a different email to create a new account.'
          )
        ).toBeInTheDocument();
        expect(mockOnShowOTP).not.toHaveBeenCalled();
      });
    });

    it('should show error when phone number already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'different@example.com',
        phoneNumber: '+11234567890',
      };
      const { useUserStore } = require('@/store/user-store');
      (useUserStore as jest.Mock).mockImplementation((selector?: any) => {
        if (selector) {
          return selector({
            users: [existingUser],
          });
        }
        return {
          users: [existingUser],
        };
      });

      render(
        <SignUp
          onShowOTP={mockOnShowOTP}
          selectedCountry={mockSelectedCountry}
          setShowCountryDropdown={mockSetShowCountryDropdown}
        />
      );

      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/mobile number/i), {
        target: { value: '1234567890' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'The phone number you entered is already associated with an account. Sign in to your account or enter a different phone number to create a new account.'
          )
        ).toBeInTheDocument();
        expect(mockOnShowOTP).not.toHaveBeenCalled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      render(
        <SignUp
          onShowOTP={mockOnShowOTP}
          selectedCountry={mockSelectedCountry}
          setShowCountryDropdown={mockSetShowCountryDropdown}
        />
      );

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = screen.getByText(/show/i);

      expect(passwordInput.type).toBe('password');

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(passwordInput.type).toBe('text');
        expect(screen.getByText(/hide/i)).toBeInTheDocument();
      });
    });
  });
});
