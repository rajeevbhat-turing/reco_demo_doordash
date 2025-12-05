import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsMobile } from '@/lib/hooks/use-mobile';

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = vi.fn();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('should return true when window width is less than 768px', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const mockMatchMedia = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(mockMatchMedia);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false when window width is greater than or equal to 768px', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const mockMatchMedia = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(mockMatchMedia);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should update when window width changes', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    let storedListener: (() => void) | undefined;
    const mockMatchMedia = {
      matches: false,
      addEventListener: vi.fn((event, listener) => {
        storedListener = listener as () => void;
      }),
      removeEventListener: vi.fn(),
    };
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(mockMatchMedia);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Simulate window resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Trigger the change event
    if (storedListener) {
      storedListener();
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should clean up event listener on unmount', () => {
    const mockMatchMedia = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(mockMatchMedia);

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mockMatchMedia.removeEventListener).toHaveBeenCalled();
  });
});
