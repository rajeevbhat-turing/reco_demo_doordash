import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantById } from '@/lib/api/restaurants';
import { useUserStore } from '@/store/user-store';

export function useRestaurant(restaurantId: string | undefined) {
  const currentAddress = useUserStore((state) => {
    const user = state.currentUser;
    if (user?.addresses && user.addresses.length > 0) {
      return user.addresses.find((addr) => addr.default) || user.addresses[0];
    }
    return state.getTempAddress();
  });

  const lat = currentAddress?.lat;
  const lng = currentAddress?.lng;

  return useQuery({
    queryKey: ['restaurant', restaurantId, lat, lng],
    queryFn: () => fetchRestaurantById(restaurantId!, lat, lng),
    enabled: !!restaurantId, // Only fetch if restaurant ID is provided
    staleTime: 1000 * 60 * 10, // 10 minutes (longer than restaurants list)
  });
}

