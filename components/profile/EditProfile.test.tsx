import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfile from './EditProfile';
import { useUserStore } from '@/store/user-store';
import { generateAvatarColor, isValidName } from '@/lib/utils/helperFunctions';
import { User } from '@/lib/types/user-types';

// Mock dependencies
vi.mock('@/store/user-store');
vi.mock('@/lib/utils/helperFunctions');

const mockUpdateUser = vi.fn();
const mockOnCancel = vi.fn();

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '1234567890',
  password: 'password123',
  country: {
    dialCode: '+1',
    code: 'US',
    name: 'United States',
  },
  userCountry: 'United States',
  avatar: null,
  is_restricted: false,
  reviews: [],
  paymentMethods: [],
  addresses: [],
};

describe('EditProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentUser: mockUser,
      updateUser: mockUpdateUser,
    });
    (generateAvatarColor as ReturnType<typeof vi.fn>).mockReturnValue('#f44336');
    (isValidName as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
      return /^[a-zA-Z0-9\s\-'.,]+$/.test(name) && name.length <= 119;
    });
  });

  describe('Rendering', () => {
    it('should render edit profile form when user is logged in', () => {
      render(<EditProfile />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByText(/restricted profile/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should not render when user is not logged in', () => {
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: null,
        updateUser: mockUpdateUser,
      });

      const { container } = render(<EditProfile />);
      expect(container.firstChild).toBeNull();
    });

    it('should display user avatar with initials', () => {
      render(<EditProfile />);

      const avatar = screen.getByText('JD');
      expect(avatar).toBeInTheDocument();
      expect(generateAvatarColor).toHaveBeenCalledWith('John Doe');
    });

    it('should display current user name in input fields', () => {
      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
    });

    it('should display restricted profile toggle', () => {
      render(<EditProfile />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).not.toBeChecked();
    });
  });

  describe('Name Input Fields', () => {
    it('should update first name when user types', () => {
      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      expect(firstNameInput.value).toBe('Jane');
    });

    it('should update last name when user types', () => {
      render(<EditProfile />);

      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

      expect(lastNameInput.value).toBe('Smith');
    });

    it('should split full name correctly when user has only first name', () => {
      const userWithOnlyFirstName: User = {
        ...mockUser,
        name: 'John',
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: userWithOnlyFirstName,
        updateUser: mockUpdateUser,
      });

      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('');
    });

    it('should handle user with firstName and lastName properties', () => {
      const userWithSeparateNames: User = {
        ...mockUser,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
      } as User;
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: userWithSeparateNames,
        updateUser: mockUpdateUser,
      });

      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
    });
  });

  describe('Restricted Profile Toggle', () => {
    it('should toggle restricted status when switch is clicked', () => {
      render(<EditProfile />);

      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();

      fireEvent.click(toggle);

      expect(toggle).toBeChecked();
    });

    it('should display current restricted status from user', () => {
      const restrictedUser: User = {
        ...mockUser,
        is_restricted: true,
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: restrictedUser,
        updateUser: mockUpdateUser,
      });

      render(<EditProfile />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
    });
  });

  describe('Cancel Functionality', () => {
    it('should reset form to original values when cancel is clicked', () => {
      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

      // Change values
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Values should be reset
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
    });

    it('should call onCancel callback when provided', () => {
      render(<EditProfile onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel if not provided', () => {
      render(<EditProfile />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Should not throw error
      expect(cancelButton).toBeInTheDocument();
    });

    it('should reset restricted status when cancel is clicked', () => {
      render(<EditProfile />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(toggle).not.toBeChecked();
    });
  });

  describe('Save Functionality', () => {
    it('should call updateUser when save is clicked with valid changes', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('1', {
          name: 'Jane Doe',
          is_restricted: false,
          firstName: 'Jane',
          lastName: 'Doe',
        });
      });
    });

    it('should call onCancel after successful save', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    it('should not call updateUser if nothing changed', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).not.toHaveBeenCalled();
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    it('should update user when only restricted status changes', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('1', {
          name: 'John Doe',
          is_restricted: true,
          firstName: 'John',
          lastName: 'Doe',
        });
      });
    });

    it('should show saving state while saving', async () => {
      mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(screen.getByRole('button', { name: /saving.../i })).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockUpdateUser.mockRejectedValue(new Error('Save failed'));

      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving profile:', expect.any(Error));
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Name Validation and Preprocessing', () => {
    it('should remove special characters from names before saving', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'John@Doe#123' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('1', {
          name: 'JohnDoe123 Doe',
          is_restricted: false,
          firstName: 'JohnDoe123',
          lastName: 'Doe',
        });
      });
    });

    it('should use original name if processed name is invalid', async () => {
      // Create a name that after preprocessing (removing special chars) is still invalid
      // We'll use a name that's too long (>119 chars) after preprocessing
      const longInvalidName = 'A'.repeat(120); // 120 characters - invalid
      (isValidName as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
        return /^[a-zA-Z0-9\s\-'.,]+$/.test(name) && name.length <= 119;
      });
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: longInvalidName } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        // After preprocessing, the name is still too long, so isValidName returns false
        // Component should use originalFirstName instead
        // Since original name equals currentUser.name, updateUser won't be called
        // But onCancel should still be called
        expect(mockOnCancel).toHaveBeenCalled();
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });
    });

    it('should use original name if final name is empty', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;

      // Clear both names
      fireEvent.change(firstNameInput, { target: { value: '' } });
      fireEvent.change(lastNameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        // When final name is empty, it uses original name
        // Since original name equals currentUser.name, updateUser won't be called
        // But onCancel should still be called
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    it('should trim whitespace from names', async () => {
      mockUpdateUser.mockResolvedValue(undefined);

      render(<EditProfile onCancel={mockOnCancel} />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: '  Jane  ' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('1', {
          name: 'Jane Doe',
          is_restricted: false,
          firstName: 'Jane',
          lastName: 'Doe',
        });
      });
    });
  });

  describe('User Updates', () => {
    it('should update form when currentUser changes', () => {
      const { rerender } = render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      expect(firstNameInput.value).toBe('John');

      const updatedUser: User = {
        ...mockUser,
        name: 'Jane Smith',
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: updatedUser,
        updateUser: mockUpdateUser,
      });

      rerender(<EditProfile />);

      expect(firstNameInput.value).toBe('Jane');
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
      expect(lastNameInput.value).toBe('Smith');
    });

    it('should update restricted status when currentUser changes', () => {
      const { rerender } = render(<EditProfile />);

      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();

      const restrictedUser: User = {
        ...mockUser,
        is_restricted: true,
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: restrictedUser,
        updateUser: mockUpdateUser,
      });

      rerender(<EditProfile />);

      expect(toggle).toBeChecked();
    });
  });

  describe('Avatar Initials', () => {
    it('should generate correct initials from full name', () => {
      render(<EditProfile />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle single name correctly', () => {
      const singleNameUser: User = {
        ...mockUser,
        name: 'John',
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: singleNameUser,
        updateUser: mockUpdateUser,
      });

      render(<EditProfile />);

      // Single name "John" -> first letter only "J"
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should handle multiple word names correctly', () => {
      const multiWordUser: User = {
        ...mockUser,
        name: 'John Michael Doe',
      };
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: multiWordUser,
        updateUser: mockUpdateUser,
      });

      render(<EditProfile />);

      expect(screen.getByText('JM')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should disable buttons while saving', async () => {
      mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<EditProfile />);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });
});
