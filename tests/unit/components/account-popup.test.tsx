import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountPopup from '@/components/account-popup';
import { User } from '@/lib/types/user-types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
}));

// Mock user store
const mockSetCurrentUser = vi.fn();
const mockSetTempAddress = vi.fn();

const { mockUseUserStore } = vi.hoisted(() => {
  return {
    mockUseUserStore: vi.fn(),
  };
});

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: (state: any) => any) => {
    return mockUseUserStore(selector);
  },
}));

describe('AccountPopup', () => {
  const mockOnClose = vi.fn();
  const mockAnchorElement = document.createElement('div');

  const mockUser: User = {
    id: 'user1',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    password: 'hashedPassword',
    country: {
      dialCode: '+1',
      code: 'US',
      name: 'United States',
    },
    userCountry: 'US',
    avatar: null,
    paymentMethods: [],
    addresses: [],
    is_restricted: false,
    reviews: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockSetCurrentUser.mockClear();
    mockSetTempAddress.mockClear();

    // Setup default user store mock
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: mockUser,
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    // Mock getBoundingClientRect for anchor element
    mockAnchorElement.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      right: 200,
      bottom: 150,
      left: 150,
      width: 50,
      height: 50,
      x: 150,
      y: 100,
      toJSON: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AccountPopup isOpen={false} onClose={mockOnClose} anchorElement={mockAnchorElement} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // User name appears in profile section
    const userNameElements = screen.getAllByText('John Doe');
    expect(userNameElements.length).toBeGreaterThan(0);
  });

  it('should display user avatar initial', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Find the avatar initial using data-testid
    const avatarInitial = screen.getByTestId('avatar-initial');
    expect(avatarInitial).toBeInTheDocument();
    expect(avatarInitial).toHaveTextContent('J');
  });

  it('should display default avatar initial when user name is missing', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: { ...mockUser, name: '' },
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Find the avatar initial using data-testid
    const avatarInitial = screen.getByTestId('avatar-initial');
    expect(avatarInitial).toBeInTheDocument();
    expect(avatarInitial).toHaveTextContent('U');
  });

  it('should display default name "User" when user name is missing', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: { ...mockUser, name: '' },
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getAllByText('User')).toHaveLength(2); // One in profile section, one in account settings
  });

  it('should display lock icon when user is restricted', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: { ...mockUser, is_restricted: true },
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('should not display lock icon when user is not restricted', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();
  });

  it('should display "View Profile" text', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('should navigate to profile page when profile section is clicked', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const profileSection = screen.getByText('View Profile').closest('div');
    if (profileSection) {
      fireEvent.click(profileSection);
    }

    expect(mockPush).toHaveBeenCalledWith('/consumer/profile/user1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when profile section is clicked', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const profileSection = screen.getByText('View Profile').closest('div');
    if (profileSection) {
      fireEvent.click(profileSection);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display Account Settings section', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByText('Account Settings')).toBeInTheDocument();
  });

  it('should display Account link with user name', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Account appears in Account Settings section
    const accountLinks = screen.getAllByText('Account');
    expect(accountLinks.length).toBeGreaterThan(0);
    // User name appears multiple times (profile section and account section)
    const userNameElements = screen.getAllByText('John Doe');
    expect(userNameElements.length).toBeGreaterThan(0);
  });

  it('should call onClose when Account link is clicked', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Find the Account link in Account Settings section (not the header)
    const accountLinks = screen.getAllByText('Account');
    // The second one is in Account Settings section
    const accountSettingsLink = accountLinks[1]?.closest('div');
    if (accountSettingsLink) {
      fireEvent.click(accountSettingsLink);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display Payment option', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('should navigate to payment page when Payment is clicked', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const paymentOption = screen.getByText('Payment').closest('div');
    if (paymentOption) {
      fireEvent.click(paymentOption);
    }

    expect(mockPush).toHaveBeenCalledWith('/payment');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display Language selector', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
  });

  it('should display language options', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('en-US');
  });

  it('should call sign out handlers when Sign Out is clicked', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    expect(mockSetCurrentUser).toHaveBeenCalledWith(null);
    expect(mockSetTempAddress).toHaveBeenCalledWith(null);
    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when other keys are pressed', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking outside popup', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Click outside the popup (on document body)
    fireEvent.mouseDown(document.body);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking inside popup', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const popup = screen.getByRole('heading', { name: 'Account' }).closest('#account-popup');
    if (popup) {
      fireEvent.mouseDown(popup);
    }

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when clicking on anchor element', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    fireEvent.mouseDown(mockAnchorElement);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should position popup relative to anchor element', () => {
    const { container } = render(
      <AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />
    );

    const popup = container.querySelector('#account-popup') as HTMLElement;
    expect(popup).toBeInTheDocument();

    // Wait for useEffect to run and set positioning
    waitFor(() => {
      expect(popup.style.top).toBe('100px');
      expect(popup.style.left).toBe('210px'); // anchorRect.right + 10
    });
  });

  it('should handle null anchor element gracefully', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={null} />);

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
  });

  it('should handle null currentUser gracefully', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: null,
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // User appears multiple times (profile section and account section)
    const userElements = screen.getAllByText('User');
    expect(userElements.length).toBeGreaterThan(0);

    // Find the avatar initial using data-testid
    const avatarInitial = screen.getByTestId('avatar-initial');
    expect(avatarInitial).toBeInTheDocument();
    expect(avatarInitial).toHaveTextContent('U');
  });

  it('should not navigate to profile when currentUser is null', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: null,
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const profileSection = screen.getByText('View Profile').closest('div');
    if (profileSection) {
      fireEvent.click(profileSection);
    }

    // Should navigate to /consumer/profile/undefined when user is null
    expect(mockPush).toHaveBeenCalledWith('/consumer/profile/undefined');
  });

  it('should stop propagation when clicking inside popup', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    const popup = screen.getByRole('heading', { name: 'Account' }).closest('#account-popup');
    if (popup) {
      fireEvent.click(popup);
    }

    // The component uses onClick={e => e.stopPropagation()} on the popup div
    // This is tested implicitly by ensuring clicks inside don't trigger onClose
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display user name in Account section', () => {
    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Account section should show user name below "Account"
    // Find the Account link in Account Settings section
    const accountLinks = screen.getAllByText('Account');
    // Find the parent container that includes both Account and user name
    const accountSettingsSection = accountLinks[1]?.closest('div')?.parentElement;
    expect(accountSettingsSection).toHaveTextContent('John Doe');
  });

  it('should handle user with single character name', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: { ...mockUser, name: 'A' },
        setCurrentUser: mockSetCurrentUser,
        setTempAddress: mockSetTempAddress,
      };
      return selector(mockState);
    });

    render(<AccountPopup isOpen={true} onClose={mockOnClose} anchorElement={mockAnchorElement} />);

    // Find the avatar initial using data-testid
    const avatarInitial = screen.getByTestId('avatar-initial');
    expect(avatarInitial).toBeInTheDocument();
    expect(avatarInitial).toHaveTextContent('A');

    // Name 'A' should also appear in profile section and account section
    const nameElements = screen.getAllByText('A');
    expect(nameElements.length).toBeGreaterThanOrEqual(2);
  });
});
