import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateDeliveryTime, parseDistance } from '@/lib/utils/restaurant-utils';

interface NearbyStore {
  id: string;
  name: string;
  rating: string;
  numRatings: string;
  distance: string;
  time: string;
  image: string;
  discount?: string;
  isDashPass?: boolean;
}

interface FastestNearYouProps {
  stores?: NearbyStore[];
}

// Default data (fallback)
const defaultStores: NearbyStore[] = [
  {
    id: '1',
    name: 'Geary Wine & Spirits',
    rating: '4.5',
    numRatings: '(20+)',
    distance: '0.7 mi',
    time: '26 min',
    image:
      'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/store/header/6cfa729f-7914-4b44-b141-4ef82b229828.9',
    isDashPass: true,
  },
  {
    id: '2',
    name: "Mollie Stone's Markets",
    rating: '4.6',
    numRatings: '200+',
    distance: '1.9 mi',
    time: '35 min',
    image:
      'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png',
    discount: '25% off, up to $15',
  },
  {
    id: '3',
    name: 'Marina Supermarket',
    rating: '4.5',
    numRatings: '200+',
    distance: '2.3 mi',
    time: '40 min',
    image:
      'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/store/cover/e8bb850f-6082-4f12-b6eb-3da45a5ffe80.jpg',
  },
];

export default function FastestNearYou({ stores = defaultStores }: FastestNearYouProps) {
  // Calculate delivery time from distance if available, otherwise use provided time
  const getDeliveryTime = (store: NearbyStore): string => {
    if (store.distance) {
      const distance = parseDistance(store.distance);
      if (distance > 0) {
        // Extract min time from calculated range (e.g., "25-35 min" -> "25 min")
        const calculatedTime = calculateDeliveryTime(distance, 'standard');
        const minTime = calculatedTime.split('-')[0];
        return `${minTime} min`;
      }
    }
    return store.time;
  };

  return (
    <div className="py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Fastest Near You</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="relative group">
            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
              <div style={{ width: '100%', paddingBottom: '75%', position: 'relative' }}>
                <div className="absolute inset-0">
                  <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                  {/* Overlay to improve text visibility if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-white opacity-80 hover:opacity-100"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <div className="mt-2">
              <div className="font-medium flex items-center">
                {store.name}
                {store.isDashPass && (
                  <span className="ml-1 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    DashPass
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                {store?.rating && store.rating != '0' && (
                  <>
                    <span>★ {store.rating}</span>
                    <span className="mx-1">•</span>
                  </>
                )}
                <span>{store.distance}</span>
                <span className="mx-1">•</span>
                <span>{getDeliveryTime(store)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
